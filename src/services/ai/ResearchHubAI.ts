// Vercel AI Gateway Service for ResearchHub
// Integrates AI-powered features using Vercel AI Gateway

import { generateText, generateObject } from 'ai';
import { z } from 'zod';

// AI Services for ResearchHub Features
export class ResearchHubAI {
  
  // Generate study suggestions based on research goals
  static async generateStudySuggestions(researchGoals: string, industry: string) {
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
  static async analyzeResponses(responses: Array<Record<string, unknown>>) {
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
  static async generateFollowUpQuestions(context: string, previousResponses: string[]) {
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
  static async recommendTemplates(description: string, goals: string[]) {
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
  static async generateStudyReport(studyData: Record<string, unknown>, responses: Array<Record<string, unknown>>) {
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
}

// Export for use in API endpoints
export default ResearchHubAI;
