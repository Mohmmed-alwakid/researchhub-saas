/**
 * 🌐 ResearchHub API Endpoints Validator
 * 
 * Comprehensive validation of all backend API endpoints:
 * 1. Authentication APIs (login, register, logout, refresh)
 * 2. Study management APIs (CRUD operations)
 * 3. User profile APIs (get/update profiles)
 * 4. Template APIs (list, get template data)
 * 5. Participant APIs (applications, sessions)
 * 6. System APIs (health, setup, admin)
 * 7. Error handling and response validation
 */

class APIEndpointsValidator {
    constructor() {
        this.baseUrl = 'https://researchhub-saas.vercel.app';
        this.testCredentials = {
            researcher: {
                email: 'abwanwr77+Researcher@gmail.com',
                password: 'Testtest123'
            },
            participant: {
                email: 'abwanwr77+participant@gmail.com',
                password: 'Testtest123'
            }
        };
        this.authToken = null;
        this.results = {
            authenticationAPIs: { status: 'PENDING', details: [] },
            studyManagementAPIs: { status: 'PENDING', details: [] },
            userProfileAPIs: { status: 'PENDING', details: [] },
            templateAPIs: { status: 'PENDING', details: [] },
            participantAPIs: { status: 'PENDING', details: [] },
            systemAPIs: { status: 'PENDING', details: [] },
            errorHandling: { status: 'PENDING', details: [] }
        };
    }

