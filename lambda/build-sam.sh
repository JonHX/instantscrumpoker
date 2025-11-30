#!/bin/bash
# Build Lambda deployment package for ScrumPoker Service
# Follows the same pattern as other OneDam services

set -e
echo "🚀 Building ScrumPoker Lambda package..."

# Create a temporary build directory
LAMBDA_PACKAGE="$(pwd)/lambda-build"
TS_BUILD_DIR="$(pwd)/ts-build"
rm -rf "$LAMBDA_PACKAGE"
rm -rf "$TS_BUILD_DIR"
rm -rf .aws-sam/
mkdir -p "$LAMBDA_PACKAGE"

# Install all dependencies (including dev for TypeScript)
echo "📦 Installing dependencies..."
npm ci

# Build TypeScript to temporary directory
echo "🔨 Compiling TypeScript..."
npx tsc

# Copy compiled JavaScript files
echo "📋 Copying compiled files..."
if [ -d "$TS_BUILD_DIR/handlers" ]; then
  cp -r "$TS_BUILD_DIR/handlers" "$LAMBDA_PACKAGE/"
  echo "✅ Copied handlers directory"
else
  echo "❌ ERROR: handlers directory not found in $TS_BUILD_DIR"
  ls -la "$TS_BUILD_DIR" || echo "ts-build directory does not exist"
  exit 1
fi
if [ -d "$TS_BUILD_DIR/lib" ]; then
  cp -r "$TS_BUILD_DIR/lib" "$LAMBDA_PACKAGE/"
  echo "✅ Copied lib directory"
else
  echo "❌ ERROR: lib directory not found in $TS_BUILD_DIR"
  exit 1
fi

# Verify handler files exist
echo "🔍 Verifying handler files..."
if [ ! -f "$LAMBDA_PACKAGE/handlers/createRoom.js" ]; then
  echo "❌ ERROR: handlers/createRoom.js not found"
  exit 1
fi
echo "✅ Handler files verified"

# Copy package.json for production dependencies
echo "📋 Copying package.json..."
cp package.json "$LAMBDA_PACKAGE/"

# Install production dependencies into lambda-build
echo "📦 Installing production dependencies..."
cd "$LAMBDA_PACKAGE"
npm install --production --no-save
cd ..
rm -rf "$TS_BUILD_DIR"

# Remove unnecessary files to reduce package size
echo "🧹 Cleaning up unnecessary files..."
cd "$LAMBDA_PACKAGE"
find . -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.ts" -delete 2>/dev/null || true
find . -type f -name "*.ts.map" -delete 2>/dev/null || true
find . -type f -name "*.d.ts" -delete 2>/dev/null || true
find . -type f -name "tsconfig.json" -delete 2>/dev/null || true
cd ..

echo "✅ Build complete! Lambda package ready at ./lambda-build/"
echo "📦 Package size: $(du -sh lambda-build 2>/dev/null | cut -f1 || echo 'N/A')"

