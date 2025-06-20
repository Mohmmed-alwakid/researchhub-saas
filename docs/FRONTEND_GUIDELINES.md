# ResearchHub - Frontend Development Guidelines

**Version:** 2.0  
**Date:** June 15, 2025  
**Status:** Under Development - Not Production Ready  

---

## 🎯 Overview

This document establishes coding standards, best practices, and architectural guidelines for frontend development in the ResearchHub platform.

---

## 🏗️ Project Structure

### Directory Organization
```
src/client/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   ├── forms/           # Form components
│   ├── admin/           # Admin-specific components
│   ├── researcher/      # Researcher-specific components
│   └── participant/     # Participant-specific components
├── pages/               # Route components/pages
│   ├── auth/           # Authentication pages
│   ├── app/            # Protected app pages
│   └── public/         # Public pages
├── hooks/               # Custom React hooks
├── services/            # API services and utilities
├── stores/              # Zustand stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── styles/              # Global styles and Tailwind config
└── assets/              # Static assets (images, icons)
```

### File Naming Conventions
- **Components** - PascalCase: `UserProfile.tsx`, `StudyCard.tsx`
- **Pages** - PascalCase: `Dashboard.tsx`, `Login.tsx`
- **Hooks** - camelCase with 'use' prefix: `useAuth.tsx`, `useStudies.tsx`
- **Services** - camelCase: `authService.ts`, `studyService.ts`
- **Types** - PascalCase: `User.ts`, `Study.ts`
- **Utils** - camelCase: `formatDate.ts`, `validators.ts`

---

## 🔤 TypeScript Guidelines

### Strict Configuration
```typescript
// tsconfig.json - Strict mode enabled
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Definitions
```typescript
// ✅ Good - Explicit interface definitions
interface User {
  id: string;
  email: string;
  role: 'admin' | 'researcher' | 'participant';
  profile: UserProfile;
  createdAt: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
}

// ✅ Good - Component props interface
interface StudyCardProps {
  study: Study;
  onEdit?: (study: Study) => void;
  onDelete?: (studyId: string) => void;
  className?: string;
}
```

### Generic Types and Utilities
```typescript
// ✅ Good - Reusable generic types
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✅ Good - Utility types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
```

---

## ⚛️ React Component Guidelines

### Component Structure
```typescript
// ✅ Good - Functional component with TypeScript
import React from 'react';
import { User } from '@/types/User';

