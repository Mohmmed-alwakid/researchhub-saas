/**
 * 🎯 LIVE PROMPT TRAINING SESSION
 * Follow these steps IN ORDER to experience GitHub Copilot prompts in action
 * 
 * INSTRUCTIONS:
 * 1. Make sure GitHub Copilot is enabled in VS Code
 * 2. Follow each exercise step by step
 * 3. Type each pattern EXACTLY as shown
 * 4. Observe Copilot's suggestions (they should be ResearchHub-specific!)
 * 5. Accept suggestions that look correct for ResearchHub
 */

console.log('🚀 Starting Live Prompt Training Session');
console.log('📅 Training Date:', new Date().toISOString());

// =============================================================================
// EXERCISE 1: STUDY BUILDER BLOCK INTERFACE
// GOAL: See Copilot suggest ResearchHub-specific block structure
// =============================================================================

console.log('\n🧩 EXERCISE 1: Type the interface below and watch suggestions');

/*
STEP 1A: Type this EXACTLY (including the opening brace):
interface StudyBuilderBlock {

EXPECTED RESULT: Copilot should suggest properties like:
- id: string;
- type: BlockType;
- order: number;
- title: string;
- description: string;
- settings: Record<string, unknown>;

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 1A:



/*
STEP 1B: Now type this and watch for block type suggestions:
type BlockType = 

EXPECTED RESULT: Copilot should suggest the 13 ResearchHub block types:
- 'welcome' | 'open_question' | 'opinion_scale' | 'simple_input' | ...

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 1B:



// =============================================================================
// EXERCISE 2: API HANDLER PATTERN
// GOAL: See Copilot suggest ResearchHub API patterns
// =============================================================================

console.log('\n🔌 EXERCISE 2: API Development Patterns');

/*
STEP 2A: Type this API handler signature:
export default async function handler(req, res) {

EXPECTED RESULT: Copilot should immediately suggest:
- const { action } = req.query;
- switch (action) {
- try/catch error handling

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 2A:



/*
STEP 2B: Type this authentication pattern:
const auth = await authenticateUser(

EXPECTED RESULT: Copilot should suggest:
- req as first parameter
- ['researcher'] or ['researcher', 'admin'] as role requirements

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 2B:



// =============================================================================
// EXERCISE 3: SUPABASE DATABASE PATTERNS
// GOAL: See Copilot suggest RLS and ownership patterns
// =============================================================================

console.log('\n🗄️ EXERCISE 3: Database Query Patterns');

/*
STEP 3A: Type this Supabase query start:
const { data, error } = await supabase.from('studies')

EXPECTED RESULT: Copilot should suggest:
- .select() with relevant fields
- .eq('researcher_id', userId) for RLS
- .single() or .order() methods

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 3A:



/*
STEP 3B: Type this block creation pattern:
const newBlock = {
  id: 

EXPECTED RESULT: Copilot should suggest:
- crypto.randomUUID()
- Not Math.random() or other ID generation methods

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 3B:



// =============================================================================
// EXERCISE 4: REACT COMPONENT PATTERNS
// GOAL: See Copilot understand ResearchHub component structures
// =============================================================================

console.log('\n⚛️ EXERCISE 4: React Component Patterns');

/*
STEP 4A: Type this component interface:
interface StudyBuilderProps {

EXPECTED RESULT: Copilot should suggest ResearchHub-specific props:
- blocks: StudyBuilderBlock[]
- onBlocksChange: (blocks: StudyBuilderBlock[]) => void
- studyId: string
- etc.

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 4A:



/*
STEP 4B: Type this component function:
export const StudyBuilder = ({ blocks, onBlocksChange }: StudyBuilderProps) => {
  const [selectedBlock, setSelectedBlock] = useState

EXPECTED RESULT: Copilot should suggest:
- <StudyBuilderBlock | null>(null)
- Proper TypeScript typing

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 4B:



// =============================================================================
// EXERCISE 5: CONSTRAINT AWARENESS TEST
// GOAL: Test if Copilot enforces ResearchHub constraints
// =============================================================================

console.log('\n🚨 EXERCISE 5: Constraint Enforcement');

/*
STEP 5A: Try to type this (this should trigger warnings):
// Create a new API file called api/new-handler.js

EXPECTED RESULT: Copilot should DISCOURAGE this because:
- ResearchHub has 12/12 API function limit
- Should suggest extending existing consolidated handlers instead

TYPE YOUR ATTEMPT HERE: ⬇️
*/

// Your typing space for Exercise 5A:



/*
STEP 5B: Type this test account pattern:
const testAccount = {
  email: 

EXPECTED RESULT: Copilot should suggest one of the 3 designated accounts:
- 'abwanwr77+Researcher@gmail.com'
- 'abwanwr77+participant@gmail.com' 
- 'abwanwr77+admin@gmail.com'

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 5B:



// =============================================================================
// EXERCISE 6: BLOCK VALIDATION LOGIC
// GOAL: See advanced ResearchHub business logic suggestions
// =============================================================================

console.log('\n✅ EXERCISE 6: Business Logic Patterns');

/*
STEP 6A: Type this validation function:
function validateStudyBlocks(blocks: StudyBuilderBlock[]) {
  const errors = [];
  
  // Check for welcome block
  if (!blocks.some(block => 

EXPECTED RESULT: Copilot should suggest:
- block.type === 'welcome'
- Understanding of required blocks pattern

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 6A:



/*
STEP 6B: Type this thank you block logic:
function ensureThankYouBlock(blocks: StudyBuilderBlock[]) {

EXPECTED RESULT: Copilot should understand:
- Check if thank you block exists
- Append thank you block if missing
- Set proper order (blocks.length)

TYPE IT HERE: ⬇️
*/

// Your typing space for Exercise 6B:



// =============================================================================
// RESULTS EVALUATION
// =============================================================================

console.log('\n📊 TRAINING SESSION COMPLETE!');

/*
EVALUATION CHECKLIST - Check off what Copilot suggested correctly:

□ StudyBuilderBlock interface with correct properties
□ All 13 block types (welcome, open_question, opinion_scale, etc.)
□ Action-based API routing (const { action } = req.query)
□ Authentication patterns with role requirements
□ Supabase RLS patterns (.eq('researcher_id', userId))
□ crypto.randomUUID() for ID generation
□ ResearchHub-specific component props
□ Proper TypeScript typing throughout
□ Warning against creating new API files
□ Designated test account suggestions
□ Block validation business logic
□ Thank you block automatic appending logic

SCORE: ___/12 suggestions worked correctly

If you got 8+ correct suggestions, the prompts are working excellently! 🎉
If you got 5-7, they're working but may need refinement
If you got <5, we need to troubleshoot the prompt activation
*/

// =============================================================================
// NEXT STEPS FOR DAILY DEVELOPMENT
// =============================================================================

/*
NOW THAT YOU'VE SEEN THE PROMPTS IN ACTION:

1. 🚀 START USING IN REAL WORK:
   - Open actual ResearchHub files
   - Let Copilot guide your typing
   - Trust the ResearchHub-specific suggestions

2. 📝 RECOGNIZE PROMPT-POWERED SUGGESTIONS:
   - More specific than generic Copilot
   - Follows ResearchHub patterns exactly
   - Enforces architectural constraints

3. 🎯 INTEGRATE INTO WORKFLOW:
   - Type less, accept more suggestions
   - Use suggested patterns consistently
   - Let prompts guide architecture decisions

4. 🔧 CUSTOMIZE AS NEEDED:
   - If patterns don't match, update prompt files
   - Add new patterns as you discover them
   - Keep prompts current with codebase evolution
*/

export {};  // Make this a module