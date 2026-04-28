import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../pages/Login';

// Mock useNavigate so we can assert navigation calls
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock antd components used in Login to avoid jsdom/matchMedia issues
// while still testing the login business logic
const mockSuccess = jest.fn();
const mockError = jest.fn();

jest.mock('antd', () => {
  const React = require('react');
  function Form({ children, onFinish, name }) {
    const handleSubmit = (e) => { e.preventDefault(); onFinish && onFinish(); };
    return <form aria-label={name} onSubmit={handleSubmit}>{children}</form>;
  }
  Form.Item = function({ children, label, name: fieldName }) {
    return (
      <div>
        {label && <label htmlFor={fieldName}>{label}</label>}
        <div id={fieldName}>{children}</div>
      </div>
    );
  };
  Form.useForm = () => [{ getFieldsValue: jest.fn(), setFieldValue: jest.fn() }];

  return {
    message: { success: (...a) => mockSuccess(...a), error: (...a) => mockError(...a) },
    Form,
    Input: Object.assign(
      React.forwardRef(({ value, onChange, placeholder, type }, ref) => (
        <input
          ref={ref}
          type={type || 'text'}
          aria-label={placeholder}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
        />
      )),
      {
        Password: React.forwardRef(({ value, onChange, placeholder }, ref) => (
          <input
            ref={ref}
            type="password"
            aria-label={placeholder}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
          />
        ))
      }
    ),
    Button: ({ children, htmlType, type, block, ...rest }) => (
      <button type={htmlType || 'button'} {...rest}>{children}</button>
    ),
    Card: ({ children, title }) => <div><h2>{title}</h2>{children}</div>
  };
});

jest.mock('../config', () => ({
  users: [
    { username: 'admin', password: 'admin123', role: '管理员' },
    { username: 'auditor', password: 'auditor123', role: '审核员' }
  ]
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('Login page', () => {
  it('renders the login form', () => {
    render(<Login />);
    expect(screen.getByText(/旅游日记审核平台/)).toBeInTheDocument();
    expect(screen.getByLabelText(/请输入用户名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/请输入密码/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/ })).toBeInTheDocument();
  });

  it('stores user info in localStorage and navigates on valid credentials', () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText(/请输入用户名/), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/请输入密码/), { target: { value: 'admin123' } });
    fireEvent.submit(screen.getByRole('form'));

    expect(mockSuccess).toHaveBeenCalledWith('登录成功！');
    expect(mockNavigate).toHaveBeenCalledWith('/');

    const stored = JSON.parse(localStorage.getItem('user'));
    expect(stored).toMatchObject({ username: 'admin', role: '管理员' });
  });

  it('shows error when credentials are wrong', () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText(/请输入用户名/), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/请输入密码/), { target: { value: 'wrongpass' } });
    fireEvent.submit(screen.getByRole('form'));

    expect(mockError).toHaveBeenCalledWith('用户名或密码错误！');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows error when user does not exist', () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText(/请输入用户名/), { target: { value: 'nobody' } });
    fireEvent.change(screen.getByLabelText(/请输入密码/), { target: { value: 'anything' } });
    fireEvent.submit(screen.getByRole('form'));

    expect(mockError).toHaveBeenCalledWith('用户名或密码错误！');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('allows the auditor role to log in successfully', () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText(/请输入用户名/), { target: { value: 'auditor' } });
    fireEvent.change(screen.getByLabelText(/请输入密码/), { target: { value: 'auditor123' } });
    fireEvent.submit(screen.getByRole('form'));

    expect(mockSuccess).toHaveBeenCalledWith('登录成功！');
    const stored = JSON.parse(localStorage.getItem('user'));
    expect(stored.role).toBe('审核员');
  });
});
