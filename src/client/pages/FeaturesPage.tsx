import React, { useState } from 'react';
import { 
  PlayCircle, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp,
  Award,
  Activity,
  PieChart,
  Monitor,
  Video,
  MessageCircle,
  Brain,
  Globe,
  Lock,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PublicHeader } from '../components/common/PublicHeader';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  benefits: string[];
  category: 'core' | 'analytics' | 'collaboration' | 'security';
}

const FeaturesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('core');

  const categories = [
    { id: 'core', name: 'Core Features', icon: Monitor },
    { id: 'analytics', name: 'Analytics & AI', icon: Brain },
    { id: 'collaboration', name: 'Collaboration', icon: Users },
    { id: 'security', name: 'Security & Privacy', icon: Shield }
  ];

  const features: Feature[] = [
    // Core Features
    {
      id: 'screen-recording',
      title: 'HD Screen Recording',
      description: 'Capture crystal-clear user interactions with advanced screen recording technology. No downloads required for participants.',
      icon: PlayCircle,
      gradient: 'from-red-500 to-pink-500',
      category: 'core',
      benefits: [
        'High-definition 1080p recording',
        'No software installation required',
        'Cross-platform compatibility',
        'Automatic video compression',
        'Real-time streaming capabilities'
      ]
    },
    {
      id: 'video-sessions',
      title: 'Video Interviews',
      description: 'Conduct face-to-face interviews with participants using our built-in video conferencing system.',
      icon: Video,
      gradient: 'from-blue-500 to-cyan-500',
      category: 'core',
      benefits: [
        'Built-in video conferencing',
        'Session recording & playback',
        'Screen sharing capabilities',
        'Multi-participant support',
        'Mobile-friendly interface'
      ]
    },
    {
      id: 'mobile-testing',
      title: 'Mobile Testing',
      description: 'Test mobile apps and responsive websites across different devices and screen sizes.',
      icon: Smartphone,
      gradient: 'from-green-500 to-emerald-500',
      category: 'core',
      benefits: [
        'iOS and Android support',
        'Device simulation',
        'Touch gesture recording',
        'Responsive design testing',
        'App store integration'
      ]
    },
    {
      id: 'live-observation',
      title: 'Live Observation',
      description: 'Watch user sessions in real-time and collaborate with your team during live studies.',
      icon: Activity,
      gradient: 'from-purple-500 to-indigo-500',
      category: 'core',
      benefits: [
        'Real-time session viewing',
        'Live note-taking',
        'Team collaboration tools',
        'Instant insights capture',
        'Session bookmarking'
      ]
    },

    // Analytics & AI
    {
      id: 'ai-insights',
      title: 'AI-Powered Insights',
      description: 'Get actionable insights with machine learning analysis of user behavior patterns and sentiment.',
      icon: Brain,
      gradient: 'from-orange-500 to-red-500',
      category: 'analytics',
      benefits: [
        'Sentiment analysis',
        'Behavior pattern recognition',
        'Automated insight generation',
        'Predictive analytics',
        'Natural language processing'
      ]
    },
    {
      id: 'heatmaps',
      title: 'Click Heatmaps',
      description: 'Visualize where users click, scroll, and interact with your interface using advanced heatmap technology.',
      icon: TrendingUp,
      gradient: 'from-yellow-500 to-orange-500',
      category: 'analytics',
      benefits: [
        'Click density mapping',
        'Scroll depth analysis',
        'Hover tracking',
        'Form interaction analytics',
        'Mobile gesture heatmaps'
      ]
    },
    {
      id: 'analytics-dashboard',
      title: 'Advanced Analytics',
      description: 'Comprehensive analytics dashboard with conversion funnels, user journeys, and performance metrics.',
      icon: PieChart,
      gradient: 'from-teal-500 to-green-500',
      category: 'analytics',
      benefits: [
        'Conversion funnel analysis',
        'User journey mapping',
        'Task completion rates',
        'Time-on-task metrics',
        'Custom report generation'
      ]
    },

    // Collaboration
    {
      id: 'team-collaboration',
      title: 'Real-time Collaboration',
      description: 'Work together with your team in real-time. Share insights, tag moments, and collaborate on analysis.',
      icon: Users,
      gradient: 'from-pink-500 to-purple-500',
      category: 'collaboration',
      benefits: [
        'Real-time co-viewing',
        'Shared note-taking',
        'Comment threading',
        'Team workspace',
        'Role-based permissions'
      ]
    },
    {
      id: 'participant-management',
      title: 'Smart Participant Management',
      description: 'Recruit, screen, and manage participants with built-in tools and automated compensation.',
      icon: Award,
      gradient: 'from-indigo-500 to-blue-500',
      category: 'collaboration',
      benefits: [
        'Participant database',
        'Automated screening',
        'Scheduling system',
        'Payment processing',
        'Communication tools'
      ]
    },

    // Security & Privacy
    {
      id: 'enterprise-security',
      title: 'Enterprise Security',
      description: 'Bank-grade security with SOC 2 compliance, GDPR ready, and end-to-end encryption for all data.',
      icon: Shield,
      gradient: 'from-gray-600 to-gray-800',
      category: 'security',
      benefits: [
        'SOC 2 Type II certified',
        'GDPR & CCPA compliant',
        'End-to-end encryption',
        'Regular security audits',
        'Data residency options'
      ]
    },
    {
      id: 'data-privacy',
      title: 'Privacy Controls',
      description: 'Complete control over participant data with automatic anonymization and consent management.',
      icon: Lock,
      gradient: 'from-red-600 to-pink-600',
      category: 'security',
      benefits: [
        'Automatic data anonymization',
        'Consent management',
        'Data retention controls',
        'Right to be forgotten',
        'Privacy-first design'
      ]
    },
    {
      id: 'global-compliance',
      title: 'Global Compliance',
      description: 'Built to meet international privacy standards and regulations across different regions.',
      icon: Globe,
      gradient: 'from-blue-600 to-cyan-600',
      category: 'security',
      benefits: [
        'Multi-region compliance',
        'Local data storage',
        'Regulatory reporting',
        'Cross-border data transfer',
        'Legal framework support'
      ]
    }
  ];

  const filteredFeatures = features.filter(feature => feature.category === activeCategory);

  const integrations = [
    'Slack', 'Figma', 'Notion', 'Zapier', 'Jira', 'Trello', 
    'Adobe XD', 'Sketch', 'GitHub', 'Confluence', 'Teams', 'Discord'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Standard Header */}
      <PublicHeader currentPage="features" />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 opacity-50"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center bg-gradient-to-r from-primary-100 to-accent-100 rounded-full px-6 py-3 mb-8">
            <Star className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-700">Powerful Features</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">Everything you need for</span>
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              comprehensive user research
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            From recording sessions to AI-powered insights, ResearchHub provides all the tools 
            you need to understand your users and improve your products.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              leftIcon={<PlayCircle className="h-5 w-5" />}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-16 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-6 py-3 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <category.icon className="h-5 w-5 mr-2" />
                {category.name}
              </button>
            ))}
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredFeatures.map((feature, index) => (
              <Card 
                key={feature.id} 
                className="group hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See ResearchHub in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the power of our platform with an interactive demo
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-3xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Interactive Platform Demo
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold text-sm">1</span>
                    </div>
                    <span className="text-gray-700">Set up your first study in under 5 minutes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold text-sm">2</span>
                    </div>
                    <span className="text-gray-700">Invite participants and start recording sessions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold text-sm">3</span>
                    </div>
                    <span className="text-gray-700">Get AI-powered insights and share with your team</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full lg:w-auto"
                  rightIcon={<PlayCircle className="h-5 w-5" />}
                >
                  Try Interactive Demo
                </Button>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <div className="flex-1 bg-gray-100 rounded ml-4 p-2">
                      <div className="text-xs text-gray-500">researchhub.com/demo</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-primary-400 to-accent-400 rounded-lg h-48 flex items-center justify-center">
                    <div className="text-center text-white">
                      <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-medium">Interactive Demo</p>
                      <p className="text-sm opacity-80">Click to explore features</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect ResearchHub with your favorite tools and streamline your workflow
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white font-semibold text-sm">
                      {integration.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{integration}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" leftIcon={<Zap className="h-5 w-5" />}>
              View All Integrations
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Sparkles className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Research?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of researchers who trust ResearchHub for their user insights
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white text-primary-700 hover:bg-gray-50"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10"
              leftIcon={<MessageCircle className="h-5 w-5" />}
            >
              Contact Sales
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8 text-primary-100">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
