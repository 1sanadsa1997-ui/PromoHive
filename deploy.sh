#!/bin/bash

# PromoHive Deployment Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
SERVER_HOST="int.hostingervps.com"
SERVER_USER="root"
APP_DIR="/var/www/promohive"
BACKUP_DIR="/var/backups/promohive"

echo "🚀 Starting PromoHive deployment to $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Create backup directory on server
print_status "Creating backup directory on server..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $BACKUP_DIR"

# Backup current deployment if it exists
print_status "Backing up current deployment..."
ssh $SERVER_USER@$SERVER_HOST "
    if [ -d '$APP_DIR' ]; then
        echo 'Creating backup...'
        tar -czf $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz -C $APP_DIR .
        echo 'Backup created successfully'
    else
        echo 'No existing deployment found'
    fi
"

# Stop existing services
print_status "Stopping existing services..."
ssh $SERVER_USER@$SERVER_HOST "
    cd $APP_DIR 2>/dev/null || true
    docker-compose down 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
"

# Create application directory
print_status "Creating application directory..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $APP_DIR"

# Copy project files to server
print_status "Copying project files to server..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude 'dist' \
    --exclude 'logs' \
    --exclude 'uploads' \
    ./ $SERVER_USER@$SERVER_HOST:$APP_DIR/

# Copy environment file
print_status "Copying environment configuration..."
scp .env $SERVER_USER@$SERVER_HOST:$APP_DIR/.env

# Install dependencies and build on server
print_status "Installing dependencies and building application..."
ssh $SERVER_USER@$SERVER_HOST "
    cd $APP_DIR
    npm install -g pnpm
    pnpm install --frozen-lockfile
    pnpm prisma generate
    pnpm build
"

# Create necessary directories
print_status "Creating necessary directories..."
ssh $SERVER_USER@$SERVER_HOST "
    cd $APP_DIR
    mkdir -p uploads logs ssl
    chmod 755 uploads logs ssl
"

# Generate SSL certificates (self-signed for now)
print_status "Generating SSL certificates..."
ssh $SERVER_USER@$SERVER_HOST "
    cd $APP_DIR/ssl
    if [ ! -f cert.pem ] || [ ! -f key.pem ]; then
        openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
            -subj '/C=US/ST=State/L=City/O=Organization/CN=int.hostingervps.com'
        chmod 600 key.pem
        chmod 644 cert.pem
        echo 'SSL certificates generated'
    else
        echo 'SSL certificates already exist'
    fi
"

# Start services
print_status "Starting services..."
ssh $SERVER_USER@$SERVER_HOST "
    cd $APP_DIR
    docker-compose up -d --build
"

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Run database migrations
print_status "Running database migrations..."
ssh $SERVER_USER@$SERVER_HOST "
    cd $APP_DIR
    docker-compose exec promohive pnpm prisma migrate deploy
"

# Seed database if needed
print_status "Seeding database..."
ssh $SERVER_USER@$SERVER_HOST "
    cd $APP_DIR
    docker-compose exec promohive npx tsx prisma/seed.ts
"

# Health check
print_status "Performing health check..."
sleep 10

if curl -f -s https://int.hostingervps.com/api/ping > /dev/null; then
    print_status "✅ Health check passed! Application is running."
else
    print_warning "⚠️ Health check failed. Checking logs..."
    ssh $SERVER_USER@$SERVER_HOST "
        cd $APP_DIR
        docker-compose logs --tail=50
    "
fi

# Show service status
print_status "Service status:"
ssh $SERVER_USER@$SERVER_HOST "
    cd $APP_DIR
    docker-compose ps
"

print_status "🎉 Deployment completed!"
print_status "🌐 Application URL: https://int.hostingervps.com"
print_status "📊 Admin Panel: https://int.hostingervps.com/admin"
print_status "🔐 Admin Credentials: admin@promohive.com / admin123"

echo ""
print_status "📋 Next steps:"
echo "1. Update DNS records to point to the server IP"
echo "2. Install proper SSL certificates (Let's Encrypt recommended)"
echo "3. Configure firewall rules"
echo "4. Set up monitoring and logging"
echo "5. Configure automated backups"
