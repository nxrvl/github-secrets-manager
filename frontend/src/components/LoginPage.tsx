import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface LoginPageProps {
  onError: (error: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onError }) => {
  const [githubToken, setGithubToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken.trim()) {
      onError('Please enter a GitHub token');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/validate', { token: githubToken });
      if (response.data.valid) {
        setToken(githubToken);
        navigate('/repositories');
      } else {
        onError('Invalid GitHub token');
      }
    } catch (error) {
      onError('Failed to validate token. Please check your token and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">GitHub Secrets Manager</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>GitHub Personal Access Token</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your GitHub token"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                You need a token with repo and secrets permissions
              </Form.Text>
            </Form.Group>
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Validating...' : 'Login'}
            </Button>
          </Form>
          <div className="mt-3">
            <Alert variant="info">
              <small>
                <strong>How to get a token:</strong>
                <ol className="mb-0 ps-3">
                  <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
                  <li>Generate new token with 'repo' scope</li>
                  <li>Copy and paste the token here</li>
                </ol>
              </small>
            </Alert>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;