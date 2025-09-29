#!/bin/bash

# Time Manager Deployment Script
set -e

echo "🚀 Starting Time Manager deployment..."

# Configuration
APP_NAME="time-manager"
DEPLOY_DIR="/opt/time-manager"
BACKUP_DIR="/opt/backups/time-manager"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed"
    exit 1
fi

# Create backup directory
log_info "Creating backup directory..."
sudo mkdir -p $BACKUP_DIR

# Backup database
log_info "Creating database backup..."
sudo docker-compose -f $DEPLOY_DIR/$DOCKER_COMPOSE_FILE exec -T database pg_dump -U time_manager_user time_manager > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql

# Keep only last 7 backups
log_info "Cleaning old backups..."
sudo find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

# Pull latest images
log_info "Pulling latest Docker images..."
cd $DEPLOY_DIR
sudo docker-compose -f $DOCKER_COMPOSE_FILE pull

# Stop current services
log_info "Stopping current services..."
sudo docker-compose -f $DOCKER_COMPOSE_FILE down

# Start services
log_info "Starting services..."
sudo docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 30

# Health check
log_info "Performing health check..."
if curl -f http://localhost/health; then
    log_info "Health check passed!"
else
    log_error "Health check failed!"
    exit 1
fi

# Clean up old images
log_info "Cleaning up old Docker images..."
sudo docker image prune -f

log_info "✅ Deployment completed successfully!"

# Show running containers
log_info "Running containers:"
sudo docker-compose -f $DOCKER_COMPOSE_FILE ps
