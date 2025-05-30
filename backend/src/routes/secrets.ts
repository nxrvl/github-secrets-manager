import { Router } from 'express';
import { Octokit } from '@octokit/rest';
import { authMiddleware } from '../middleware/auth';
import { all, run, get } from '../database';
import sodium from 'libsodium-wrappers';

const router = Router();

router.get('/:owner/:repo/secrets', authMiddleware, async (req, res) => {
  const { owner, repo } = req.params;
  
  try {
    const octokit = new Octokit({ auth: req.headers.authorization?.replace('Bearer ', '') });
    
    const { data } = await octokit.actions.listRepoSecrets({
      owner,
      repo
    });
    
    interface LocalSecret {
      secret_name: string;
      created_at: string;
      updated_at: string;
    }
    
    const localSecrets = await all<LocalSecret>(
      'SELECT secret_name, created_at, updated_at FROM secrets WHERE repository_owner = ? AND repository_name = ?',
      [owner, repo]
    );
    
    const mergedSecrets = data.secrets.map(secret => {
      const localSecret = localSecrets.find(ls => ls.secret_name === secret.name);
      return {
        name: secret.name,
        created_at: secret.created_at,
        updated_at: localSecret?.updated_at || secret.updated_at
      };
    });
    
    return res.json(mergedSecrets);
  } catch (error) {
    console.error('Failed to fetch secrets:', error);
    return res.status(500).json({ error: 'Failed to fetch secrets' });
  }
});

router.get('/:owner/:repo/secrets/:name', authMiddleware, async (req, res) => {
  const { owner, repo, name } = req.params;
  
  try {
    interface SecretRecord {
      secret_value: string;
    }
    
    const secret = await get<SecretRecord>(
      'SELECT secret_value FROM secrets WHERE repository_owner = ? AND repository_name = ? AND secret_name = ?',
      [owner, repo, name]
    );
    
    if (!secret) {
      return res.json({ value: '' });
    }
    
    return res.json({ value: secret.secret_value });
  } catch (error) {
    console.error('Failed to fetch secret value:', error);
    return res.status(500).json({ error: 'Failed to fetch secret value' });
  }
});

router.post('/:owner/:repo/secrets', authMiddleware, async (req, res) => {
  const { owner, repo } = req.params;
  const { name, value } = req.body;
  
  if (!name || !value) {
    return res.status(400).json({ error: 'Secret name and value are required' });
  }
  
  try {
    const octokit = new Octokit({ auth: req.headers.authorization?.replace('Bearer ', '') });
    
    const { data: publicKey } = await octokit.actions.getRepoPublicKey({
      owner,
      repo
    });
    
    await sodium.ready;
    
    const binkey = sodium.from_base64(publicKey.key, sodium.base64_variants.ORIGINAL);
    const binsec = sodium.from_string(value);
    const encBytes = sodium.crypto_box_seal(binsec, binkey);
    const encrypted_value = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
    
    await octokit.actions.createOrUpdateRepoSecret({
      owner,
      repo,
      secret_name: name,
      encrypted_value,
      key_id: publicKey.key_id
    });
    
    await run(
      `INSERT INTO secrets (repository_owner, repository_name, secret_name, secret_value, updated_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) 
       ON CONFLICT(repository_owner, repository_name, secret_name) 
       DO UPDATE SET secret_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [owner, repo, name, value, value]
    );
    
    await run(
      'INSERT INTO secret_history (repository_owner, repository_name, secret_name, action) VALUES (?, ?, ?, ?)',
      [owner, repo, name, 'updated']
    );
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create/update secret:', error);
    return res.status(500).json({ error: 'Failed to create/update secret' });
  }
});

router.delete('/:owner/:repo/secrets/:name', authMiddleware, async (req, res) => {
  const { owner, repo, name } = req.params;
  
  try {
    const octokit = new Octokit({ auth: req.headers.authorization?.replace('Bearer ', '') });
    
    await octokit.actions.deleteRepoSecret({
      owner,
      repo,
      secret_name: name
    });
    
    await run(
      'DELETE FROM secrets WHERE repository_owner = ? AND repository_name = ? AND secret_name = ?',
      [owner, repo, name]
    );
    
    await run(
      'INSERT INTO secret_history (repository_owner, repository_name, secret_name, action) VALUES (?, ?, ?, ?)',
      [owner, repo, name, 'deleted']
    );
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete secret:', error);
    return res.status(500).json({ error: 'Failed to delete secret' });
  }
});

export default router;