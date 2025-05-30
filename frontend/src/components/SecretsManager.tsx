import React, { useState, useEffect } from 'react';
import { Container, Button, ListGroup, Spinner, Modal, Form, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Secret {
  name: string;
  created_at: string;
  updated_at: string;
}

const SecretsManager: React.FC = () => {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSecret, setEditingSecret] = useState<string | null>(null);
  const [secretName, setSecretName] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchSecrets();
  }, [owner, repo, token]);

  const fetchSecrets = async () => {
    try {
      const response = await axios.get(`/api/repositories/${owner}/${repo}/secrets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSecrets(response.data);
    } catch (error) {
      console.error('Failed to fetch secrets:', error);
      setError('Failed to fetch secrets');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = async (secretName?: string) => {
    setShowModal(true);
    setError(null);
    
    if (secretName) {
      setEditingSecret(secretName);
      setSecretName(secretName);
      setLoadingSecret(true);
      setSecretValue('');
      
      // Fetch the secret value from the backend
      try {
        const response = await axios.get(
          `/api/repositories/${owner}/${repo}/secrets/${secretName}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSecretValue(response.data.value || '');
      } catch (error) {
        console.error('Failed to fetch secret value:', error);
        setError('Failed to load secret value');
        setSecretValue('');
      } finally {
        setLoadingSecret(false);
      }
    } else {
      setEditingSecret(null);
      setSecretName('');
      setSecretValue('');
      setLoadingSecret(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSecret(null);
    setSecretName('');
    setSecretValue('');
    setError(null);
  };

  const handleSaveSecret = async () => {
    if (!secretName.trim() || !secretValue.trim()) {
      setError('Secret name and value are required');
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        `/api/repositories/${owner}/${repo}/secrets`,
        { name: secretName, value: secretValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchSecrets();
      handleCloseModal();
    } catch (error) {
      setError('Failed to save secret');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSecret = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete the secret "${name}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/repositories/${owner}/${repo}/secrets/${name}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchSecrets();
    } catch (error) {
      setError('Failed to delete secret');
    }
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/repositories" className="text-decoration-none">← Back to Repositories</Link>
          <h2 className="mt-2">{owner}/{repo} Secrets</h2>
        </div>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Add Secret
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {secrets.length === 0 ? (
        <div className="empty-state">
          <h5>No secrets found</h5>
          <p>This repository doesn't have any secrets yet.</p>
        </div>
      ) : (
        <ListGroup>
          {secrets.map((secret) => (
            <ListGroup.Item key={secret.name} className="secret-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">{secret.name}</h6>
                  <small className="text-muted">
                    Updated: {new Date(secret.updated_at).toLocaleString()}
                  </small>
                </div>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowModal(secret.name)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteSecret(secret.name)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingSecret ? 'Edit Secret' : 'Add New Secret'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Secret Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="SECRET_NAME"
                value={secretName}
                onChange={(e) => setSecretName(e.target.value)}
                disabled={!!editingSecret}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Secret Value</Form.Label>
              {loadingSecret ? (
                <div className="text-center p-3">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Loading secret value...</span>
                </div>
              ) : (
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter secret value"
                  value={secretValue}
                  onChange={(e) => setSecretValue(e.target.value)}
                />
              )}
            </Form.Group>
            {editingSecret && (
              <Form.Text className="text-muted d-block mt-2">
                <small>Secret values are stored locally for your convenience. GitHub only stores encrypted values.</small>
              </Form.Text>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveSecret}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Secret'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SecretsManager;