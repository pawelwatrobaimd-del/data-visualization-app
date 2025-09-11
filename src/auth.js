// Proste zarządzanie stanem logowania w localStorage
export const authService = {
  login: (username, role) => {
    localStorage.setItem('user', JSON.stringify({ username, role }));
  },
  logout: () => {
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};