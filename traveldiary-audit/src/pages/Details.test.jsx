import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Details from './Details';

// ── Routing mocks ────────────────────────────────────────────────────────────
const mockNavigate = jest.fn();
let mockState = {
  id: 1,
  returnFlag: '1',
  filterStatus: 'all',
  searchValue: '',
  allItems: [
    { id: 1, title: '第一篇游记', status: 'pending' },
    { id: 2, title: '第二篇游记', status: 'pending' },
  ],
  currentIndex: 0,
};

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockState }),
}));

// ── axios mock ───────────────────────────────────────────────────────────────
jest.mock('axios');
const axios = require('axios');

// ── antd & icons mocks ───────────────────────────────────────────────────────
jest.mock('@ant-design/icons', () => ({
  LeftOutlined: () => <span>←</span>,
}));

const mockModalConfirm = jest.fn();
const mockModalSuccess = jest.fn();
const mockModalError = jest.fn();

jest.mock('antd', () => {
  const React = require('react');

  const Layout = ({ children }) => <div>{children}</div>;
  Layout.Header = ({ children, style }) => <header style={style}>{children}</header>;
  Layout.Content = ({ children, style }) => <main style={style}>{children}</main>;

  const Button = ({ children, onClick, disabled, type, danger, icon, ...rest }) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {icon}{children}
    </button>
  );

  const Image = ({ src, alt, width }) => <img src={src} alt={alt || 'media'} width={width} />;

  const Modal = {
    confirm: (...args) => mockModalConfirm(...args),
    success: (...args) => mockModalSuccess(...args),
    error: (...args) => mockModalError(...args),
  };

  return { Layout, Button, Image, Modal };
});

// ── sample diary ─────────────────────────────────────────────────────────────
const pendingDiary = {
  id: 1,
  title: '第一篇游记',
  content: '游记内容',
  status: 'pending',
  created_at: '2024-01-01',
  author: { nickname: '作者一' },
  media: [
    { type: 'image', url: '/img/photo.jpg' },
    { type: 'video', url: '/vid/movie.mp4' },
  ],
};

const deletedDiary = { ...pendingDiary, status: 'deleted' };

// ── helpers ───────────────────────────────────────────────────────────────────
function setUser(role = '审核员') {
  localStorage.setItem('user', JSON.stringify({ username: 'testuser', role }));
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  axios.get.mockResolvedValue({ data: pendingDiary });
  // reset location state to defaults
  mockState = {
    id: 1,
    returnFlag: '1',
    filterStatus: 'all',
    searchValue: '',
    allItems: [
      { id: 1, title: '第一篇游记', status: 'pending' },
      { id: 2, title: '第二篇游记', status: 'pending' },
    ],
    currentIndex: 0,
  };
});

// ── tests ────────────────────────────────────────────────────────────────────
describe('Details page (audit)', () => {
  it('shows loading state initially', () => {
    setUser();
    axios.get.mockImplementation(() => new Promise(() => {}));
    render(<Details />);
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('renders diary title and author after fetching', async () => {
    setUser();
    render(<Details />);
    await waitFor(() => expect(screen.getByText('第一篇游记')).toBeInTheDocument());
    expect(screen.getByText('作者一')).toBeInTheDocument();
  });

  it('renders diary content', async () => {
    setUser();
    render(<Details />);
    await waitFor(() => screen.getByText('游记内容'));
  });

  it('renders 通过 and 拒绝 buttons for pending diary', async () => {
    setUser();
    render(<Details />);
    await waitFor(() => screen.getByText('第一篇游记'));
    expect(screen.getByText('通过')).toBeInTheDocument();
    expect(screen.getByText('拒绝')).toBeInTheDocument();
  });

  it('renders 删除 button for admin on pending diary', async () => {
    setUser('管理员');
    render(<Details />);
    await waitFor(() => screen.getByText('第一篇游记'));
    expect(screen.getByText('删除')).toBeInTheDocument();
  });

  it('does not render 删除 button for non-admin', async () => {
    setUser('审核员');
    render(<Details />);
    await waitFor(() => screen.getByText('第一篇游记'));
    expect(screen.queryByText('删除')).not.toBeInTheDocument();
  });

  it('renders 恢复 button for admin on deleted diary', async () => {
    setUser('管理员');
    axios.get.mockResolvedValue({ data: deletedDiary });
    render(<Details />);
    await waitFor(() => screen.getByText('第一篇游记'));
    expect(screen.getByText('恢复')).toBeInTheDocument();
    expect(screen.queryByText('通过')).not.toBeInTheDocument();
  });

  it('calls Modal.confirm when 通过 is clicked', async () => {
    setUser();
    render(<Details />);
    await waitFor(() => screen.getByText('通过'));
    fireEvent.click(screen.getByText('通过'));
    expect(mockModalConfirm).toHaveBeenCalled();
  });

  it('calls Modal.confirm when 拒绝 is clicked', async () => {
    setUser();
    render(<Details />);
    await waitFor(() => screen.getByText('拒绝'));
    fireEvent.click(screen.getByText('拒绝'));
    expect(mockModalConfirm).toHaveBeenCalled();
  });

  it('disables 上一个 button when at first item', async () => {
    setUser();
    render(<Details />);
    await waitFor(() => screen.getByText('第一篇游记'));
    const prevBtn = screen.getByText('上一个');
    expect(prevBtn).toBeDisabled();
  });

  it('navigates to previous diary when 上一个 is clicked (non-first)', async () => {
    setUser();
    mockState = { ...mockState, currentIndex: 1 };
    render(<Details />);
    await waitFor(() => screen.getByText('第一篇游记'));
    const prevBtn = screen.getByText('上一个');
    expect(prevBtn).not.toBeDisabled();
    fireEvent.click(prevBtn);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('navigates back to list on 返回列表 click', async () => {
    setUser();
    render(<Details />);
    await waitFor(() => screen.getByText('返回列表'));
    fireEvent.click(screen.getByText('返回列表'));
    expect(mockNavigate).toHaveBeenCalledWith('/', expect.any(Object));
  });

  it('renders image media', async () => {
    setUser();
    render(<Details />);
    await waitFor(() => screen.getByText('第一篇游记'));
    const images = screen.getAllByRole('img');
    const mediaImg = images.find((img) => img.src && img.src.includes('photo.jpg'));
    expect(mediaImg).toBeTruthy();
  });

  it('shows error message when diary cannot be loaded', async () => {
    setUser();
    axios.get.mockRejectedValue(new Error('Network error'));
    render(<Details />);
    await waitFor(() => expect(mockModalError).toHaveBeenCalled());
  });
});
