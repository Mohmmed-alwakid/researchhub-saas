# 🚀 DEPLOYMENT & INFRASTRUCTURE - COMPREHENSIVE REQUIREMENTS
## Production-Ready Deployment Architecture & DevOps Pipeline

**Created**: July 12, 2025  
**Status**: 🟢 GREENFIELD SPECIFICATION  
**Scope**: Complete deployment infrastructure, CI/CD pipelines, and production operations  
**Dependencies**: Platform Foundation (01-PLATFORM_FOUNDATION.md), All System Components

---

## 📋 EXECUTIVE SUMMARY

The Deployment & Infrastructure system provides enterprise-grade deployment architecture, automated CI/CD pipelines, scalable cloud infrastructure, and comprehensive monitoring to ensure ResearchHub operates reliably at scale with zero-downtime deployments.

### **🎯 Core Value Proposition**
> "Rock-solid infrastructure that scales seamlessly with automated deployments, comprehensive monitoring, and enterprise-grade security that keeps ResearchHub running flawlessly 24/7"

### **🏆 Success Metrics**
- **System Uptime**: >99.99% availability
- **Deployment Success**: >99.5% successful deployments
- **Performance**: <200ms average API response time
- **Security**: Zero critical vulnerabilities in production

---

## 🏗️ INFRASTRUCTURE ARCHITECTURE

### **Production Environment Stack**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  # Frontend - Next.js Application
  web:
    image: researchhub/web:${VERSION}
    build:
      context: .
      dockerfile: Dockerfile.prod
      args:
        - NODE_ENV=production
        - NEXT_PUBLIC_API_URL=${API_URL}
        - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_REGION=${AWS_REGION}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G

  # Database - PostgreSQL with Supabase
  db:
    image: supabase/postgres:15.1.0.117
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_HOST_AUTH_METHOD=md5
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  # Redis Cache & Session Store
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  # Background Job Processing
  worker:
    image: researchhub/worker:${VERSION}
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  # Nginx Reverse Proxy & Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - nginx_cache:/var/cache/nginx
    depends_on:
      - web
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Monitoring - Prometheus
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped

  # Monitoring - Grafana
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  nginx_cache:
  prometheus_data:
  grafana_data:

networks:
  default:
    driver: bridge
