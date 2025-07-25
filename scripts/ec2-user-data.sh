#!/bin/bash

# EC2 User Data Script for Directus Infrastructure
# This script runs automatically when the EC2 instance first boots

set -e

# Update system
apt-get update

# Install Docker
apt-get install -y ca-certificates curl gnupg lsb-release
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install Docker Compose (standalone)
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Nginx
apt-get install -y nginx

# Install Certbot for SSL
apt-get install -y certbot python3-certbot-nginx

# Create application directory
mkdir -p /opt/directus-infra
chown ubuntu:ubuntu /opt/directus-infra

# Create systemd service for automatic deployment
cat > /etc/systemd/system/directus-deploy.service << 'EOF'
[Unit]
Description=Directus Auto Deployment Service
After=network.target docker.service

[Service]
Type=oneshot
User=ubuntu
WorkingDirectory=/opt/directus-infra
ExecStart=/opt/directus-infra/deploy.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Create deployment script
cat > /opt/directus-infra/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting Directus deployment..."

# Pull latest code (this will be triggered by GitHub Actions)
if [ -d ".git" ]; then
    git pull origin main
else
    echo "No git repository found. First deployment should be done via GitHub Actions."
fi

# Build and start services
docker-compose down --remove-orphans || true
docker-compose up -d --build

echo "✅ Deployment completed!"
EOF

chmod +x /opt/directus-infra/deploy.sh
chown ubuntu:ubuntu /opt/directus-infra/deploy.sh

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Configure basic firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Create a simple health check endpoint
mkdir -p /var/www/html
cat > /var/www/html/health << 'EOF'
{
  "status": "healthy",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "instance": "$(curl -s http://169.254.169.254/latest/meta-data/instance-id)"
}
EOF

# Basic Nginx configuration (will be overridden by deployment)
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;
    
    server_name _;
    
    location /health {
        try_files $uri $uri/ =404;
    }
    
    location / {
        return 503 "Deployment in progress";
    }
}
EOF

# Restart Nginx
systemctl restart nginx

# Log completion
echo "✅ EC2 User Data script completed successfully!" >> /var/log/user-data.log
echo "Instance ready for Directus deployment at $(date)" >> /var/log/user-data.log

# Create a marker file to indicate setup is complete
touch /opt/directus-infra/.setup-complete