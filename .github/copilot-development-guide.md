# ResearchHub - Development Guide for Copilot

## ⚠️ Project Status: UNDER DEVELOPMENT - NOT PRODUCTION READY
**Last Updated**: December 28, 2024  
**Status**: � Early Development Stage - Many Features Incomplete

## �🚀 Quick Start Commands

### Development Workflow
```bash
# 1. Verify TypeScript (should show 0 errors)
npx tsc --noEmit

# 2. Start LOCAL development environment (RECOMMENDED)
npm run dev:fullstack  # Frontend (5175) + Backend (3003) + Real Supabase DB

# 3. Test core functionality
# Local API health check
curl http://localhost:3003/api/health

# Production health check (after deployment)
curl https://researchhub-saas.vercel.app/api/health
```

### Current Local Development Ports
- **Frontend**: http://localhost:5175 (Vite dev server)
- **Backend API**: http://localhost:3003 (Express with real Supabase)
- **Production**: https://researchhub-saas.vercel.app

## 🏗️ Project Architecture

### Authentication Flow
```typescript
// Login sequence
POST /api/auth/login → JWT access token + httpOnly refresh token
→ Store access token in memory, refresh token in httpOnly cookie
→ Auto-refresh on 401 responses

// Protected routes use middleware:
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Verify JWT and attach user to request
};
```

### Component Structure
```
src/client/components/
├── auth/           # Login, register, password reset
├── common/         # Shared UI components (Button, Card, etc.)
├── dashboard/      # Main dashboard components
├── studies/        # Study builder and management
├── analytics/      # Charts, metrics, reports
├── participants/   # User management
└── ui/            # Base UI primitives
```

### API Route Structure
```
src/server/routes/
├── auth.routes.ts     # Authentication endpoints
├── users.routes.ts    # User management
├── studies.routes.ts  # Study CRUD operations
├── analytics.routes.ts # Data and metrics
└── index.ts          # Route aggregation
```

## 🔧 Common Development Patterns

### API Response Pattern
```typescript
// Standard response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Implementation
const response: ApiResponse<User> = {
  success: true,
  data: user,
  message: 'User created successfully'
};
```

### Error Handling Pattern
```typescript
// Client-side error handling
const handleApiCall = async () => {
  try {
    const response = await apiService.call();
    if (response.success) {
      // Handle success
      toast.success(response.message);
    } else {
      // Handle API error
      toast.error(response.error);
    }
  } catch (error) {
    // Handle network/unexpected errors
    toast.error('Something went wrong');
    console.error('API Error:', error);
  }
};
```

### Form Validation with Zod
```typescript
// Define schema
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
});

// Use in React Hook Form
const form = useForm<z.infer<typeof userSchema>>({
  resolver: zodResolver(userSchema),
});
```

## 📱 UI Component Guidelines

### Accessibility Requirements
```tsx
// All form inputs must have proper labels
<label htmlFor="email">Email</label>
<input 
  id="email" 
  {...register('email')} 
  type="email"
  aria-describedby="email-error"
/>

// Error messages should be associated
<p id="email-error" role="alert">
  {errors.email?.message}
</p>
```

### Tailwind CSS Patterns
```typescript
// Use consistent spacing and colors
const styles = {
  button: 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700',
  input: 'border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500',
  card: 'bg-white rounded-lg shadow-md p-6',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
};
```

## 🔄 State Management

### Zustand Store Pattern
```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### React Query for API State
```typescript
// Query hook pattern
const useStudies = () => {
  return useQuery({
    queryKey: ['studies'],
    queryFn: () => studyService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hook pattern
const useCreateStudy = () => {
  return useMutation({
    mutationFn: studyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['studies']);
      toast.success('Study created successfully');
    },
  });
};
```

## 🛡️ Security Best Practices

### Input Validation
```typescript
// Server-side validation
const validateStudyInput = (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500),
    type: z.enum(['usability', 'survey', 'interview']),
  });

  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid input' });
  }
};
```

### Environment Variables
```typescript
// Access environment variables safely
const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/researchhub',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5175',
};
```

## 🧪 Testing Strategies

### Component Testing Pattern
```typescript
// Test user interactions
test('should submit form with valid data', async () => {
  render(<LoginForm />);
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  
  expect(mockLogin).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

### API Testing Pattern
```typescript
// Test API endpoints
describe('POST /api/auth/login', () => {
  it('should return JWT token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

## 🔄 CI/CD Pipeline

### Pre-commit Checks
```bash
# These should all pass before committing
npm run lint          # ESLint checks
npx tsc --noEmit      # TypeScript compilation
npm run test          # Unit tests
npm run build         # Production build
```

### Deployment Checklist
- [ ] All TypeScript errors resolved
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Build process succeeds
- [ ] Health endpoint responds
- [ ] Authentication flow works
- [ ] Core features functional
