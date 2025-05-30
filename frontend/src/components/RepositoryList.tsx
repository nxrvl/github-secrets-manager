import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  owner: {
    login: string;
  };
}

const RepositoryList: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRepositories();
  }, [token]);

  useEffect(() => {
    const filtered = repositories.filter(repo =>
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRepos(filtered);
  }, [searchTerm, repositories]);

  const fetchRepositories = async () => {
    try {
      const response = await axios.get('/api/repositories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRepositories(response.data);
      setFilteredRepos(response.data);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepoClick = (repo: Repository) => {
    navigate(`/repository/${repo.owner.login}/${repo.name}/secrets`);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Your Repositories</h2>
      <Form.Group className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>
      
      {filteredRepos.length === 0 ? (
        <div className="empty-state">
          <h5>No repositories found</h5>
          <p>You don't have access to any repositories or no matches found.</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredRepos.map((repo) => (
            <Col key={repo.id}>
              <Card 
                className="repo-card h-100" 
                onClick={() => handleRepoClick(repo)}
              >
                <Card.Body>
                  <Card.Title className="d-flex align-items-center justify-content-between">
                    <span>{repo.name}</span>
                    {repo.private && (
                      <span className="badge bg-secondary">Private</span>
                    )}
                  </Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {repo.owner.login}
                  </Card.Subtitle>
                  <Card.Text>
                    {repo.description || 'No description available'}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default RepositoryList;