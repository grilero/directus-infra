# Grile.ro Infrastructure Guide

Complete guide for setting up and deploying the Grile.ro Directus infrastructure with Supabase integration, from local development to production deployment on EC2.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Dev     │    │   Development   │    │   Production    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ Local Supabase  │    │ Cloud Supabase  │    │ Cloud Supabase  │
│ Local Directus  │    │ EC2 Directus    │    │ EC2 Directus    │
│ Port: 8055      │    │ dev.content.    │    │ content.        │
│                 │    │ grile.ro        │    │ grile.ro        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Environment Variables](#environment-variables)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [EC2 Deployment Process](#ec2-deployment-process)
6. [CI/CD Configuration](#cicd-configuration)
7. [Collections Architecture](#collections-architecture)
8. [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Supabase CLI (`npm install -g supabase`)
- PostgreSQL client (psql)

### ⚡ One-Command Setup

```bash
# Complete fresh setup (resets database)
npm run dev:clean

# Start with existing database
npm run dev
```

### What happens in `npm run dev:clean` (Complete Reset):

1. **Resets database** (`npm run db:reset`)
   - Completely resets local Supabase database
2. **Seeds database** (`npm run db:seed`)
   - Creates all 18 collections via SQL
   - Loads production sample data
3. **Starts Directus** (`npm run directus:start`)
   - Directus on port 8055, waits for health check
4. **Bootstraps Directus** (`npm run directus:bootstrap`)
   - Creates Directus system tables and admin user
5. **Configures metadata** (`npm run bootstrap:metadata`)
   - Adds collection icons, colors, display templates
   - Configures 86 fields with proper interfaces and validation
6. **Restarts Directus** (`npm run directus:restart`)
   - Ensures field metadata is properly applied
   - **Eliminates "database only: click to configure" warnings**

### What happens in `npm run dev` (Preserve Data):

1. **Starts Supabase** (`npm run db:create`)
   - PostgreSQL on port 54322, preserves existing data
   - Supabase Studio on port 54323, API on port 54321
2. **Starts Directus** (`npm run directus:start`)
   - Directus on port 8055, waits for health check
3. **Bootstraps Directus** (`npm run directus:bootstrap`)
   - Ensures Directus system tables exist
4. **Configures metadata** (`npm run bootstrap:metadata`)
   - Updates collection and field metadata
5. **Restarts Directus** (`npm run directus:restart`)
   - Applies latest metadata configurations

### Manual Steps (if needed)

```bash
# Individual commands
supabase start                                    # Start local Supabase
docker-compose -f docker-compose.local.yml up -d # Start Directus
npm run bootstrap:sql                             # Create collections + metadata

# Check status
npm run dev:logs                                  # View Directus logs
supabase status                                   # View Supabase status
```

### Access Points (Local)

- **Directus Admin**: http://localhost:8055
  - Email: `admin@grile.ro`
  - Password: `parola123`
- **Supabase Studio**: http://localhost:54323
- **Database**: `postgresql://postgres:postgres@localhost:54322/postgres`

## Environment Variables

### Local Development (`.env.local`)

```bash
# Directus Configuration
KEY=ccd85527e622a2b3d56605cc435bb0b3
SECRET=c9acf71cd22d019b30163078ab33b77ed97d937e61e5402bbfbd0902975ab2b3

# Admin User
ADMIN_EMAIL=admin@grile.ro
ADMIN_PASSWORD=parola123

# Database (Local Supabase)
DB_CLIENT=pg
DB_HOST=host.docker.internal
DB_PORT=54322
DB_DATABASE=postgres
DB_USER=postgres
DB_PASSWORD=postgres

# Public URL
PUBLIC_URL=http://localhost:8055

# AWS S3 Storage (Supabase-compatible)
STORAGE_S3_DRIVER=s3
STORAGE_S3_KEY=2e236d04cb3e11c622a615a5ebf9c801
STORAGE_S3_SECRET=b814fd076eb324b188fc896c05c80491bd3b8a8e0a1d01034078ebb5163e0e69
STORAGE_S3_BUCKET=https://sbpqgoclsbmysycejelx.supabase.co/storage/v1/s3
STORAGE_S3_REGION=eu-central-1

# Extensions
EXTENSIONS_PATH=./extensions
EXTENSIONS_AUTO_RELOAD=true

# Development Settings
LOG_LEVEL=debug
CACHE_ENABLED=false
```

### Development Environment (`.env.dev`)

```bash
# Directus Configuration
KEY=dev-directus-key-32-chars-here
SECRET=dev-directus-secret-32-chars-here

# Admin User
ADMIN_EMAIL=admin@grile.ro
ADMIN_PASSWORD=secure-dev-password

# Database (Cloud Supabase Dev)
DB_CLIENT=pg
DB_HOST=aws-0-eu-central-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres.sbpqgoclsbmysycejelx
DB_PASSWORD=dev-database-password

# Public URL
PUBLIC_URL=https://dev.content.grile.ro

# AWS S3 Storage (Supabase Dev)
STORAGE_S3_DRIVER=s3
STORAGE_S3_KEY=dev-s3-access-key
STORAGE_S3_SECRET=dev-s3-secret-key
STORAGE_S3_BUCKET=https://sbpqgoclsbmysycejelx.supabase.co/storage/v1/s3
STORAGE_S3_REGION=eu-central-1

# Extensions
EXTENSIONS_PATH=./extensions
EXTENSIONS_AUTO_RELOAD=false

# Production Settings
LOG_LEVEL=info
CACHE_ENABLED=true
```

### Production Environment (`.env.prod`)

```bash
# Directus Configuration
KEY=prod-directus-key-32-chars-here
SECRET=prod-directus-secret-32-chars-here

# Admin User
ADMIN_EMAIL=admin@grile.ro
ADMIN_PASSWORD=secure-production-password

# Database (Cloud Supabase Prod)
DB_CLIENT=pg
DB_HOST=aws-0-eu-central-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres.prod-project-id
DB_PASSWORD=prod-database-password

# Public URL
PUBLIC_URL=https://content.grile.ro

# AWS S3 Storage (Supabase Prod)
STORAGE_S3_DRIVER=s3
STORAGE_S3_KEY=prod-s3-access-key
STORAGE_S3_SECRET=prod-s3-secret-key
STORAGE_S3_BUCKET=https://prod-project-id.supabase.co/storage/v1/s3
STORAGE_S3_REGION=eu-central-1

# Extensions
EXTENSIONS_PATH=./extensions
EXTENSIONS_AUTO_RELOAD=false

# Production Settings
LOG_LEVEL=warn
CACHE_ENABLED=true
RATE_LIMITER_ENABLED=true
```

## Remote Bootstrap (Development & Production)

### ⚡ One-Command Remote Setup

After setting up your remote Supabase projects and environment files, you can bootstrap them with:

```bash
# Bootstrap Development Environment (with sample data)
npm run bootstrap:dev

# Bootstrap Production Environment (schema only, no sample data)
npm run bootstrap:prod
```

### What happens in `npm run bootstrap:dev`:

1. **Apply Schema Migration** (`npm run remote:dev:schema`)
   - Runs migration: `supabase migration up --project-ref sbpqgoclsbmysycejelx`
   - Creates all 18 collections in remote dev database
2. **Seed with Sample Data** (`npm run remote:dev:seed`)
   - Shows manual command to load `scripts/dev-seed.sql`
   - Includes medical questions, chapters, books, and test users
3. **Configure Directus Metadata** (`npm run remote:dev:metadata`)
   - Adds collection icons, colors, and display templates
   - Uses `.env.dev` for authentication and connection

### What happens in `npm run bootstrap:prod`:

1. **Apply Schema Migration** (`npm run remote:prod:schema`)
   - Runs migration to production Supabase instance
   - Creates all 18 collections (no sample data)
2. **Configure Directus Metadata** (`npm run remote:prod:metadata`)
   - Adds collection metadata for production instance
   - Uses `.env.prod` for authentication and connection

### Prerequisites for Remote Bootstrap

1. **Environment Files**: Create `.env.dev` and `.env.prod` from examples:
   ```bash
   cp .env.dev.example .env.dev
   cp .env.prod.example .env.prod
   # Edit files with your actual credentials
   ```

2. **Supabase CLI Authentication**:
   ```bash
   supabase login
   ```

3. **Project References**: Update project refs in package.json:
   ```bash
   # Find your project refs in Supabase Dashboard
   # Update package.json with actual refs
   ```

### Manual Remote Steps (if needed)

```bash
# Apply schema migration only
supabase migration up --project-ref your-project-ref

# Seed development data
psql "your-supabase-connection-string" -f scripts/dev-seed.sql

# Configure metadata manually
SUPABASE_PROJECT_REF=your-ref node scripts/remote-bootstrap.js dev
```

### Remote Bootstrap Results

✅ **18 Collections Created**: All tables with proper relationships and indexes  
✅ **Directus Metadata Applied**: Icons, colors, display templates  
✅ **Sample Data (Dev Only)**: Medical questions, books, chapters, test users  
✅ **Production Ready**: Schema-only setup for production environment  
✅ **Field Configuration**: All fields properly configured (no "database only" warnings)

## Development Deployment

### 1. Supabase Project Setup

```bash
# Create development project
supabase projects create grile-ro-dev --plan free

# Link to project
SUPABASE_PROJECT_REF=sbpqgoclsbmysycejelx supabase link

# Push schema to dev
SUPABASE_PROJECT_REF=sbpqgoclsbmysycejelx npm run db:schema
```

### 2. EC2 Instance Setup (Development)

```bash
# SSH into development EC2 instance
ssh -i ~/.ssh/grile-dev.pem ubuntu@dev.content.grile.ro

# Install dependencies
sudo apt update
sudo apt install -y docker.io docker-compose nodejs npm git postgresql-client

# Clone repository
git clone https://github.com/your-org/directus-infra.git
cd directus-infra
git checkout develop

# Setup environment
cp .env.dev.example .env
# Edit .env with development credentials

# Build extensions
npm run build:extensions

# Start services
docker-compose up -d
```

### 3. DNS Configuration

```bash
# Point subdomain to EC2 instance
dev.content.grile.ro → EC2-DEV-IP-ADDRESS
```

## Production Deployment

### 1. Supabase Project Setup

```bash
# Create production project
supabase projects create grile-ro-prod --plan pro

# Link to project
SUPABASE_PROJECT_REF=your-prod-project-id supabase link

# Push schema to production
SUPABASE_PROJECT_REF=your-prod-project-id npm run db:schema
```

### 2. EC2 Instance Setup (Production)

```bash
# SSH into production EC2 instance
ssh -i ~/.ssh/grile-prod.pem ubuntu@content.grile.ro

# Install dependencies
sudo apt update
sudo apt install -y docker.io docker-compose nodejs npm git postgresql-client

# Clone repository
git clone https://github.com/your-org/directus-infra.git
cd directus-infra
git checkout main

# Setup environment
cp .env.prod.example .env
# Edit .env with production credentials

# Build extensions
npm run build:extensions

# Start services with SSL
./init-letsencrypt.sh  # SSL certificate setup
docker-compose up -d
```

### 3. DNS Configuration

```bash
# Point domain to EC2 instance
content.grile.ro → EC2-PROD-IP-ADDRESS
```

## EC2 Deployment Process

### Instance Requirements

| Environment | Instance Type | Storage | Security Groups |
|-------------|---------------|---------|-----------------|
| Development | t3.small      | 20GB    | HTTP, HTTPS, SSH |
| Production  | t3.medium     | 50GB    | HTTP, HTTPS, SSH |

### Security Groups

```bash
# HTTP/HTTPS Traffic
Port 80  (HTTP)  - 0.0.0.0/0
Port 443 (HTTPS) - 0.0.0.0/0
Port 22  (SSH)   - Your-IP-Address/32

# Optional: Direct Directus access for debugging
Port 8055 (Directus) - Your-IP-Address/32
```

### EC2 Setup Script

```bash
#!/bin/bash
# EC2 initial setup script

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install additional tools
sudo apt install -y git curl postgresql-client

# Setup firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create directory structure
mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps

echo "EC2 setup complete. Now clone your repository and configure environment."
```

### SSL Certificate Setup

```bash
# On EC2 instance
cd /home/ubuntu/apps/directus-infra

# Test nginx configuration
./test-nginx.sh

# Initialize Let's Encrypt certificates
./init-letsencrypt.sh

# Verify SSL
curl -I https://content.grile.ro
curl -I https://dev.content.grile.ro
```

## CI/CD Configuration

### GitHub Environments

Create two GitHub environments:

1. **development**
   - URL: https://dev.content.grile.ro
   - Deployment branch: `develop`
   - Required reviewers: None

2. **production**
   - URL: https://content.grile.ro
   - Deployment branch: `main`
   - Required reviewers: Admin team

### GitHub Secrets (per environment)

```bash
# Development Environment Secrets
AWS_EC2_SSH_KEY         # SSH private key for dev EC2
EC2_HOST_DEV           # dev.content.grile.ro
DIRECTUS_KEY_DEV       # Development Directus key
DIRECTUS_SECRET_DEV    # Development Directus secret
SUPABASE_PROJECT_REF_DEV # sbpqgoclsbmysycejelx

# Production Environment Secrets
AWS_EC2_SSH_KEY         # SSH private key for prod EC2
EC2_HOST_PROD          # content.grile.ro
DIRECTUS_KEY_PROD      # Production Directus key
DIRECTUS_SECRET_PROD   # Production Directus secret
SUPABASE_PROJECT_REF_PROD # Production Supabase project ID
```

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Directus Infrastructure

on:
  push:
    branches: [main, develop]

jobs:
  deploy-development:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: development
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Development
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.EC2_HOST_DEV }}
          username: ubuntu
          key: ${{ secrets.AWS_EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/apps/directus-infra
            git pull origin develop
            npm run build:extensions
            docker-compose down
            docker-compose up -d --build
            
  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.EC2_HOST_PROD }}
          username: ubuntu
          key: ${{ secrets.AWS_EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/apps/directus-infra
            git pull origin main
            npm run build:extensions
            docker-compose down
            docker-compose up -d --build
```

## Collections Architecture

### SQL-Based Bootstrap

The new bootstrap process creates collections via SQL for reliability:

1. **SQL Schema** (`scripts/collections-schema.sql`)
   - Creates all tables with proper relationships
   - Includes indexes for performance
   - Adds sample data

2. **Metadata Bootstrap** (`scripts/add-directus-metadata.js`)
   - Adds Directus UI metadata (icons, colors, templates)
   - Configures display options
   - Sets up relationships

### Collection Structure

```
📚 Content Collections
├── domains (Subject areas)
├── books (Medical textbooks)
├── chapters (Book organization)
└── subchapters (Fine-grained content)

❓ Question System
├── questions (Published questions)
├── answer_options (Multiple choice options)
├── ai_question_staging (AI-generated questions for review)
├── ai_answer_options_staging (AI answer options)
└── ai_generation_costs (Usage tracking)

👤 User System
├── profiles (User information)
├── user_settings (Preferences)
├── quiz_instances (Quiz attempts)
├── quiz_templates (Reusable quiz configs)
├── quiz_instance_questions (Junction table)
└── subscriptions (Stripe integration)

🎴 Additional
├── flashcards (Study cards)
├── quizzes (Legacy compatibility)
└── test (Development testing)
```

### ⚡ Quick Commands Reference

```bash
# Local Development
npm run dev                    # Start everything (one command)
npm run dev:clean             # Fresh start with reset database
npm run dev:down              # Stop all services
npm run dev:logs              # View Directus logs

# Database Management
npm run db:create             # Start local Supabase
npm run db:reset              # Reset local database
npm run db:schema             # Apply SQL schema

# Bootstrap Collections
npm run bootstrap:sql         # Create tables + add metadata
npm run bootstrap:local       # Add metadata only

# Extensions
npm run build:extensions      # Build all extensions
npm run build:layout         # Build AI review layout
npm run build:interface      # Build search interface

# Utilities
npm run test:health          # Check service health
npm run test:connection      # Test database connection
```

## Troubleshooting

### Common Issues

**1. Directus Permission Errors**
```bash
# Reset admin password
docker-compose exec directus npx directus users passwd --email admin@grile.ro --password newpassword
```

**2. Database Connection Issues**
```bash
# Check Supabase status
supabase status

# Test database connection
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1;"
```

**3. SQL Bootstrap Fails**
```bash
# Run SQL schema manually
npm run db:schema

# Then add metadata
npm run bootstrap:local
```

**4. SSL Certificate Issues**
```bash
# Renew certificates
docker-compose exec certbot certbot renew

# Test nginx config
./test-nginx.sh
```

**5. Extension Loading Issues**
```bash
# Rebuild extensions
npm run build:extensions

# Check extension logs
docker-compose logs directus | grep -i extension
```

### Health Checks

```bash
# Local development
curl http://localhost:8055/server/health
curl http://localhost:54321/rest/v1/

# Development environment
curl https://dev.content.grile.ro/server/health

# Production environment
curl https://content.grile.ro/server/health
```

### Performance Monitoring

```bash
# Database performance
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Docker resource usage
docker stats

# Disk usage
df -h
du -sh /home/ubuntu/apps/directus-infra/uploads/
```

### Debug Mode

```bash
# Enable debug logging
docker-compose -f docker-compose.local.yml down
# Edit .env.local: LOG_LEVEL=debug
docker-compose -f docker-compose.local.yml up -d

# View detailed logs
npm run dev:logs
```

## Support

For issues and questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review container logs: `npm run dev:logs`
3. Check database connectivity
4. Verify environment variables
5. Create an issue in the repository

## Migration from Old Setup

If you have an existing Directus setup using the API-based bootstrap:

```bash
# Stop old services
docker-compose down

# Backup existing data
pg_dump $OLD_DATABASE_URL > backup.sql

# Start new setup
npm run dev:clean

# Restore data (adapt as needed)
psql postgresql://postgres:postgres@localhost:54322/postgres < backup.sql
```

## Quick Reference

### 🚀 Complete Setup Commands

| Environment | Command | What it does |
|-------------|---------|--------------|
| **Local** | `npm run dev:clean` | Complete reset + schema + data + metadata + restart |
| **Local** | `npm run dev` | Start with existing data + metadata + restart |
| **Dev Remote** | `npm run bootstrap:dev` | Schema + sample data + metadata for dev Supabase |
| **Prod Remote** | `npm run bootstrap:prod` | Schema + metadata only for prod Supabase |

### 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `supabase/seed.sql` | Local development: complete schema + sample data |
| `supabase/migrations/20250725000001_complete_schema.sql` | Remote: schema migration for dev/prod |
| `scripts/dev-seed.sql` | Remote development: sample data only |
| `scripts/add-directus-metadata.js` | Collection icons, colors, display templates |
| `scripts/configure-field-metadata.js` | Field interfaces, validation, removes "database only" warnings |
| `scripts/remote-bootstrap.js` | Remote Directus metadata configuration |
| `.env.local` | Local development environment |
| `.env.dev` | Remote development environment |
| `.env.prod` | Remote production environment |

### 🔗 Access Points

| Environment | Directus Admin | Database | Notes |
|-------------|---------------|----------|-------|
| **Local** | http://localhost:8055 | postgresql://postgres:postgres@localhost:54322/postgres | Auto-configured |
| **Dev** | https://dev.content.grile.ro | Supabase Dev Connection | Requires .env.dev |
| **Prod** | https://content.grile.ro | Supabase Prod Connection | Requires .env.prod |

**Default Admin Credentials (Local):**
- Email: `admin@grile.ro`
- Password: `parola123`

### 🎯 What You Get

✅ **18 Collections**: Complete medical quiz platform schema  
✅ **86 Fields**: All properly configured with interfaces and validation  
✅ **Sample Data**: Medical questions, books, chapters, users (dev environments)  
✅ **Metadata**: Icons, colors, display templates for all collections  
✅ **No Warnings**: "Database only: click to configure" completely eliminated  
✅ **One Command**: Setup any environment in minutes  
✅ **Production Ready**: Schema-only setup for production deployment  

---

**Happy coding! 🚀**