import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagementModal.css';

const UserManagementModal = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(Object.entries(response.data).map(([username, data]) => ({ username, ...data })));
    } catch (error) {
      setMessage('Błąd podczas ładowania listy użytkowników.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', newUser);
      setMessage('Użytkownik dodany pomyślnie!');
      setNewUser({ username: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      setMessage(`Błąd: ${error.response?.data?.message || 'Nieznany błąd'}`);
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`Czy na pewno chcesz usunąć użytkownika ${username}?`)) {
      try {
        await axios.delete(`/api/users/${username}`);
        setMessage('Użytkownik usunięty pomyślnie!');
        fetchUsers();
      } catch (error) {
        setMessage(`Błąd: ${error.response?.data?.message || 'Nieznany błąd'}`);
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/users/${editingUser.username}`, editingUser);
      setMessage('Użytkownik zaktualizowany pomyślnie!');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      setMessage(`Błąd: ${error.response?.data?.message || 'Nieznany błąd'}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Zarządzanie użytkownikami</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {message && <p className="message">{message}</p>}

          <h4>Dodaj nowego użytkownika</h4>
          <form onSubmit={handleAddUser}>
            <input
              type="text"
              placeholder="Nazwa użytkownika"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Hasło"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Dodaj</button>
          </form>

          <hr />

          <h4>Lista użytkowników</h4>
          <ul className="user-list">
            {users.map(user => (
              <li key={user.username}>
                {editingUser?.username === user.username ? (
                  <>
                    <input
                      type="password"
                      placeholder="Nowe hasło"
                      value={editingUser.password || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    />
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={handleSaveEdit}>Zapisz</button>
                    <button onClick={() => setEditingUser(null)}>Anuluj</button>
                  </>
                ) : (
                  <>
                    <span>{user.username} ({user.role})</span>
                    <div className="user-actions">
                      <button onClick={() => handleEditUser(user)}>Edytuj</button>
                      <button onClick={() => handleDeleteUser(user.username)}>Usuń</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;