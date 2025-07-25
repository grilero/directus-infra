# Directus Infrastructure with AI Question Review System

Self-hosted Directus CMS infrastructure running on Docker Compose with SSL certificates, custom extensions for AI-powered question review, and automated deployment capabilities.

## 🏗 Architecture Overview

### Core Infrastructure
- **Directus CMS**: Main application in Docker container
- **Nginx**: Reverse proxy with SSL termination  
- **PostgreSQL**: External database (Supabase)
- **AWS S3**: File storage (private/public buckets)
- **Let's Encrypt**: Automated SSL certificate management

### Custom Extensions
1. **AI Questions Review Layout** - Review and approve/decline AI-generated questions
2. **Search Chapters Interface** - Custom search interface for chapters

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- AWS account (free tier compatible)
- Supabase account
- Domain name pointed to your server

### Initial Setup

1. **Clone and configure environment**:
```bash
git clone <your-repo-url>
cd directus-infra
cp env_vars_example.sh env_vars.sh
# Edit env_vars.sh with your actual values
source env_vars.sh
```

2. **Set up SSL certificates**:
```bash
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```

3. **Start services**:
```bash
docker-compose up -d
```

4. **Build extensions** (if developing):
```bash
# AI Review Layout
cd extensions/directus-extension-layout-review-ai-questions/
npm install && npm run build

# Search Interface  
cd ../directus-extension-interface-search-chapters/
npm install && npm run build
```

## 📋 Required Environment Variables

Create `env_vars.sh` based on `env_vars_example.sh`:

### Database (Supabase)
```bash
export SUPABASE_HOST="your-project.supabase.co"
export SUPABASE_DB_NAME="postgres"
export SUPABASE_DB_USER="postgres"
export SUPABASE_DB_PASSWORD="your-password"
```

### Directus Configuration
```bash
export DIRECTUS_KEY="your-32-char-secret-key"
export DIRECTUS_SECRET="your-secret"
export DIRECTUS_ADMIN_EMAIL="admin@example.com"
export DIRECTUS_ADMIN_PASSWORD="secure-password"
```

### AWS S3 Storage
```bash
export DIRECTUS_ACCESS_KEY="your-aws-access-key"
export DIRECTUS_ACCESS_SECRET="your-aws-secret-key"
```

### Domain & SSL
```bash
export DOMAIN="yourdomain.com"
export EMAIL="admin@yourdomain.com"
```

## 🔧 Common Operations

### Docker Management

```bash
# Start all services
docker-compose up -d

# Stop all services  
docker-compose down

# Rebuild specific service
docker-compose up -d --build directus

# View logs
docker-compose logs -f directus
docker-compose logs -f nginx
```

### SSL Certificate Management
```bash
# Initial setup (run once)
./init-letsencrypt.sh

# Test nginx config before applying changes
./test-nginx.sh

# Force certificate renewal (if needed)
docker-compose exec certbot-renewal certbot renew --force-renewal
```

### Extension Development

#### AI Questions Review Layout
```bash
cd extensions/directus-extension-layout-review-ai-questions/

# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build for production
npm run build
```

#### Search Chapters Interface
```bash
cd extensions/directus-extension-interface-search-chapters/

# Install dependencies
npm install

# Development with hot reload  
npm run dev

# Build for production
npm run build
```

## 🗄 Database Schema

The AI review system uses PostgreSQL stored procedures:

- `accept_ai_question(question_id)`: Moves questions from staging to production
- `decline_ai_question(question_id, reason)`: Marks questions as declined  
- `vw_user_review_stats`: View for reviewer statistics

### Setting up the Database Schema
```sql
-- Run these in your Supabase SQL editor
-- See migrations/ directory for complete schema
```

## 🤖 AI Question Review Workflow

1. AI system adds questions to `ai_questions_staged` table
2. Reviewers use the custom layout to approve/decline questions
3. Approved questions move to main `questions` table
4. Declined questions are marked with reason and archived

### Using the Review Layout
1. Navigate to Collections → AI Questions Staged
2. Select "AI Review" from the layout dropdown
3. Review questions and click Approve/Decline
4. Add comments for declined questions

## 🚀 GitHub Actions Deployment

### Branch Strategy
- `main`: Production environment
- `dev`: Development environment

### Automatic Deployment
Push to either branch triggers:
1. Extension building
2. Docker image creation
3. Deployment to respective environment
4. Health checks

### Manual Deployment
```bash
# Deploy to production
git push origin main

# Deploy to development
git push origin dev
```

## 🛠 Bootstrap Collections

