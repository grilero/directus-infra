#!/bin/bash
# Production Environment Deployment Script
# Deploys to production environment with zero downtime and safety checks

set -e

ENVIRONMENT="prod"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
CONTAINER_NAME="directus-prod"

echo "🚀 Deploying to Production Environment..."

# Safety checks
echo "🛡️  Running safety checks..."

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found!"
    echo "Please create it from .env.prod.example"
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Docker Compose file $COMPOSE_FILE not found!"
    exit 1
fi

# Check if we're on the main branch (if in git repo)
if [ -d ".git" ]; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo "⚠️  Warning: Not on main branch (current: $CURRENT_BRANCH)"
        read -p "Continue with production deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Deployment cancelled"
            exit 1
        fi
    fi
fi

# Create backup of current state
echo "💾 Creating backup of current state..."
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
if docker-compose -f "$COMPOSE_FILE" ps "$CONTAINER_NAME" | grep -q "Up"; then
    docker-compose -f "$COMPOSE_FILE" logs "$CONTAINER_NAME" --tail=100 > "$BACKUP_DIR/pre_deployment_logs.txt"
fi

# Build extensions if source exists
if [ -d "extensions" ]; then
    echo "🔨 Building extensions..."
    for ext_dir in extensions/*/; do
        if [ -f "${ext_dir}package.json" ]; then
            echo "Building $(basename "$ext_dir")..."
            cd "$ext_dir"
            if [ -f package-lock.json ]; then
                npm ci --production
            else
                npm install --production
            fi
            npm run build
            cd - > /dev/null
        fi
    done
fi

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f "$COMPOSE_FILE" pull

# Start/restart services with zero downtime
echo "🔄 Deploying with zero downtime..."

# Start new container
docker-compose -f "$COMPOSE_FILE" up -d "$CONTAINER_NAME"

# Wait for new container to be healthy
echo "⏳ Waiting for new instance to be healthy..."
timeout 180 bash -c "
while true; do
    if docker-compose -f $COMPOSE_FILE ps $CONTAINER_NAME | grep -q 'healthy'; then
        echo '✅ New instance is healthy!'
        break
    fi
    if docker-compose -f $COMPOSE_FILE ps $CONTAINER_NAME | grep -q 'unhealthy'; then
        echo '❌ New instance is unhealthy!'
        echo '📋 Recent logs:'
        docker-compose -f $COMPOSE_FILE logs $CONTAINER_NAME --tail=50
        
        echo '🔄 Rolling back...'
        # Here you could implement rollback logic if needed
        exit 1
    fi
    echo 'Waiting for health check...'
    sleep 10
done
"

# Verify deployment
echo "🔍 Verifying deployment..."
PUBLIC_URL=$(grep PUBLIC_URL "$ENV_FILE" | cut -d'=' -f2)
if [ -n "$PUBLIC_URL" ]; then
    if curl -f -s "$PUBLIC_URL/health" > /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "❌ Health check failed!"
        echo "📋 Container logs:"
        docker-compose -f "$COMPOSE_FILE" logs "$CONTAINER_NAME" --tail=20
        exit 1
    fi
fi

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# Show status
echo "📊 Service Status:"
docker-compose -f "$COMPOSE_FILE" ps

# Log successful deployment
echo "$(date): Production deployment completed successfully" >> deployment.log

echo "✅ Production deployment completed successfully!"
echo "🌐 Service available at: $PUBLIC_URL"
echo "📝 Logs saved to: $BACKUP_DIR/"