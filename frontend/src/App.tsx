import React, { useState, useEffect } from 'react';
import { Container, Navbar, Alert } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RepositoryList from './components/RepositoryList';
import SecretsManager from './components/SecretsManager';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const { token, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="app-container">
      {token && (
        <Navbar bg="dark" variant="dark" className="mb-4">
          <Container>
            <Navbar.Brand>GitHub Secrets Manager</Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                <button className="btn btn-sm btn-outline-light" onClick={logout}>
                  Logout
                </button>
              </Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}

      <Container className="main-content">
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        <Routes>
          <Route 
            path="/login" 
            element={token ? <Navigate to="/repositories" /> : <LoginPage onError={setError} />} 
          />
          <Route 
            path="/repositories" 
            element={token ? <RepositoryList /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/repository/:owner/:repo/secrets" 
            element={token ? <SecretsManager /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to="/repositories" />} />
        </Routes>
      </Container>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;