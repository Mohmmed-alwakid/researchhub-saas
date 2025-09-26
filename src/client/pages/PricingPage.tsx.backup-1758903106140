import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  Crown, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Headphones,
  Database,
  BarChart3,
  Globe,
  MessageCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { PricingCTA } from '../components/pricing/PricingCTA';
import { PublicHeader } from '../components/common/PublicHeader';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  interval: 'month' | 'year';
  description: string;
  badge?: string;
  badgeColor?: string;
  features: string[];
  limitations?: string[];
  cta: string;
  ctaVariant: 'primary' | 'secondary' | 'outline';
  popular?: boolean;
  recommended?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
}

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      description: 'Perfect for getting started with user research',
      features: [
        'Up to 2 studies per month',
        'Maximum 10 participants per study',
        'Basic analytics dashboard',
        'Email support',
        'Standard templates',
        'Basic collaboration',
        'Community access'
      ],
      limitations: [
        'Limited to 2 studies',
        'No advanced analytics',
        'No custom branding',
        'No API access'
      ],
      cta: 'Get Started Free',
      ctaVariant: 'outline',
      icon: Zap,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: billingCycle === 'monthly' ? 29 : 290,
      originalPrice: billingCycle === 'yearly' ? 348 : undefined,
      interval: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'Ideal for small teams and regular research',
      badge: 'Most Popular',
      badgeColor: 'bg-green-500',
      features: [
        'Up to 25 studies per month',
        'Maximum 100 participants per study',
        'Advanced analytics & insights',
        'Screen recording capabilities',
        'Priority email support',
        'Custom templates',
        'Team collaboration',
        'Export capabilities',
        'Basic integrations'
      ],
      cta: 'Start 14-Day Free Trial',
      ctaVariant: 'primary',
      popular: true,
      icon: Users,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? 79 : 790,
      originalPrice: billingCycle === 'yearly' ? 948 : undefined,
      interval: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'For growing teams with advanced needs',
      badge: 'Best Value',
      badgeColor: 'bg-purple-500',
      features: [
        'Unlimited studies',
        'Unlimited participants',
        'Advanced analytics suite',
        'Video recording & playback',
        'Live chat support',
        'Custom branding',
        'Advanced integrations',
        'API access',
        'White-label options',
        'Advanced collaboration',
        'Priority support'
      ],
      cta: 'Start 14-Day Free Trial',
      ctaVariant: 'secondary',
      recommended: true,
      icon: TrendingUp,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 199 : 1990,
      originalPrice: billingCycle === 'yearly' ? 2388 : undefined,
      interval: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'For large organizations with custom requirements',
      badge: 'Custom Solutions',
      badgeColor: 'bg-amber-500',
      features: [
        'Everything in Pro',
        'Custom deployment options',
        'Dedicated account manager',
        'SSO integration',
        'Advanced security features',
        'Custom integrations',
        'SLA guarantee',
        'Phone support',
        'Training & onboarding',
        'Custom reporting',
        'Volume discounts'
      ],
      cta: 'Contact Sales',
      ctaVariant: 'outline',
      icon: Crown,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500'
    }
  ];

  const comparisonFeatures = [
    {
      category: 'Core Features',
      features: [
        {
          name: 'Studies per month',
          free: '2',
          basic: '25',
          pro: 'Unlimited',
          enterprise: 'Unlimited'
        },
        {
          name: 'Participants per study',
          free: '10',
          basic: '100',
          pro: 'Unlimited',
          enterprise: 'Unlimited'
        },
        {
          name: 'Screen recording',
          free: false,
          basic: true,
          pro: true,
          enterprise: true
        },
        {
          name: 'Video recording',
          free: false,
          basic: false,
          pro: true,
          enterprise: true
        },
        {
          name: 'Custom branding',
          free: false,
          basic: false,
          pro: true,
          enterprise: true
        }
      ]
    },
    {
      category: 'Analytics & Reporting',
      features: [
        {
          name: 'Basic analytics',
          free: true,
          basic: true,
          pro: true,
          enterprise: true
        },
        {
          name: 'Advanced insights',
          free: false,
          basic: true,
          pro: true,
          enterprise: true
        },
        {
          name: 'Custom reports',
          free: false,
          basic: false,
          pro: true,
          enterprise: true
        },
        {
          name: 'Data export',
          free: false,
          basic: true,
          pro: true,
          enterprise: true
        }
      ]
    },
    {
      category: 'Support & Integration',
      features: [
        {
          name: 'Email support',
          free: true,
          basic: true,
          pro: true,
          enterprise: true
        },
        {
          name: 'Priority support',
          free: false,
          basic: true,
          pro: true,
          enterprise: true
        },
        {
          name: 'Phone support',
          free: false,
          basic: false,
          pro: false,
          enterprise: true
        },
        {
          name: 'API access',
          free: false,
          basic: false,
          pro: true,
          enterprise: true
        },
        {
          name: 'SSO integration',
          free: false,
          basic: false,
          pro: false,
          enterprise: true
        }
      ]
    }
  ];

  const faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 14-day free trial for all paid plans. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise customers.'
    },
    {
      question: 'Do you offer discounts for annual plans?',
      answer: 'Yes, annual plans receive a 17% discount compared to monthly billing.'
    },
    {
      question: 'What happens if I exceed my plan limits?',
      answer: 'You\'ll receive notifications when approaching limits. You can upgrade your plan or contact support for assistance.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use enterprise-grade security with SOC 2 compliance, end-to-end encryption, and regular security audits.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Standard Header */}
      <PublicHeader currentPage="pricing" />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 opacity-50"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center bg-gradient-to-r from-primary-100 to-accent-100 rounded-full px-6 py-3 mb-8">
            <Sparkles className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-700">Simple, Transparent Pricing</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">Choose the perfect plan for</span>
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              your research needs
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start free, scale as you grow. All plans include our core features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
              </button>
            </div>
            {billingCycle === 'yearly' && (
              <div className="ml-4 flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-1" />
                Save 17%
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <Card 
                key={tier.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  tier.popular ? 'ring-2 ring-primary-500 shadow-lg scale-105' : ''
                } ${
                  tier.recommended ? 'ring-2 ring-purple-500 shadow-lg' : ''
                }`}
              >
                {tier.badge && (
                  <div className={`absolute top-0 right-0 ${tier.badgeColor} text-white px-3 py-1 text-xs font-medium`}>
                    {tier.badge}
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${tier.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <tier.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        ${tier.price}
                      </span>
                      <span className="text-gray-500 ml-2">
                        /{tier.interval}
                      </span>
                    </div>
                    {tier.originalPrice && (
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-sm text-gray-400 line-through">
                          ${tier.originalPrice}/{tier.interval}
                        </span>
                        <span className="text-sm text-green-600 ml-2 font-medium">
                          Save ${tier.originalPrice - tier.price}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <PricingCTA 
                    planId={tier.id}
                    ctaText={tier.cta}
                    variant={tier.ctaVariant}
                    isEnterprise={tier.id === 'enterprise'}
                  />
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {tier.limitations && tier.limitations.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                      <ul className="space-y-1">
                        {tier.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <X className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compare all features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get a detailed breakdown of what's included in each plan
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 overflow-x-auto">
            <div className="min-w-full">
              {comparisonFeatures.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    {category.category === 'Core Features' && <Database className="h-5 w-5 mr-2" />}
                    {category.category === 'Analytics & Reporting' && <BarChart3 className="h-5 w-5 mr-2" />}
                    {category.category === 'Support & Integration' && <Headphones className="h-5 w-5 mr-2" />}
                    {category.category}
                  </h3>
                  
                  <div className="grid grid-cols-5 gap-4">
                    <div className="font-medium text-gray-700">Feature</div>
                    <div className="font-medium text-center text-gray-700">Free</div>
                    <div className="font-medium text-center text-gray-700">Basic</div>
                    <div className="font-medium text-center text-gray-700">Pro</div>
                    <div className="font-medium text-center text-gray-700">Enterprise</div>
                  </div>
                  
                  {category.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="grid grid-cols-5 gap-4 py-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">{feature.name}</div>
                      <div className="text-center">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-gray-700">{feature.free}</span>
                        )}
                      </div>
                      <div className="text-center">
                        {typeof feature.basic === 'boolean' ? (
                          feature.basic ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-gray-700">{feature.basic}</span>
                        )}
                      </div>
                      <div className="text-center">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-gray-700">{feature.pro}</span>
                        )}
                      </div>
                      <div className="text-center">
                        {typeof feature.enterprise === 'boolean' ? (
                          feature.enterprise ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-gray-700">{feature.enterprise}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by thousands of researchers
            </h2>
            <p className="text-xl text-gray-600">
              Join companies who trust ResearchHub for their user research needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-green-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Enterprise Security</h3>
              </div>
              <p className="text-gray-600">
                SOC 2 Type II certified with enterprise-grade security, GDPR compliance, and data encryption.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <Globe className="h-8 w-8 text-blue-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Global Scale</h3>
              </div>
              <p className="text-gray-600">
                99.9% uptime SLA with global CDN, supporting research teams across 50+ countries.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-8 w-8 text-purple-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">24/7 Support</h3>
              </div>
              <p className="text-gray-600">
                Expert support team available around the clock to help you succeed with your research.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We have answers.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Still have questions? We're here to help.
            </p>
            <Button variant="outline" leftIcon={<MessageCircle className="h-5 w-5" />}>
              Contact Support
            </Button>
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
            Start your free trial today. No credit card required.
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
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
