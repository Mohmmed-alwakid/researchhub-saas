import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, 
  Users, 
  Shield, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  Monitor,
  Activity,
  PieChart
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PublicHeader } from '../components/common/PublicHeader';

const EnhancedLandingPage = () => {
  const [activeDemo, setActiveDemo] = useState('screen-recording');
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    studies: 0,
    satisfaction: 0
  });

  // Animated counter effect
  useEffect(() => {
    const targetStats = { users: 50000, studies: 125000, satisfaction: 98 };
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        users: Math.floor(targetStats.users * progress),
        studies: Math.floor(targetStats.studies * progress),
        satisfaction: Math.floor(targetStats.satisfaction * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
      }
    }, increment);
    
    return () => clearInterval(timer);
  }, []);

  const demoFeatures = [
    {
      id: 'screen-recording',
      title: 'Screen Recording',
      description: 'Watch how users interact with your designs',
      icon: Monitor,
      preview: (
        <div className="bg-gray-900 rounded-lg p-4 h-64">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="ml-4 text-gray-400 text-sm">Recording: 00:32</div>
          </div>
          <div className="bg-white rounded-md h-40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"></div>
            <div className="relative p-4">
              <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded mb-2 w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded mb-4 w-2/3"></div>
              <div className="w-12 h-8 bg-blue-500 rounded animate-pulse"></div>
            </div>
            <div className="absolute bottom-4 right-4">
              <div className="w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'heatmaps',
      title: 'Click Heatmaps',
      description: 'Visualize where users click and interact',
      icon: Activity,
      preview: (
        <div className="bg-white rounded-lg p-4 h-64 relative">
          <div className="text-sm font-medium text-gray-700 mb-4">Click Density Map</div>
          <div className="relative h-48 bg-gray-50 rounded-lg overflow-hidden">
            <div className="absolute top-8 left-8 w-16 h-16 bg-red-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-12 right-12 w-10 h-10 bg-orange-400 rounded-full opacity-40"></div>
            <div className="absolute bottom-16 left-16 w-12 h-12 bg-yellow-400 rounded-full opacity-50"></div>
            <div className="absolute bottom-8 right-8 w-8 h-8 bg-green-400 rounded-full opacity-30"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-red-500 rounded-full opacity-70 animate-pulse"></div>
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Real-time Analytics',
      description: 'Track user behavior and conversion metrics',
      icon: PieChart,
      preview: (
        <div className="bg-white rounded-lg p-4 h-64">
          <div className="text-sm font-medium text-gray-700 mb-4">Live Dashboard</div>
          <div className="grid grid-cols-2 gap-4 h-40">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
              <div className="text-xs text-blue-600 mb-1">Completion Rate</div>
              <div className="text-2xl font-bold text-blue-800">94%</div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full w-11/12"></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
              <div className="text-xs text-green-600 mb-1">Active Users</div>
              <div className="text-2xl font-bold text-green-800">127</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">+12%</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
              <div className="text-xs text-purple-600 mb-1">Avg. Duration</div>
              <div className="text-2xl font-bold text-purple-800">4:32</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
              <div className="text-xs text-orange-600 mb-1">Bounce Rate</div>
              <div className="text-2xl font-bold text-orange-800">12%</div>
            </div>
          </div>
        </div>
      )
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Standard Header */}
      <PublicHeader currentPage="home" />

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
                  <Link to="/register">
                    <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                      Start Free Trial
                    </Button>
                  </Link>
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
                        <p className="text-2xl font-bold text-green-800 mt-1">{animatedStats.satisfaction}%</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-primary-50 p-4 rounded-xl">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-primary-600 mr-2" />
                          <span className="text-sm text-primary-700">Active Users</span>
                        </div>
                        <p className="text-2xl font-bold text-primary-800 mt-1">{animatedStats.users.toLocaleString()}</p>
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

      {/* Interactive Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See our platform in action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover powerful features that make user research effortless and insightful
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo Feature Tabs */}
            <div className="space-y-4">
              {demoFeatures.map((feature) => (
                <Card 
                  key={feature.id}
                  className={`p-6 cursor-pointer transition-all duration-300 ${
                    activeDemo === feature.id 
                      ? 'ring-2 ring-primary-500 shadow-lg bg-white' 
                      : 'hover:shadow-md bg-white/70'
                  }`}
                  onClick={() => setActiveDemo(feature.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                        activeDemo === feature.id 
                          ? 'bg-gradient-to-r from-primary-500 to-accent-500' 
                          : 'bg-gray-100'
                      }`}>
                        <feature.icon className={`h-6 w-6 ${
                          activeDemo === feature.id ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${
                          activeDemo === feature.id ? 'text-primary-700' : 'text-gray-900'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      {activeDemo === feature.id && (
                        <ChevronRight className="h-5 w-5 text-primary-500 ml-2" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Demo Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-3xl blur-3xl opacity-20 transform rotate-3"></div>
              <Card className="relative overflow-hidden">
                <CardContent className="p-0">
                  {demoFeatures.find(f => f.id === activeDemo)?.preview}
                </CardContent>
              </Card>
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
              },              {
                icon: TrendingUp,
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
          </h2>          <p className="text-xl text-primary-100 mb-8">
            Join thousands of researchers who trust Afkar for their user testing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-white text-primary-700 hover:bg-gray-50">
                Start Free Trial
              </Button>
            </Link>
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
