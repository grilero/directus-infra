#!/bin/bash
# Development Environment Deployment Script
# Deploys to dev environment with zero downtime

set -e

ENVIRONMENT="dev"
COMPOSE_FILE="docker-compose.dev.yml"
ENV_FILE=".env.dev"
CONTAINER_NAME="directus-dev"

echo "🚀 Deploying to Development Environment..."

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found!"
    echo "Please create it from .env.dev.example"
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Docker Compose file $COMPOSE_FILE not found!"
    exit 1
fi

# Build extensions if source exists
if [ -d "extensions" ]; then
    echo "🔨 Building extensions..."
    for ext_dir in extensions/*/; do
        if [ -f "${ext_dir}package.json" ]; then
            echo "Building $(basename "$ext_dir")..."
            cd "$ext_dir"
            if [ -f package-lock.json ]; then
                npm ci
            else
                npm install
            fi
            npm run build
            cd - > /dev/null
        fi
    done
fi

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f "$COMPOSE_FILE" pull

# Start/restart services
echo "🔄 Starting services..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for Directus to be healthy
echo "⏳ Waiting for Directus to be healthy..."
timeout 120 bash -c "
while true; do
    if docker-compose -f $COMPOSE_FILE ps $CONTAINER_NAME | grep -q 'healthy'; then
        echo '✅ Directus is healthy!'
        break
    fi
    if docker-compose -f $COMPOSE_FILE ps $CONTAINER_NAME | grep -q 'unhealthy'; then
        echo '❌ Directus is unhealthy!'
        docker-compose -f $COMPOSE_FILE logs $CONTAINER_NAME --tail=50
        exit 1
    fi
    echo 'Waiting for health check...'
    sleep 5
done
"

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# Show status
echo "📊 Service Status:"
docker-compose -f "$COMPOSE_FILE" ps

echo "✅ Development deployment completed successfully!"
echo "🌐 Service available at: $(grep PUBLIC_URL $ENV_FILE | cut -d'=' -f2)"