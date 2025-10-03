import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  type: 'article' | 'video' | 'guide';
  url?: string;
}

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpArticles: HelpArticle[] = [
  // Researcher Articles
  {
    id: 'create-study',
    title: 'Creating Your First Study',
    category: 'Getting Started',
    type: 'guide',
    content: 'Learn how to create a comprehensive research study using our Study Builder. This guide covers selecting templates, adding blocks, and launching your study.'
  },
  {
    id: 'study-blocks',
    title: 'Understanding Study Blocks',
    category: 'Study Builder',
    type: 'article',
    content: 'Study blocks are the building blocks of your research. Learn about all 13 block types including Welcome Screens, Open Questions, Opinion Scales, and more.'
  },
  {
    id: 'manage-participants',
    title: 'Managing Study Participants',
    category: 'Participants',
    type: 'guide',
    content: 'Review applications, approve participants, and track study completion. Learn best practices for participant management and communication.'
  },
  {
    id: 'analyze-results',
    title: 'Analyzing Study Results',
    category: 'Analytics',
    type: 'article',
    content: 'Understand how to interpret study results, export data, and generate insights from participant responses.'
  },
  {
    id: 'templates-guide',
    title: 'Using Study Templates',
    category: 'Templates',
    type: 'guide',
    content: 'Browse and use pre-configured study templates for common research scenarios like usability testing, user interviews, and feedback collection.'
  },
  
  // Participant Articles
  {
    id: 'discover-studies',
    title: 'Finding Studies to Join',
    category: 'For Participants',
    type: 'guide',
    content: 'Discover available research studies, filter by your interests, and learn how to apply to participate in studies.'
  },
  {
    id: 'complete-study',
    title: 'Completing a Study Session',
    category: 'For Participants',
    type: 'article',
    content: 'Step-by-step guide on how to complete study sessions, answer questions, and provide valuable feedback to researchers.'
  },
  {
    id: 'participant-dashboard',
    title: 'Your Participant Dashboard',
    category: 'For Participants',
    type: 'guide',
    content: 'Navigate your participant dashboard, track your applications, view completed studies, and manage your profile.'
  },
  
  // Technical Articles
  {
    id: 'account-settings',
    title: 'Managing Your Account',
    category: 'Account',
    type: 'article',
    content: 'Update your profile information, change password, configure notification preferences, and manage your account settings.'
  },
  {
    id: 'billing-subscription',
    title: 'Billing & Subscriptions',
    category: 'Billing',
    type: 'guide',
    content: 'Understand subscription plans, payment methods, and how to manage your billing information.'
  }
];

const categories = [
  'All Categories',
  'Getting Started',
  'Study Builder',
  'Participants',
  'Analytics',
  'Templates',
  'For Participants',
  'Account',
  'Billing'
];

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Help Center</h2>
              <p className="text-sm text-gray-600">Find answers and learn how to use ResearchHub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, guides, and tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedArticle(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedArticle ? (
              <div className="p-6">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Back to articles
                </button>
                
                <div className="flex items-center gap-2 mb-3">
                  {selectedArticle.type === 'video' && <Video className="h-5 w-5 text-gray-400" />}
                  {selectedArticle.type === 'guide' && <BookOpen className="h-5 w-5 text-gray-400" />}
                  {selectedArticle.type === 'article' && <FileText className="h-5 w-5 text-gray-400" />}
                  <span className="text-sm text-gray-600">{selectedArticle.category}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedArticle.title}
                </h3>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedArticle.content}
                  </p>
                </div>

                {selectedArticle.url && (
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Full Article
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedCategory}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div className="space-y-3">
                  {filteredArticles.map(article => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {article.type === 'video' && <Video className="h-4 w-4 text-gray-400" />}
                            {article.type === 'guide' && <BookOpen className="h-4 w-4 text-gray-400" />}
                            {article.type === 'article' && <FileText className="h-4 w-4 text-gray-400" />}
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                              {article.title}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {article.content}
                          </p>
                          <span className="text-xs text-gray-500 mt-1 inline-block">
                            {article.category}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No articles found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search or browse different categories
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Can't find what you're looking for?{' '}
            <a href="mailto:support@researchhub.com" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
