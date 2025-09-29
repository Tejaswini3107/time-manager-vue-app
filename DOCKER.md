# Docker Setup for Time Manager Application

This document provides instructions for running the Time Manager application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Production Environment

1. **Build and run the full stack:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Development Environment

1. **Run in development mode:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3002 (with hot reload)
   - Backend API: http://localhost:3001 (with auto-reload)
   - Database: localhost:5432

## Services

### Frontend (Vue.js)
- **Port:** 3002
- **Technology:** Vue.js 3 with Vite
- **Features:** Hot reload in development mode
- **Production:** Nginx server with optimized build

### Backend (Node.js/Express)
- **Port:** 3001
- **Technology:** Node.js with Express
- **Features:** Auto-reload in development mode
- **API Endpoints:** `/api/*`

### Database (PostgreSQL)
- **Port:** 5432
- **Database:** time_manager
- **User:** time_manager_user
- **Password:** time_manager_password
- **Features:** Persistent data storage

### Redis (Optional)
- **Port:** 6379
- **Purpose:** Caching and session storage
- **Features:** Persistent data storage

## Docker Commands

### Basic Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs database
```

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start development in background
docker-compose -f docker-compose.dev.yml up -d

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Database Commands

```bash
# Connect to database
docker-compose exec database psql -U time_manager_user -d time_manager

# Backup database
docker-compose exec database pg_dump -U time_manager_user time_manager > backup.sql

# Restore database
docker-compose exec -T database psql -U time_manager_user -d time_manager < backup.sql
```

## Environment Variables

### Frontend
- `NODE_ENV`: development/production
- `VITE_API_URL`: Backend API URL

### Backend
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 3001)
- `DATABASE_URL`: PostgreSQL connection string

### Database
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password

## File Structure

```
├── Dockerfile                 # Production frontend
├── Dockerfile.dev            # Development frontend
├── Dockerfile.backend        # Production backend
├── Dockerfile.backend.dev    # Development backend
├── docker-compose.yml        # Production environment
├── docker-compose.dev.yml    # Development environment
├── nginx.conf                # Nginx configuration
├── init.sql                  # Database initialization
└── .dockerignore             # Docker ignore file
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3002
   lsof -i :3001
   lsof -i :5432
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs database
   
   # Restart database
   docker-compose restart database
   ```

3. **Frontend not loading:**
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Rebuild frontend
   docker-compose up --build frontend
   ```

4. **Backend API not responding:**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Restart backend
   docker-compose restart backend
   ```

### Clean Up

```bash
# Remove all containers and networks
docker-compose down

# Remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Remove everything (containers, networks, volumes, images)
docker-compose down -v --rmi all
```

## Production Deployment

### Using Docker Compose

1. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL=postgresql://user:password@host:5432/database
   ```

2. **Deploy:**
   ```bash
   docker-compose up -d
   ```

### Using Docker Swarm

1. **Initialize swarm:**
   ```bash
   docker swarm init
   ```

2. **Deploy stack:**
   ```bash
   docker stack deploy -c docker-compose.yml time-manager
   ```

### Using Kubernetes

1. **Convert compose to Kubernetes:**
   ```bash
   kompose convert
   ```

2. **Deploy:**
   ```bash
   kubectl apply -f .
   ```

## Monitoring

### Health Checks

- Frontend: http://localhost:3002/health
- Backend: http://localhost:3001/api/health
- Database: `docker-compose exec database pg_isready`

### Logs

```bash
# Follow logs in real-time
docker-compose logs -f

# Follow logs for specific service
docker-compose logs -f backend
```

## Security Considerations

1. **Change default passwords** in production
2. **Use environment variables** for sensitive data
3. **Enable SSL/TLS** for production deployments
4. **Use secrets management** for sensitive configuration
5. **Regular security updates** for base images

## Performance Optimization

1. **Use multi-stage builds** (already implemented)
2. **Enable gzip compression** (configured in nginx.conf)
3. **Use Redis for caching** (optional service included)
4. **Optimize database queries** and add indexes
5. **Use CDN** for static assets in production
