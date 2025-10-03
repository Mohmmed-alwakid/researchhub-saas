import React, { useState } from 'react';
import { Video, Play, Clock, BookOpen, ChevronRight } from 'lucide-react';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnailUrl: string;
  videoUrl: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const videoTutorials: VideoTutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with ResearchHub',
    description: 'Learn the basics of ResearchHub and how to navigate the platform as a researcher.',
    duration: '5:30',
    category: 'Getting Started',
    thumbnailUrl: '/tutorials/getting-started-thumb.jpg',
    videoUrl: 'https://youtube.com/watch?v=example1',
    difficulty: 'Beginner'
  },
  {
    id: 'create-first-study',
    title: 'Creating Your First Study',
    description: 'Step-by-step tutorial on creating a comprehensive research study from scratch.',
    duration: '8:45',
    category: 'Study Builder',
    thumbnailUrl: '/tutorials/create-study-thumb.jpg',
    videoUrl: 'https://youtube.com/watch?v=example2',
    difficulty: 'Beginner'
  },
  {
    id: 'study-blocks-guide',
    title: 'Complete Guide to Study Blocks',
    description: 'Deep dive into all 13 study block types and when to use each one.',
    duration: '12:20',
    category: 'Study Builder',
    thumbnailUrl: '/tutorials/blocks-guide-thumb.jpg',
    videoUrl: 'https://youtube.com/watch?v=example3',
    difficulty: 'Intermediate'
  },
  {
    id: 'participant-management',
    title: 'Managing Participants Effectively',
    description: 'Best practices for reviewing applications, approving participants, and tracking completion.',
    duration: '7:15',
    category: 'Participants',
    thumbnailUrl: '/tutorials/participants-thumb.jpg',
    videoUrl: 'https://youtube.com/watch?v=example4',
    difficulty: 'Intermediate'
  },
  {
    id: 'analyzing-results',
    title: 'Analyzing Study Results',
    description: 'Learn how to interpret data, export results, and generate actionable insights.',
    duration: '10:30',
    category: 'Analytics',
    thumbnailUrl: '/tutorials/analytics-thumb.jpg',
    videoUrl: 'https://youtube.com/watch?v=example5',
    difficulty: 'Advanced'
  },
  {
    id: 'advanced-templates',
    title: 'Creating Custom Templates',
    description: 'Advanced tutorial on creating and saving your own study templates for reuse.',
    duration: '9:00',
    category: 'Templates',
    thumbnailUrl: '/tutorials/templates-thumb.jpg',
    videoUrl: 'https://youtube.com/watch?v=example6',
    difficulty: 'Advanced'
  }
];

const categories = ['All', 'Getting Started', 'Study Builder', 'Participants', 'Analytics', 'Templates'];
const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export const VideoTutorialLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);

  const filteredTutorials = videoTutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'All' || tutorial.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All Levels' || tutorial.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Video className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Tutorial Library</h1>
            <p className="text-gray-600">Learn at your own pace with our comprehensive video guides</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDifficulty === difficulty
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map(tutorial => (
          <div
            key={tutorial.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => setSelectedVideo(tutorial)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition-all group-hover:scale-110">
                  <Play className="h-8 w-8 text-blue-600 ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                <Clock className="h-3 w-3 inline mr-1" />
                {tutorial.duration}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  tutorial.difficulty === 'Beginner'
                    ? 'bg-green-100 text-green-700'
                    : tutorial.difficulty === 'Intermediate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {tutorial.difficulty}
                </span>
                <span className="text-xs text-gray-500">{tutorial.category}</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {tutorial.title}
              </h3>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {tutorial.description}
              </p>

              <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                Watch Tutorial
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTutorials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No tutorials found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters to see more tutorials
          </p>
        </div>
      )}

      {/* Video Modal - Placeholder */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-gray-900 rounded-t-lg flex items-center justify-center">
              <p className="text-white">Video player would be embedded here</p>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedVideo.title}
              </h2>
              <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
