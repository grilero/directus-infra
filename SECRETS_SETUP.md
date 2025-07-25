# GitHub Repository Secrets Setup

## 🔐 Required Secrets for CI/CD Pipeline

Go to: `https://github.com/grilero/directus-infra/settings/secrets/actions`

Add these **16 secrets** for the automated deployment pipeline:

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

3. **Prod Project**: `grile-ro-prod`
   - Same steps as dev project

## ✅ After Adding Secrets

1. **Test Development**: Push to `dev` branch → Should deploy to `https://dev.content.grile.ro`
2. **Test Production**: Push to `main` branch → Should deploy to `https://content.grile.ro`

## 🔍 Verify Secrets Are Working

Check workflow runs at: `https://github.com/grilero/directus-infra/actions`

If a deployment fails, check the logs for missing secrets or configuration issues.

## 🎉 Current Status

- ✅ GitHub repository created
- ✅ Dev branch created  
- ✅ GitHub Actions workflows uploaded
- ✅ Ready for secret configuration
- 🔄 **Waiting for you to add the 16 secrets above**

Once secrets are added, the CI/CD pipeline will be fully automated!