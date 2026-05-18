# Task Management System

This repository contains a sample task management system split into multiple services and a static frontend.

## Structure

- `frontend/` - static UI for login, signup, and dashboard
- `auth-service/` - authentication microservice
- `task-service/` - task management microservice
- `database/` - database support files
- `.github/workflows/` - CI/CD workflows
- `docker-compose.yml` - local service composition
- `Jenkinsfile` - Jenkins pipeline definition

## Local development

Start all services with Docker Compose:

```bash
docker-compose up --build
```

Then open `http://localhost:3000`.

## Frontend

The frontend is served as static files and includes:

- `index.html`
- `login.html`
- `signup.html`
- `dashboard.html`
- `css/style.css`
- `js/auth.js`
- `js/tasks.js`
- `Dockerfile`
