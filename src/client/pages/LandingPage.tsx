import { Link } from 'react-router-dom';
import { 
  PlayCircle, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const EnhancedLandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-soft border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link to="/" className="flex items-center group">
                <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all duration-200">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  ResearchHub
                </span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200">
                Features
              </a>
              <a href="#pricing" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200">
                Pricing
              </a>
              <a href="#about" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200">
                About
              </a>
            </nav>
            
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
              <Link
                to="/login"
                className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                Sign in
              </Link>
              <Button>
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="animate-fade-in">
                <div className="flex items-center mb-6">
                  <div className="flex items-center bg-gradient-to-r from-primary-100 to-accent-100 rounded-full px-4 py-2">
                    <Sparkles className="h-4 w-4 text-primary-600 mr-2" />
                    <span className="text-sm font-medium text-primary-700">AI-Powered Research Platform</span>
                  </div>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="text-gray-900">User research made</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    simple & powerful
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Conduct user testing, gather feedback, and analyze behavior with our comprehensive research platform. 
                  Screen recording, heatmaps, and analytics powered by AI.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Start Free Trial
                  </Button>
                  <Button variant="secondary" size="lg" leftIcon={<PlayCircle className="h-5 w-5" />}>
                    Watch Demo
                  </Button>
                </div>
                
                <div className="flex items-center space-x-8 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    No credit card required
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    14-day free trial
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="relative animate-slide-up">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-3xl blur-3xl opacity-20 transform rotate-6"></div>
                <Card variant="glass" className="relative p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Live Dashboard</h3>
                      <div className="flex items-center text-green-600">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse-soft"></div>
                        Live
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                        <div className="flex items-center">
                          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm text-green-700">Completion Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-green-800 mt-1">94%</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-primary-50 p-4 rounded-xl">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-primary-600 mr-2" />
                          <span className="text-sm text-primary-700">Active Users</span>
                        </div>
                        <p className="text-2xl font-bold text-primary-800 mt-1">2,847</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Study Progress</span>
                        <span className="text-sm font-medium text-gray-900">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-1000" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary-100 rounded-full px-4 py-2 mb-6">
              <Star className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">Powerful Features</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for <span className="gradient-text">user research</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools to conduct, manage, and analyze user research studies with AI-powered insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: PlayCircle,
                title: "HD Screen Recording",
                description: "Capture crystal-clear user interactions with advanced screen recording technology. No downloads required.",
                gradient: "from-red-500 to-pink-500"
              },
              {
                icon: BarChart3,
                title: "AI-Powered Analytics",
                description: "Get actionable insights with heatmaps, conversion funnels, and behavioral analysis powered by machine learning.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Users,
                title: "Smart Participant Management",
                description: "Recruit, screen, and manage participants with built-in tools, automated compensation, and CRM integration.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-grade security with SOC 2 compliance, GDPR ready, and end-to-end encryption for all data.",
                gradient: "from-purple-500 to-indigo-500"
              },
              {
                icon: Zap,
                title: "Real-time Collaboration",
                description: "Work together with your team in real-time. Share insights, tag moments, and collaborate on analysis.",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: Award,
                title: "Advanced Integrations",
                description: "Connect with 50+ tools including Slack, Figma, Notion, and your favorite design and project management tools.",
                gradient: "from-teal-500 to-green-500"
              }
            ].map((feature, index) => (
              <Card 
                key={feature.title} 
                variant="interactive"
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your user research?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of researchers who trust ResearchHub for their user testing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="bg-white text-primary-700 hover:bg-gray-50">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <PlayCircle className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedLandingPage;
