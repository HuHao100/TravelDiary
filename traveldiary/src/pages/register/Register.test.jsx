import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register';

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

  let formInstance = null;

  function Form({ children, onFinish, form, footer }) {
    formInstance = form;
    const handleSubmit = (e) => {
      e.preventDefault();
      if (onFinish) onFinish(form.__values || {});
    };
    return (
      <form aria-label="register-form" onSubmit={handleSubmit}>
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

// ── helpers ───────────────────────────────────────────────────────────────────
const mockAPI_BASE_URL = 'http://localhost:80/api';
jest.mock('../../config', () => 'http://localhost:80/api');

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

// ── tests ────────────────────────────────────────────────────────────────────
describe('Register page (traveldiary)', () => {
  it('renders the register form', () => {
    render(<Register />);
    expect(screen.getByText('旅游日记')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入昵称')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<Register />);
    const link = screen.getByText('立即登录');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/login');
  });

  it('renders avatar upload area', () => {
    render(<Register />);
    expect(screen.getByText('点击更换头像')).toBeInTheDocument();
    const fileInput = screen.getByAltText('头像').closest('label').querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();
  });

  it('shows toast when form is submitted without avatar', async () => {
    render(<Register />);
    fireEvent.submit(screen.getByRole('form', { name: 'register-form' }));
    await waitFor(() =>
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ content: '请选择头像' })
      )
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows success toast and navigates to login on successful registration', async () => {
    axios.post.mockResolvedValue({ status: 201, data: {} });
    render(<Register />);

    // Simulate avatar selection via file input
    const fileInput = screen.getByAltText('头像').closest('label').querySelector('input[type="file"]');
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file] });

    // Mock FileReader
    const origFileReader = global.FileReader;
    global.FileReader = function () {
      this.readAsDataURL = (f) => {
        this.result = 'data:image/png;base64,abc';
        this.onloadend && this.onloadend();
      };
    };

    fireEvent.change(fileInput);

    // Restore
    global.FileReader = origFileReader;

    fireEvent.submit(screen.getByRole('form', { name: 'register-form' }));

    await waitFor(() =>
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ content: '注册成功，请登录' })
      )
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows error toast on registration failure', async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: '用户名已存在' } },
    });
    render(<Register />);

    // Simulate avatar selection
    const fileInput = screen.getByAltText('头像').closest('label').querySelector('input[type="file"]');
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file] });

    global.FileReader = function () {
      this.readAsDataURL = () => {
        this.result = 'data:image/png;base64,abc';
        this.onloadend && this.onloadend();
      };
    };

    fireEvent.change(fileInput);

    fireEvent.submit(screen.getByRole('form', { name: 'register-form' }));

    await waitFor(() =>
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({ content: '用户名已存在' })
      )
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
