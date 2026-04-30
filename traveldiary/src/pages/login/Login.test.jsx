import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

// ── Routing mocks ────────────────────────────────────────────────────────────
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// ── axios mock ───────────────────────────────────────────────────────────────
jest.mock('axios');
const axios = require('axios');

// ── antd-mobile mock ─────────────────────────────────────────────────────────
const mockToastShow = jest.fn();

jest.mock('antd-mobile', () => {
  const React = require('react');

  function Form({ children, onFinish, form, footer }) {
    const handleSubmit = (e) => {
      e.preventDefault();
      if (onFinish) onFinish(form.__values || {});
    };
    return (
      <form aria-label="login-form" onSubmit={handleSubmit}>
        {children}
        {footer}
      </form>
    );
  }
  Form.Item = function ({ children, label, name }) {
    return (
      <div>
        {label && <label htmlFor={name}>{label}</label>}
        {children}
      </div>
    );
  };
  Form.useForm = () => {
    const values = {};
    const form = {
      __values: values,
      getFieldValue: (k) => values[k],
      setFieldValue: (k, v) => { values[k] = v; },
    };
    return [form];
  };

  const Input = React.forwardRef(({ placeholder, clearable, type, style, onChange, value }, ref) => (
    <input
      ref={ref}
      type={type || 'text'}
      aria-label={placeholder}
      placeholder={placeholder}
      value={value !== undefined ? value : ''}
      onChange={onChange}
    />
  ));
  Input.displayName = 'Input';

  const Button = ({ children, type, color, size, loading, block, ...rest }) => (
    <button type={type || 'button'} disabled={loading} {...rest}>{children}</button>
  );

  const Toast = {
    show: (...args) => mockToastShow(...args),
  };

  return { Form, Input, Button, Toast };
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

// ── tests ────────────────────────────────────────────────────────────────────
describe('Login page (traveldiary)', () => {
  it('renders the login form', () => {
    render(<Login />);
    expect(screen.getByText('旅游日记')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
    expect(screen.getByText('登录')).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    render(<Login />);
    const link = screen.getByText('立即注册');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/register');
  });

  it('shows success toast and navigates on valid login', async () => {
    axios.post.mockResolvedValue({ data: { id: 1, username: 'testuser', token: 'abc' } });
    render(<Login />);

    fireEvent.submit(screen.getByRole('form', { name: 'login-form' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/mynotes'));
    expect(mockToastShow).toHaveBeenCalledWith(expect.objectContaining({ content: '登录成功' }));
  });

  it('stores user data in localStorage on valid login', async () => {
    const userData = { id: 1, username: 'testuser', token: 'abc' };
    axios.post.mockResolvedValue({ data: userData });
    render(<Login />);

    fireEvent.submit(screen.getByRole('form', { name: 'login-form' }));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('user'));
      expect(stored).toMatchObject({ username: 'testuser' });
    });
  });

  it('shows error toast on failed login', async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: '用户名或密码错误' } },
    });
    render(<Login />);

    fireEvent.submit(screen.getByRole('form', { name: 'login-form' }));

    await waitFor(() =>
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ content: '用户名或密码错误' })
      )
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows default error message when server returns no message', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));
    render(<Login />);

    fireEvent.submit(screen.getByRole('form', { name: 'login-form' }));

    await waitFor(() =>
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ content: '登录失败，请检查用户名和密码' })
      )
    );
  });
});
