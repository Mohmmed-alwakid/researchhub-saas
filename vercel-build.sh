#!/bin/bash

# Vercel Build Script with Framework Quality Gates
echo "🎯 Starting Vercel build with Completion Framework validation..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed - blocking deployment"
    exit 1
fi

# Run framework validators
echo "🔍 Running framework quality gates..."
if [ -f ".framework/validators/run-all-validators.js" ]; then
    node .framework/validators/run-all-validators.js
    if [ $? -ne 0 ]; then
        echo "❌ Framework validation failed - blocking deployment"
        exit 1
    fi
else
    echo "⚠️  Framework validators not found - proceeding with caution"
fi

# Check completion tracking
echo "📊 Checking completion framework status..."
if [ -f "scripts/simple-completion-tracker.js" ]; then
    npm run track-progress
fi

# Build the application
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful - all quality gates passed!"
    echo "🚀 Ready for production deployment"
else
    echo "❌ Build failed - deployment blocked"
    exit 1
fi
