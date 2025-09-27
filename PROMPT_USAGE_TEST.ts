/**
 * PROMPT TEST - Try typing these patterns in VS Code with Copilot enabled
 * Open this file in VS Code and start typing the patterns below
 */

// TEST 1: Type this and see what Copilot suggests
// interface StudyBuilderBlock {

// TEST 2: Type this and watch for 13 block type suggestions
// type BlockType = 

// TEST 3: Type this and see ResearchHub API pattern suggestions
// export default async function handler(req, res) {

// TEST 4: Type this and see authentication pattern suggestions
// const auth = await authenticateUser(

// TEST 5: Type this and see RLS pattern suggestions
// const { data, error } = await supabase.from('studies')

// TEST 6: Try creating a new API file - Copilot should WARN about 12-function limit!

console.log('🧪 Open this file in VS Code and try the patterns above!');
console.log('💡 You should see ResearchHub-specific suggestions from the prompts');

/*
EXPECTED BEHAVIORS:

1. When typing StudyBuilderBlock interface:
   - Should suggest: id, type, order, title, description, settings
   - Should know BlockType has 13 options

2. When typing API handler:
   - Should suggest: const { action } = req.query
   - Should suggest: switch (action) pattern
   - Should suggest: authenticateUser patterns

3. When typing Supabase queries:
   - Should suggest: .eq('researcher_id', userId) for RLS
   - Should understand study ownership patterns

4. When creating new files:
   - Should suggest proper locations (testing/, not tests/)
   - Should warn about API function limits

5. General ResearchHub awareness:
   - Should know about 13-block system
   - Should understand study creation workflows
   - Should enforce designated test accounts
*/