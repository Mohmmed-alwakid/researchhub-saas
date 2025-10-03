import React, { useState } from 'react';
import { HelpCenter } from '../../components/help/HelpCenter';
import { VideoTutorialLibrary } from '../../components/tutorials/VideoTutorialLibrary';
import { FAQSection } from '../../components/help/FAQSection';
import { BookOpen, Video, HelpCircle, GraduationCap } from 'lucide-react';

type ActiveTab = 'tutorials' | 'help' | 'faq';

export const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tutorials');
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Learning Center
              </h1>
              <p className="text-gray-600 mt-1">
                Everything you need to master ResearchHub
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">15+</div>
                  <div className="text-sm text-blue-700">Video Tutorials</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">50+</div>
                  <div className="text-sm text-purple-700">Help Articles</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">25+</div>
                  <div className="text-sm text-green-700">FAQ Answers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('tutorials')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                activeTab === 'tutorials'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Video className="h-5 w-5" />
              Video Tutorials
              {activeTab === 'tutorials' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setIsHelpCenterOpen(true)}
              className="flex items-center gap-2 px-6 py-4 font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              Help Articles
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                activeTab === 'faq'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
              {activeTab === 'faq' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tutorials' && <VideoTutorialLibrary />}
        {activeTab === 'faq' && <FAQSection />}
      </div>

      {/* Help Center Modal */}
      <HelpCenter
        isOpen={isHelpCenterOpen}
        onClose={() => setIsHelpCenterOpen(false)}
      />

      {/* Floating Help Button */}
      <button
        onClick={() => setIsHelpCenterOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-40"
        aria-label="Open Help Center"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

export default DocumentationPage;
