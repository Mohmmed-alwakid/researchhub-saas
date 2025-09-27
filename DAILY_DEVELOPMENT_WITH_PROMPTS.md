# 🚀 Daily Development Workflow with GitHub Copilot Prompts

## **Your New Development Routine**

This guide shows you exactly how to integrate the GitHub Copilot prompts into your daily ResearchHub development work.

---

## 📅 **Morning Development Routine**

### **1. Open VS Code & Verify Prompts**
```bash
# Your morning checklist:
✅ Open ResearchHub project in VS Code
✅ Verify GitHub Copilot is enabled (bottom status bar)
✅ Check .github/prompts/ folder exists with 3 files
✅ Verify .vscode/settings.copilot.json is configured
```

### **2. Pick Your Development Task**
The prompts automatically activate based on what you're working on:

| **Working On** | **Prompt Activates** | **You Get Suggestions For** |
|---|---|---|
| Study Builder components | `study-builder.md` | Block types, interfaces, validation |
| API handlers | `api-development.md` | Action routing, auth, RLS patterns |
| Any ResearchHub file | `global-context.md` | Architecture, constraints, patterns |

---

## 🧩 **When Building Study Components**

### **Before (Without Prompts)**
```typescript
// You typed everything from scratch
interface Props {
  // Had to remember all properties manually
  data: any;
  callback: Function;
}

function MyComponent() {
  // Generic patterns only
  const [state, setState] = useState();
}
```

### **After (With Prompts)**
```typescript
// Start typing - Copilot suggests ResearchHub patterns
interface StudyBuilderProps {
  blocks: StudyBuilderBlock[];        // ← Copilot suggests this
  onBlocksChange: (blocks: StudyBuilderBlock[]) => void;  // ← And this
  studyId: string;                    // ← And this
}

function StudyBuilder({ blocks, onBlocksChange }: StudyBuilderProps) {
  const [selectedBlock, setSelectedBlock] = useState<StudyBuilderBlock | null>(null); // ← Proper types
  
  // Copilot suggests block validation patterns
  const validateBlocks = (blocks: StudyBuilderBlock[]) => {
    return blocks.every(block => block.type && block.title); // ← ResearchHub logic
  };
}
```

**🎯 What to do:** Just start typing interfaces and component functions. Accept Copilot's ResearchHub-specific suggestions.

---

## 🔌 **When Working on APIs**

### **Before (Without Prompts)**
```javascript
// Generic API handler
export default async function handler(req, res) {
  // Had to remember patterns manually
  if (req.method === 'POST') {
    // Basic patterns
  }
}
```

### **After (With Prompts)**
```javascript
// Start typing - Copilot immediately suggests ResearchHub patterns
export default async function handler(req, res) {
  try {
    const { action } = req.query; // ← Copilot suggests this immediately
    
    switch (action) {             // ← And this pattern
      case 'get-studies':         // ← And ResearchHub actions
        const auth = await authenticateUser(req, ['researcher']); // ← Role patterns
        // ... Copilot suggests the rest
    }
  } catch (error) {
    return res.status(500).json({ // ← Consistent error format
      success: false,
      error: error.message
    });
  }
}
```

**🎯 What to do:** Start with `export default async function handler` and let Copilot guide you through ResearchHub API patterns.

---

## 🧪 **Quick Daily Tests**

### **Morning Prompt Check (30 seconds)**
Open any `.tsx` file and type:
```typescript
interface StudyBuilderBlock {
```
**Expected:** Copilot should suggest `id: string; type: BlockType; order: number;`

### **API Pattern Check (30 seconds)**  
Open any API file and type:
```javascript
export default async function handler(req, res) {
```
**Expected:** Copilot should suggest `const { action } = req.query;`

**If these work → prompts are active! ✅**
**If not → check VS Code Copilot settings**

---

## 💡 **Recognizing Prompt-Powered Suggestions**

### **✅ Good Signs (Prompts Working)**
- Suggests `StudyBuilderBlock` interface with exact properties
- Knows all 13 block types (`welcome`, `open_question`, etc.)
- Suggests `crypto.randomUUID()` for IDs
- Suggests action-based API routing
- Suggests `authenticateUser(req, ['researcher'])`
- Warns about creating new API files (12-function limit)
- Suggests designated test accounts only

### **❌ Warning Signs (Prompts Not Working)**
- Generic interface suggestions
- Doesn't know ResearchHub block types
- Suggests `Math.random()` for IDs
- Basic API patterns only
- No authentication pattern awareness
- No constraint enforcement

---

## 🎯 **Practical Development Scenarios**

### **Scenario 1: Adding a New Block Type**
1. **Open** `src/types/blocks.ts` (or similar)
2. **Type** `type BlockType =`
3. **See** Copilot suggest all current block types
4. **Add** your new type to the list
5. **Navigate** to block validation logic
6. **Type** `switch (block.type) {`
7. **See** Copilot suggest cases for all block types including your new one

### **Scenario 2: Creating API Endpoint**
1. **Open** `api/research-consolidated.js`
2. **Find** the switch statement
3. **Add** new case: `case 'your-new-action':`
4. **Type** `return await handleYourNewAction(req, res);`
5. **Create** the handler function
6. **Type** `const auth = await authenticateUser(`
7. **See** Copilot suggest proper role requirements

### **Scenario 3: Building New Component**
1. **Create** new `.tsx` file in `src/components/`
2. **Type** component name with "Study" or "Block" in it
3. **See** Copilot activate study-builder prompts
4. **Type** interface and see ResearchHub-specific suggestions
5. **Type** component function and see proper patterns

---

## 🔧 **Troubleshooting**

### **If Prompts Don't Seem to Work:**

1. **Check Copilot Status**
   - Look at VS Code bottom status bar
   - Should show GitHub Copilot icon
   - Click it to ensure it's enabled

2. **Verify File Locations**
   ```bash
   # These files should exist:
   .github/prompts/global-context.md
   .github/prompts/study-builder.md
   .github/prompts/api-development.md
   .vscode/settings.copilot.json
   ```

3. **Restart VS Code**
   - Sometimes needed after configuration changes
   - Prompts should activate on restart

4. **Check Settings**
   - Open VS Code Settings (Ctrl+,)
   - Search "copilot instructions"
   - Ensure "Use Instruction Files" is enabled

---

## 📈 **Measuring Success**

### **Daily Development Metrics**
Track these to see prompt effectiveness:

- **Typing Speed**: Less typing, more accepting suggestions
- **Pattern Consistency**: More ResearchHub patterns in code
- **Constraint Adherence**: Fewer architectural mistakes
- **Development Flow**: Less context switching to check patterns

### **Weekly Review Questions**
- Are Copilot suggestions more ResearchHub-specific?
- Do I need to look up patterns less often?
- Am I making fewer architectural mistakes?
- Is my code more consistent with ResearchHub standards?

---

## 🚀 **Your Next Development Session**

1. **Open** a real ResearchHub file you need to work on
2. **Start typing** as normal
3. **Pause** when Copilot shows suggestions
4. **Look for** ResearchHub-specific patterns
5. **Accept** suggestions that follow our architecture
6. **Trust** the constraint enforcement (like API limits)
7. **Enjoy** faster, more consistent development!

**Remember: The prompts work invisibly. Just type and trust the enhanced suggestions!** 🎉

---

*Last updated: September 27, 2025*
*Status: Production ready for daily use*