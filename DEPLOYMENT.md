# 🚀 PromoHive Server Deployment Guide

## 📋 Prerequisites

### Server Requirements
- **OS:** Ubuntu 20.04+ or CentOS 8+
- **RAM:** Minimum 2GB, Recommended 4GB+
- **Storage:** Minimum 20GB SSD
- **CPU:** 2+ cores
- **Network:** Public IP with ports 80, 443, 22 open

### Software Requirements
- Docker & Docker Compose
- Node.js 18+
- pnpm
- Git
- OpenSSL (for SSL certificates)
- Nginx (optional, included in Docker setup)

## 🔧 Server Setup

### 1. Connect to Server
```bash
ssh root@int.hostingervps.com
```

### 2. Update System
```bash
apt update && apt upgrade -y
```

### 3. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start Docker service
systemctl start docker
systemctl enable docker
```

### 4. Install Node.js and pnpm
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install pnpm
npm install -g pnpm
```

## 📦 Deployment Steps

### Method 1: Automated Deployment (Recommended)

#### From Local Machine (Windows)
```powershell
# Run the PowerShell deployment script
.\deploy.ps1 production
```

#### From Local Machine (Linux/Mac)
```bash
# Run the bash deployment script
./deploy.sh production
```

### Method 2: Manual Deployment

#### 1. Clone Repository on Server
```bash
cd /var/www
git clone https://github.com/1sanadsa1997-ui/PromoHive.git promohive
cd promohive
```

#### 2. Install Dependencies
```bash
pnpm install --frozen-lockfile
```

#### 3. Build Application
```bash
pnpm prisma generate
pnpm build
```

#### 4. Setup Environment
```bash
# Copy production environment file
cp env.production .env

# Edit environment variables if needed
nano .env
```

#### 5. Create Directories
```bash
mkdir -p uploads logs ssl
chmod 755 uploads logs ssl
```

#### 6. Generate SSL Certificates
```bash
cd ssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
    -subj '/C=US/ST=State/L=City/O=Organization/CN=int.hostingervps.com'
chmod 600 key.pem
chmod 644 cert.pem
```

#### 7. Start Services
```bash
cd /var/www/promohive
docker-compose up -d --build
```

#### 8. Run Database Migrations
```bash
docker-compose exec promohive pnpm prisma migrate deploy
```

#### 9. Seed Database
```bash
docker-compose exec promohive npx tsx prisma/seed.ts
```

## 🔍 Verification & Testing

### 1. Check Service Status
```bash
cd /var/www/promohive
docker-compose ps
```

### 2. Check Logs
```bash
# Application logs
docker-compose logs promohive

# Nginx logs
docker-compose logs nginx
```

### 3. Test Endpoints
```bash
# Health check
curl -f https://int.hostingervps.com/api/ping

# Test admin endpoint
curl -f https://int.hostingervps.com/admin
```

### 4. Test Database Connection
```bash
docker-compose exec promohive pnpm prisma db pull
```

## 🔐 Default Credentials

### Super Admin
- **Email:** admin@promohive.com
- **Password:** admin123
- **URL:** https://int.hostingervps.com/admin

### Demo User
- **Email:** demo@promohive.com
- **Password:** user123
- **URL:** https://int.hostingervps.com

## 🛠️ Management Commands

### Start Services
```bash
cd /var/www/promohive
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Update Application
```bash
git pull origin main
docker-compose up -d --build
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs promohive
docker-compose logs nginx

# Follow logs
docker-compose logs -f promohive
```

### Database Operations
```bash
# Run migrations
docker-compose exec promohive pnpm prisma migrate deploy

# Reset database
docker-compose exec promohive pnpm prisma migrate reset

# Seed database
docker-compose exec promohive npx tsx prisma/seed.ts

# Open Prisma Studio
docker-compose exec promohive pnpm prisma studio
```

## 🔧 Configuration

### Environment Variables
Edit `/var/www/promohive/.env` to modify:
- Database connection
- Email settings
- Payment gateways
- Security settings
- Feature flags

### Nginx Configuration
Edit `/var/www/promohive/nginx.conf` to modify:
- SSL settings
- Rate limiting
- Proxy settings
- Security headers

### Docker Configuration
Edit `/var/www/promohive/docker-compose.yml` to modify:
- Port mappings
- Volume mounts
- Environment variables
- Resource limits

## 🚨 Troubleshooting

### Common Issues

#### 1. Services Won't Start
```bash
# Check Docker status
systemctl status docker

# Check logs
docker-compose logs

# Restart Docker
systemctl restart docker
```

#### 2. Database Connection Issues
```bash
# Check database URL in .env
cat .env | grep DATABASE_URL

# Test connection
docker-compose exec promohive pnpm prisma db pull
```

#### 3. SSL Certificate Issues
```bash
# Regenerate certificates
cd /var/www/promohive/ssl
rm cert.pem key.pem
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
    -subj '/C=US/ST=State/L=City/O=Organization/CN=int.hostingervps.com'
```

#### 4. Port Conflicts
```bash
# Check what's using port 80/443
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Stop conflicting services
systemctl stop apache2
systemctl stop nginx
```

### Performance Optimization

#### 1. Enable Gzip Compression
Already configured in nginx.conf

#### 2. Set Resource Limits
Edit docker-compose.yml:
```yaml
services:
  promohive:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

#### 3. Enable Caching
Add Redis service to docker-compose.yml for session caching

## 📊 Monitoring

### 1. Health Checks
```bash
# Application health
curl -f https://int.hostingervps.com/api/ping

# Database health
docker-compose exec promohive pnpm prisma db pull
```

### 2. Resource Monitoring
```bash
# Docker stats
docker stats

# System resources
htop
df -h
free -h
```

### 3. Log Monitoring
```bash
# Real-time logs
docker-compose logs -f

# Log rotation (add to crontab)
0 0 * * * docker-compose logs --since=24h > /var/log/promohive-$(date +\%Y\%m\%d).log
```

## 🔒 Security

### 1. Firewall Configuration
```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 2. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
apt install certbot

# Generate certificate
certbot certonly --standalone -d int.hostingervps.com

# Update nginx.conf to use Let's Encrypt certificates
```

### 3. Regular Updates
```bash
# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

## 📞 Support

- **WhatsApp:** +1 (725) 334-8692
- **Email:** support@promohive.com
- **GitHub:** https://github.com/1sanadsa1997-ui/PromoHive

---

🎉 **Your PromoHive application is now live at https://int.hostingervps.com!**
