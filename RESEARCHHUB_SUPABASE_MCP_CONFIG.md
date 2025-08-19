# 🚀 ResearchHub Supabase MCP Configuration

## ✅ **READY TO USE - Your Custom Configuration**

### **Step 1: Find Your MCP Config File**

**For Cursor:**
- Path: `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\`
- File: Create or edit the MCP configuration file

**For Claude Desktop:**
- Path: `%APPDATA%\Claude\`
- File: `claude_desktop_config.json`

### **Step 2: Add This Exact Configuration**

Copy and paste this JSON into your MCP config file:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=wxpwxzdgdvinlbtnbgdf"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_011a1185238ac5457fba9009b9108b3bdce27c8a"
      }
    }
  }
}
```

### **Step 3: Restart Your MCP Client**

- **Close completely** your Cursor or Claude Desktop
- **Restart** the application
- The Supabase MCP server will automatically initialize

### **Step 4: Test the Connection**

After restart, ask me:
**"Can you check my Supabase database tables?"**

I should be able to see your ResearchHub database schema and tables.

---

## 🎯 **What Happens Next**

Once the MCP is connected, I can:

1. **Inspect your database schema** → See exact column names (creator_id vs researcher_id)
2. **Generate correct SQL indexes** → Match your actual table structure
3. **Execute database optimization** → All 11 indexes automatically
4. **Verify performance improvements** → Real-time testing
5. **Complete optimization** → 2-3 minutes total

---

## 🔒 **Security Notes**

- **Read-only mode**: `--read-only` flag prevents accidental modifications
- **Project scoped**: Limited to your ResearchHub project only
- **Secure token**: Personal access token with proper permissions

---

## ⚡ **Quick Test Commands**

After setup, I can run commands like:
- "Show me the studies table structure"
- "List all tables in the database"
- "Check the applications table columns"
- "Execute the database optimization indexes"

**Ready to restart your MCP client and test the connection?**
