# 🚀 Supabase MCP Setup Guide for ResearchHub

## ⚡ Quick Setup (5 minutes)

This will enable direct database access for automated optimization.

### **Step 1: Get Your Supabase Credentials (2 minutes)**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Get Project Reference ID**:
   - Open your ResearchHub project
   - Go to Settings → General
   - Copy the "Project ID" (looks like: `abcdefghijklmnopqrst`)

3. **Create Personal Access Token**:
   - Go to Account Settings → Access Tokens
   - Click "Generate new token"
   - Name it: "Cursor MCP Server"
   - Copy the token (you won't see it again!)

### **Step 2: Configure MCP Client (2 minutes)**

**For Windows with Cursor/Claude Desktop:**

1. **Find your MCP config file**:
   - Cursor: `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\`
   - Claude Desktop: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add this configuration**:

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
        "--project-ref=YOUR_PROJECT_ID_HERE"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN_HERE"
      }
    }
  }
}
```

3. **Replace the placeholders**:
   - `YOUR_PROJECT_ID_HERE` → Your Project ID from Step 1
   - `YOUR_ACCESS_TOKEN_HERE` → Your Access Token from Step 1

### **Step 3: Restart Your MCP Client (30 seconds)**

- Close and restart Cursor/Claude Desktop
- The Supabase MCP server will automatically start

### **Step 4: Test Connection (30 seconds)**

Ask me: "Can you check my Supabase tables?"

I should be able to see your database schema and tables.

---

## 🎯 What This Enables

After setup, I can:
- ✅ **Inspect your database schema** automatically
- ✅ **Fix the creator_id error** by seeing actual column names
- ✅ **Create optimized indexes** directly in your database
- ✅ **Verify performance improvements** in real-time
- ✅ **Complete database optimization** in 2-3 minutes

---

## 🔒 Security Settings

The configuration above uses:
- `--read-only` flag for safety (I can only read, not modify without permission)
- `--project-ref` to limit access to only your ResearchHub project
- Personal access token (more secure than project API keys)

---

## 🚀 Alternative: Manual Setup

If you prefer not to set up MCP right now, we can continue manually:
1. Run the diagnostic query I provided
2. Share the results
3. I'll create corrected SQL commands
4. You execute them in Supabase

---

## 📞 Need Help?

If you encounter any issues:
1. Check that Node.js is installed: `node -v`
2. Verify the config file syntax (JSON must be valid)
3. Ensure the paths are correct for your system
4. Try restarting your MCP client

**Ready to proceed with MCP setup?**
