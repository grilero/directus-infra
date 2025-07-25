# GitHub Repository Secrets Setup

## 🔐 Required Secrets for CI/CD Pipeline

Go to: `https://github.com/grilero/directus-infra/settings/secrets/actions`

Add these **18 secrets** for the automated deployment pipeline with SSL and bootstrap:

### SSH Access (Same EC2 Instance for Both Environments)
```
DEV_HOST = [Your EC2 instance IP address]
DEV_USER = ubuntu
DEV_SSH_PRIVATE_KEY = [Your SSH private key content]

PROD_HOST = [Your EC2 instance IP address] (same as DEV_HOST)
PROD_USER = ubuntu  
PROD_SSH_PRIVATE_KEY = [Your SSH private key content] (same as DEV_SSH_PRIVATE_KEY)
```

### Development Environment Secrets
```
DEV_DIRECTUS_KEY = [Random 32+ character string for encryption]
DEV_DIRECTUS_SECRET = [Random 32+ character string for JWT]
DEV_ADMIN_EMAIL = [Your admin email for dev instance]
DEV_ADMIN_PASSWORD = [Your admin password for dev instance]
DEV_PUBLIC_URL = https://dev.content.grile.ro
DEV_DB_HOST = [Your grile-ro-dev Supabase database host]
DEV_DB_USER = [Your grile-ro-dev Supabase database user]  
DEV_DB_PASSWORD = [Your grile-ro-dev Supabase database password]
SUPABASE_PROJECT_URL_DEV = [Your dev Supabase project URL]
SUPABASE_ANON_KEY_DEV = [Your dev Supabase anon key]
DEV_SUPABASE_PROJECT_REF = [Your dev Supabase project reference ID]
```

### Production Environment Secrets
```
PROD_DIRECTUS_KEY = [Random 32+ character string for encryption]
PROD_DIRECTUS_SECRET = [Random 32+ character string for JWT]
PROD_ADMIN_EMAIL = [Your admin email for prod instance]
PROD_ADMIN_PASSWORD = [Your admin password for prod instance]
PROD_PUBLIC_URL = https://content.grile.ro
PROD_DB_HOST = [Your grile-ro-prod Supabase database host]
PROD_DB_USER = [Your grile-ro-prod Supabase database user]
PROD_DB_PASSWORD = [Your grile-ro-prod Supabase database password]
SUPABASE_PROJECT_URL_PROD = [Your prod Supabase project URL]
SUPABASE_ANON_KEY_PROD = [Your prod Supabase anon key]
PROD_SUPABASE_PROJECT_REF = [Your prod Supabase project reference ID]
```

## 🎯 How to Find These Values

### SSH Keys
```bash
# Generate SSH key for GitHub Actions if you don't have one
ssh-keygen -t rsa -b 4096 -f ~/.ssh/directus_deploy -N ""

# Copy private key content (this goes in DEV_SSH_PRIVATE_KEY and PROD_SSH_PRIVATE_KEY)
cat ~/.ssh/directus_deploy

# Copy public key to your EC2 authorized_keys
cat ~/.ssh/directus_deploy.pub >> ~/.ssh/authorized_keys
```

### Random Strings for Directus
```bash
# Generate random keys (do this 4 times for the 4 key/secret pairs)
openssl rand -base64 32
```

### Supabase Values
1. Go to your Supabase projects
2. **Dev Project**: `grile-ro-dev` 
   - Database host: Settings → Database → Connection string host
   - Database user/password: From your connection string
   - Project URL: Settings → API → Project URL
   - Anon key: Settings → API → Project API keys → anon key
   - Project Ref: Found in project URL (e.g., `https://[project-ref].supabase.co`)

3. **Prod Project**: `grile-ro-prod`
   - Same steps as dev project

## 🚀 What Happens on First Deployment

### SSL Certificates
- ✅ Automatically detects if certificates exist
- ✅ Runs `init-letsencrypt.sh` to create Let's Encrypt certificates
- ✅ Sets up certificates for both `dev.content.grile.ro` and `content.grile.ro`
- ✅ Auto-renewal via certbot service

### Bootstrap Process
- ✅ Detects first-time deployment (no running containers)
- ✅ Runs `npx directus bootstrap` to initialize Directus
- ✅ Applies database schema from `supabase/migrations/`
- ✅ Configures metadata via `scripts/remote-bootstrap.js`
- ✅ Waits for health checks before completing

## ✅ After Adding Secrets

1. **Test Development**: 
   - Push to `dev` branch → Should deploy to `https://dev.content.grile.ro`
   - First deployment includes SSL setup + full bootstrap

2. **Test Production**: 
   - Push to `main` branch → Should deploy to `https://content.grile.ro`
   - First deployment includes SSL setup + full bootstrap

## 🔍 Verify Everything Is Working

### Check Workflow Runs
Go to: `https://github.com/grilero/directus-infra/actions`

### Check SSL Certificates
```bash
curl -I https://dev.content.grile.ro
curl -I https://content.grile.ro
```

### Check Directus Health
```bash
curl https://dev.content.grile.ro/server/health
curl https://content.grile.ro/server/health
```

## 🎉 Current Status

- ✅ GitHub repository created
- ✅ Dev branch created  
- ✅ GitHub Actions workflows uploaded with SSL + Bootstrap
- ✅ SSL certificate automation included
- ✅ First-time bootstrap process included
- ✅ Updated `init-letsencrypt.sh` for both domains
- 🔄 **Waiting for you to add the 18 secrets above**

Once secrets are added, both environments will automatically:
1. 🔐 Set up SSL certificates on first run
2. 🚀 Bootstrap Directus with your schema and data
3. 🔄 Deploy automatically on code changes
4. 📊 Monitor health and rollback on failures

**The complete "bootstrap once, then automatic forever" pipeline is ready!**