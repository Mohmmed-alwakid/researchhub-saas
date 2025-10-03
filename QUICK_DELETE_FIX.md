# 🎯 QUICK FIX: Delete Study Issue

**Problem:** Can't delete studies  
**Fix Time:** 5 minutes  
**Risk:** LOW

---

## 🚀 **DO THIS NOW (2 Steps)**

### **Step 1: Fix Frontend (1 minute)**

**File:** `src/client/services/studies.service.ts`  
**Line:** 138

**Change this:**
```typescript
async deleteStudy(studyId: string): Promise<{ success: boolean; message: string }> {
  return apiService.delete(`research-consolidated?action=delete-study&id=${studyId}`);
},
```

**To this:**
```typescript
async deleteStudy(studyId: string): Promise<{ success: boolean; message: string }> {
  return apiService.post(`research-consolidated?action=delete-study`, { id: studyId });
},
```

**What changed:** `delete` → `post` and moved ID from URL to body

---

### **Step 2: Fix Backend (1 minute)**

**File:** `api/research-consolidated.js`  
**Line:** ~505

**Change this:**
```javascript
const user = authResult.user;
const id = req.query.id || req.body.id;
```

**To this:**
```javascript
const user = authResult.user;
const { id } = req.body;
```

**What changed:** Only get ID from body (more reliable)

---

## ✅ **Test It (3 minutes)**

1. **Restart server:**
   - Press Ctrl+C in terminal
   - Run: `npm run dev:fullstack`

2. **Test delete:**
   - Go to http://localhost:5175
   - Login as researcher
   - Click delete on a study
   - Confirm deletion

3. **Expected result:**
   - ✅ Study deletes successfully
   - ✅ No error messages
   - ✅ Studies list refreshes

---

## 🎉 **Why This Works**

- **Problem:** DELETE requests with query parameters are unreliable
- **Solution:** Use POST with body (more reliable)
- **Result:** Delete functionality works perfectly

---

## 📝 **If It Works (Commit)**

```powershell
git add .
git commit -m "fix: Change delete study to POST for reliability"
git push origin main
```

---

## 🔄 **If It Breaks (Rollback)**

```powershell
git reset --hard HEAD
```

Then we'll try option 2.

---

**Ready to fix it?** Just make those 2 small changes and test! 🚀
