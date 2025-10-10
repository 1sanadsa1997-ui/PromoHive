# PromoHive Deployment Script for Windows
# Usage: .\deploy.ps1 [environment]

param(
    [string]$Environment = "production"
)

$ServerHost = "int.hostingervps.com"
$ServerUser = "root"
$AppDir = "/var/www/promohive"
$BackupDir = "/var/backups/promohive"

Write-Host "🚀 Starting PromoHive deployment to $Environment environment..." -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

Write-Status "Creating backup directory on server..."
ssh $ServerUser@$ServerHost "mkdir -p $BackupDir"

Write-Status "Backing up current deployment..."
ssh $ServerUser@$ServerHost @"
if [ -d '$AppDir' ]; then
    echo 'Creating backup...'
    tar -czf $BackupDir/backup-`$(date +%Y%m%d-%H%M%S).tar.gz -C $AppDir .
    echo 'Backup created successfully'
else
    echo 'No existing deployment found'
fi
"@

Write-Status "Stopping existing services..."
ssh $ServerUser@$ServerHost @"
cd $AppDir 2>/dev/null || true
docker-compose down 2>/dev/null || true
docker system prune -f 2>/dev/null || true
"@

Write-Status "Creating application directory..."
ssh $ServerUser@$ServerHost "mkdir -p $AppDir"

Write-Status "Copying project files to server..."
# Note: You'll need to install rsync for Windows or use scp
# For now, we'll use scp to copy files
scp -r . $ServerUser@$ServerHost:$AppDir/

Write-Status "Installing dependencies and building application..."
ssh $ServerUser@$ServerHost @"
cd $AppDir
npm install -g pnpm
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm build
"@

Write-Status "Creating necessary directories..."
ssh $ServerUser@$ServerHost @"
cd $AppDir
mkdir -p uploads logs ssl
chmod 755 uploads logs ssl
"@

Write-Status "Generating SSL certificates..."
ssh $ServerUser@$ServerHost @"
cd $AppDir/ssl
if [ ! -f cert.pem ] || [ ! -f key.pem ]; then
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
        -subj '/C=US/ST=State/L=City/O=Organization/CN=int.hostingervps.com'
    chmod 600 key.pem
    chmod 644 cert.pem
    echo 'SSL certificates generated'
else
    echo 'SSL certificates already exist'
fi
"@

Write-Status "Starting services..."
ssh $ServerUser@$ServerHost @"
cd $AppDir
docker-compose up -d --build
"@

Write-Status "Waiting for services to start..."
Start-Sleep -Seconds 30

Write-Status "Running database migrations..."
ssh $ServerUser@$ServerHost @"
cd $AppDir
docker-compose exec promohive pnpm prisma migrate deploy
"@

Write-Status "Seeding database..."
ssh $ServerUser@$ServerHost @"
cd $AppDir
docker-compose exec promohive npx tsx prisma/seed.ts
"@

Write-Status "Performing health check..."
Start-Sleep -Seconds 10

try {
    $response = Invoke-WebRequest -Uri "https://int.hostingervps.com/api/ping" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Status "✅ Health check passed! Application is running."
    }
} catch {
    Write-Warning "⚠️ Health check failed. Checking logs..."
    ssh $ServerUser@$ServerHost @"
cd $AppDir
docker-compose logs --tail=50
"@
}

Write-Status "Service status:"
ssh $ServerUser@$ServerHost @"
cd $AppDir
docker-compose ps
"@

Write-Status "🎉 Deployment completed!"
Write-Status "🌐 Application URL: https://int.hostingervps.com"
Write-Status "📊 Admin Panel: https://int.hostingervps.com/admin"
Write-Status "🔐 Admin Credentials: admin@promohive.com / admin123"

Write-Host ""
Write-Status "📋 Next steps:"
Write-Host "1. Update DNS records to point to the server IP"
Write-Host "2. Install proper SSL certificates (Let's Encrypt recommended)"
Write-Host "3. Configure firewall rules"
Write-Host "4. Set up monitoring and logging"
Write-Host "5. Configure automated backups"
