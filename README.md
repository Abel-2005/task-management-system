# Task Management System

This repository contains a production-ready DevOps Task Management System with a modern operations dashboard, real-time activity logging, and simulated deployment pipelines.

## 🚀 New Features (v2.1.0)

- ✅ **Task Status Management** - Track tasks through Pending → In Progress → Completed
- ✅ **Dynamic Activity Feed** - Real-time logging of all operations
- ✅ **Delete Functionality** - Remove tasks with smooth animations
- ✅ **Mock DevOps Actions** - Simulate builds and deployments
- ✅ **Production UI** - Modern SaaS-style dashboard with glassmorphism design
- ✅ **Real-time Metrics** - Dashboard counters update dynamically
- ✅ **Enhanced API** - RESTful endpoints for all operations

See [ENHANCEMENT_GUIDE.md](./ENHANCEMENT_GUIDE.md) for detailed documentation.

## Structure

- `frontend/` - Modern responsive UI for login, signup, and dashboard
- `auth-service/` - Spring Boot microservice with task & activity management
- `database/` - PostgreSQL database with persistent storage
- `nginx/` - Reverse proxy configuration
- `.github/workflows/` - CI/CD workflows
- `docker-compose.yml` - Multi-service orchestration
- `Jenkinsfile` - Jenkins pipeline definition

## Quick Start

### Local development

Start all services with Docker Compose:

```bash
docker-compose up --build
```

Then open `http://localhost/dashboard.html` and login.

### Demo Credentials
- Username: `demo`
- Password: `demo`

## API Endpoints

### Tasks
```
GET    /api/tasks              # List all tasks
POST   /api/tasks              # Create task
PUT    /api/tasks/{id}         # Update task status
DELETE /api/tasks/{id}         # Delete task
```

### Activity
```
GET    /api/activity?limit=20  # Get recent activities
```

### DevOps Actions
```
POST   /api/tasks/action/build    # Trigger build simulation
POST   /api/tasks/action/deploy   # Trigger deploy simulation
```

## Frontend

The frontend is served as static files via Nginx:

- `index.html` - Landing page
- `login.html` - Authentication page
- `signup.html` - Registration page
- `dashboard.html` - Main operations dashboard
- `css/style.css` - Production-grade styling
- `js/tasks.js` - Dashboard functionality
- `js/auth.js` - Authentication logic

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Spring Boot 3.5.14 + Spring Security
- **Database**: PostgreSQL 17
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions + Jenkins
