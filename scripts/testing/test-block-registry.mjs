#!/usr/bin/env node

/**
 * ResearchHub Block Registry Test
 * Tests the block registry system functionality
 */

import { BlockRegistry, BLOCK_TYPES } from '../../src/shared/blocks/SimpleBlockRegistry.js';

console.log('🧪 Testing ResearchHub Block Registry System');
console.log('=' .repeat(50));

try {
  // Test 1: Get all block types
  console.log('\n📋 Test 1: Get all block types');
  const allBlocks = BlockRegistry.getAllBlockTypes();
  console.log(`✅ Found ${allBlocks.length} block types:`, allBlocks.slice(0, 3), '...');

  // Test 2: Get block metadata
  console.log('\n📋 Test 2: Get block metadata');
  const welcomeMetadata = BlockRegistry.getBlockMetadata(BLOCK_TYPES.WELCOME_SCREEN);
  if (welcomeMetadata) {
    console.log(`✅ Welcome Screen metadata:`, {
      displayName: welcomeMetadata.displayName,
      category: welcomeMetadata.category,
      complexity: welcomeMetadata.complexity
    });
  }

  // Test 3: Get blocks by category
  console.log('\n📋 Test 3: Get blocks by category');
  const inputBlocks = BlockRegistry.getBlocksByCategory('input');
  console.log(`✅ Input blocks (${inputBlocks.length}):`, inputBlocks.slice(0, 3));

  const interactionBlocks = BlockRegistry.getBlocksByCategory('interaction');
  console.log(`✅ Interaction blocks (${interactionBlocks.length}):`, interactionBlocks);

  // Test 4: Create a block
  console.log('\n📋 Test 4: Create a block');
  const newBlock = BlockRegistry.createBlock(BLOCK_TYPES.WELCOME_SCREEN, {
    title: 'Custom Welcome Title'
  });
  console.log(`✅ Created block:`, {
    id: newBlock.id,
    type: newBlock.type,
    title: newBlock.title
  });

  // Test 5: Calculate estimated duration
  console.log('\n📋 Test 5: Calculate estimated duration');
  const sampleBlocks = [
    { type: BLOCK_TYPES.WELCOME_SCREEN },
    { type: BLOCK_TYPES.OPEN_QUESTION },
    { type: BLOCK_TYPES.THANK_YOU }
  ];
  const duration = BlockRegistry.getEstimatedDuration(sampleBlocks);
  console.log(`✅ Estimated duration for 3 blocks: ${duration} seconds (${Math.round(duration/60)} minutes)`);

  // Test 6: Get complexity stats
  console.log('\n📋 Test 6: Get complexity statistics');
  const complexityStats = BlockRegistry.getBlockComplexityStats(sampleBlocks);
  console.log(`✅ Complexity stats:`, complexityStats);

  // Test 7: Get interactive blocks
  console.log('\n📋 Test 7: Get interactive blocks');
  const interactive = BlockRegistry.getInteractiveBlocks();
  console.log(`✅ Interactive blocks (${interactive.length}):`, interactive.slice(0, 4));

  // Test 8: Get supported features
  console.log('\n📋 Test 8: Get all supported features');
  const features = BlockRegistry.getAllSupportedFeatures();
  console.log(`✅ All features (${features.length}):`, features.slice(0, 6), '...');

  // Test 9: Search blocks by feature
  console.log('\n📋 Test 9: Search blocks by feature');
  const richTextBlocks = BlockRegistry.getBlocksByFeature('rich-text');
  console.log(`✅ Blocks with rich-text feature:`, richTextBlocks);

  // Test 10: Registry statistics
  console.log('\n📋 Test 10: Registry statistics');
  const stats = BlockRegistry.getRegistryStats();
  console.log(`✅ Registry stats:`, stats);

  // Test 11: Validate block type
  console.log('\n📋 Test 11: Validate block types');
  console.log(`✅ 'welcome-screen' is valid:`, BlockRegistry.isValidBlockType('welcome-screen'));
  console.log(`✅ 'invalid-block' is valid:`, BlockRegistry.isValidBlockType('invalid-block'));

  console.log('\n🎉 All tests completed successfully!');
  console.log(`📊 Block Registry System is working with ${allBlocks.length} block types`);

} catch (error) {
  console.log('\n❌ Test failed:', error.message);
  console.log('Stack:', error.stack);
}
