import { users } from '../config';

describe('audit app config', () => {
  it('exports an array of users', () => {
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  it('contains an admin user with the correct role', () => {
    const admin = users.find((u) => u.username === 'admin');
    expect(admin).toBeDefined();
    expect(admin.role).toBe('管理员');
  });

  it('contains an auditor user with the correct role', () => {
    const auditor = users.find((u) => u.username === 'auditor');
    expect(auditor).toBeDefined();
    expect(auditor.role).toBe('审核员');
  });

  it('every user entry has username, password and role fields', () => {
    users.forEach((user) => {
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('password');
      expect(user).toHaveProperty('role');
    });
  });
});
