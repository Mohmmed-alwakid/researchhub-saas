import { chromium } from 'playwright';

async function testPostApprovalWorkflow() {
    console.log('🔬 Starting Post-Approval Study Execution Test...');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Navigate to the test page
        console.log('📄 Opening test page...');
        await page.goto('file:///d:/MAMP/AfakarM/post-approval-study-execution-test.html');
        await page.waitForLoadState('networkidle');
        
        // Step 1: Login as participant
        console.log('🔐 Step 1: Logging in as participant...');
        await page.click('button:has-text("Login as Test Participant")');
        await page.waitForTimeout(3000);
        
        // Check if login was successful
        const authResult = await page.textContent('#authResult');
        console.log('Auth Result:', authResult);
        
        if (authResult.includes('Login successful')) {
            console.log('✅ Login successful');
        } else {
            console.log('❌ Login failed');
            console.log('Full auth result:', authResult);
        }
        
        // Step 2: Load applications
        console.log('📚 Step 2: Loading participant applications...');
        await page.click('button:has-text("Load My Applications")');
        await page.waitForTimeout(3000);
        
        const applicationsResult = await page.textContent('#applicationsResult');
        console.log('Applications Result:', applicationsResult.substring(0, 200) + '...');
        
        // Step 3: Find approved study
        console.log('🎯 Step 3: Finding approved study...');
        await page.click('button:has-text("Find First Approved Study")');
        await page.waitForTimeout(2000);
        
        const approvedStudiesList = await page.textContent('#approvedStudiesList');
        console.log('Approved Studies:', approvedStudiesList.substring(0, 200) + '...');
        
        // Step 4: Test study session
        console.log('🎬 Step 4: Testing study session...');
        await page.click('button:has-text("Test Study Session")');
        await page.waitForTimeout(4000);
        
        const studySessionResult = await page.textContent('#studySessionResult');
        console.log('Study Session Result:', studySessionResult.substring(0, 200) + '...');
        
        // Step 5: Test task execution
        console.log('🎯 Step 5: Testing task execution...');
        await page.click('button:has-text("Test Task Execution")');
        await page.waitForTimeout(2000);
        
        const taskExecutionResult = await page.textContent('#taskExecutionResult');
        console.log('Task Execution Result:', taskExecutionResult.substring(0, 200) + '...');
        
        // Step 6: Complete study session
        console.log('🏁 Step 6: Completing study session...');
        await page.click('button:has-text("Complete Study Session")');
        await page.waitForTimeout(3000);
        
        const finalResult = await page.textContent('#taskExecutionResult');
        console.log('Final Result:', finalResult.substring(0, 200) + '...');
        
        // Generate workflow summary
        console.log('📊 Generating workflow summary...');
        await page.click('button:has-text("Generate Complete Summary")');
        await page.waitForTimeout(2000);
        
        const workflowSummary = await page.textContent('#workflowSummary');
        console.log('Workflow Summary:', workflowSummary);
        
        // Check flow steps status
        console.log('🔄 Checking flow steps status...');
        const flowSteps = await page.$$eval('.flow-step', steps => 
            steps.map(step => ({
                text: step.textContent.trim(),
                completed: step.classList.contains('completed'),
                failed: step.classList.contains('failed')
            }))
        );
        
        console.log('Flow Steps Status:');
        flowSteps.forEach((step, index) => {
            const status = step.completed ? '✅ COMPLETED' : step.failed ? '❌ FAILED' : '⏳ PENDING';
            console.log(`${index + 1}. ${status} - ${step.text.split('\n')[0]}`);
        });
        
        // Final assessment
        const completedSteps = flowSteps.filter(step => step.completed).length;
        const totalSteps = flowSteps.length;
        const successRate = (completedSteps / totalSteps * 100).toFixed(1);
        
        console.log('\n📊 FINAL ASSESSMENT:');
        console.log(`Success Rate: ${successRate}% (${completedSteps}/${totalSteps} steps completed)`);
        
        if (completedSteps === totalSteps) {
            console.log('🎉 CONCLUSION: POST-APPROVAL WORKFLOW FULLY VERIFIED!');
            console.log('✅ Approved participants CAN successfully do studies');
            console.log('✅ All workflow steps are functional');
            console.log('✅ Backend APIs working correctly');
            console.log('✅ Frontend integration complete');
        } else {
            console.log('⚠️ CONCLUSION: WORKFLOW HAS SOME ISSUES');
            console.log('❌ Some steps failed - additional debugging needed');
        }
        
        // Keep browser open for manual inspection
        console.log('\n🔍 Keeping browser open for manual inspection...');
        console.log('Press any key to close browser and continue...');
        
        // Wait for user input
        await new Promise(resolve => {
            process.stdin.once('data', resolve);
        });
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testPostApprovalWorkflow().catch(console.error);