### Quick Start - Complete Platform Setup
For a fresh Directus installation or complete reconfiguration:

```bash
cd scripts/
npm install
cp .env.example .env
# Add your Directus admin token to .env

# Full bootstrap - all 17 collections
npm run full-bootstrap
```

### Partial Bootstrap - Missing Collections Only
If you only need to fix specific missing collections:

```bash
cd scripts/
npm run bootstrap
```

### Get Admin Token
1. Login to Directus admin panel
2. Go to **User Profile → API Token**  
3. Create new token with **admin privileges**
4. Add token to `scripts/.env` file

## 🎯 Complete Platform Setup

The full bootstrap configures **all 17 collections** for your complete Grile.ro platform:

### System Overview
- 🤖 **AI System** (3 collections) - Question generation & review workflow
- 📚 **Content Management** (5 collections) - Domains → Books → Chapters → Subchapters → Flashcards
- ❓ **Question System** (2 collections) - Questions & answer options
- 🎯 **Quiz System** (3 collections) - Templates, instances, and question mapping
- 👤 **User System** (2 collections) - Profiles and preferences
- 💳 **Business System** (1 collection) - Stripe subscription management
- 📦 **Legacy Collections** (1 collection) - Old quiz system

### What Gets Configured
- ✅ **Collections**: All 17 collections with proper metadata, icons, and colors
- ✅ **Field Interfaces**: Every field gets appropriate UI components
- ✅ **Relationships**: Foreign key relationships properly configured
- ✅ **Display Templates**: How items appear in lists and detail views
- ✅ **Field Options**: Dropdowns with predefined choices
- ✅ **Permissions Ready**: Collections ready for role-based access control

### Detailed Documentation
See [`docs/full-bootstrap-guide.md`](docs/full-bootstrap-guide.md) for complete setup instructions and troubleshooting.

## 🔍 Troubleshooting

### Extension Not Showing Up
1. Check if extension is built: `ls extensions/*/dist/`
2. Restart Directus: `docker-compose restart directus`
3. Check logs: `docker-compose logs directus`
4. Verify extension permissions in Directus admin

### SSL Certificate Issues
```bash
# Check certificate status
docker-compose exec certbot-renewal certbot certificates

# Test renewal
docker-compose exec certbot-renewal certbot renew --dry-run

# Force renewal
docker-compose exec certbot-renewal certbot renew --force-renewal
```

### Database Connection Issues
1. Check Supabase connection settings
2. Verify environment variables are loaded
3. Test connection: `docker-compose exec directus npm run cli -- --help`

### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor logs for errors
docker-compose logs -f --tail=100
```

## 📁 Project Structure
```
directus-infra/
├── docker-compose.yml          # Main service configuration
├── env_vars_example.sh         # Environment variables template
├── init-letsencrypt.sh         # SSL certificate setup script
├── test-nginx.sh               # Nginx configuration validation
├── nginx/
│   └── conf.d/default.conf     # Nginx reverse proxy configuration
├── certbot/                    # SSL certificates storage
├── extensions/                 # Custom Directus extensions
│   ├── directus-extension-layout-review-ai-questions/
│   └── directus-extension-interface-search-chapters/
├── migrations/                 # Database schema changes
│   └── 20250723_ai_review_procedures.sql
├── scripts/                    # Bootstrap and automation scripts
│   ├── full-bootstrap.js       # Complete platform setup (all 17 collections)
│   ├── bootstrap-collections.js # Partial bootstrap for missing collections
│   ├── package.json            # Dependencies for bootstrap scripts
│   └── .env.example            # Environment template for scripts
├── docs/                       # Documentation
│   ├── full-bootstrap-guide.md # Complete bootstrap documentation
│   ├── auth-strategy.md        # Authentication strategy analysis
│   ├── setup-ai-review.md      # AI review system setup guide
│   ├── aws-optimization.md     # AWS optimization guide
│   ├── PLANNING.md             # Historical planning documents
│   ├── SUMMARY.md              # Session summaries
│   └── collection-sync-instructions.md # Manual sync fallback
├── uploads/                    # Directus file uploads
├── CLAUDE.md                   # AI assistant instructions
├── LICENSE                     # Project license
└── README.md                   # This file
```

## 🏷 Version Information
- Directus: Latest
- Node.js: 18+
- PostgreSQL: 13+
- Nginx: Latest

## 📞 Support
For issues with:
- Extensions: Check extension-specific logs and build output
- SSL: Run `./test-nginx.sh` and check certbot logs
- Database: Verify Supabase connection and schema
- Deployment: Check GitHub Actions logs and container status
