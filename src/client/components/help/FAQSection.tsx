import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: 'what-is-researchhub',
    question: 'What is ResearchHub?',
    answer: 'ResearchHub is a comprehensive usability testing and user research platform that helps researchers create studies, recruit participants, and analyze results. Our block-based study builder makes it easy to design custom research studies without technical expertise.',
    category: 'Getting Started'
  },
  {
    id: 'who-can-use',
    question: 'Who can use ResearchHub?',
    answer: 'ResearchHub is designed for UX researchers, product managers, designers, and anyone who needs to conduct user research. We also welcome participants who want to contribute to research studies and earn rewards.',
    category: 'Getting Started'
  },
  {
    id: 'how-to-start',
    question: 'How do I get started?',
    answer: 'Simply create an account, choose your role (Researcher or Participant), and follow our guided onboarding tour. Researchers can start creating studies immediately using our templates or build from scratch. Participants can browse available studies and apply to participate.',
    category: 'Getting Started'
  },

  // Study Creation
  {
    id: 'what-are-blocks',
    question: 'What are study blocks?',
    answer: 'Study blocks are the building components of your research study. We offer 13 different block types including Welcome Screens, Open Questions, Opinion Scales, Multiple Choice, Card Sorting, Tree Tests, and more. Each block serves a specific research purpose.',
    category: 'Study Creation'
  },
  {
    id: 'use-templates',
    question: 'Should I use a template or start from scratch?',
    answer: 'Templates are great for common research scenarios like usability testing, user interviews, or feedback collection. They provide a proven structure you can customize. Starting from scratch gives you complete flexibility to design unique studies tailored to your specific needs.',
    category: 'Study Creation'
  },
  {
    id: 'how-many-blocks',
    question: 'How many blocks should my study have?',
    answer: 'There\'s no strict limit, but we recommend 8-15 blocks for most studies. This provides enough depth for meaningful insights while keeping the participant experience manageable. Consider participant time commitment and study objectives when planning your structure.',
    category: 'Study Creation'
  },
  {
    id: 'preview-study',
    question: 'Can I preview my study before launching?',
    answer: 'Yes! Use the Preview button in the Study Builder to see exactly what participants will experience. You can walk through the entire study flow, test all interactions, and make adjustments before launching.',
    category: 'Study Creation'
  },

  // Participants
  {
    id: 'recruit-participants',
    question: 'How do I recruit participants?',
    answer: 'Once you launch your study, it becomes discoverable to participants on our platform. You can also share a direct link to invite specific participants. Set clear eligibility criteria and offer appropriate incentives to attract qualified participants.',
    category: 'Participants'
  },
  {
    id: 'approve-participants',
    question: 'How do I approve participant applications?',
    answer: 'Go to your study\'s Participants tab to review applications. Check each applicant\'s profile and responses to your screening questions. Approve those who meet your criteria and decline others. Approved participants can then access and complete your study.',
    category: 'Participants'
  },
  {
    id: 'participant-incentives',
    question: 'How do participant incentives work?',
    answer: 'You set the incentive amount when creating your study. Participants see this before applying. Once a participant completes your study, you can release payment through our platform. We support various payment methods for your convenience.',
    category: 'Participants'
  },

  // Results & Analytics
  {
    id: 'view-results',
    question: 'When can I see study results?',
    answer: 'Results are available in real-time as participants complete your study. Go to the Results tab to see response summaries, individual submissions, and analytics. You can export data at any time for further analysis.',
    category: 'Results & Analytics'
  },
  {
    id: 'export-data',
    question: 'Can I export my study data?',
    answer: 'Yes! You can export results in multiple formats including CSV, Excel, and JSON. Exported data includes all participant responses, timestamps, and metadata. This makes it easy to perform advanced analysis in your preferred tools.',
    category: 'Results & Analytics'
  },
  {
    id: 'data-privacy',
    question: 'How is participant data protected?',
    answer: 'We take data privacy seriously. All participant data is encrypted, securely stored, and only accessible to authorized researchers. We comply with GDPR, CCPA, and other privacy regulations. Participants can request data deletion at any time.',
    category: 'Results & Analytics'
  },

  // Billing & Plans
  {
    id: 'pricing-plans',
    question: 'What are the pricing plans?',
    answer: 'We offer flexible plans for individuals and teams. The Free plan includes basic features perfect for getting started. Pro and Enterprise plans unlock advanced features like unlimited studies, team collaboration, custom branding, and priority support. Visit our Pricing page for details.',
    category: 'Billing & Plans'
  },
  {
    id: 'change-plan',
    question: 'Can I change my plan later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time from your Account Settings. Changes take effect immediately, and we\'ll prorate any charges. There are no long-term commitments or cancellation fees.',
    category: 'Billing & Plans'
  },

  // Technical
  {
    id: 'browser-support',
    question: 'Which browsers are supported?',
    answer: 'ResearchHub works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of your preferred browser. Mobile browsers are also fully supported.',
    category: 'Technical'
  },
  {
    id: 'mobile-studies',
    question: 'Can participants complete studies on mobile devices?',
    answer: 'Absolutely! All studies are fully responsive and work seamlessly on smartphones and tablets. This is especially useful for testing mobile apps or gathering feedback from mobile users.',
    category: 'Technical'
  }
];

const categories = ['All', 'Getting Started', 'Study Creation', 'Participants', 'Results & Analytics', 'Billing & Plans', 'Technical'];

export const FAQSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600">
          Find quick answers to common questions about ResearchHub
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFAQs.map(faq => (
          <div
            key={faq.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 pr-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {faq.question}
                </h3>
                <span className="text-xs text-gray-500">{faq.category}</span>
              </div>
              {expandedItems.has(faq.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {expandedItems.has(faq.id) && (
              <div className="px-6 pb-4 border-t border-gray-100">
                <p className="text-gray-700 leading-relaxed pt-4">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFAQs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No FAQs found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or browse different categories
          </p>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-8 text-center p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-2">
          Still have questions?
        </h3>
        <p className="text-gray-600 mb-4">
          Our support team is here to help you succeed
        </p>
        <a
          href="mailto:support@researchhub.com"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};
