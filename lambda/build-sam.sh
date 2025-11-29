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
# Temporarily change outDir for build
TSCONFIG_TEMP=$(mktemp)
sed 's|"outDir": "./lambda-build"|"outDir": "./ts-build"|' tsconfig.json > "$TSCONFIG_TEMP"
npx tsc --project "$TSCONFIG_TEMP"
rm "$TSCONFIG_TEMP"

# Copy compiled JavaScript files
echo "📋 Copying compiled files..."
if [ -d "$TS_BUILD_DIR/handlers" ]; then
  cp -r "$TS_BUILD_DIR/handlers" "$LAMBDA_PACKAGE/"
fi
if [ -d "$TS_BUILD_DIR/lib" ]; then
  cp -r "$TS_BUILD_DIR/lib" "$LAMBDA_PACKAGE/"
fi

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

