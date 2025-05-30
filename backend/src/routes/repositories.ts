import { Router } from 'express';
import { Octokit } from '@octokit/rest';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const octokit = new Octokit({ auth: req.headers.authorization?.replace('Bearer ', '') });
    
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated'
    });
    
    return res.json(data);
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    return res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

export default router;