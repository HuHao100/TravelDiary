import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Home from './Home';

// ── Routing mocks ────────────────────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockLocationState = { returnFlag: '1', filterStatus: 'all', searchValue: '' };

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockLocationState }),
}));

// ── axios mock ───────────────────────────────────────────────────────────────
jest.mock('axios');
const axios = require('axios');

// ── antd mock ────────────────────────────────────────────────────────────────
jest.mock('antd', () => {
  const React = require('react');

  const Layout = ({ children }) => <div>{children}</div>;
  Layout.Header = ({ children }) => <header>{children}</header>;
  Layout.Content = ({ children }) => <main>{children}</main>;
  Layout.Footer = ({ children }) => <footer>{children}</footer>;

  const Menu = ({ items, selectedKeys, onClick }) => (
    <nav>
      {(items || []).map((item) => (
        <button
          key={item.key}
          data-selected={selectedKeys && selectedKeys.includes(item.key)}
          onClick={() => onClick && onClick({ key: item.key })}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );

  const Tag = ({ children, color }) => <span data-color={color}>{children}</span>;

  const Select = ({ value, onChange, children }) => (
    <select value={value} onChange={(e) => onChange && onChange(e.target.value)}>
      {children}
    </select>
  );
  Select.Option = ({ value, children }) => <option value={value}>{children}</option>;

  const InputBase = React.forwardRef(({ value, onChange, placeholder, onSearch }, ref) => (
    <input
      ref={ref}
      aria-label={placeholder}
      value={value !== undefined ? value : ''}
      onChange={onChange}
      placeholder={placeholder}
    />
  ));
  InputBase.displayName = 'InputBase';
  const Input = Object.assign(InputBase, {
    Search: ({ value, placeholder, onSearch, onChange, enterButton }) => (
      <div>
        <input
          aria-label={placeholder}
          value={value !== undefined ? value : ''}
          onChange={onChange}
          placeholder={placeholder}
        />
        <button onClick={() => onSearch && onSearch(value)}>{enterButton}</button>
      </div>
    ),
    Password: InputBase,
  });

  const Pagination = ({ total }) => <div aria-label="pagination">{total}</div>;

  const Drawer = ({ visible, onClose, children, title }) =>
    visible ? (
      <div role="dialog" aria-label={title}>
        {children}
        <button onClick={onClose}>关闭</button>
      </div>
    ) : null;

  const Button = ({ children, onClick, type, danger, ...rest }) => (
    <button onClick={onClick} {...rest}>{children}</button>
  );

  const Avatar = ({ src, onClick }) => (
    <img src={src} alt="avatar" onClick={onClick} />
  );

  const Breadcrumb = ({ children }) => <nav aria-label="breadcrumb">{children}</nav>;
  Breadcrumb.Item = ({ children }) => <span>{children}</span>;

  const List = ({ dataSource, renderItem }) => (
    <ul>
      {(dataSource || []).map((item, i) => renderItem(item, i))}
    </ul>
  );
  List.Item = ({ children, onClick, style }) => (
    <li style={style} onClick={onClick}>{children}</li>
  );

  const message = {
    success: jest.fn(),
    error: jest.fn(),
  };

  return {
    Layout,
    Menu,
    Tag,
    Select,
    Input,
    Pagination,
    Drawer,
    Button,
    Avatar,
    Breadcrumb,
    List,
    message,
  };
});

// ── sample data ──────────────────────────────────────────────────────────────
const allDiaries = [
  { id: 1, title: '待审游记一', content: '内容一', status: 'pending', image_url: '/img/cover.jpg', user: { nickname: '用户一' }, created_at: '2024-01-01' },
  { id: 2, title: '待审游记二', content: '内容二', status: 'pending', image_url: '/img/cover.jpg', user: { nickname: '用户二' }, created_at: '2024-01-02' },
  { id: 3, title: '通过游记三', content: '内容三', status: 'approved', image_url: '/img/cover.jpg', user: { nickname: '用户三' }, created_at: '2024-01-03' },
];

// ── helpers ───────────────────────────────────────────────────────────────────
function renderWithUser(role = '审核员') {
  localStorage.setItem('user', JSON.stringify({ username: 'testuser', role }));
  return render(<Home />);
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  axios.get.mockResolvedValue({ data: allDiaries });
});

// ── tests ────────────────────────────────────────────────────────────────────
describe('Home page (audit)', () => {
  it('renders menu items for auditor', async () => {
    renderWithUser('审核员');
    await waitFor(() => expect(screen.getAllByText('待审核').length).toBeGreaterThan(0));
    expect(screen.getAllByText('已审核').length).toBeGreaterThan(0);
    expect(screen.queryByText('回收站')).not.toBeInTheDocument();
  });

  it('renders recycle bin menu item for admin', async () => {
    axios.get.mockResolvedValueOnce({ data: allDiaries }).mockResolvedValueOnce({ data: [] });
    renderWithUser('管理员');
    await waitFor(() => expect(screen.getByText('回收站')).toBeInTheDocument());
  });

  it('fetches diaries on mount', async () => {
    renderWithUser();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });

  it('shows pending diary titles after fetching', async () => {
    renderWithUser();
    await waitFor(() => expect(screen.getByText('待审游记一')).toBeInTheDocument());
    expect(screen.getByText('待审游记二')).toBeInTheDocument();
  });

  it('switches to 已审核 menu and shows approved items', async () => {
    renderWithUser();
    await waitFor(() => screen.getByText('待审游记一'));

    const yishenheButton = screen.getByText('已审核');
    fireEvent.click(yishenheButton);

    await waitFor(() => expect(screen.getByText('通过游记三')).toBeInTheDocument());
  });

  it('filters diary list by search value', async () => {
    renderWithUser();
    await waitFor(() => screen.getByText('待审游记一'));

    const searchInput = screen.getByPlaceholderText('搜索游记标题/内容/发布者');
    fireEvent.change(searchInput, { target: { value: '待审游记二' } });

    await waitFor(() => {
      expect(screen.getByText('待审游记二')).toBeInTheDocument();
      expect(screen.queryByText('待审游记一')).not.toBeInTheDocument();
    });
  });

  it('resets search on reset button click', async () => {
    renderWithUser();
    await waitFor(() => screen.getByText('待审游记一'));

    const searchInput = screen.getByPlaceholderText('搜索游记标题/内容/发布者');
    fireEvent.change(searchInput, { target: { value: '待审游记二' } });
    fireEvent.click(screen.getByText('重置'));

    await waitFor(() => {
      expect(screen.getByText('待审游记一')).toBeInTheDocument();
      expect(screen.getByText('待审游记二')).toBeInTheDocument();
    });
  });

  it('navigates to details when a diary item is clicked', async () => {
    renderWithUser();
    await waitFor(() => screen.getByText('待审游记一'));

    const item = screen.getAllByRole('listitem')[0];
    fireEvent.click(item);

    expect(mockNavigate).toHaveBeenCalled();
    const [path] = mockNavigate.mock.calls[0];
    expect(path).toMatch(/\/details\//);
  });

  it('shows user drawer when avatar is clicked', async () => {
    renderWithUser();
    await waitFor(() => screen.getByText('待审游记一'));

    const avatar = screen.getByAltText('avatar');
    fireEvent.click(avatar);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
