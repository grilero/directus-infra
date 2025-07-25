# Directus Infrastructure Deployment Guide

## Overview

This setup runs both development and production Directus instances on a single EC2 instance using Docker Compose with:
- **Development**: `dev.content.grile.ro` → `docker-compose.dev.yml` 
- **Production**: `content.grile.ro` → `docker-compose.prod.yml`
- **Storage**: Supabase Storage (not S3) for file management
- **Databases**: Separate Supabase projects for dev and prod
- **SSL**: Let's Encrypt certificates via Nginx reverse proxy

## Architecture

```
EC2 Instance (Single)
├── Nginx (Port 80/443)
│   ├── dev.content.grile.ro → directus-dev:8055
│   └── content.grile.ro → directus-prod:8056
├── Directus Dev (Port 8055)
│   └── Connects to: grile-ro-dev Supabase
├── Directus Prod (Port 8056) 
│   └── Connects to: grile-ro-prod Supabase
└── Let's Encrypt Certbot
```

## Initial EC2 Setup

### 1. Launch EC2 Instance
- **AMI**: Ubuntu Server 20.04 LTS
- **Instance Type**: t3.medium (minimum for running both instances)
- **Security Groups**: Allow SSH (22), HTTP (80), HTTPS (443)
- **Storage**: 20GB+ EBS volume

### 2. Run Setup Script
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Run the setup script
curl -fsSL https://raw.githubusercontent.com/grilero/directus-infra/main/scripts/ec2-setup.sh | bash
```

### 3. Configure DNS
Point your domains to the EC2 instance:
- `dev.content.grile.ro` → EC2 Elastic IP
- `content.grile.ro` → EC2 Elastic IP

### 4. Initialize SSL Certificates
```bash
cd ~/directus-infra
./init-letsencrypt.sh
```

## GitHub Actions CI/CD Setup

### Repository Secrets Required

#### SSH Access
- `DEV_HOST` = `your-ec2-ip`
- `DEV_USER` = `ubuntu`
- `DEV_SSH_PRIVATE_KEY` = SSH private key for EC2 access
- `PROD_HOST` = `your-ec2-ip` (same as dev)
- `PROD_USER` = `ubuntu`
- `PROD_SSH_PRIVATE_KEY` = SSH private key for EC2 access (same as dev)

#### Development Environment
- `DEV_DIRECTUS_KEY` = Random 32+ character encryption key
- `DEV_DIRECTUS_SECRET` = Random 32+ character JWT secret
- `DEV_ADMIN_EMAIL` = Admin email for dev instance
- `DEV_ADMIN_PASSWORD` = Admin password for dev instance
- `DEV_PUBLIC_URL` = `https://dev.content.grile.ro`
- `DEV_DB_HOST` = Supabase dev database host
- `DEV_DB_USER` = Supabase dev database user
- `DEV_DB_PASSWORD` = Supabase dev database password

#### Production Environment
- `PROD_DIRECTUS_KEY` = Random 32+ character encryption key
- `PROD_DIRECTUS_SECRET` = Random 32+ character JWT secret
- `PROD_ADMIN_EMAIL` = Admin email for prod instance
- `PROD_ADMIN_PASSWORD` = Admin password for prod instance
- `PROD_PUBLIC_URL` = `https://content.grile.ro`
- `PROD_DB_HOST` = Supabase prod database host
- `PROD_DB_USER` = Supabase prod database user
- `PROD_DB_PASSWORD` = Supabase prod database password

#### Supabase Storage (Optional - for future S3 migration)
- `SUPABASE_PROJECT_URL_DEV` = Your dev Supabase project URL
- `SUPABASE_ANON_KEY_DEV` = Dev Supabase anon key
- `SUPABASE_PROJECT_URL_PROD` = Your prod Supabase project URL
- `SUPABASE_ANON_KEY_PROD` = Prod Supabase anon key

## Deployment Workflow

### Automatic Deployment
- **Push to `dev` branch** → Deploys to `https://dev.content.grile.ro`
- **Push to `main` branch** → Deploys to `https://content.grile.ro`

### Manual Deployment
```bash
# Development
npm run deploy:dev

# Production  
npm run deploy:prod
```

### Both Environment Management on Single EC2

The setup uses different Docker Compose files and container names:

**Development (`docker-compose.dev.yml`)**
- Container: `directus-dev`
- Port: `8055`
- Environment: `.env.dev`
- Domain: `dev.content.grile.ro`

**Production (`docker-compose.prod.yml`)**
- Container: `directus-prod`  
- Port: `8056`
- Environment: `.env.prod`
- Domain: `content.grile.ro`

## Configuration Changes & Auto-Redeployment

Any changes to these files will trigger automatic redeployment:

### Development Triggers
- Changes to `extensions/` directory
- Changes to `docker-compose.dev.yml`
- Changes to `.env.dev.example`
- Changes to `nginx/conf.d/` configuration
- Push to `dev` branch

### Production Triggers  
- Changes to `extensions/` directory
- Changes to `docker-compose.prod.yml`
- Changes to `.env.prod.example`
- Changes to `nginx/conf.d/` configuration
- Push to `main` branch

## File Storage Configuration

Currently configured for **Supabase Storage**. To migrate to S3, update environment variables:

```bash
# Replace Supabase storage with S3
STORAGE_LOCATIONS=s3_private,s3_public
STORAGE_S3_DRIVER=s3
STORAGE_S3_PRIVATE_KEY=your-aws-key
STORAGE_S3_PRIVATE_SECRET=your-aws-secret
STORAGE_S3_PRIVATE_BUCKET=your-bucket-name
```

## Monitoring & Health Checks

### Health Endpoints
- Development: `https://dev.content.grile.ro/health`
- Production: `https://content.grile.ro/health`

### Container Status
```bash
# Check running containers
docker ps

# View logs
docker-compose -f docker-compose.dev.yml logs directus-dev
docker-compose -f docker-compose.prod.yml logs directus-prod
```

### SSL Certificate Renewal
Certificates auto-renew via cron job. Manual renewal:
```bash
docker-compose run --rm certbot renew
docker-compose exec nginx nginx -s reload
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Dev and prod use different ports (8055 vs 8056)
2. **SSL Issues**: Run `./test-nginx.sh` before nginx changes
3. **Database Connection**: Check Supabase connection strings and firewall
4. **Extension Build Failures**: Check Node.js version and dependencies

### Rollback Procedure
```bash
# Quick rollback to previous deployment
git checkout HEAD~1
git push -f origin main  # or dev branch
```

### Log Locations
- Nginx: `docker-compose logs nginx`
- Directus Dev: `docker-compose -f docker-compose.dev.yml logs directus-dev`
- Directus Prod: `docker-compose -f docker-compose.prod.yml logs directus-prod`
- System: `/var/log/syslog`

## Security Notes

- All secrets managed via GitHub repository secrets
- SSL certificates automatically renewed
- Database connections encrypted (Supabase default)
- Nginx configured with security headers
- UFW firewall enabled on EC2 instance