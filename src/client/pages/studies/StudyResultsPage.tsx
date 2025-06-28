import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  BarChart3, 
  Download,
  Search
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { IStudy } from '../../../shared/types';

interface ParticipantResponse {
  participantId: string;
  participantNumber: number;
  responses: Array<{
    blockId: string;
    blockType: string;
    blockTitle: string;
    answer: string | number | boolean | object;
    timestamp: string;
  }>;
  completedAt: string;
  duration: number;
}

interface BlockResult {
  blockId: string;
  blockType: string;
  blockTitle: string;
  responses: Array<{
    participantId: string;
    participantNumber: number;
    answer: string | number | boolean | object;
    timestamp: string;
  }>;
  summary: {
    totalResponses: number;
    averageTime?: number;
    commonAnswers?: Array<{ answer: string; count: number }>;
  };
}

const StudyResultsPage: React.FC = () => {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const { studies, fetchStudies } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'results' | 'participants'>('results');
  const [study, setStudy] = useState<IStudy | null>(null);
  const [participants, setParticipants] = useState<ParticipantResponse[]>([]);
  const [blockResults, setBlockResults] = useState<BlockResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (studies.length === 0) {
      fetchStudies();
    }
  }, [studies, fetchStudies]);

  useEffect(() => {
    if (studyId && studies.length > 0) {
      const foundStudy = studies.find(s => s._id === studyId);
      if (foundStudy) {
        setStudy(foundStudy);
        loadStudyResults(studyId);
      }
    }
  }, [studyId, studies]);

  const loadStudyResults = async (_studyId: string) => {
    try {
      setLoading(true);
      
      // Mock data for now - in real implementation, fetch from API
      const mockParticipants: ParticipantResponse[] = [
        {
          participantId: 'p001',
          participantNumber: 1,
          responses: [
            {
              blockId: 'b1',
              blockType: 'welcome',
              blockTitle: 'Welcome Screen',
              answer: 'started',
              timestamp: '2025-06-26T10:00:00Z'
            },
            {
              blockId: 'b2',
              blockType: 'open_question',
              blockTitle: 'What do you think about this design?',
              answer: 'I really like the clean interface and easy navigation',
              timestamp: '2025-06-26T10:02:00Z'
            },
            {
              blockId: 'b3',
              blockType: 'opinion_scale',
              blockTitle: 'Rate the overall experience',
              answer: 4,
              timestamp: '2025-06-26T10:05:00Z'
            }
          ],
          completedAt: '2025-06-26T10:15:00Z',
          duration: 900 // 15 minutes
        },
        {
          participantId: 'p002',
          participantNumber: 2,
          responses: [
            {
              blockId: 'b1',
              blockType: 'welcome',
              blockTitle: 'Welcome Screen',
              answer: 'started',
              timestamp: '2025-06-26T11:00:00Z'
            },
            {
              blockId: 'b2',
              blockType: 'open_question',
              blockTitle: 'What do you think about this design?',
              answer: 'The design is good but could use more color',
              timestamp: '2025-06-26T11:03:00Z'
            },
            {
              blockId: 'b3',
              blockType: 'opinion_scale',
              blockTitle: 'Rate the overall experience',
              answer: 3,
              timestamp: '2025-06-26T11:06:00Z'
            }
          ],
          completedAt: '2025-06-26T11:18:00Z',
          duration: 1080 // 18 minutes
        }
      ];

      // Process block results
      const blocks = new Map<string, BlockResult>();
      
      mockParticipants.forEach(participant => {
        participant.responses.forEach(response => {
          if (!blocks.has(response.blockId)) {
            blocks.set(response.blockId, {
              blockId: response.blockId,
              blockType: response.blockType,
              blockTitle: response.blockTitle,
              responses: [],
              summary: { totalResponses: 0 }
            });
          }
          
          const block = blocks.get(response.blockId)!;
          block.responses.push({
            participantId: participant.participantId,
            participantNumber: participant.participantNumber,
            answer: response.answer,
            timestamp: response.timestamp
          });
          block.summary.totalResponses++;
        });
      });

      setParticipants(mockParticipants);
      setBlockResults(Array.from(blocks.values()));
    } catch (error) {
      console.error('Failed to load study results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getBlockTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      welcome: '👋',
      open_question: '💬',
      opinion_scale: '⭐',
      multiple_choice: '☑️',
      simple_input: '📝',
      context_screen: 'ℹ️',
      yes_no: '❓',
      five_second_test: '⏱️',
      card_sort: '🃏',
      tree_test: '🌳',
      thank_you: '🙏',
      image_upload: '📸',
      file_upload: '📎'
    };
    return icons[type] || '📊';
  };

  const filteredParticipants = participants.filter(participant =>
    participant.participantNumber.toString().includes(searchTerm) ||
    participant.participantId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Study not found</h3>
          <button
            onClick={() => navigate('/app/studies')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Back to studies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/app/studies')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{study.title} - Results</h1>
            <p className="text-gray-600 mt-1">
              {participants.length} participant{participants.length !== 1 ? 's' : ''} • 
              {blockResults.length} block{blockResults.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('results')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'results'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Results Menu
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'participants'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Participants
          </button>
        </nav>
      </div>

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {blockResults.map((block) => (
            <div key={block.blockId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getBlockTypeIcon(block.blockType)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{block.blockTitle}</h3>
                    <p className="text-sm text-gray-600 capitalize">{block.blockType.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {block.summary.totalResponses} response{block.summary.totalResponses !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="space-y-3">
                {block.responses.map((response, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium mr-3">
                        #{response.participantNumber}
                      </span>
                      <div>
                        <p className="text-gray-900">{JSON.stringify(response.answer)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(response.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Participants List */}
          <div className="space-y-4">
            {filteredParticipants.map((participant) => (
              <div key={participant.participantId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full text-lg font-bold mr-4">
                      #{participant.participantNumber}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Participant {participant.participantNumber}</h3>
                      <p className="text-sm text-gray-600">
                        Completed {new Date(participant.completedAt).toLocaleString()} • 
                        Duration: {formatDuration(participant.duration)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {participant.responses.map((response, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg">{getBlockTypeIcon(response.blockType)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{response.blockTitle}</h4>
                        <p className="text-gray-700 mt-1">{JSON.stringify(response.answer)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(response.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyResultsPage;
