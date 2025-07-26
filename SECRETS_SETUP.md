# GitHub Repository Secrets Setup

## 🎯 **Simplified Workflow**

Your setup now matches your actual development process:

1. **Local Development** (`npm run dev`) → Connects to Supabase `grile-ro-dev` project
2. **Production Deployment** (`git push origin main`) → Deploys to EC2 + Supabase `grile-ro-prod` project
3. **No dev.content.grile.ro** (unnecessary complexity removed)

## 🔐 Production Environment Secrets

Go to: `https://github.com/grilero/directus-infra/settings/environments`

Create **one environment** called **`production`** and add these **9 secrets**:

```
HOST = [Your EC2 instance IP address]
USER = ubuntu
SSH_PRIVATE_KEY = [Your SSH private key content]
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

## 🏠 **Local Development Setup**

For your local `npm run dev` to work with remote Supabase dev project, update your local environment files to point to `grile-ro-dev`:

### Update `.env.local.example` → `.env.local`
```bash
# Local development with remote Supabase dev project
DB_CLIENT=pg
DB_HOST=[grile-ro-dev supabase host]
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=[grile-ro-dev user]
DB_PASSWORD=[grile-ro-dev password]
DB_SSL__REJECT_UNAUTHORIZED=false

DIRECTUS_KEY=[your local dev key]
DIRECTUS_SECRET=[your local dev secret]
ADMIN_EMAIL=[your dev admin email]
ADMIN_PASSWORD=[your dev admin password]
PUBLIC_URL=http://localhost:8055

# Supabase Storage for dev
STORAGE_LOCATIONS=supabase
STORAGE_SUPABASE_DRIVER=supabase
STORAGE_SUPABASE_PROJECT_URL=[grile-ro-dev project URL]
STORAGE_SUPABASE_ANON_KEY=[grile-ro-dev anon key]
STORAGE_SUPABASE_BUCKET=directus-files

EXTENSIONS_PATH=./extensions
EXTENSIONS_AUTO_RELOAD=true
NODE_ENV=development
```

## 🎯 **How to Find These Values**

### SSH Keys
```bash
# Generate SSH key for GitHub Actions if you don't have one
ssh-keygen -t rsa -b 4096 -f ~/.ssh/directus_deploy -N ""

# Copy private key content (this goes in SSH_PRIVATE_KEY)
cat ~/.ssh/directus_deploy

# Copy public key to your EC2 authorized_keys
cat ~/.ssh/directus_deploy.pub >> ~/.ssh/authorized_keys
```

### Random Strings for Directus
```bash
# Generate random keys (do this 2 times for prod key/secret)
openssl rand -base64 32
```

### Supabase Values
1. **Production Project**: `grile-ro-prod`
   - Database host: Settings → Database → Connection string host
   - Database user/password: From your connection string
   - Project URL: Settings → API → Project URL
   - Anon key: Settings → API → Project API keys → anon key
   - Project Ref: Found in project URL (e.g., `https://[project-ref].supabase.co`)

2. **Development Project**: `grile-ro-dev` (for your local .env.local)
   - Same steps as production project

## 🚀 **Deployment Flow**

### Local Development
```bash
# Start with remote dev database
npm run dev
```

### Production Deployment
```bash
# Push to main triggers automatic deployment
git push origin main
```

### First Deployment Features
- ✅ **SSL Certificate Setup**: Automatically creates Let's Encrypt certificate for `content.grile.ro`
- ✅ **Bootstrap Process**: Runs Directus bootstrap + applies database schema
- ✅ **Zero Downtime**: Health checks ensure successful deployment
- ✅ **Rollback**: Manual rollback via git revert if needed

## ✅ **After Adding Secrets**

1. **Add the 9 secrets** to the `production` environment
2. **Push to main branch**: 
   ```bash
   git push origin main
   ```
3. **Monitor deployment**: Check `https://github.com/grilero/directus-infra/actions`
4. **Verify**: Visit `https://content.grile.ro/server/health`

## 🎉 **Simplified Status**

- ✅ Single GitHub environment (`production`)
- ✅ Clean secret names (no DEV_/PROD_ prefixes)
- ✅ Local dev connects to remote Supabase dev project
- ✅ Production deployment to EC2 + Supabase prod project
- ✅ SSL certificate automation
- ✅ AI question review stored procedures ready
- 🔄 **Waiting for you to add the 9 production secrets**

**Perfect! This matches your real development workflow.** 🎯