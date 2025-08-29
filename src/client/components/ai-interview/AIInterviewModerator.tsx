import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export interface AIInterviewMessage {
  id: string;
  role: 'ai' | 'participant';
  content: string;
  timestamp: Date;
  language: 'arabic' | 'english';
  audioUrl?: string;
}

export interface AIInterviewSessionData {
  sessionId: string;
  studyId: string;
  participantId: string;
  messages: AIInterviewMessage[];
  startTime: Date;
  endTime: Date;
  completed: boolean;
}

export interface AIInterviewProps {
  studyId: string;
  participantId: string;
  sessionId: string;
  interviewConfig: {
    language: 'arabic' | 'english';
    voiceEnabled: boolean;
    moderatorPersonality: 'professional' | 'friendly' | 'casual';
    questions: Array<{
      id: string;
      text: string;
      type: 'opening' | 'main' | 'follow_up' | 'closing';
    }>;
  };
  onSessionComplete?: (sessionData: AIInterviewSessionData) => void;
  onError?: (error: string) => void;
}

export const AIInterviewModerator: React.FC<AIInterviewProps> = ({
  studyId,
  participantId,
  sessionId,
  interviewConfig,
  onSessionComplete,
  onError
}) => {
  const [messages, setMessages] = useState<AIInterviewMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(interviewConfig.voiceEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize session with welcome message
  useEffect(() => {
    const initializeSession = async () => {
      const welcomeMessage: AIInterviewMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: getWelcomeMessage(),
        timestamp: new Date(),
        language: interviewConfig.language
      };

      setMessages([welcomeMessage]);
      
      // Synthesize speech if audio is enabled
      if (isAudioEnabled) {
        await synthesizeSpeech(welcomeMessage.content, interviewConfig.language);
      }
    };

    if (!sessionStarted) {
      initializeSession();
      setSessionStarted(true);
    }
  }, [sessionStarted, interviewConfig.language, isAudioEnabled]);

  const getWelcomeMessage = (): string => {
    const messages = {
      arabic: `مرحباً! أنا المحاور الذكي للدراسة. سأقوم بطرح بعض الأسئلة عليك لفهم تجربتك بشكل أفضل. هل أنت مستعد للبدء؟`,
      english: `Hello! I'm your AI interview moderator. I'll be asking you some questions to better understand your experience. Are you ready to begin?`
    };
    return messages[interviewConfig.language];
  };

  const synthesizeSpeech = async (text: string, language: 'arabic' | 'english') => {
    try {
      const response = await fetch('/api/research-consolidated?action=synthesize-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await processAudioInput(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access error:', error);
      onError?.('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', interviewConfig.language);

      const response = await fetch('/api/research-consolidated?action=transcribe-audio', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        handleParticipantResponse(result.transcript);
      } else {
        onError?.('Failed to transcribe audio');
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      onError?.('Audio processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = () => {
    if (currentInput.trim()) {
      handleParticipantResponse(currentInput.trim());
      setCurrentInput('');
    }
  };

  const handleParticipantResponse = async (response: string) => {
    // Add participant message
    const participantMessage: AIInterviewMessage = {
      id: `participant-${Date.now()}`,
      role: 'participant',
      content: response,
      timestamp: new Date(),
      language: interviewConfig.language
    };

    setMessages(prev => [...prev, participantMessage]);
    setIsLoading(true);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(response);
      
      const aiMessage: AIInterviewMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        language: interviewConfig.language
      };

      setMessages(prev => [...prev, aiMessage]);

      // Synthesize AI response if audio enabled
      if (isAudioEnabled) {
        await synthesizeSpeech(aiResponse.content, interviewConfig.language);
      }

      // Check if interview should continue or end
      if (aiResponse.shouldEnd) {
        await endSession();
      } else if (aiResponse.nextQuestionIndex !== undefined) {
        setCurrentQuestionIndex(aiResponse.nextQuestionIndex);
      }

    } catch (error) {
      console.error('AI response generation error:', error);
      onError?.('Failed to generate AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (participantResponse: string) => {
    const response = await fetch('/api/research-consolidated?action=ai-interview-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        participantResponse,
        currentQuestionIndex,
        conversationHistory: messages,
        interviewConfig,
        studyContext: { studyId, participantId }
      })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  };

  const endSession = async () => {
    try {
      const sessionData = {
        sessionId,
        studyId,
        participantId,
        messages,
        startTime: messages[0]?.timestamp,
        endTime: new Date(),
        completed: true
      };

      await fetch('/api/research-consolidated?action=save-interview-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      onSessionComplete?.(sessionData);
    } catch (error) {
      console.error('Session save error:', error);
      onError?.('Failed to save session data');
    }
  };

  const formatMessage = (message: AIInterviewMessage) => {
    const isAI = message.role === 'ai';
    return (
      <div
        key={message.id}
        className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div className={`max-w-[80%] rounded-lg p-4 ${
          isAI 
            ? 'bg-blue-50 border border-blue-200 text-blue-900' 
            : 'bg-green-50 border border-green-200 text-green-900'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isAI ? 'bg-blue-500' : 'bg-green-500'}`} />
            <span className="text-sm font-medium">
              {isAI ? 'AI Moderator' : 'You'}
            </span>
            <span className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Interview Session</h2>
            <p className="text-sm text-gray-600">
              Language: {interviewConfig.language === 'arabic' ? 'العربية' : 'English'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-2 rounded-full ${
                isAudioEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(formatMessage)}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span className="text-sm text-blue-700">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          {/* Voice Input */}
          {isAudioEnabled && (
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className={`p-3 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Hold to record"
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}

          {/* Text Input */}
          <div className="flex-1 flex items-center">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
              placeholder={
                interviewConfig.language === 'arabic' 
                  ? 'اكتب إجابتك هنا...' 
                  : 'Type your response here...'
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              style={{ direction: interviewConfig.language === 'arabic' ? 'rtl' : 'ltr' }}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!currentInput.trim() || isLoading}
              className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="mt-2 text-center">
            <span className="text-sm text-red-600 animate-pulse">
              🔴 Recording... Release to send
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInterviewModerator;
