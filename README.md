# GitHub Secrets Manager

A modern, user-friendly web application to manage GitHub repository secrets locally with a clean interface built using React, Bootstrap, and TypeScript.

## Features

- 🔐 Secure GitHub authentication using personal access tokens
- 📋 List all repositories available to the authenticated user
- 🔑 View, create, modify, and delete secrets for each repository
- 💾 Local SQLite database for storing secret history
- 🐳 Fully containerized with Docker
- 🎨 Clean, minimal, and modern UI design with Bootstrap
- 🔄 Real-time synchronization with GitHub

## Prerequisites

- Docker and Docker Compose installed
- GitHub Personal Access Token with `repo` scope

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd github-secrets-manager
```

2. Build and run with Docker Compose:
```bash
docker-compose up --build
```

3. Access the application at `http://localhost`

4. Login with your GitHub Personal Access Token

## Getting a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name
4. Select the `repo` scope (Full control of private repositories)
5. Generate the token and copy it

## Architecture

### Frontend
- React with TypeScript
- React Bootstrap for UI components
- React Router for navigation
- Axios for API calls

### Backend
- Express.js with TypeScript
- SQLite for local secret storage
- Octokit for GitHub API integration
- libsodium for secret encryption

### Security Features
- Secrets are encrypted before sending to GitHub
- Tokens are stored locally in browser localStorage
- All API calls require authentication
- Docker containers run with minimal privileges

## Development

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Backend Development
```bash
cd backend
npm install
npm run dev
```

## API Endpoints

- `POST /api/auth/validate` - Validate GitHub token
- `GET /api/repositories` - List user repositories
- `GET /api/repositories/:owner/:repo/secrets` - List repository secrets
- `POST /api/repositories/:owner/:repo/secrets` - Create/update secret
- `DELETE /api/repositories/:owner/:repo/secrets/:name` - Delete secret

## Environment Variables

Backend (optional):
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (default: production)

## License

MIT