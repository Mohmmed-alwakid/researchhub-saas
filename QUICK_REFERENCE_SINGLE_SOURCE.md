# 🎯 QUICK REFERENCE: SINGLE SOURCE OF TRUTH

## ⚡ Fast Rules

**When you need to know HOW something works:**

1. ✅ **CHECK `docs/requirements/` FIRST** 
2. ❌ **Don't search everywhere**
3. ✅ **If unclear, update requirements**
4. ❌ **Don't create parallel documentation**

---

## 📍 Where to Find What

| **What you need** | **Where to look** |
|-------------------|-------------------|
| How study creation works | `docs/requirements/04-STUDY_CREATION_SYSTEM.md` |
| Authentication flow | `docs/requirements/02-AUTHENTICATION_SYSTEM.md` |
| User roles & permissions | `docs/requirements/03-USER_MANAGEMENT_SYSTEM.md` |
| API specifications | `docs/requirements/09-INTEGRATIONS_API_ECOSYSTEM.md` |
| Database schemas | Any relevant requirements file |
| UI components | Relevant requirements file |
| Implementation status | `docs/reports/` (secondary source) |
| Test results | `testing/` (validation only) |

---

## 🚨 Information Hierarchy

```
1. docs/requirements/     ← THE TRUTH
2. docs/implementation/   ← Implementation notes  
3. docs/reports/         ← Status updates
4. testing/              ← Validation
5. Everything else       ← Context/Archive
```

---

## ✅ Do's and ❌ Don'ts

### ✅ **DO:**
- Start with requirements when researching
- Update requirements when system changes
- Reference requirements in implementation docs
- Use requirements as API contracts

### ❌ **DON'T:**
- Create conflicting specifications elsewhere
- Assume implementation reports are authoritative
- Build features not defined in requirements
- Change behavior without updating requirements

---

**Remember: If it's not in `docs/requirements/`, it's not official!**