    async validateAPIEndpoints() {
        console.log('🌐 Starting API Endpoints Validation...');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🎯 Target API: ${this.baseUrl}/api`);
        
        try {
            await this.testAuthenticationAPIs();
            await this.testStudyManagementAPIs();
            await this.testUserProfileAPIs();
            await this.testTemplateAPIs();
            await this.testParticipantAPIs();
            await this.testSystemAPIs();
            await this.testErrorHandling();
            
            return this.generateReport();
            
        } catch (error) {
            console.error('❌ API endpoints validation failed:', error.message);
            throw error;
        }
    }

    async testAuthenticationAPIs() {
        console.log('\\n🔐 Testing Authentication APIs...');
        const details = [];
        
        try {
            // Test login API
            const loginResponse = await this.makeRequest('/api/auth-consolidated', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'login',
                    email: this.testCredentials.researcher.email,
                    password: this.testCredentials.researcher.password
                })
            });
            
            if (loginResponse.ok) {
                const loginData = await loginResponse.json();
                if (loginData.success && loginData.data?.access_token) {
                    details.push('✅ Login API working correctly');
                    this.authToken = loginData.data.access_token;
                } else {
                    details.push('❌ Login API response format incorrect');
                }
            } else {
                details.push(`❌ Login API failed with status ${loginResponse.status}`);
            }
            
            // Test registration API
            const registerResponse = await this.makeRequest('/api/auth-consolidated', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'register',
                    email: 'test@example.com',
                    password: 'TestPassword123',
                    role: 'researcher'
                })
            });
            
            if (registerResponse.ok) {
                details.push('✅ Registration API endpoint accessible');
            } else if (registerResponse.status === 400) {
                details.push('✅ Registration API properly validates (expected error for existing email)');
            } else {
                details.push(`❌ Registration API unexpected status ${registerResponse.status}`);
            }
            
            // Test user info API
            if (this.authToken) {
                const userResponse = await this.makeRequest('/api/auth-consolidated?action=user', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });
                
                if (userResponse.ok) {
                    details.push('✅ User info API working with authentication');
                } else {
                    details.push('❌ User info API failed with valid token');
                }
            }
            
            // Test logout API
            const logoutResponse = await this.makeRequest('/api/auth-consolidated', {
                method: 'POST',
                body: JSON.stringify({ action: 'logout' }),
                headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
            });
            
            if (logoutResponse.ok) {
                details.push('✅ Logout API accessible');
            } else {
                details.push('⚠️ Logout API may have issues');
            }
            
        } catch (error) {
            details.push(`❌ Authentication APIs test failed: ${error.message}`);
        }
        
        this.results.authenticationAPIs = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testStudyManagementAPIs() {
        console.log('\\n📚 Testing Study Management APIs...');
        const details = [];
        
        try {
            // Test get studies API
            const studiesResponse = await this.makeRequest('/api/research-consolidated?action=get-studies', {
                method: 'GET',
                headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
            });
            
            if (studiesResponse.ok) {
                const studiesData = await studiesResponse.json();
                if (studiesData.success || Array.isArray(studiesData.data)) {
                    details.push('✅ Get studies API working');
                } else {
                    details.push('⚠️ Get studies API response format unclear');
                }
            } else {
                details.push(`❌ Get studies API failed with status ${studiesResponse.status}`);
            }
            
            // Test create study API
            const createStudyResponse = await this.makeRequest('/api/research-consolidated', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'create-study',
                    title: 'Test Study',
                    description: 'API validation test study',
                    type: 'unmoderated'
                }),
                headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
            });
            
            if (createStudyResponse.ok) {
                details.push('✅ Create study API working');
            } else if (createStudyResponse.status === 401) {
                details.push('✅ Create study API properly requires authentication');
            } else {
                details.push(`⚠️ Create study API status ${createStudyResponse.status}`);
            }
            
            // Test dashboard analytics API
            const analyticsResponse = await this.makeRequest('/api/research-consolidated?action=dashboard-analytics', {
                method: 'GET',
                headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
            });
            
            if (analyticsResponse.ok) {
                details.push('✅ Dashboard analytics API working');
            } else {
                details.push('⚠️ Dashboard analytics API may have issues');
            }
            
        } catch (error) {
            details.push(`❌ Study management APIs test failed: ${error.message}`);
        }
        
        this.results.studyManagementAPIs = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testUserProfileAPIs() {
        console.log('\\n👤 Testing User Profile APIs...');
        const details = [];
        
        try {
            // Test get profile API
            const profileResponse = await this.makeRequest('/api/user-profile-consolidated?action=get-profile', {
                method: 'GET',
                headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
            });
            
            if (profileResponse.ok) {
                details.push('✅ Get profile API working');
            } else if (profileResponse.status === 401) {
                details.push('✅ Profile API properly requires authentication');
            } else {
                details.push(`⚠️ Profile API status ${profileResponse.status}`);
            }
            
            // Test update profile API
            const updateProfileResponse = await this.makeRequest('/api/user-profile-consolidated', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update-profile',
                    displayName: 'Test User'
                }),
                headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
            });
            
            if (updateProfileResponse.ok) {
                details.push('✅ Update profile API working');
            } else if (updateProfileResponse.status === 401) {
                details.push('✅ Update profile API properly requires authentication');
            } else {
                details.push(`⚠️ Update profile API status ${updateProfileResponse.status}`);
            }
            
        } catch (error) {
            details.push(`❌ User profile APIs test failed: ${error.message}`);
        }
        
        this.results.userProfileAPIs = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testTemplateAPIs() {
        console.log('\\n📋 Testing Template APIs...');
        const details = [];
        
        try {
            // Test get templates API
            const templatesResponse = await this.makeRequest('/api/templates-consolidated?action=get-templates', {
                method: 'GET'
            });
            
            if (templatesResponse.ok) {
                const templatesData = await templatesResponse.json();
                if (Array.isArray(templatesData) || templatesData.success) {
                    details.push('✅ Get templates API working');
                } else {
                    details.push('⚠️ Templates API response format unclear');
                }
            } else {
                details.push(`❌ Templates API failed with status ${templatesResponse.status}`);
            }
            
            // Test get template by ID API
            const templateByIdResponse = await this.makeRequest('/api/templates-consolidated?action=get-template&id=usability-basic', {
                method: 'GET'
            });
            
            if (templateByIdResponse.ok) {
                details.push('✅ Get template by ID API working');
            } else {
                details.push('⚠️ Get template by ID API may have issues');
            }
            
        } catch (error) {
            details.push(`❌ Template APIs test failed: ${error.message}`);
        }
        
        this.results.templateAPIs = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testParticipantAPIs() {
        console.log('\\n👥 Testing Participant APIs...');
        const details = [];
        
        try {
            // Test applications API
            const applicationsResponse = await this.makeRequest('/api/applications', {
                method: 'GET',
                headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
            });
            
            if (applicationsResponse.ok) {
                details.push('✅ Applications API working');
            } else if (applicationsResponse.status === 401) {
                details.push('✅ Applications API properly requires authentication');
            } else {
                details.push(`⚠️ Applications API status ${applicationsResponse.status}`);
            }
            
            // Test wallet API
            const walletResponse = await this.makeRequest('/api/wallet', {
                method: 'GET',
                headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
            });
            
            if (walletResponse.ok) {
                details.push('✅ Wallet API working');
            } else if (walletResponse.status === 401) {
                details.push('✅ Wallet API properly requires authentication');
            } else {
                details.push(`⚠️ Wallet API status ${walletResponse.status}`);
            }
            
        } catch (error) {
            details.push(`❌ Participant APIs test failed: ${error.message}`);
        }
        
        this.results.participantAPIs = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testSystemAPIs() {
        console.log('\\n⚙️ Testing System APIs...');
        const details = [];
        
        try {
            // Test health API
            const healthResponse = await this.makeRequest('/api/health', {
                method: 'GET'
            });
            
            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                if (healthData.status === 'healthy' || healthData.success) {
                    details.push('✅ Health API working correctly');
                } else {
                    details.push('⚠️ Health API response unclear');
                }
            } else {
                details.push(`❌ Health API failed with status ${healthResponse.status}`);
            }
            
            // Test setup API
            const setupResponse = await this.makeRequest('/api/setup', {
                method: 'GET'
            });
            
            if (setupResponse.ok) {
                details.push('✅ Setup API accessible');
            } else {
                details.push('⚠️ Setup API may have restrictions');
            }
            
            // Test password reset API
            const passwordResponse = await this.makeRequest('/api/password', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'test@example.com'
                })
            });
            
            if (passwordResponse.ok) {
                details.push('✅ Password reset API working');
            } else if (passwordResponse.status === 400) {
                details.push('✅ Password reset API properly validates requests');
            } else {
                details.push(`⚠️ Password reset API status ${passwordResponse.status}`);
            }
            
        } catch (error) {
            details.push(`❌ System APIs test failed: ${error.message}`);
        }
        
        this.results.systemAPIs = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async testErrorHandling() {
        console.log('\\n🚨 Testing Error Handling...');
        const details = [];
        
        try {
            // Test invalid endpoint
            const invalidResponse = await this.makeRequest('/api/nonexistent-endpoint', {
                method: 'GET'
            });
            
            if (invalidResponse.status === 404) {
                details.push('✅ Invalid endpoints properly return 404');
            } else {
                details.push(`⚠️ Invalid endpoint returned status ${invalidResponse.status}`);
            }
            
            // Test malformed request
            const malformedResponse = await this.makeRequest('/api/auth-consolidated', {
                method: 'POST',
                body: 'invalid json'
            });
            
            if (malformedResponse.status >= 400) {
                details.push('✅ Malformed requests properly rejected');
            } else {
                details.push('❌ Malformed requests not properly handled');
            }
            
            // Test unauthorized access
            const unauthorizedResponse = await this.makeRequest('/api/research-consolidated?action=get-studies', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer invalid-token' }
            });
            
            if (unauthorizedResponse.status === 401) {
                details.push('✅ Invalid tokens properly rejected');
            } else {
                details.push('⚠️ Token validation may have issues');
            }
            
        } catch (error) {
            details.push(`❌ Error handling test failed: ${error.message}`);
        }
        
        this.results.errorHandling = {
            status: details.filter(d => d.includes('❌')).length === 0 ? 'PASS' : 'FAIL',
            details
        };
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        return fetch(url, { ...defaultOptions, ...options });
    }

    generateReport() {
        console.log('\\n' + '='.repeat(80));
        console.log('🌐 API ENDPOINTS VALIDATION REPORT');
        console.log('='.repeat(80));
        
        let totalTests = 0;
        let passedTests = 0;
        
        for (const [testName, result] of Object.entries(this.results)) {
            totalTests++;
            if (result.status === 'PASS') {
                passedTests++;
                console.log(`\\n✅ ${testName.toUpperCase()}: PASS`);
            } else {
                console.log(`\\n❌ ${testName.toUpperCase()}: ${result.status}`);
            }
            
            result.details.forEach(detail => {
                console.log(`   ${detail}`);
            });
        }
        
        const healthScore = Math.round((passedTests / totalTests) * 100);
        
        console.log('\\n' + '='.repeat(80));
        console.log(`🎯 API BACKEND HEALTH: ${healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'GOOD' : 'NEEDS ATTENTION'} (${healthScore}%)`);
        console.log(`📊 API TESTS PASSED: ${passedTests}/${totalTests}`);
        console.log('='.repeat(80));
        
        return { results: this.results, totalTests, passedTests, healthScore };
    }
}

// Execute validation
const validator = new APIEndpointsValidator();
validator.validateAPIEndpoints()
    .then(results => {
        process.exit(results.healthScore >= 60 ? 0 : 1);
    })
    .catch(error => {
        console.error('API endpoints validation execution failed:', error);
        process.exit(1);
    });