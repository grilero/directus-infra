# GitHub Repository Secrets Setup

## 🌍 Using GitHub Environments (Best Practice)

Instead of prefixing secrets with `DEV_` and `PROD_`, we use GitHub Environments which provide better security and organization.

### Step 1: Create Environments

Go to: `https://github.com/grilero/directus-infra/settings/environments`

Create two environments:
1. **`development`** - for dev deployments
2. **`production`** - for prod deployments (can add protection rules)

### Step 2: Add Secrets to Each Environment

## 🔐 Development Environment Secrets

Go to: `https://github.com/grilero/directus-infra/settings/environments/development`

Add these **9 clean secrets**:

```
HOST = [Your EC2 instance IP address]
USER = ubuntu
SSH_PRIVATE_KEY = [Your SSH private key content]
DIRECTUS_KEY = [Random 32+ character string for encryption]
DIRECTUS_SECRET = [Random 32+ character string for JWT]
ADMIN_EMAIL = [Your admin email for dev instance]
ADMIN_PASSWORD = [Your admin password for dev instance]
PUBLIC_URL = https://dev.content.grile.ro
DB_HOST = [Your grile-ro-dev Supabase database host]
DB_USER = [Your grile-ro-dev Supabase database user]
DB_PASSWORD = [Your grile-ro-dev Supabase database password]
SUPABASE_PROJECT_URL = [Your dev Supabase project URL]
SUPABASE_ANON_KEY = [Your dev Supabase anon key]
SUPABASE_PROJECT_REF = [Your dev Supabase project reference ID]
```

## 🔐 Production Environment Secrets

Go to: `https://github.com/grilero/directus-infra/settings/environments/production`

Add these **9 clean secrets** (same names, different values):

```
HOST = [Your EC2 instance IP address] (same as dev)
USER = ubuntu
SSH_PRIVATE_KEY = [Your SSH private key content] (same as dev)
DIRECTUS_KEY = [Random 32+ character string for encryption]
DIRECTUS_SECRET = [Random 32+ character string for JWT]
ADMIN_EMAIL = [Your admin email for prod instance]
ADMIN_PASSWORD = [Your admin password for prod instance]
PUBLIC_URL = https://content.grile.ro
DB_HOST = [Your grile-ro-prod Supabase database host]
DB_USER = [Your grile-ro-prod Supabase database user]
DB_PASSWORD = [Your grile-ro-prod Supabase database password]
SUPABASE_PROJECT_URL = [Your prod Supabase project URL]
SUPABASE_ANON_KEY = [Your prod Supabase anon key]
SUPABASE_PROJECT_REF = [Your prod Supabase project reference ID]
```

## 🎯 How to Find These Values

### SSH Keys
```bash
# Generate SSH key for GitHub Actions if you don't have one
ssh-keygen -t rsa -b 4096 -f ~/.ssh/directus_deploy -N ""

# Copy private key content (this goes in SSH_PRIVATE_KEY for both environments)
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

## ✅ Benefits of GitHub Environments

### 🔒 **Security**
- Environment-specific access controls
- Can require reviews for production deployments
- Secrets are isolated per environment

### 📝 **Clean Organization**
- No prefixed secret names (`DIRECTUS_KEY` vs `DEV_DIRECTUS_KEY`)
- Same secret names across environments
- Clear separation of concerns

### 🛡️ **Protection Rules** (Optional)
You can add protection rules to the `production` environment:
- Require reviewers before deployment
- Restrict to specific branches
- Add deployment delays

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

## 🔍 After Adding Secrets

1. **Test Development**: 
   - Push to `dev` branch → Uses `development` environment secrets
   - Deploys to `https://dev.content.grile.ro`

2. **Test Production**: 
   - Push to `main` branch → Uses `production` environment secrets
   - Deploys to `https://content.grile.ro`

## ✅ Verify Everything Is Working

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
- ✅ GitHub Actions workflows use environment-based secrets
- ✅ SSL certificate automation included
- ✅ First-time bootstrap process included
- ✅ Clean secret names (no DEV_/PROD_ prefixes)
- 🔄 **Waiting for you to create environments and add the 9 secrets to each**

**This follows GitHub's best practices for environment management!** 🏆