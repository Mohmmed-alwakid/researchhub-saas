
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ParticipantBlockRenderingFinal_2025-07-01', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175/login');

    // Fill input field
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Testtest123');

    // Click element
    await page.click('button[type="submit"]');

    // Navigate to URL
    await page.goto('http://localhost:5175/participant/study/62184eb3-45c0-45e6-af6d-4cbad96a5a0a/session/session_1751277783433_9876c870');

    // Take screenshot
    await page.screenshot({ path: 'block_rendering_demo_start.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:5175/participant/study/62184eb3-45c0-45e6-af6d-4cbad96a5a0a/session/session_1751277783433_9876c870');

    // Navigate to URL
    await page.goto('http://localhost:5175/app/participant-dashboard');

    // Take screenshot
    await page.screenshot({ path: 'participant_dashboard.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:5175/app/studies/62184eb3-45c0-45e6-af6d-4cbad96a5a0a/session');

    // Take screenshot
    await page.screenshot({ path: 'study_session_page_loading.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text("Start Study Session")');

    // Take screenshot
    await page.screenshot({ path: 'study_blocks_rendering.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text("Get Started")');

    // Take screenshot
    await page.screenshot({ path: 'context_screen_block.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text("I Understand, Continue")');

    // Take screenshot
    await page.screenshot({ path: 'multiple_choice_block.png', { fullPage: true } });

    // Click element
    await page.click('input[value="daily"]');

    // Click element
    await page.click('label:has-text("Daily")');

    // Click element
    await page.click('button:has-text("Continue")');

    // Take screenshot
    await page.screenshot({ path: 'open_question_block.png', { fullPage: true } });

    // Fill input field
    await page.fill('textarea', 'This platform has a very modern and clean interface. The navigation is intuitive and the study blocks flow smoothly from one to the next. The progress indicators are helpful for understanding how much time is remaining. The overall user experience feels professional and well-designed.');

    // Click element
    await page.click('button:has-text("Continue")');

    // Take screenshot
    await page.screenshot({ path: 'opinion_scale_block.png', { fullPage: true } });

    // Click element
    await page.click('button[aria-label='5 stars']');

    // Click element
    await page.click('button:has-text("Continue")');

    // Take screenshot
    await page.screenshot({ path: 'opinion_scale_validation.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text("Continue")');

    // Take screenshot
    await page.screenshot({ path: 'thank_you_block.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text("thank you")');

    // Click element
    await page.click('button:has-text("Next")');

    // Take screenshot
    await page.screenshot({ path: 'final_block_navigation.png', { fullPage: true } });
});