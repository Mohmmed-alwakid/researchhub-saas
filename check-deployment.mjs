/**
 * VERIFY DEPLOYMENT STATUS
 * Check if our StudyDetailPage fix has been properly deployed
 */

async function checkDeploymentStatus() {
  console.log('🔍 Checking deployment status...\n');

  try {
    // Check if we can fetch the static assets to confirm deployment
    const response = await fetch('https://researchhub-saas.vercel.app/', {
      method: 'HEAD'
    });

    console.log('📊 Site Status:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Also check the time to see if it's recent
    const lastModified = response.headers.get('last-modified');
    const age = response.headers.get('age');
    const cacheControl = response.headers.get('cache-control');

    console.log('📅 Deployment Info:', {
      lastModified,
      age,
      cacheControl
    });

    // Check git status to confirm our changes
    console.log('\n📋 Latest commit info:');
    
  } catch (error) {
    console.error('❌ Error checking deployment:', error.message);
  }
}

checkDeploymentStatus();
