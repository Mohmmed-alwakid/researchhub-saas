import React from 'react';
import { 
  Shield, 
  Users, 
  Target, 
  Heart,
  Award,
  Building,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  TrendingUp,
  MessageCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PublicHeader } from '../components/common/PublicHeader';

const AboutPage: React.FC = () => {
  const stats = [
    { label: 'Active Researchers', value: '50,000+', icon: Users },
    { label: 'Studies Completed', value: '125,000+', icon: Target },
    { label: 'Countries Supported', value: '50+', icon: Globe },
    { label: 'Customer Satisfaction', value: '98%', icon: Heart }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'We believe user privacy is fundamental. All data is encrypted, GDPR compliant, and you maintain full control.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Human-Centered',
      description: 'Our platform puts real users at the center of every research study, creating meaningful insights.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Innovation Driven',
      description: 'We continuously evolve our platform with cutting-edge AI and machine learning technologies.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'Every feature is built with attention to detail and rigorous testing to ensure reliability.',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former UX Research Director at Google. PhD in Human-Computer Interaction from Stanford.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Ex-Netflix Senior Engineer. Expert in distributed systems and real-time data processing.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Head of Research',
      bio: 'Leading researcher in behavioral psychology with 15+ years in academic and industry research.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'David Kim',
      role: 'VP of Product',
      bio: 'Product leader from Spotify with expertise in user experience and product strategy.',
      image: '/api/placeholder/150/150'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Standard Header */}
      <PublicHeader currentPage="about" />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 opacity-50"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center bg-gradient-to-r from-primary-100 to-accent-100 rounded-full px-6 py-3 mb-8">
            <Sparkles className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-700">About ResearchHub</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">Empowering researchers to create</span>
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              better user experiences
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're on a mission to democratize user research, making it accessible, 
            efficient, and insightful for teams of all sizes.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-xl text-gray-600">
              Born from the frustration of complex research tools and disconnected insights
            </p>
          </div>

          <div className="prose prose-lg mx-auto text-gray-700">
            <p>
              ResearchHub was founded in 2021 by a team of researchers and engineers who experienced 
              firsthand the challenges of conducting meaningful user research. Traditional tools were 
              either too complex, too expensive, or didn't provide the depth of insights needed to 
              make informed product decisions.
            </p>
            
            <p>
              We started with a simple belief: user research should be accessible to everyone, 
              not just large enterprises with dedicated research teams. By combining intuitive 
              design with powerful analytics and AI-driven insights, we've created a platform 
              that democratizes user research.
            </p>
            
            <p>
              Today, ResearchHub serves thousands of researchers, designers, and product managers 
              across 50+ countries, helping them understand their users better and build products 
              that truly meet people's needs.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-gradient-to-r ${value.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate researchers, engineers, and designers working to transform user research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-primary-600 mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Building className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            To democratize user research by providing powerful, accessible tools that help 
            teams understand their users deeply and create products that truly matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white text-primary-700 hover:bg-gray-50"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start Your Research
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10"
              leftIcon={<MessageCircle className="h-5 w-5" />}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Join the Research Revolution
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Be part of a community that's changing how the world approaches user research.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700">Free to start</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700">No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700">24/7 support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
