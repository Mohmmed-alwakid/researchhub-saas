// Quick test for Study Sessions API endpoints
import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3003';
const TEST_USER_ID = 'test-user-123';
const TEST_STUDY_ID = 'test-study-456';

test.describe('Study Sessions API', () => {
  test('should start a new study session', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/study-sessions/start`, {
      data: {
        userId: TEST_USER_ID,
        studyId: TEST_STUDY_ID,
        sessionData: {
          deviceInfo: { userAgent: 'test-browser' },
          startTime: new Date().toISOString()
        }
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.sessionId).toBeDefined();
  });

  test('should save session progress', async ({ request }) => {
    // First start a session
    const startResponse = await request.post(`${API_BASE}/api/study-sessions/start`, {
      data: {
        userId: TEST_USER_ID,
        studyId: TEST_STUDY_ID,
        sessionData: {
          deviceInfo: { userAgent: 'test-browser' },
          startTime: new Date().toISOString()
        }
      }
    });

    const startData = await startResponse.json();
    const sessionId = startData.sessionId;

    // Then save progress
    const progressResponse = await request.post(`${API_BASE}/api/study-sessions/progress`, {
      data: {
        sessionId,
        userId: TEST_USER_ID,
        progressData: {
          currentStep: 2,
          responses: { step1: 'completed' },
          timestamp: new Date().toISOString()
        }
      }
    });

    expect(progressResponse.status()).toBe(200);
    const progressData = await progressResponse.json();
    expect(progressData.success).toBe(true);
  });

  test('should complete a study session', async ({ request }) => {
    // Start session
    const startResponse = await request.post(`${API_BASE}/api/study-sessions/start`, {
      data: {
        userId: TEST_USER_ID,
        studyId: TEST_STUDY_ID,
        sessionData: {
          deviceInfo: { userAgent: 'test-browser' },
          startTime: new Date().toISOString()
        }
      }
    });

    const startData = await startResponse.json();
    const sessionId = startData.sessionId;

    // Complete session
    const completeResponse = await request.post(`${API_BASE}/api/study-sessions/complete`, {
      data: {
        sessionId,
        userId: TEST_USER_ID,
        completionData: {
          endTime: new Date().toISOString(),
          finalResponses: { overall: 'completed successfully' },
          feedback: 'Great experience'
        }
      }
    });

    expect(completeResponse.status()).toBe(200);
    const completeData = await completeResponse.json();
    expect(completeData.success).toBe(true);
  });

  test('should retrieve session results', async ({ request }) => {
    // Start and complete a session first
    const startResponse = await request.post(`${API_BASE}/api/study-sessions/start`, {
      data: {
        userId: TEST_USER_ID,
        studyId: TEST_STUDY_ID,
        sessionData: {
          deviceInfo: { userAgent: 'test-browser' },
          startTime: new Date().toISOString()
        }
      }
    });

    const startData = await startResponse.json();
    const sessionId = startData.sessionId;

    await request.post(`${API_BASE}/api/study-sessions/complete`, {
      data: {
        sessionId,
        userId: TEST_USER_ID,
        completionData: {
          endTime: new Date().toISOString(),
          finalResponses: { overall: 'completed successfully' }
        }
      }
    });

    // Get results
    const resultsResponse = await request.get(`${API_BASE}/api/study-sessions/results/${sessionId}?userId=${TEST_USER_ID}`);

    expect(resultsResponse.status()).toBe(200);
    const resultsData = await resultsResponse.json();
    expect(resultsData.success).toBe(true);
    expect(resultsData.session).toBeDefined();
    expect(resultsData.session.status).toBe('completed');
  });

  test('should handle authentication requirements', async ({ request }) => {
    // Test without authentication
    const response = await request.post(`${API_BASE}/api/study-sessions/start`, {
      data: {
        studyId: TEST_STUDY_ID,
        // Missing userId
        sessionData: {}
      }
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});
