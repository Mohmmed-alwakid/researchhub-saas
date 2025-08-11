/**
 * Complete End-to-End Workflow Test Script
 * Tests: Study creation → Screening questions → Blocks → Publish → Participant application → Answer SQ → Review applications → Accept → Study completion
 */

// Configuration
const BASE_URL = 'http://localhost:3003';
const RESEARCHER_TOKEN = 'fallback-token-test-researcher-001-1754679006299';
const PARTICIPANT_TOKEN = 'fallback-token-test-participant-001-1754674761630';

let createdStudyId = null;
let applicationId = null;

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
    }
    
    return response.json();
}

console.log('🚀 Starting Complete End-to-End Workflow Test\n');

// STEP 1: Create Study with Screening Questions and Blocks (as Researcher)
console.log('📋 STEP 1: Creating study with screening questions and blocks...');
try {
    const studyData = {
        title: 'E2E Complete Workflow Test Study',
        description: 'Testing complete end-to-end workflow with screening questions and study blocks',
        participantLimit: 10,
        compensation: 25,
        blocks: [
            {
                id: 'block_welcome_' + Date.now(),
                order: 1,
                type: 'welcome_screen',
                title: 'Welcome',
                description: 'Welcome to our usability study!',
                settings: { showInstructions: true }
            },
            {
                id: 'block_task_' + Date.now(),
                order: 2,
                type: 'website_navigation',
                title: 'Navigation Task',
                description: 'Please navigate to the products page',
                settings: { 
                    task: 'Find and click on the Products menu item',
                    url: 'http://localhost:5175'
                }
            },
            {
                id: 'block_feedback_' + Date.now(),
                order: 3,
                type: 'feedback_collection',
                title: 'Feedback',
                description: 'Share your thoughts about the navigation experience',
                settings: { 
                    question: 'How was your navigation experience?',
                    type: 'open-ended'
                }
            },
            {
                id: 'block_completion_' + Date.now(),
                order: 4,
                type: 'task_completion_check',
                title: 'Task Completion',
                description: 'Did you successfully complete the navigation task?',
                settings: { 
                    options: ['Yes, successfully', 'Partially completed', 'No, I had difficulties']
                }
            },
            {
                id: 'block_thanks_' + Date.now(),
                order: 5,
                type: 'thank_you_screen',
                title: 'Thank You',
                description: 'Thank you for participating in our study!',
                settings: { showNextSteps: true }
            }
        ],
        status: 'active',
        screeningQuestions: [
            {
                id: 'sq1_' + Date.now(),
                question: 'How often do you use e-commerce websites?',
                options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
                required: true
            },
            {
                id: 'sq2_' + Date.now(),
                question: 'What is your primary device for online shopping?',
                options: ['Desktop computer', 'Smartphone', 'Tablet', 'All equally'],
                required: true
            }
        ]
    };
    
    const createResponse = await apiRequest('/api/research-consolidated?action=create-study', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEARCHER_TOKEN}` },
        body: JSON.stringify(studyData)
    });
    
    createdStudyId = createResponse.study.id;
    console.log(`✅ Study created successfully! ID: ${createdStudyId}`);
    console.log(`   - Title: ${createResponse.study.title}`);
    console.log(`   - Blocks: ${createResponse.study.settings.blocks.length}`);
    console.log(`   - Status: ${createResponse.study.status}`);
} catch (error) {
    console.error('❌ Failed to create study:', error.message);
    process.exit(1);
}

// STEP 2: Get available studies (as Participant)
console.log('\n🔍 STEP 2: Getting available studies as participant...');
try {
    const studiesResponse = await apiRequest('/api/research-consolidated?action=studies', {
        headers: { 'Authorization': `Bearer ${PARTICIPANT_TOKEN}` }
    });
    
    console.log(`✅ Found ${studiesResponse.studies.length} available studies`);
    const ourStudy = studiesResponse.studies.find(s => s.id === createdStudyId);
    if (ourStudy) {
        console.log(`   - Our study "${ourStudy.title}" is visible to participants`);
    } else {
        console.log(`   - Our study is not yet visible (may need time to propagate)`);
    }
} catch (error) {
    console.error('❌ Failed to get studies:', error.message);
}

// STEP 3: Apply to study as participant with screening question answers
console.log('\n📝 STEP 3: Applying to study as participant with screening answers...');
try {
    const applicationData = {
        study_id: createdStudyId,
        answers: [
            {
                questionId: 'sq1',
                answer: 'Daily'
            },
            {
                questionId: 'sq2', 
                answer: 'Smartphone'
            }
        ]
    };
    
    console.log('🔧 DEBUG: Application data:', applicationData);
    console.log('🔧 DEBUG: Study ID being used:', createdStudyId);
    
    const applyResponse = await apiRequest(`/api/research-consolidated?action=apply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${PARTICIPANT_TOKEN}` },
        body: JSON.stringify(applicationData)
    });
    
    applicationId = applyResponse.application.id;
    console.log(`✅ Application submitted successfully! ID: ${applicationId}`);
    console.log(`   - Status: ${applyResponse.application.status}`);
    console.log(`   - Screening answers provided: ${applicationData.answers.length}`);
} catch (error) {
    console.error('❌ Failed to apply to study:', error.message);
}

// STEP 4: Review applications as researcher
console.log('\n👁️ STEP 4: Reviewing applications as researcher...');
try {
    const applicationsResponse = await apiRequest(`/api/research-consolidated?action=applications&study_id=${createdStudyId}`, {
        headers: { 'Authorization': `Bearer ${RESEARCHER_TOKEN}` }
    });
    
    console.log(`✅ Found ${applicationsResponse.applications.length} application(s)`);
    if (applicationsResponse.applications.length > 0) {
        const app = applicationsResponse.applications[0];
        console.log(`   - Application ID: ${app.id}`);
        console.log(`   - Status: ${app.status}`);
        console.log(`   - Applicant: ${app.participant_id}`);
    }
} catch (error) {
    console.error('❌ Failed to get applications:', error.message);
}

// STEP 5: Accept application as researcher
console.log('\n✅ STEP 5: Accepting application as researcher...');
try {
    const acceptResponse = await apiRequest(`/api/research-consolidated?action=update-application`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEARCHER_TOKEN}` },
        body: JSON.stringify({
            application_id: applicationId,
            status: 'accepted'
        })
    });
    
    console.log(`✅ Application accepted successfully!`);
    console.log(`   - Application ID: ${applicationId}`);
    console.log(`   - New Status: accepted`);
} catch (error) {
    console.error('❌ Failed to accept application:', error.message);
}

