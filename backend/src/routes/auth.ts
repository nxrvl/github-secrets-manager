import { Router } from 'express';
import { Octokit } from '@octokit/rest';

const router = Router();

router.post('/validate', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ valid: false, message: 'Token is required' });
  }

  try {
    const octokit = new Octokit({ auth: token });
    
    await octokit.users.getAuthenticated();
    
    return res.json({ valid: true });
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

export default router;