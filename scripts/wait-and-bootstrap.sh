#!/bin/bash

echo "🚀 Starting Directus initialization process..."

# Wait for Directus to be ready
echo "⏳ Waiting for Directus to be ready..."
timeout=300  # 5 minutes timeout
counter=0

while [ $counter -lt $timeout ]; do
    if curl -sf http://localhost:8055/server/health > /dev/null 2>&1; then
        echo "✅ Directus is ready!"
        break
    fi
    echo "   Waiting... ($counter/${timeout}s)"
    sleep 5
    counter=$((counter + 5))
done

if [ $counter -ge $timeout ]; then
    echo "❌ Timeout waiting for Directus to be ready"
    exit 1
fi

# Additional wait to ensure Directus is fully initialized
echo "🔄 Waiting additional 10 seconds for full initialization..."
sleep 10

# Run bootstrap script
echo "🏗️  Running bootstrap script..."
if npm run bootstrap:local; then
    echo "✅ Bootstrap completed successfully!"
else
    echo "⚠️  Bootstrap had issues, but continuing..."
fi

echo "🎉 Initialization complete!"