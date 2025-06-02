import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Search, 
  Filter, 
  Send,
  Phone,
  Mail,
  FileText,
  Star,
  ArrowRight,
  MoreVertical,
  RefreshCw
} from 'lucide-react';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature-request' | 'bug-report' | 'general';
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
  rating?: number;
}

interface SupportMessage {
  id: string;
  content: string;
  author: {
    name: string;
    role: 'user' | 'admin';
  };
  timestamp: string;
  attachments?: string[];
}

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  averageResponseTime: number;
  satisfactionRating: number;
  ticketsByCategory: { [key: string]: number };
  ticketsByPriority: { [key: string]: number };
}

const mockTickets: SupportTicket[] = [
  {
    id: 'TICK-001',
    subject: 'Unable to create new study',
    description: 'Getting an error when trying to create a new study. The form submission fails.',
    status: 'open',
    priority: 'high',
    category: 'technical',
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Researcher'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    messages: [
      {
        id: 'msg-1',
        content: 'I keep getting a 400 error when submitting the study creation form. This is blocking my research work.',
        author: { name: 'John Doe', role: 'user' },
        timestamp: '2024-01-15T10:30:00Z'
      }
    ]
  },
  {
    id: 'TICK-002',
    subject: 'Billing question about subscription',
    description: 'Question about upgrading subscription plan.',
    status: 'resolved',
    priority: 'medium',
    category: 'billing',
    user: {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@university.edu',
      role: 'Researcher'
    },
    assignedTo: 'Admin User',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    rating: 5,
    messages: [
      {
        id: 'msg-2',
        content: 'I want to upgrade from Basic to Professional plan. How do I do this?',
        author: { name: 'Jane Smith', role: 'user' },
        timestamp: '2024-01-14T14:20:00Z'
      },
      {
        id: 'msg-3',
        content: 'You can upgrade your plan in your account settings under the Billing section. I\'ve sent you a direct link via email.',
        author: { name: 'Admin User', role: 'admin' },
        timestamp: '2024-01-15T09:15:00Z'
      }
    ]
  },
  {
    id: 'TICK-003',
    subject: 'Feature request: Export analytics data',
    description: 'Would like to export study analytics data to CSV format.',
    status: 'in-progress',
    priority: 'low',
    category: 'feature-request',
    user: {
      id: 'user-3',
      name: 'Dr. Michael Johnson',
      email: 'mjohnson@research.org',
      role: 'Researcher'
    },
    assignedTo: 'Development Team',
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-14T11:30:00Z',
    messages: [
      {
        id: 'msg-4',
        content: 'It would be great to have an export function for analytics data so I can create custom reports in Excel.',
        author: { name: 'Dr. Michael Johnson', role: 'user' },
        timestamp: '2024-01-12T16:45:00Z'
      },
      {
        id: 'msg-5',
        content: 'Thanks for the suggestion! We\'ve added this to our development roadmap. I\'ll keep you updated on progress.',
        author: { name: 'Development Team', role: 'admin' },
        timestamp: '2024-01-14T11:30:00Z'
      }
    ]
  }
];

const mockStats: SupportStats = {
  totalTickets: 127,
  openTickets: 23,
  resolvedToday: 8,
  averageResponseTime: 2.4,
  satisfactionRating: 4.6,
  ticketsByCategory: {
    technical: 45,
    billing: 28,
    'feature-request': 32,
    'bug-report': 15,
    general: 7
  },
  ticketsByPriority: {
    urgent: 3,
    high: 12,
    medium: 67,
    low: 45
  }
};

const SupportCenter: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [stats, setStats] = useState<SupportStats>(mockStats);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: SupportMessage = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      author: { name: 'Admin User', role: 'admin' },
      timestamp: new Date().toISOString()
    };

    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      updatedAt: new Date().toISOString()
    };

    setSelectedTicket(updatedTicket);
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setNewMessage('');
  };

  const updateTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
        : ticket
    ));
    
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Center</h2>
          <p className="text-gray-600 mt-1">Manage user support tickets and help requests</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolvedToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{stats.satisfactionRating}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                    <span className="text-sm font-medium text-gray-900">{ticket.id}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">{ticket.subject}</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{ticket.user.name}</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedTicket ? (
            <div className="h-full flex flex-col">
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTicket.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedTicket.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as SupportTicket['status'])}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Priority</p>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getPriorityColor(selectedTicket.priority)}`}></div>
                      <span className="font-medium capitalize">{selectedTicket.priority}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-medium capitalize mt-1">{selectedTicket.category.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">User</p>
                    <p className="font-medium mt-1">{selectedTicket.user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium mt-1">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedTicket.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.author.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.author.role === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.author.role === 'admin' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.author.name} • {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your response..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a ticket to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
