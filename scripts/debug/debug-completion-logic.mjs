// Debug completion detection logic
const blockType = 'thank_you';
const isLastBlock = true;
const blockId = 'thank-you-final';

const isStudyComplete = blockType === 'thank_you' || isLastBlock || blockId.includes('thank_you');

console.log('🔍 Completion Logic Test:');
console.log('blockType:', blockType);
console.log('isLastBlock:', isLastBlock);
console.log('blockId:', blockId);
console.log('blockType === "thank_you":', blockType === 'thank_you');
console.log('blockId.includes("thank_you"):', blockId.includes('thank_you'));
console.log('Final isStudyComplete:', isStudyComplete);

if (isStudyComplete) {
  console.log('✅ Study should be marked as completed!');
} else {
  console.log('❌ Study will NOT be marked as completed');
}