```

### **Kubernetes Production Manifests**
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: researchhub-prod
  labels:
    name: researchhub-prod
    environment: production

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: researchhub-config
  namespace: researchhub-prod
data:
  NODE_ENV: "production"
  API_URL: "https://api.researchhub.com"
  REDIS_URL: "redis://redis-service:6379"

---
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: researchhub-secrets
  namespace: researchhub-prod
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  NEXTAUTH_SECRET: <base64-encoded-secret>
  STRIPE_SECRET_KEY: <base64-encoded-stripe-key>
  SENDGRID_API_KEY: <base64-encoded-sendgrid-key>
  AWS_ACCESS_KEY_ID: <base64-encoded-aws-key>
  AWS_SECRET_ACCESS_KEY: <base64-encoded-aws-secret>

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: researchhub-web
  namespace: researchhub-prod
  labels:
    app: researchhub-web
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: researchhub-web
  template:
    metadata:
      labels:
        app: researchhub-web
        version: v1
    spec:
      containers:
      - name: web
        image: researchhub/web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: researchhub-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: researchhub-secrets
              key: DATABASE_URL
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: researchhub-web-service
  namespace: researchhub-prod
spec:
  selector:
    app: researchhub-web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: researchhub-ingress
  namespace: researchhub-prod
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - researchhub.com
    - www.researchhub.com
    secretName: researchhub-tls
  rules:
  - host: researchhub.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: researchhub-web-service
            port:
              number: 80

---
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: researchhub-web-hpa
  namespace: researchhub-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: researchhub-web
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 🔧 CI/CD PIPELINE CONFIGURATION

### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: researchhub_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run type checking
      run: npm run type-check

    - name: Run unit tests
      run: npm run test:unit
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/researchhub_test

    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/researchhub_test

    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/researchhub_test

    - name: Upload test coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run dependency security audit
      run: npm audit --audit-level=moderate

    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high

    - name: Run SAST with CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: typescript, javascript

    - name: Perform CodeQL analysis
      uses: github/codeql-action/analyze@v2

  build:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix=sha-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile.prod
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-staging:
    if: github.ref == 'refs/heads/main'
    needs: [build]
    runs-on: ubuntu-latest
    environment: staging

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Update kubeconfig
      run: aws eks update-kubeconfig --name researchhub-staging

    - name: Deploy to staging
      run: |
        sed -i 's|IMAGE_TAG|${{ github.sha }}|g' k8s/staging/deployment.yaml
        kubectl apply -f k8s/staging/

    - name: Wait for deployment
      run: kubectl rollout status deployment/researchhub-web -n researchhub-staging --timeout=300s

    - name: Run smoke tests
      run: |
        STAGING_URL=$(kubectl get ingress researchhub-ingress -n researchhub-staging -o jsonpath='{.spec.rules[0].host}')
        npm run test:smoke -- --url=https://$STAGING_URL

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [deploy-staging]
    runs-on: ubuntu-latest
    environment: production

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Update kubeconfig
      run: aws eks update-kubeconfig --name researchhub-prod

    - name: Deploy to production
      run: |
        sed -i 's|IMAGE_TAG|${{ github.sha }}|g' k8s/production/deployment.yaml
        kubectl apply -f k8s/production/

    - name: Wait for deployment
      run: kubectl rollout status deployment/researchhub-web -n researchhub-prod --timeout=300s

    - name: Run production health checks
      run: |
        npm run test:health-check -- --url=https://researchhub.com

    - name: Notify deployment success
      uses: 8398a7/action-slack@v3
      with:
        status: success
        channel: '#deployments'
        message: '🚀 Production deployment successful! Version: ${{ github.sha }}'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  rollback:
    if: failure()
    needs: [deploy-production]
    runs-on: ubuntu-latest
    environment: production

    steps:
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Update kubeconfig
      run: aws eks update-kubeconfig --name researchhub-prod

    - name: Rollback deployment
      run: kubectl rollout undo deployment/researchhub-web -n researchhub-prod

    - name: Notify rollback
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        channel: '#alerts'
        message: '⚠️ Production deployment failed! Rollback initiated.'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### **Terraform Infrastructure as Code**
```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
  }

  backend "s3" {
    bucket = "researchhub-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "researchhub-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true

  tags = {
    Environment = "production"
    Project     = "researchhub"
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"

  cluster_name    = "researchhub-prod"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true

  eks_managed_node_groups = {
    main = {
      min_size     = 3
      max_size     = 10
      desired_size = 5

      instance_types = ["t3.large"]
      capacity_type  = "ON_DEMAND"

      k8s_labels = {
        Environment = "production"
        NodeGroup   = "main"
      }
    }
  }

  tags = {
    Environment = "production"
    Project     = "researchhub"
  }
}

# RDS Database
resource "aws_db_instance" "main" {
  identifier = "researchhub-prod"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.large"

  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true

  db_name  = "researchhub"
  username = "researchhub"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = false
  final_snapshot_identifier = "researchhub-prod-final-snapshot"

  tags = {
    Environment = "production"
    Project     = "researchhub"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "researchhub-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "researchhub-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = {
    Environment = "production"
    Project     = "researchhub"
  }
}

# S3 Buckets
resource "aws_s3_bucket" "uploads" {
  bucket = "researchhub-uploads-prod"

  tags = {
    Environment = "production"
    Project     = "researchhub"
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "researchhub-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["researchhub.com", "www.researchhub.com"]

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "researchhub-origin"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "CloudFront-Forwarded-Proto"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.main.arn
    ssl_support_method  = "sni-only"
  }

  tags = {
    Environment = "production"
    Project     = "researchhub"
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Outputs
output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}
```

---

## 📊 MONITORING & OBSERVABILITY

### **Prometheus Configuration**
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'researchhub-app'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### **Grafana Dashboard Configuration**
```json
{
  "dashboard": {
    "id": null,
    "title": "ResearchHub Production Metrics",
    "tags": ["researchhub", "production"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ],
        "yAxes": [
          {
            "unit": "s",
            "min": 0
          }
        ]
      },
      {
        "id": 2,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m]) * 100",
            "legendFormat": "Error Rate %"
          }
        ]
      },
      {
        "id": 4,
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active Connections"
          }
        ]
      },
      {
        "id": 5,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "process_resident_memory_bytes / 1024 / 1024",
            "legendFormat": "Memory (MB)"
          }
        ]
      },
      {
        "id": 6,
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(process_cpu_seconds_total[5m]) * 100",
            "legendFormat": "CPU %"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### **Alert Rules Configuration**
```yaml
# monitoring/rules/alerts.yml
groups:
  - name: researchhub-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} for the last 5 minutes"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Database has {{ $value }} active connections"

      - alert: MemoryUsageHigh
        expr: process_resident_memory_bytes / 1024 / 1024 / 1024 > 1.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}GB"

      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[5m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Pod is crash looping"
          description: "Pod {{ $labels.pod }} is restarting frequently"

      - alert: PodNotReady
        expr: kube_pod_status_ready{condition="false"} == 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Pod not ready"
          description: "Pod {{ $labels.pod }} has been not ready for more than 5 minutes"
```

---

## 🛡️ SECURITY & BACKUP CONFIGURATION

### **Security Scanning & Compliance**
```yaml
# .github/workflows/security.yml
name: Security Scanning

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
  push:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run OWASP ZAP scan
        uses: zaproxy/action-full-scan@v0.4.0
        with:
          target: 'https://staging.researchhub.com'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'

  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'ResearchHub'
          path: '.'
          format: 'ALL'
          
      - name: Upload dependency check results
        uses: actions/upload-artifact@v3
        with:
          name: dependency-check-report
          path: reports/
```

### **Backup Strategy**
```bash
#!/bin/bash
# scripts/backup.sh

set -euo pipefail

# Configuration
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BACKUP_BUCKET="researchhub-backups-prod"
DATABASE_URL="${DATABASE_URL}"
REDIS_HOST="${REDIS_HOST}"

echo "Starting backup process at $(date)"

# Database Backup
echo "Creating database backup..."
pg_dump "$DATABASE_URL" | gzip > "db_backup_${BACKUP_TIMESTAMP}.sql.gz"

# Upload to S3
echo "Uploading database backup to S3..."
aws s3 cp "db_backup_${BACKUP_TIMESTAMP}.sql.gz" \
  "s3://${S3_BACKUP_BUCKET}/database/db_backup_${BACKUP_TIMESTAMP}.sql.gz"

# Redis Backup
echo "Creating Redis backup..."
redis-cli --rdb "redis_backup_${BACKUP_TIMESTAMP}.rdb" -h "$REDIS_HOST"

# Upload Redis backup to S3
echo "Uploading Redis backup to S3..."
aws s3 cp "redis_backup_${BACKUP_TIMESTAMP}.rdb" \
  "s3://${S3_BACKUP_BUCKET}/redis/redis_backup_${BACKUP_TIMESTAMP}.rdb"

# File uploads backup (sync with versioning)
echo "Syncing file uploads..."
aws s3 sync s3://researchhub-uploads-prod \
  "s3://${S3_BACKUP_BUCKET}/uploads/${BACKUP_TIMESTAMP}/" \
  --storage-class GLACIER

# Cleanup old local backups
echo "Cleaning up local backup files..."
rm -f "db_backup_${BACKUP_TIMESTAMP}.sql.gz"
rm -f "redis_backup_${BACKUP_TIMESTAMP}.rdb"

# Cleanup old S3 backups (keep last 30 days)
echo "Cleaning up old backups..."
aws s3api list-objects-v2 \
  --bucket "$S3_BACKUP_BUCKET" \
  --prefix "database/" \
  --query 'Contents[?LastModified<=`'"$(date -d '30 days ago' -u +%Y-%m-%dT%H:%M:%S)"'`].[Key]' \
  --output text | xargs -I {} aws s3 rm "s3://${S3_BACKUP_BUCKET}/{}"

echo "Backup process completed at $(date)"

# Test backup integrity
echo "Testing backup integrity..."
gunzip -t "s3://${S3_BACKUP_BUCKET}/database/db_backup_${BACKUP_TIMESTAMP}.sql.gz" || {
  echo "ERROR: Database backup integrity check failed!"
  exit 1
}

echo "Backup integrity verified successfully"
```

---

## 🧪 TESTING SPECIFICATIONS

### **Deployment Testing Suite**
```typescript
// tests/deployment/health-check.test.ts
import { test, expect } from '@playwright/test';

test.describe('Production Health Checks', () => {
  test('should respond to health check endpoint', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const health = await response.json();
    expect(health.status).toBe('healthy');
    expect(health.database).toBe('connected');
    expect(health.redis).toBe('connected');
  });

  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ResearchHub/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should authenticate users', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle API requests', async ({ request }) => {
    const response = await request.get('/api/studies', {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.studies)).toBe(true);
  });

  test('should connect to WebSocket', async ({ page }) => {
    let wsConnected = false;
    
    page.on('websocket', ws => {
      ws.on('framereceived', () => {
        wsConnected = true;
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    expect(wsConnected).toBe(true);
  });
});

// Performance tests
test.describe('Performance Tests', () => {
  test('should meet performance benchmarks', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3 second max load time
  });

  test('should handle concurrent requests', async ({ request }) => {
    const requests = Array(50).fill(null).map(() => 
      request.get('/api/health')
    );
    
    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.status() === 200).length;
    
    expect(successCount).toBe(50);
  });
});
```

### **Infrastructure Testing**
```typescript
// tests/infrastructure/infrastructure.test.ts
import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Infrastructure Tests', () => {
  it('should have all required services running', async () => {
    const { stdout } = await execAsync('kubectl get pods -n researchhub-prod');
    
    expect(stdout).toContain('researchhub-web');
    expect(stdout).toContain('Running');
    expect(stdout).not.toContain('Error');
  });

  it('should have ingress configured correctly', async () => {
    const { stdout } = await execAsync('kubectl get ingress -n researchhub-prod');
    
    expect(stdout).toContain('researchhub.com');
    expect(stdout).toContain('80, 443');
  });

  it('should have SSL certificate valid', async () => {
    const { stdout } = await execAsync('curl -I https://researchhub.com');
    
    expect(stdout).toContain('HTTP/2 200');
    expect(stdout).not.toContain('certificate');
  });

  it('should have monitoring endpoints accessible', async () => {
    const endpoints = [
      'http://prometheus:9090/api/v1/query?query=up',
      'http://grafana:3000/api/health'
    ];

    for (const endpoint of endpoints) {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" ${endpoint}`);
      expect(stdout.trim()).toBe('200');
    }
  });

  it('should have database connection pool healthy', async () => {
    const { stdout } = await execAsync(`
      kubectl exec -n researchhub-prod deployment/researchhub-web -- \
      node -e "
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        pool.query('SELECT 1').then(() => {
          console.log('Database connection successful');
          process.exit(0);
        }).catch((err) => {
          console.error('Database connection failed:', err);
          process.exit(1);
        });
      "
    `);
    
    expect(stdout).toContain('Database connection successful');
  });
});
```

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### **Deployment Success Metrics**
```typescript
interface DeploymentKPIs {
  reliability: {
    systemUptime: number; // Target: >99.99%
    deploymentSuccessRate: number; // Target: >99.5%
    rollbackTime: number; // Target: <5 minutes
    mttr: number; // Mean Time To Recovery: <15 minutes
  };
  
