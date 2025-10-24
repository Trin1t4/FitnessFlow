#!/bin/bash
set -e

echo "🔨 Building the application..."
npm run build

echo "📦 Setting up build files for server..."
node setup-build.js

echo "✅ Build completed successfully!"
echo "Files are ready in server/public/"
