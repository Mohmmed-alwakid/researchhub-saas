# ResearchHub - Testing & Deployment Guide for Copilot

## 🧪 Testing Strategy

### Unit Testing Pattern
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/client/components/auth/LoginForm';

describe('LoginForm', () => {
  it('should validate email format', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });
});
```

### API Integration Testing
```typescript
// Test API endpoints
import request from 'supertest';
import { app } from '@/server';

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should return JWT token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });
  });
});
```

### E2E Testing with Playwright
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete full login process', async ({ page }) => {
    await page.goto('http://localhost:5175/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

## 🚀 Deployment Configurations

### Environment-Specific Settings

#### Development (.env.development)
```bash
NODE_ENV=development
PORT=3002
CLIENT_URL=http://localhost:5175
MONGODB_URI=mongodb://localhost:27017/researchhub-dev
JWT_SECRET=dev-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret
LOG_LEVEL=debug
```

#### Production (.env.production)
```bash
NODE_ENV=production
PORT=3002
CLIENT_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/researchhub
JWT_SECRET=super-secure-production-secret
JWT_REFRESH_SECRET=super-secure-refresh-secret
LOG_LEVEL=error

# Required for full functionality
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=researchhub-storage
```

### Docker Deployment

#### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3002:3002"
    environment:
      NODE_ENV: production
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
      CLIENT_URL: ${CLIENT_URL}
    depends_on:
      - mongodb
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongodb_data:
```

#### Nginx Production Configuration
```nginx
# nginx.prod.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3002;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/ssl/cert.pem;
        ssl_certificate_key /etc/ssl/key.pem;

        location /api/ {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            root /var/www/html;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### Cloud Deployment Scripts

#### Railway Deployment
```bash
# deploy-railway.sh
#!/bin/bash

echo "🚀 Deploying to Railway..."

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login and deploy
railway login
railway link
railway up

echo "✅ Deployment initiated to Railway"
echo "📊 Monitor at: https://railway.app/dashboard"
```

#### Vercel Deployment (Frontend only)
```bash
# deploy-vercel.sh
#!/bin/bash

echo "🚀 Deploying frontend to Vercel..."

# Build frontend
npm run build:client

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    npm install -g vercel
fi

# Deploy
vercel --prod

echo "✅ Frontend deployed to Vercel"
```

### Health Checks & Monitoring

#### Health Check Script
```typescript
// healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3002,
  path: '/api/health',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    console.error(`Health check failed with status: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('Health check error:', err);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
```

#### Monitoring Endpoints
```typescript
// Additional monitoring endpoints
app.get('/api/metrics', authenticateAdmin, (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    database: {
      connected: mongoose.connection.readyState === 1,
      collections: Object.keys(mongoose.connection.collections)
    },
    environment: process.env.NODE_ENV
  });
});
```

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Unit tests pass (`npm run test`)
- [ ] Build process succeeds (`npm run build`)

### Security
- [ ] Environment variables secured
- [ ] Strong JWT secrets configured
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Rate limiting enabled

### Performance
- [ ] Bundle size optimized
- [ ] Database indexes created
- [ ] Image optimization enabled
- [ ] Caching strategies implemented

### Functionality
- [ ] Authentication flow works
- [ ] Study creation/management works
- [ ] File upload works
- [ ] Real-time features work
- [ ] Payment integration works

### Infrastructure
- [ ] Health endpoints respond
- [ ] Database connection stable
- [ ] SSL certificates valid
- [ ] Backup strategy in place
- [ ] Monitoring configured

## 🎯 Deployment Commands

### Local Testing
```bash
# Test production build locally
npm run build
npm start

# Test with Docker
docker-compose up --build

# Load testing
npm install -g artillery
artillery quick --count 10 --num 100 http://localhost:3002/api/health
```

### Cloud Deployment
```bash
# Railway
railway up

# Heroku
git push heroku main

# DigitalOcean App Platform
doctl apps create --spec .do/app.yaml

# AWS ECS
aws ecs update-service --cluster researchhub --service app --force-new-deployment
```

### Post-Deployment Verification
```bash
# Check health
curl https://your-domain.com/api/health

# Test authentication
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Verify frontend loads
curl -I https://your-domain.com

# Check SSL
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

## 🚨 Rollback Strategy

### Quick Rollback Commands
```bash
# Railway
railway rollback

# Heroku
heroku rollback v123

# Docker
docker-compose down
docker-compose up -d --scale app=0
docker-compose up -d --scale app=1
```

### Database Rollback
```typescript
// Create migration scripts for schema changes
// Always backup before major changes
const backup = await mongoose.connection.db.admin().runCommand({
  createBackup: true,
  name: `backup_${Date.now()}`
});
```