  performance: {
    apiResponseTime: number; // Target: <200ms average
    pageLoadTime: number; // Target: <3 seconds
    databaseQueryTime: number; // Target: <50ms average
    cdnHitRate: number; // Target: >90%
  };
  
  security: {
    vulnerabilityScore: number; // Target: 0 critical, <5 high
    securityScanCoverage: number; // Target: >95%
    sslRating: string; // Target: A+
    complianceScore: number; // Target: >98%
  };
  
  operationalEfficiency: {
    automatedDeploymentRate: number; // Target: >99%
    manualInterventionRate: number; // Target: <1%
    monitoringCoverage: number; // Target: >95%
    alertResponseTime: number; // Target: <5 minutes
  };
}
```

### **Infrastructure Performance Targets**
```typescript
const INFRASTRUCTURE_TARGETS = {
  availability: {
    target: '>99.99%',
    measurement: 'System uptime excluding planned maintenance',
    acceptance: 'Monthly uptime above target'
  },
  
  performance: {
    target: '<200ms',
    measurement: 'Average API response time',
    acceptance: '95th percentile under 500ms'
  },
  
  scalability: {
    target: '10x load',
    measurement: 'Ability to handle traffic spikes',
    acceptance: 'Auto-scaling within 2 minutes'
  },
  
  security: {
    target: '0 critical vulnerabilities',
    measurement: 'Security scan results',
    acceptance: 'Daily scans pass without critical issues'
  }
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Infrastructure Foundation (Week 1)**
- [ ] AWS/Cloud infrastructure setup
- [ ] Kubernetes cluster configuration
- [ ] Database and Redis deployment
- [ ] SSL certificates and domain setup
- [ ] Basic monitoring setup

### **Phase 2: CI/CD Pipeline (Week 2)**
- [ ] GitHub Actions workflow configuration
- [ ] Automated testing integration
- [ ] Security scanning implementation
- [ ] Staging environment deployment
- [ ] Production deployment pipeline

### **Phase 3: Monitoring & Observability (Week 3)**
- [ ] Prometheus and Grafana setup
- [ ] Custom metrics implementation
- [ ] Alert configuration
- [ ] Log aggregation system
- [ ] Performance monitoring

### **Phase 4: Security & Compliance (Week 4)**
- [ ] Security hardening
- [ ] Backup and disaster recovery
- [ ] Compliance documentation
- [ ] Security audit implementation
- [ ] Penetration testing

---

**🚀 DEPLOYMENT & INFRASTRUCTURE: Enterprise-grade infrastructure that scales seamlessly with automated deployments, comprehensive monitoring, and rock-solid security to keep ResearchHub running flawlessly 24/7 while enabling rapid innovation and growth.**
