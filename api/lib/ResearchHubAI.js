// Vercel AI Gateway Service for ResearchHub
// Simple JavaScript version for Node.js compatibility

import { generateText, generateObject } from 'ai';
import { z } from 'zod';

// AI Services for ResearchHub Features
export class ResearchHubAI {
  
  // Generate study suggestions based on research goals
  static async generateStudySuggestions(researchGoals, industry) {
    try {
      const result = await generateObject({
        model: 'openai/gpt-4o-mini', // Using AI Gateway model routing
        prompt: `Generate 3 research study suggestions for: ${researchGoals} in ${industry} industry`,
        schema: z.object({
          studies: z.array(z.object({
            title: z.string(),
            description: z.string(),
            methodology: z.string(),
            duration: z.string(),
            participants: z.number()
          }))
        })
      });
      
      return { success: true, data: result.object };
    } catch (error) {
      console.error('AI Study Suggestions Error:', error);
      return { success: false, error: 'Failed to generate study suggestions' };
    }
  }

  // Analyze participant responses for insights
  static async analyzeResponses(responses) {
    try {
      const result = await generateText({
        model: 'openai/gpt-4o-mini',
        prompt: `Analyze these user research responses and provide key insights, patterns, and recommendations: ${JSON.stringify(responses)}`
      });
      
      return { success: true, insights: result.text };
    } catch (error) {
      console.error('AI Response Analysis Error:', error);
      return { success: false, error: 'Failed to analyze responses' };
    }
  }

  // Generate follow-up questions for interviews
  static async generateFollowUpQuestions(context, previousResponses) {
    try {
      const result = await generateObject({
        model: 'openai/gpt-4o-mini',
        prompt: `Based on this interview context: ${context} and previous responses: ${previousResponses.join(', ')}, generate 3 thoughtful follow-up questions`,
        schema: z.object({
          questions: z.array(z.string())
        })
      });
      
      return { success: true, data: result.object };
    } catch (error) {
      console.error('AI Follow-up Questions Error:', error);
      return { success: false, error: 'Failed to generate follow-up questions' };
    }
  }

  // Smart template recommendations
  static async recommendTemplates(description, goals) {
    try {
      const result = await generateObject({
        model: 'openai/gpt-4o-mini',
        prompt: `Recommend research study templates for: ${description} with goals: ${goals.join(', ')}`,
        schema: z.object({
          recommendations: z.array(z.object({
            templateName: z.string(),
            reason: z.string(),
            confidence: z.number()
          }))
        })
      });
      
      return { success: true, data: result.object };
    } catch (error) {
      console.error('AI Template Recommendations Error:', error);
      return { success: false, error: 'Failed to recommend templates' };
    }
  }

  // Generate study reports with AI insights
  static async generateStudyReport(studyData, responses) {
    try {
      const result = await generateText({
        model: 'openai/gpt-4o-mini',
        prompt: `Generate a comprehensive research study report for: ${JSON.stringify(studyData)} with participant responses: ${JSON.stringify(responses)}. Include executive summary, key findings, insights, and actionable recommendations.`
      });
      
      return { success: true, report: result.text };
    } catch (error) {
      console.error('AI Study Report Error:', error);
      return { success: false, error: 'Failed to generate study report' };
    }
  }

  // AI Interview Moderator Methods (UE-001)
  static async generateInterviewResponse(interviewData) {
    try {
      const { 
        participantResponse, 
        currentQuestionIndex, 
        conversationHistory, 
        interviewConfig, 
        studyContext 
      } = interviewData;

      const language = interviewConfig.language;
      const personality = interviewConfig.moderatorPersonality;
      
      // Build conversation context
      const conversationContext = conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Create language-specific prompts
      const prompts = {
        arabic: `أنت محاور ذكي ${personality === 'professional' ? 'مهني' : personality === 'friendly' ? 'ودود' : 'مريح'}. 
                 تجري مقابلة بحثية باللغة العربية. 
                 السياق السابق: ${conversationContext}
                 الإجابة الأخيرة للمشارك: ${participantResponse}
                 
                 اطرح سؤال متابعة مناسب أو اطلب توضيحاً. كن ${personality === 'professional' ? 'مهني ومباشر' : personality === 'friendly' ? 'ودود ومشجع' : 'مريح وغير رسمي'}.`,
        
        english: `You are an AI interview moderator with a ${personality} personality conducting a research interview. 
                  Previous conversation: ${conversationContext}
                  Participant's latest response: ${participantResponse}
                  
                  Generate an appropriate follow-up question or ask for clarification. Be ${personality === 'professional' ? 'professional and direct' : personality === 'friendly' ? 'warm and encouraging' : 'casual and relaxed'}.`
      };

      const result = await generateObject({
        model: 'openai/gpt-4o-mini',
        prompt: prompts[language],
        schema: z.object({
          content: z.string(),
          shouldEnd: z.boolean(),
          nextQuestionIndex: z.number().optional(),
          followUpType: z.enum(['clarification', 'deep_dive', 'transition', 'conclusion']).optional()
        })
      });
      
      return { success: true, data: result.object };
    } catch (error) {
      console.error('AI Interview Response Error:', error);
      return { 
        success: false, 
        error: 'Failed to generate interview response',
        data: {
          content: interviewData.interviewConfig.language === 'arabic' 
            ? 'عذراً، حدث خطأ تقني. هل يمكنك إعادة إجابتك؟'
            : 'Sorry, there was a technical issue. Could you please repeat your response?',
          shouldEnd: false
        }
      };
    }
  }

  // Generate interview questions based on study context
  static async generateInterviewQuestions(studyGoals, participantProfile, language = 'english') {
    try {
      const prompts = {
        arabic: `بناءً على أهداف الدراسة: ${studyGoals} وملف المشارك: ${JSON.stringify(participantProfile)}، 
                 أنشئ 5-7 أسئلة مقابلة بحثية عالية الجودة باللغة العربية.`,
        english: `Based on study goals: ${studyGoals} and participant profile: ${JSON.stringify(participantProfile)}, 
                  generate 5-7 high-quality research interview questions in English.`
      };

      const result = await generateObject({
        model: 'openai/gpt-4o-mini',
        prompt: prompts[language],
        schema: z.object({
          questions: z.array(z.object({
            id: z.string(),
            text: z.string(),
            type: z.enum(['opening', 'main', 'follow_up', 'closing']),
            expectedDuration: z.number()
          }))
        })
      });
      
      return { success: true, data: result.object };
    } catch (error) {
      console.error('AI Interview Questions Error:', error);
      return { success: false, error: 'Failed to generate interview questions' };
    }
  }

  // Analyze interview session for insights
  static async analyzeInterviewSession(sessionData) {
    try {
      const messages = sessionData.messages;
      const participantResponses = messages
        .filter(msg => msg.role === 'participant')
        .map(msg => msg.content)
        .join(' ');

      const result = await generateObject({
        model: 'openai/gpt-4o-mini',
        prompt: `Analyze this interview session and extract insights: ${participantResponses}. 
                 Identify key themes, sentiment, pain points, and actionable recommendations.`,
        schema: z.object({
          themes: z.array(z.string()),
          sentiment: z.enum(['positive', 'neutral', 'negative']),
          painPoints: z.array(z.string()),
          insights: z.array(z.string()),
          recommendations: z.array(z.string()),
          confidenceScore: z.number()
        })
      });
      
      return { success: true, data: result.object };
    } catch (error) {
      console.error('AI Interview Analysis Error:', error);
      return { success: false, error: 'Failed to analyze interview session' };
    }
  }
}

// Export for use in API endpoints
export default ResearchHubAI;
