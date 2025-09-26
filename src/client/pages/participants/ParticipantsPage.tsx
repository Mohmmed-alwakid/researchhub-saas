import React, { useEffect, useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Mail, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent } from '../../components/ui/Card';
import { useAppStore } from '../../stores/appStore';

interface InviteData {
  studyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: InviteData) => void;
  studies: Record<string, unknown>[];
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onInvite, studies }) => {
  const [formData, setFormData] = useState({
    studyId: '',
    email: '',
    firstName: '',
    lastName: '',
    demographics: {}
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(formData);
    setFormData({ studyId: '', email: '', firstName: '', lastName: '', demographics: {} });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Participant</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Study *
            </label>
            <select
              value={formData.studyId}
              onChange={(e) => setFormData({ ...formData, studyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a study</option>
              {studies.map((study) => (
                <option key={study._id} value={study._id}>
                  {study.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ParticipantsPage: React.FC = () => {
  const { 
    participants, 
    participantsLoading, 
    studies,
    fetchParticipants, 
    fetchStudies,
    inviteParticipant,
    updateParticipant 
  } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studyFilter, setStudyFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchParticipants();
    fetchStudies();
  }, [fetchParticipants, fetchStudies]);

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;
    const matchesStudy = studyFilter === 'all' || participant.studyId === studyFilter;
    
    return matchesSearch && matchesStatus && matchesStudy;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      invited: 'bg-blue-100 text-blue-800',
      screened: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      disqualified: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'invited':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'screened':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'qualified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case 'disqualified':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const handleInvite = async (data: InviteData) => {
    try {
      await inviteParticipant(data.studyId, data);
    } catch (error) {
      console.error('Failed to invite participant:', error);
    }
  };

  const handleStatusChange = async (participantId: string, newStatus: 'invited' | 'screened' | 'qualified' | 'completed' | 'disqualified') => {
    try {
      await updateParticipant(participantId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update participant status:', error);
    }
  };

  if (participantsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
          <p className="text-gray-600 mt-1">Manage study participants and track their progress</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Participant
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
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

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="invited">Invited</option>
              <option value="screened">Screened</option>
              <option value="qualified">Qualified</option>
              <option value="completed">Completed</option>
              <option value="disqualified">Disqualified</option>
            </select>
          </div>

          {/* Study Filter */}
          <div className="sm:w-48">
            <select
              value={studyFilter}
              onChange={(e) => setStudyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Studies</option>
              {studies.map((study) => (
                <option key={study._id} value={study._id}>
                  {study.title}
                </option>
              ))}
            </select>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      {filteredParticipants.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            👥
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || studyFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Start by inviting participants to your studies'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && studyFilter === 'all' && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Participant
            </button>
          )}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Study
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compensation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParticipants.map((participant) => {
                  const study = studies.find(s => s._id === participant.studyId);
                  
                  return (
                    <tr key={participant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {participant.firstName.charAt(0)}{participant.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.firstName} {participant.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {participant.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{study?.title || 'Unknown Study'}</div>
                        <div className="text-sm text-gray-500 capitalize">{study?.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(participant.status)}
                          <div className="ml-2">
                            {getStatusBadge(participant.status)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.sessions.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                          {participant.compensation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(participant.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <select
                            value={participant.status}
                            onChange={(e) => handleStatusChange(participant._id, e.target.value as 'invited' | 'screened' | 'qualified' | 'completed' | 'disqualified')}
                            className="text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="invited">Invited</option>
                            <option value="screened">Screened</option>
                            <option value="qualified">Qualified</option>
                            <option value="completed">Completed</option>
                            <option value="disqualified">Disqualified</option>
                          </select>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        studies={studies.filter(study => study.status === 'recruiting' || study.status === 'active')}
      />
    </div>
  );
};

export default ParticipantsPage;