interface UserProfileProps {
  user: User;
  isEditable?: boolean;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  isEditable = false, 
  onUpdate 
}) => {
  // State declarations
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom hooks
  const { updateUser, isLoading } = useUser();
  
  // Event handlers
  const handleSave = useCallback(async (userData: User) => {
    try {
      await updateUser(userData);
      onUpdate?.(userData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }, [updateUser, onUpdate]);
  
  // Early returns
  if (!user) {
    return <div>No user data available</div>;
  }
  
  // Main render
  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
};
```

### Component Best Practices
```typescript
// ✅ Good - Use meaningful prop names
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// ✅ Good - Default props pattern
export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  onClick,
  children 
}) => {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        { 'btn-loading': isLoading }
      )}
      disabled={isDisabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

---

## 🎨 Styling Guidelines

### Tailwind CSS Best Practices
```tsx
// ✅ Good - Use consistent spacing scale
<div className="p-4 mb-6 space-y-4">
  <h2 className="text-xl font-semibold text-gray-900">
    Study Details
  </h2>
  <p className="text-gray-600 leading-relaxed">
    Study description goes here...
  </p>
</div>

// ✅ Good - Responsive design patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {studies.map(study => (
    <StudyCard key={study.id} study={study} />
  ))}
</div>

// ✅ Good - Component variants with cn utility
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
};

<button className={cn('px-4 py-2 rounded-md', buttonVariants[variant])}>
  {children}
</button>
```

### CSS-in-JS Alternative (for complex styles)
```typescript
// ✅ Good - Use CSS modules for complex component styles
import styles from './StudyCard.module.css';

const StudyCard = ({ study }: StudyCardProps) => (
  <div className={cn(styles.card, 'shadow-lg rounded-lg')}>
    <div className={styles.header}>
      <h3 className={styles.title}>{study.title}</h3>
    </div>
  </div>
);
```

### Design System Colors
```css
/* Tailwind CSS color palette customization */
:root {
  --color-primary: #3b82f6;      /* Blue 500 */
  --color-primary-dark: #1d4ed8; /* Blue 700 */
  --color-secondary: #6b7280;    /* Gray 500 */
  --color-success: #10b981;      /* Emerald 500 */
  --color-warning: #f59e0b;      /* Amber 500 */
  --color-danger: #ef4444;       /* Red 500 */
}
```

---

## 🔄 State Management

### Zustand Store Pattern
```typescript
// ✅ Good - Zustand store structure
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  // Actions
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  },

  updateUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading })
}));
```

### React Query Pattern
```typescript
// ✅ Good - React Query hooks
export const useStudies = (filters?: StudyFilters) => {
  return useQuery({
    queryKey: ['studies', filters],
    queryFn: () => studyService.getStudies(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useCreateStudy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: studyService.createStudy,
    onSuccess: () => {
      queryClient.invalidateQueries(['studies']);
    },
    onError: (error) => {
      console.error('Failed to create study:', error);
    }
  });
};
```

---

## 🔗 API Integration

### Service Layer Pattern
```typescript
// ✅ Good - API service structure
class StudyService {
  private baseURL = '/api/studies';

  async getStudies(filters?: StudyFilters): Promise<Study[]> {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`${this.baseURL}?${params}`);
    return response.data;
  }

  async createStudy(study: CreateStudyData): Promise<Study> {
    const response = await api.post(this.baseURL, study);
    return response.data;
  }

  async updateStudy(id: string, updates: Partial<Study>): Promise<Study> {
    const response = await api.patch(`${this.baseURL}/${id}`, updates);
    return response.data;
  }

  async deleteStudy(id: string): Promise<void> {
    await api.delete(`${this.baseURL}/${id}`);
  }
}

export const studyService = new StudyService();
```

### Error Handling Pattern
```typescript
// ✅ Good - Consistent error handling
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Usage in components
const { mutate: createStudy, isLoading, error } = useCreateStudy();

const handleSubmit = async (data: CreateStudyData) => {
  try {
    await createStudy(data);
    toast.success('Study created successfully!');
    navigate('/app/studies');
  } catch (error) {
    toast.error(handleApiError(error));
  }
};
```

---

## 🎣 Custom Hooks

### Hook Patterns
```typescript
// ✅ Good - Custom hook for form handling
export const useStudyForm = (initialData?: Study) => {
  const [formData, setFormData] = useState<StudyFormData>(
    initialData || getDefaultStudyData()
  );
  const [errors, setErrors] = useState<StudyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((data: StudyFormData): StudyFormErrors => {
    const errors: StudyFormErrors = {};
    
    if (!data.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!data.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    return errors;
  }, []);

  const handleSubmit = useCallback(async (
    onSubmit: (data: StudyFormData) => Promise<void>
  ) => {
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    handleSubmit
  };
};
```

---

## 🛣️ Routing & Navigation

### Route Protection
```typescript
// ✅ Good - Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback = <Navigate to="/login" replace />
}) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return fallback;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Usage
<Route path="/app/admin/*" element={
  <ProtectedRoute requiredRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
} />
```

### Route Organization
```typescript
// ✅ Good - Route configuration
export const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    {/* Protected routes */}
    <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="studies/*" element={<StudyRoutes />} />
      <Route path="profile" element={<Profile />} />
      
      {/* Admin routes */}
      <Route path="admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminRoutes />
        </ProtectedRoute>
      } />
    </Route>
    
    {/* Catch all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);
```

---

## 🎨 Component Library

### Reusable Component Patterns
```typescript
// ✅ Good - Base button component
interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonStyles.base,
          buttonStyles.variants[variant],
          buttonStyles.sizes[size],
          { [buttonStyles.loading]: isLoading },
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner className="mr-2" />}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
```

### Form Components
```typescript
// ✅ Good - Form input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, ...props }, ref) => {
    const inputId = useId();
    
    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-blue-500 focus:ring-blue-500',
            { 'border-red-300': error },
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {helpText && !error && (
          <p className="text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);
```

---

## 🧪 Testing Guidelines

### Component Testing
```typescript
// ✅ Good - Component test structure
import { render, screen, userEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
```

---

## 🔧 Performance Guidelines

### Code Splitting
```typescript
// ✅ Good - Lazy loading for large components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Analytics = lazy(() => import('./components/Analytics'));

// Usage with Suspense
<Suspense fallback={<PageLoader />}>
  <AdminDashboard />
</Suspense>
```

### Optimization Techniques
```typescript
// ✅ Good - Memoization patterns
const StudyList = React.memo(({ studies, onEdit, onDelete }: StudyListProps) => {
  const memoizedStudies = useMemo(() => 
    studies.filter(study => study.status === 'published'),
    [studies]
  );

  return (
    <div>
      {memoizedStudies.map(study => (
        <StudyCard 
          key={study.id} 
          study={study}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

// ✅ Good - Callback optimization
const StudyCard = ({ study, onEdit, onDelete }: StudyCardProps) => {
  const handleEdit = useCallback(() => {
    onEdit(study);
  }, [study, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(study.id);
  }, [study.id, onDelete]);

  return (
    <div>
      <Button onClick={handleEdit}>Edit</Button>
      <Button onClick={handleDelete} variant="danger">Delete</Button>
    </div>
  );
};
```

---

## 📱 Accessibility Guidelines

### ARIA and Semantic HTML
```typescript
// ✅ Good - Accessible modal component
export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="flex min-h-screen items-center justify-center">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
          aria-hidden="true"
        />
        
        <div 
          ref={modalRef}
          className="relative bg-white rounded-lg shadow-xl"
          tabIndex={-1}
        >
          <div className="px-6 py-4">
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="px-6 pb-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 📋 Code Review Checklist

### Before Submitting
- [ ] TypeScript compilation passes with no errors
- [ ] ESLint rules pass without warnings
- [ ] Components are properly typed
- [ ] Error boundaries implemented where needed
- [ ] Loading states handled appropriately
- [ ] Accessibility attributes added
- [ ] Responsive design tested
- [ ] Performance optimizations applied

### Review Criteria
- [ ] Code follows established patterns
- [ ] Components are reusable and composable
- [ ] State management is appropriate
- [ ] Error handling is comprehensive
- [ ] Tests cover critical functionality
- [ ] Documentation is updated if needed

---

## 📞 Contact & Updates

**Frontend Lead:** ResearchHub Development Team  
**Last Updated:** June 15, 2025  
**Next Review:** September 15, 2025  

---

*These guidelines evolve with the project. All developers should stay updated with the latest patterns and best practices.*