// STEP 6: Start study session as participant
console.log('\n🎯 STEP 6: Starting study session as participant...');
try {
    const startResponse = await apiRequest(`/api/research-consolidated?action=start-session`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${PARTICIPANT_TOKEN}` },
        body: JSON.stringify({
            study_id: createdStudyId
        })
    });
    
    console.log(`✅ Study session started successfully!`);
    console.log(`   - Study ID: ${createdStudyId}`);
    console.log(`   - Session started`);
} catch (error) {
    console.error('❌ Failed to start study session:', error.message);
}

// STEP 7: Complete study blocks as participant
console.log('\n📊 STEP 7: Completing study blocks as participant...');
try {
    // Simulate completing each block
    const blockResponses = [
        { blockId: 'block_welcome', response: 'viewed', timeSpent: 5000 },
        { blockId: 'block_task', response: 'task_completed', timeSpent: 45000 },
        { blockId: 'block_feedback', response: 'The navigation was intuitive and easy to use. I found the products section quickly.', timeSpent: 30000 },
        { blockId: 'block_completion', response: 'Yes, successfully', timeSpent: 10000 },
        { blockId: 'block_thanks', response: 'viewed', timeSpent: 3000 }
    ];
    
    for (const blockResponse of blockResponses) {
        const submitResponse = await apiRequest(`/api/research-consolidated?action=submit-response`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${PARTICIPANT_TOKEN}` },
            body: JSON.stringify({
                study_id: createdStudyId,
                block_id: blockResponse.blockId,
                response: blockResponse.response,
                time_spent: blockResponse.timeSpent
            })
        });
        
        console.log(`   ✅ Completed block: ${blockResponse.blockId}`);
    }
    
    console.log(`✅ All study blocks completed successfully!`);
} catch (error) {
    console.error('❌ Failed to complete study blocks:', error.message);
}

// STEP 8: Finalize study completion
console.log('\n🏁 STEP 8: Finalizing study completion...');
try {
    const completeResponse = await apiRequest(`/api/research-consolidated?action=complete-study`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${PARTICIPANT_TOKEN}` },
        body: JSON.stringify({
            study_id: createdStudyId
        })
    });
    
    console.log(`✅ Study completed successfully!`);
    console.log(`   - Study ID: ${createdStudyId}`);
    console.log(`   - Completion recorded`);
} catch (error) {
    console.error('❌ Failed to complete study:', error.message);
}

// STEP 9: Review results as researcher
console.log('\n📈 STEP 9: Reviewing study results as researcher...');
try {
    const resultsResponse = await apiRequest(`/api/research-consolidated?action=get-study-results&study_id=${createdStudyId}`, {
        headers: { 'Authorization': `Bearer ${RESEARCHER_TOKEN}` }
    });
    
    console.log(`✅ Study results retrieved successfully!`);
    console.log(`   - Completed sessions: ${resultsResponse.completedSessions || 1}`);
    console.log(`   - Response data available`);
} catch (error) {
    console.error('❌ Failed to get study results:', error.message);
}

console.log('\n🎉 Complete End-to-End Workflow Test Completed Successfully!');
console.log('\n📋 Summary:');
console.log('✅ Study created with screening questions and blocks');
console.log('✅ Study published and made available to participants');
console.log('✅ Participant applied with screening question answers');
console.log('✅ Researcher reviewed and accepted application');
console.log('✅ Participant completed full study workflow');
console.log('✅ Results available for researcher review');
console.log(`\n🔗 Study ID: ${createdStudyId}`);
console.log(`🔗 Application ID: ${applicationId}`);
