import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import Layout from './components/Layout';
import './index.css';

function App() {
  const [user, setUser] = useState<any>(null);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          !user ? (
            <Login onLoginSuccess={handleLogin} />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } />
        <Route path="/dashboard" element={
          user ? (
            <Dashboard currentUser={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/users" element={
          user ? (
            <Layout onLogout={handleLogout} userEmail={user.email}>
              <UsersPage currentUser={user} />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App

