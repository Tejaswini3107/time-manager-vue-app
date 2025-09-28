# Time Manager Application - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Frontend Architecture (Vue.js)](#frontend-architecture-vuejs)
5. [Backend Architecture (Express.js)](#backend-architecture-expressjs)
6. [Database Schema](#database-schema)
7. [Docker Configuration](#docker-configuration)
8. [Development Commands](#development-commands)
9. [Deployment Guide](#deployment-guide)
10. [API Documentation](#api-documentation)
11. [Component Architecture](#component-architecture)
12. [State Management](#state-management)
13. [Styling and UI](#styling-and-ui)
14. [Testing](#testing)
15. [Monitoring and Logging](#monitoring-and-logging)
16. [Troubleshooting](#troubleshooting)

---

## Project Overview

The **Time Manager** is a comprehensive web application for tracking employee working hours, managing time entries, and providing analytics. It's built with modern web technologies and follows microservices architecture principles.

### Key Features:
- **User Management**: Create, edit, and manage user accounts
- **Time Tracking**: Clock in/out functionality with real-time tracking
- **Working Time Management**: Add, edit, and delete working time entries
- **Analytics Dashboard**: Visual charts and metrics for time analysis
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data synchronization

---

## Technology Stack

### Frontend
- **Vue.js 3.4.0** - Progressive JavaScript framework
- **Vite 6.3.5** - Fast build tool and development server
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **Chart.js 4.4.0** - Data visualization library
- **Lucide Vue Next** - Icon library
- **Vue Router 4.2.0** - Client-side routing

### Backend
- **Express.js 4.18.2** - Web application framework
- **CORS 2.8.5** - Cross-Origin Resource Sharing middleware
- **Node.js** - JavaScript runtime environment

### Database
- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching and session storage

### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and load balancer
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Unit testing framework
- **Artillery** - Performance testing
- **Concurrently** - Run multiple commands

---

## Project Structure

```
Time Manager UI Design-3/
├── src/                          # Source code
│   ├── components/               # Vue components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── ActivityFeed.vue     # Activity feed component
│   │   ├── ChartManager.vue     # Chart management
│   │   ├── ClockManager.vue     # Clock in/out functionality
│   │   ├── DashboardCharts.vue  # Dashboard charts
│   │   ├── Login.vue           # Login component (commented out)
│   │   ├── MetricsCards.vue    # Metrics display cards
│   │   ├── User.vue            # User profile component
│   │   ├── UsersPage.vue       # User management page
│   │   ├── WorkingTime.vue     # Single working time entry
│   │   └── WorkingTimes.vue    # Working times list
│   ├── composables/            # Vue composables
│   │   ├── useClocks.js        # Clock-related logic
│   │   ├── useUsers.js         # User-related logic
│   │   └── useWorkingTime.js   # Working time logic
│   ├── services/               # API services
│   │   └── api.js              # Main API service
│   ├── styles/                 # Global styles
│   │   └── globals.css         # Global CSS
│   ├── App.vue                 # Main application component
│   ├── main.js                 # Application entry point
│   └── index.css               # Main stylesheet
├── tests/                      # Test files
│   └── performance/            # Performance tests
├── monitoring/                 # Monitoring configuration
├── nginx/                      # Nginx configuration
├── docker-compose.yml          # Development Docker setup
├── docker-compose.prod.yml     # Production Docker setup
├── Dockerfile                  # Frontend Docker image
├── Dockerfile.backend          # Backend Docker image
├── package.json                # Node.js dependencies
├── vite.config.js              # Vite configuration
└── server.js                   # Express.js backend server
```

---

## Frontend Architecture (Vue.js)

### Vue.js 3 Composition API

The application uses Vue.js 3 with the Composition API, which is similar to React hooks but for Vue. Here's how it works:

#### Component Structure
```javascript
// Example: User.vue component
<template>
  <!-- HTML template -->
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'User',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    // Reactive data
    const loading = ref(false);
    const error = ref(null);
    
    // Computed properties
    const userDisplayName = computed(() => {
      return props.currentUser.username || 'Loading...';
    });
    
    // Methods
    const loadUserData = async () => {
      // API call logic
    };
    
    // Lifecycle hooks
    onMounted(() => {
      loadUserData();
    });
    
    return {
      loading,
      error,
      userDisplayName,
      loadUserData
    };
  }
};
</script>
```

#### Key Vue.js Concepts (for .NET Developers)

1. **Reactive Data** (`ref`, `reactive`)
   - Similar to C# properties with `INotifyPropertyChanged`
   - Automatically updates UI when data changes

2. **Computed Properties** (`computed`)
   - Similar to C# computed properties or calculated fields
   - Automatically recalculated when dependencies change

3. **Props** (Component Input)
   - Similar to C# constructor parameters or properties
   - Pass data from parent to child components

4. **Emits** (Component Output)
   - Similar to C# events
   - Child components can notify parent components

5. **Lifecycle Hooks**
   - `onMounted` - Similar to C# constructor or `OnLoad`
   - `onUnmounted` - Similar to C# `Dispose` method

### Component Communication

```javascript
// Parent Component (App.vue)
<template>
  <User :currentUser="currentUser" @navigate-to-users="handleNavigation" />
</template>

<script>
// Child Component (User.vue)
<template>
  <button @click="navigateToUsers">View All Users</button>
</template>

<script>
export default {
  emits: ['navigate-to-users'],
  setup(props, { emit }) {
    const navigateToUsers = () => {
      emit('navigate-to-users'); // Emit event to parent
    };
    
    return { navigateToUsers };
  }
};
</script>
```

---

## Backend Architecture (Express.js)

### Express.js Server (server.js)

The backend is a simple Express.js server that provides REST API endpoints:

```javascript
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory data storage (for development)
let users = [
  { id: 1, username: 'testuser', email: 'test@gmnail.com' }
];
let clocks = [];
let workingTimes = [];

// API Routes
app.get('/api/users', (req, res) => {
  res.json({ data: users });
});

app.post('/api/users', (req, res) => {
  const newUser = { id: Date.now(), ...req.body.user };
  users.push(newUser);
  res.status(201).json({ data: newUser });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### API Service Layer (api.js)

The frontend uses a centralized API service:

```javascript
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:4000/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  }

  // User methods
  async getUsers() {
    return await this.request('/users');
  }

  async getUserById(id) {
    return await this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return await this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ user: userData })
    });
  }

  // Clock methods
  async getClocks(userId) {
    return await this.request(`/clocks?user_id=${userId}`);
  }

  async createClock(clockData) {
    return await this.request('/clocks', {
      method: 'POST',
      body: JSON.stringify({ clock: clockData })
    });
  }

  // Working time methods
  async getWorkingTimes(userId, filters = {}) {
    const params = new URLSearchParams({ user_id: userId, ...filters });
    return await this.request(`/workingtimes?${params}`);
  }

  async createWorkingTime(workingTimeData) {
    return await this.request('/workingtimes', {
      method: 'POST',
      body: JSON.stringify({ working_time: workingTimeData })
    });
  }
}

export const apiService = new ApiService();
```

---

## Database Schema

### PostgreSQL Tables

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clocks table (for clock in/out)
CREATE TABLE clocks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    time TIMESTAMP NOT NULL,
    status BOOLEAN NOT NULL, -- true for clock in, false for clock out
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Working times table
CREATE TABLE working_times (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    start TIMESTAMP NOT NULL,
    "end" TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_clocks_user_id ON clocks(user_id);
CREATE INDEX idx_clocks_time ON clocks(time);
CREATE INDEX idx_working_times_user_id ON working_times(user_id);
CREATE INDEX idx_working_times_start ON working_times(start);
```

### Data Relationships

```
Users (1) -----> (Many) Clocks
Users (1) -----> (Many) Working Times
```

---

## Docker Configuration

### Docker Compose Services

The application uses Docker Compose to orchestrate multiple services:

#### Development Setup (docker-compose.yml)
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3002:3002"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend.dev
    ports:
      - "3001:3001"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - PORT=3001

  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=time_manager
      - POSTGRES_USER=time_manager_user
      - POSTGRES_PASSWORD=time_manager_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro

volumes:
  postgres_data:
```

#### Production Setup (docker-compose.prod.yml)
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    networks:
      - time-manager-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@database:5432/time_manager
    depends_on:
      - database
    networks:
      - time-manager-network

  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=time_manager
      - POSTGRES_USER=time_manager_user
      - POSTGRES_PASSWORD=time_manager_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - time-manager-network

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - time-manager-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - time-manager-network

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  time-manager-network:
    driver: bridge
```

### Dockerfiles

#### Frontend Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY server.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

CMD ["node", "server.js"]
```

---

## Development Commands

### NPM Scripts

```bash
# Development
npm run dev              # Start Vite dev server (frontend only)
npm run server           # Start Express server (backend only)
npm run dev:full         # Start both frontend and backend
npm start                # Alias for dev:full

# Building
npm run build            # Build frontend for production

# Docker Commands
npm run docker:build     # Build Docker images
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
npm run docker:dev       # Start development containers
npm run docker:logs      # View container logs
npm run docker:clean     # Clean up containers and images

# Testing
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run performance:test # Run performance tests

# Code Quality
npm run lint             # Lint and fix code
npm run lint:check       # Check linting without fixing

# Deployment
npm run deploy:prod      # Deploy to production
npm run deploy:dev       # Deploy to development
```

### Docker Commands

```bash
# Basic Docker Commands
docker-compose up                    # Start all services
docker-compose up -d                 # Start in background
docker-compose down                  # Stop all services
docker-compose down -v               # Stop and remove volumes
docker-compose logs -f               # Follow logs
docker-compose logs -f frontend      # Follow specific service logs

# Development
docker-compose -f docker-compose.dev.yml up
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down

# Individual Services
docker-compose up frontend           # Start only frontend
docker-compose up backend database   # Start backend and database
docker-compose stop frontend         # Stop specific service
docker-compose restart backend       # Restart specific service

# Database Operations
docker-compose exec database psql -U time_manager_user -d time_manager
docker-compose exec database pg_dump -U time_manager_user time_manager > backup.sql

# Cleanup
docker-compose down -v --rmi all     # Remove everything
docker system prune -a               # Clean up Docker system
```

---

## Deployment Guide

### Local Development Setup

1. **Prerequisites**
   ```bash
   # Install Node.js (18+)
   # Install Docker and Docker Compose
   # Install Git
   ```

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd "Time Manager UI Design-3"
   npm install
   ```

3. **Start Development Environment**
   ```bash
   # Option 1: Local development (no Docker)
   npm run dev:full
   
   # Option 2: Docker development
   npm run docker:dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001/api
   - Database: localhost:5432

### Production Deployment

1. **Environment Variables**
   ```bash
   # Create .env file
   DB_NAME=time_manager
   DB_USER=time_manager_user
   DB_PASSWORD=your_secure_password
   GRAFANA_PASSWORD=your_grafana_password
   ```

2. **Deploy with Docker**
   ```bash
   # Build and start production containers
   npm run deploy:prod
   
   # Or manually
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Access Production Services**
   - Application: https://your-domain.com
   - Grafana: https://your-domain.com:3000
   - Prometheus: https://your-domain.com:9090

### Cloud Deployment (AWS/Azure/GCP)

1. **Prepare for Cloud**
   ```bash
   # Update docker-compose.prod.yml with cloud-specific settings
   # Configure environment variables
   # Set up SSL certificates
   ```

2. **Deploy to Cloud**
   ```bash
   # Using cloud CLI tools
   aws ecs create-cluster --cluster-name time-manager
   # Or use cloud-specific deployment tools
   ```

---

## API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-domain.com/api`

### Authentication
Currently, the application doesn't implement authentication. All endpoints are publicly accessible.

### Endpoints

#### Users
```http
GET    /api/users              # Get all users
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create new user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

#### Clocks
```http
GET    /api/clocks?user_id=:id # Get clocks for user
POST   /api/clocks             # Create clock entry
```

#### Working Times
```http
GET    /api/workingtimes?user_id=:id&start=:date&end=:date  # Get working times
POST   /api/workingtimes       # Create working time entry
PUT    /api/workingtimes/:id   # Update working time entry
DELETE /api/workingtimes/:id   # Delete working time entry
```

#### Health Check
```http
GET    /api/health             # Health check endpoint
```

### Request/Response Examples

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "user": {
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

Response:
```json
{
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Create Clock Entry
```http
POST /api/clocks
Content-Type: application/json

{
  "clock": {
    "user_id": 1,
    "time": "2025-01-01T09:00:00.000Z",
    "status": true
  }
}
```

#### Create Working Time Entry
```http
POST /api/workingtimes
Content-Type: application/json

{
  "working_time": {
    "user_id": 1,
    "start": "2025-01-01T09:00:00.000Z",
    "end": "2025-01-01T17:00:00.000Z"
  }
}
```

---

## Component Architecture

### Component Hierarchy

```
App.vue (Root Component)
├── User.vue (User Profile)
├── ClockManager.vue (Clock In/Out)
├── MetricsCards.vue (Dashboard Metrics)
├── DashboardCharts.vue (Charts)
├── WorkingTimes.vue (Working Times List)
├── UsersPage.vue (User Management)
└── ChartManager.vue (Analytics)
```

### Key Components Explained

#### 1. App.vue (Root Component)
- **Purpose**: Main application container and routing
- **Features**: Sidebar navigation, user state management
- **State**: Current user, active tab, sidebar state

#### 2. User.vue (User Profile)
- **Purpose**: Display and edit user information
- **Features**: User details, edit functionality
- **Props**: `currentUser`, `onUserUpdate`
- **Emits**: `navigate-to-users`

#### 3. ClockManager.vue (Time Tracking)
- **Purpose**: Handle clock in/out functionality
- **Features**: Real-time clock, status tracking
- **Props**: `userId`
- **State**: Clock status, current time

#### 4. MetricsCards.vue (Dashboard Metrics)
- **Purpose**: Display key performance metrics
- **Features**: Today's hours, weekly hours, productivity
- **Props**: `userId`
- **Data**: Working times, clock data

#### 5. DashboardCharts.vue (Visualization)
- **Purpose**: Display charts and graphs
- **Features**: Weekly chart, monthly chart
- **Libraries**: Chart.js
- **Props**: `userId`

#### 6. WorkingTimes.vue (Time Management)
- **Purpose**: Manage working time entries
- **Features**: CRUD operations, date/time pickers
- **Props**: `userId`
- **State**: Working times list, edit modal

#### 7. UsersPage.vue (User Management)
- **Purpose**: Manage all users in the system
- **Features**: User list, add/edit/delete users
- **State**: Users list, modals

### Component Communication Patterns

#### 1. Props Down, Events Up
```javascript
// Parent passes data down
<User :currentUser="currentUser" @navigate-to-users="handleNavigation" />

// Child emits events up
emit('navigate-to-users');
```

#### 2. Shared State via Props
```javascript
// App.vue manages global state
const currentUser = ref({ id: 1, username: 'testuser' });

// Pass to child components
<User :currentUser="currentUser" />
<ClockManager :userId="currentUser.id" />
```

#### 3. API Service Integration
```javascript
// Each component uses the API service directly
import { apiService } from '../services/api.js';

const loadData = async () => {
  const data = await apiService.getUsers();
  users.value = data;
};
```

---

## State Management

### Current Approach: Props and Local State

The application uses a simple state management approach:

#### 1. Global State (App.vue)
```javascript
// App.vue - Global application state
const currentUser = ref({
  id: 1,
  username: 'Loading...',
  email: 'Loading...'
});

const activeTab = ref('dashboard');
const sidebarOpen = ref(true);
```

#### 2. Component State
```javascript
// Each component manages its own state
const loading = ref(false);
const error = ref(null);
const data = ref([]);
```

#### 3. API State Management
```javascript
// Components fetch and manage their own data
const loadData = async () => {
  try {
    loading.value = true;
    const result = await apiService.getData();
    data.value = result;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
```

### Alternative: Vuex/Pinia (Not Currently Used)

For larger applications, you might want to use a state management library:

```javascript
// Example with Pinia (Vue 3 recommended)
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    users: [],
    loading: false
  }),
  
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const users = await apiService.getUsers();
        this.users = users;
      } finally {
        this.loading = false;
      }
    }
  }
});
```

---

## Styling and UI

### Tailwind CSS

The application uses Tailwind CSS for styling, which is similar to Bootstrap but utility-first:

#### Utility Classes
```html
<!-- Spacing -->
<div class="p-4 m-2">Padding 4, Margin 2</div>

<!-- Colors -->
<div class="bg-blue-500 text-white">Blue background, white text</div>

<!-- Layout -->
<div class="flex items-center justify-between">Flexbox layout</div>

<!-- Responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">Responsive grid</div>
```

#### Custom Components
```html
<!-- Card Component -->
<Card class="w-full">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Component Styling

#### 1. Scoped Styles
```vue
<style scoped>
.custom-class {
  /* Component-specific styles */
}
</style>
```

#### 2. Global Styles
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
body {
  font-family: 'Inter', sans-serif;
}
```

#### 3. Dynamic Classes
```vue
<template>
  <div :class="`button ${isActive ? 'active' : 'inactive'}`">
    Button
  </div>
</template>
```

### UI Components

The application includes custom UI components in `src/components/ui/`:

- **Button**: Customizable button component
- **Card**: Card container with header/content
- **Input**: Form input component
- **Badge**: Status badge component
- **Label**: Form label component

---

## Testing

### Unit Testing with Vitest

```javascript
// tests/components/User.test.js
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import User from '@/components/User.vue';

describe('User Component', () => {
  it('renders user information correctly', () => {
    const user = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    };
    
    const wrapper = mount(User, {
      props: { currentUser: user }
    });
    
    expect(wrapper.text()).toContain('testuser');
    expect(wrapper.text()).toContain('test@example.com');
  });
});
```

### Performance Testing with Artillery

```yaml
# tests/performance/load-test.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/health"
      - get:
          url: "/api/users"
```

### Running Tests

```bash
# Unit tests
npm run test

# Tests with UI
npm run test:ui

# Coverage report
npm run test:coverage

# Performance tests
npm run performance:test
```

---

## Monitoring and Logging

### Prometheus Metrics

The application includes Prometheus for metrics collection:

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'time-manager-backend'
    static_configs:
      - targets: ['backend:3001']
  
  - job_name: 'time-manager-frontend'
    static_configs:
      - targets: ['frontend:80']
```

### Grafana Dashboards

Grafana provides visualization for metrics:

- **Application Metrics**: Response times, error rates
- **System Metrics**: CPU, memory, disk usage
- **Database Metrics**: Connection pool, query performance
- **Custom Metrics**: User activity, time tracking data

### Logging

```javascript
// Backend logging
console.log('=== API REQUEST ===');
console.log('URL:', url);
console.log('Config:', config);

// Error logging
console.error('Failed to fetch data:', err);
```

---

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run server
```

#### 2. Docker Issues
```bash
# Clean up Docker
docker-compose down -v --rmi all
docker system prune -a

# Rebuild containers
docker-compose up --build
```

#### 3. Database Connection Issues
```bash
# Check database status
docker-compose exec database pg_isready

# Connect to database
docker-compose exec database psql -U time_manager_user -d time_manager
```

#### 4. CORS Issues
```javascript
// Check CORS configuration in server.js
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### 5. Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run build
```

### Debugging

#### 1. Frontend Debugging
```javascript
// Add console logs
console.log('Component mounted:', props.currentUser);

// Use Vue DevTools browser extension
// Add debugger statements
debugger;
```

#### 2. Backend Debugging
```javascript
// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});
```

#### 3. Network Debugging
```bash
# Check API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/users

# Check Docker services
docker-compose ps
docker-compose logs frontend
docker-compose logs backend
```

---

## Conclusion

This Time Manager application demonstrates modern web development practices with:

- **Vue.js 3** for reactive frontend development
- **Express.js** for RESTful API backend
- **Docker** for containerization and deployment
- **PostgreSQL** for data persistence
- **Chart.js** for data visualization
- **Tailwind CSS** for modern styling

The architecture is scalable and follows microservices principles, making it suitable for production deployment and further development.

### Key Takeaways for .NET Developers

1. **Vue.js** is similar to Angular but lighter and more flexible
2. **Express.js** is like ASP.NET Core but for Node.js
3. **Docker** provides similar benefits to .NET containerization
4. **Component-based architecture** is similar to .NET Blazor
5. **API-first design** follows REST principles like .NET Web API

This documentation should help you understand and work with the Time Manager application effectively.
