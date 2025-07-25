# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a self-hosted Directus infrastructure running on Docker Compose with SSL certificates from Let's Encrypt. The setup includes custom Directus extensions for AI-powered question review functionality and chapter search interfaces.

## Architecture

### Core Infrastructure
- **Directus CMS**: Main application running in Docker container
- **Nginx**: Reverse proxy with SSL termination
- **PostgreSQL**: External database hosted on Supabase
- **AWS S3**: File storage (both private and public buckets)
- **Let's Encrypt**: SSL certificate management via Certbot

### Directus Extensions
The repository contains two custom Directus extensions:

1. **AI Questions Review Layout** (`extensions/directus-extension-layout-review-ai-questions/`)
   - Type: Layout extension
   - Purpose: Review and approve/decline AI-generated questions
   - Uses PostgreSQL stored procedures for question management
   - Built with Vue 3 + TypeScript + Vite

2. **Search Chapters Interface** (`extensions/directus-extension-interface-search-chapters/`)
   - Type: Interface extension
   - Purpose: Custom search interface for chapters
   - Built with Vue 3 + JavaScript

### Database Integration
The AI review system uses PostgreSQL stored procedures:
- `accept_ai_question()`: Moves questions from staging to production
- `decline_ai_question()`: Marks questions as declined with reason
- `vw_user_review_stats`: View for reviewer statistics

## Common Commands

### Docker Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# View logs
docker-compose logs directus
docker-compose logs nginx
```

### SSL Certificate Management
```bash
# Initial certificate setup
./init-letsencrypt.sh

# Test nginx configuration
./test-nginx.sh
```

### Extension Development

#### AI Questions Review Layout
```bash
cd extensions/directus-extension-layout-review-ai-questions/

# Development with hot reload
npm run dev
# or
pnpm dev

# Build for production
npm run build
# or
pnpm build
```

#### Search Chapters Interface
```bash
cd extensions/directus-extension-interface-search-chapters/

# Development with hot reload
npm run dev

# Build for production
npm run build

# Link extension for development
npm run link
```

### Environment Variables
Required environment variables (see `env_vars_example.sh`):
- `SUPABASE_HOST`, `SUPABASE_DB_NAME`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`
- `DIRECTUS_KEY`, `DIRECTUS_SECRET`
- `DIRECTUS_ADMIN_EMAIL`, `DIRECTUS_ADMIN_PASSWORD`
- `DIRECTUS_ACCESS_KEY`, `DIRECTUS_ACCESS_SECRET` (for S3)

## Development Workflow

1. **Extension Development**: Extensions auto-reload when `EXTENSIONS_AUTO_RELOAD=true` is set
2. **Database Changes**: SQL migrations are stored in `migrations/` directory
3. **SSL Testing**: Always run `./test-nginx.sh` before applying nginx config changes
4. **Production Deployment**: Extensions are built and mounted as volumes to the Directus container

## Key Files

- `docker-compose.yml`: Main service configuration
- `nginx/conf.d/default.conf`: Nginx reverse proxy configuration
- `extensions/*/src/`: Extension source code
- `migrations/`: Database schema changes
- `init-letsencrypt.sh`: SSL certificate provisioning
- `test-nginx.sh`: Nginx configuration validation

## Extension Architecture Notes

- Layout extensions appear in the collection view picker and define how data is displayed
- Interface extensions provide custom input/display components for fields
- Both extension types use the Directus Extensions SDK with Vue 3 components
- The AI review layout uses the Directus API client to call PostgreSQL stored procedures via `/rpc/` endpoints