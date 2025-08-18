# 🎯 IMMEDIATE ACTION PLAN - Session Management Enhancement

## 🚀 PRIORITY 1: Fix Participant Session Persistence

### Issue Analysis
- **Problem**: JWT tokens not persisting between page navigations
- **Impact**: Participants need to re-authenticate to access studies
- **Root Cause**: Frontend session management needs enhancement
- **Solution**: Implement robust token persistence and refresh mechanisms

### Technical Implementation Plan

#### 1. Enhanced Auth Service (Frontend)
**File**: `src/client/services/auth.js`

**Updates Needed**:
```javascript
// Add token persistence with multiple storage strategies
const AUTH_STORAGE_KEY = 'researchhub_auth_token';
const REFRESH_TOKEN_KEY = 'researchhub_refresh_token';

class AuthService {
  // Multiple storage fallbacks
  setToken(token, refreshToken) {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
    sessionStorage.setItem(AUTH_STORAGE_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  // Automatic token refresh
  async refreshTokenIfNeeded() {
    const token = this.getToken();
    if (this.isTokenExpiring(token)) {
      return await this.refreshToken();
    }
    return token;
  }

  // Check token before API calls
  async getValidToken() {
    return await this.refreshTokenIfNeeded();
  }
}
```

#### 2. API Client Enhancement
**File**: `src/client/utils/api.js`

**Updates Needed**:
```javascript
// Automatic token injection and refresh
export const apiClient = {
  async request(endpoint, options = {}) {
    const token = await authService.getValidToken();
    
    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const response = await fetch(endpoint, config);
    
    // Handle token expiration
    if (response.status === 401) {
      await authService.refreshToken();
      return this.request(endpoint, options);
    }
    
    return response;
  }
};
```

#### 3. React Context Enhancement
**File**: `src/client/contexts/AuthContext.tsx`

**Updates Needed**:
```typescript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await authService.getValidToken();
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Token refresh interval
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        await authService.refreshTokenIfNeeded();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [user]);
};
```

### Implementation Steps

#### Phase 1: Core Token Management (Today)
1. **Update AuthService**: Add robust token persistence methods
2. **Enhance API Client**: Automatic token injection and refresh
3. **Test Token Persistence**: Verify tokens survive page refresh

#### Phase 2: React Integration (Tomorrow)
1. **Update AuthContext**: Add initialization and refresh logic
2. **Update Login Components**: Use enhanced auth service
3. **Test User Flows**: Verify seamless navigation

#### Phase 3: Participant Workflow (Day 3)
1. **Test Complete Flow**: Login → Discover → Apply → Execute
2. **Fix Any Edge Cases**: Handle network errors, token expiration
3. **Validate End-to-End**: Complete participant experience

### Success Criteria
- ✅ Participant can login once and navigate freely
- ✅ Token automatically refreshes before expiration
- ✅ No re-authentication needed during session
- ✅ Complete participant workflow functional

### Testing Plan
1. **Unit Tests**: Token persistence and refresh logic
2. **Integration Tests**: Full auth flow with page navigation
3. **E2E Tests**: Complete participant workflow validation
4. **Cross-browser**: Test in Chrome, Firefox, Safari, Edge

## 🛠️ IMMEDIATE DEVELOPMENT COMMANDS

### Start Local Development
```bash
npm run dev:fullstack
```

### Run Focused Tests
```bash
npm run test:auth        # Auth-specific tests
npm run test:participant # Participant workflow tests
npm run test:e2e         # End-to-end validation
```

### Quick Validation
```bash
# Test auth persistence locally
npm run test:quick
```

## 📅 TIMELINE

- **Day 1 (Today)**: Core token management implementation
- **Day 2**: React integration and testing
- **Day 3**: Complete participant workflow validation
- **Day 4**: Production deployment and validation

## 🎯 EXPECTED OUTCOME

By the end of this week:
- ✅ Seamless participant authentication experience
- ✅ Complete end-to-end participant workflow functional
- ✅ Platform ready for real participant onboarding
- ✅ Production-quality user experience

This enhancement will complete the final missing piece of the ResearchHub platform, making it fully operational for both researchers and participants.

---
**Next Action**: Begin implementation of enhanced AuthService with token persistence
**Priority**: HIGH - Blocks complete participant workflow
**Estimated Time**: 2-3 days for complete implementation and testing
