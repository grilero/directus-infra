#!/bin/bash

# SSL Certificate Setup for Directus Infrastructure
# Sets up Let's Encrypt certificates for both dev and prod domains

domains=(dev.content.grile.ro content.grile.ro)
rsa_key_size=4096
data_path="./certbot"
email="admin@grile.ro"  # Change this to your email
staging=0  # Set to 1 for testing

if [ -d "$data_path" ]; then
  read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

echo "### Setting up SSL certificates for domains: ${domains[*]}"

# Download recommended TLS parameters
if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo
fi

# Create dummy certificates for each domain
for domain in "${domains[@]}"; do
  echo "### Creating dummy certificate for $domain ..."
  path="/etc/letsencrypt/live/$domain"
  mkdir -p "$data_path/conf/live/$domain"
  docker-compose run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
      -keyout '$path/privkey.pem' \
      -out '$path/fullchain.pem' \
      -subj '/CN=localhost'" certbot
  echo
done

echo "### Starting nginx ..."
# Try both compose files (dev and prod containers may be running)
docker-compose -f docker-compose.dev.yml up --force-recreate -d nginx 2>/dev/null || \
docker-compose -f docker-compose.prod.yml up --force-recreate -d nginx 2>/dev/null || \
docker-compose up --force-recreate -d nginx
echo

# Get real certificates for each domain
for domain in "${domains[@]}"; do
  echo "### Deleting dummy certificate for $domain ..."
  docker-compose run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/$domain && \
    rm -Rf /etc/letsencrypt/archive/$domain && \
    rm -Rf /etc/letsencrypt/renewal/$domain.conf" certbot
  echo

  echo "### Requesting Let's Encrypt certificate for $domain ..."
  
  # Email arg
  case "$email" in
    "") email_arg="--register-unsafely-without-email" ;;
    *) email_arg="--email $email" ;;
  esac

  # Staging arg
  if [ $staging != "0" ]; then staging_arg="--staging"; fi

  docker-compose run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
      $staging_arg \
      $email_arg \
      -d $domain \
      --rsa-key-size $rsa_key_size \
      --agree-tos \
      --force-renewal" certbot
      
  if [ $? -eq 0 ]; then
    echo "✅ Certificate for $domain obtained successfully"
  else
    echo "❌ Failed to obtain certificate for $domain"
  fi
  echo
done

echo "### Reloading nginx ..."
# Reload nginx in whichever container is running
docker-compose -f docker-compose.dev.yml exec nginx nginx -s reload 2>/dev/null || \
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload 2>/dev/null || \
docker-compose exec nginx nginx -s reload

echo "✅ SSL certificate setup completed!"
echo "📝 Next steps:"
echo "1. Verify certificates: https://dev.content.grile.ro and https://content.grile.ro"
echo "2. Certificates will auto-renew via certbot service"