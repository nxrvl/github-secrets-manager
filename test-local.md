# Testing GitHub Secrets Manager Locally

Since there are Docker connectivity issues, here's how to test the application locally:

## Backend Setup

1. Open a terminal and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create the data directory and initialize the database:
```bash
mkdir -p data
npm run init-db
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:3001

## Frontend Setup

1. Open another terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Testing the Application

1. Open http://localhost:3000 in your browser
2. You'll see the login page
3. Enter your GitHub Personal Access Token (needs repo scope)
4. After login, you'll see your repositories
5. Click on any repository to manage its secrets
6. You can create, edit, and delete secrets

## API Testing

You can also test the backend API directly:

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Validate token (replace YOUR_TOKEN)
curl -X POST http://localhost:3001/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN"}'

# List repositories (replace YOUR_TOKEN)
curl http://localhost:3001/api/repositories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Docker Setup (When Docker Hub is accessible)

When Docker Hub connectivity is restored, you can use:

```bash
# Build and run with docker-compose
docker-compose up --build

# Or use the development compose file
docker-compose -f docker-compose.dev.yml up --build
```

The application will be available at:
- Production: http://localhost (port 80)
- Development: http://localhost:8080