#!/bin/bash
# EC2 Instance Setup Script for Directus Infrastructure
# Run this script on a fresh Ubuntu EC2 instance

set -e

echo "🚀 Setting up EC2 instance for Directus infrastructure..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose (standalone)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER

# Install other utilities
sudo apt install -y git curl wget unzip rsync

# Create application directory
mkdir -p ~/directus-infra
cd ~/directus-infra

# Create directories for volumes
mkdir -p uploads certbot/conf certbot/www nginx/conf.d

# Create nginx configuration
cat > nginx/conf.d/default.conf << 'EOF'
# Development Environment
server {
    listen 80;
    server_name dev-content.grile.ro;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name dev-content.grile.ro;
    
    ssl_certificate /etc/letsencrypt/live/dev-content.grile.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev-content.grile.ro/privkey.pem;
    
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    client_max_body_size 1G;
    
    location / {
        proxy_pass http://directus:8055;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}

# Production Environment  
server {
    listen 80;
    server_name content.grile.ro;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name content.grile.ro;
    
    ssl_certificate /etc/letsencrypt/live/content.grile.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/content.grile.ro/privkey.pem;
    
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    client_max_body_size 1G;
    
    location / {
        proxy_pass http://directus-prod:8055;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# Create SSL initialization script
cat > init-letsencrypt.sh << 'EOF'
#!/bin/bash

domains=(dev-content.grile.ro content.grile.ro)
rsa_key_size=4096
data_path="./certbot"
email="admin@grile.ro"
staging=0

if [ -d "$data_path" ]; then
  read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo
fi

echo "### Creating dummy certificate for $domains ..."
path="/etc/letsencrypt/live/$domains"
mkdir -p "$data_path/conf/live/$domains"
docker-compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

echo "### Starting nginx ..."
docker-compose up --force-recreate -d nginx
echo

echo "### Deleting dummy certificate for $domains ..."
docker-compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domains && \
  rm -Rf /etc/letsencrypt/archive/$domains && \
  rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot
echo

echo "### Requesting Let's Encrypt certificate for $domains ..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot
echo

echo "### Reloading nginx ..."
docker-compose exec nginx nginx -s reload
EOF

chmod +x init-letsencrypt.sh

# Set up SSH keys for GitHub Actions
echo "🔑 Setting up SSH keys for GitHub Actions..."
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

echo "📋 EC2 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Add this public key to your GitHub repository secrets as SSH_PUBLIC_KEY:"
echo "   $(cat ~/.ssh/github_actions.pub)"
echo ""
echo "2. Add this private key to your GitHub repository secrets as SSH_PRIVATE_KEY:"
echo "   $(cat ~/.ssh/github_actions)"
echo ""
echo "3. Configure your domain DNS to point to this EC2 instance"
echo "4. Run ./init-letsencrypt.sh to set up SSL certificates"
echo "5. Deploy via GitHub Actions or manually"