# 🔄 Story ID Migration Script

> **Automated migration tool for updating story IDs to new unique system**

## 📋 **MIGRATION STRATEGY**

### **Step 1: Pattern Replacement Map**
```bash
# For 02_USER_RESEARCH_ENGINE.md (UE- prefix)
Story 1.1 → UE-001
Story 1.2 → UE-002  
Story 1.3 → UE-003
Story 2.1 → UE-004
Story 2.2 → UE-005
Story 2.3 → UE-006
Story 3.1 → UE-007
Story 3.2 → UE-008
Story 4.1 → UE-009

# For 03_PARTICIPANT_MANAGEMENT.md (PM- prefix)
Story 1.1 → PM-001
Story 1.2 → PM-002
Story 1.3 → PM-003
# ... continue pattern

# For 04_STUDY_EXECUTION.md (SE- prefix)  
Story 1.1 → SE-001
Story 1.2 → SE-002
Story 1.3 → SE-003
# ... continue pattern
```

### **Step 2: Enhanced Story Template**
Add these fields to each story:
```markdown
**Epic**: [Epic Name]
**Feature Area**: [Feature Area Name]  
**Related Stories**: [List related story IDs]
**Dependencies**: [List dependent story IDs]
**Stakeholders**: [List stakeholders]
**User Roles**: [Primary role], [Secondary roles]
```

### **Step 3: Cross-Reference Updates**
Update all story references to use new IDs:
```bash
# Replace old references
"Story 1.1" → "UE-001"
"Story 2.1 (Analytics)" → "AI-001"
"Participant Quality (PM)" → "PM-003"
```

## 🎯 **AUTOMATED MIGRATION COMMANDS**

### **PowerShell Migration Script**
```powershell
# Navigate to requirements directory
cd "docs\requirements"

# For each file, replace story patterns
$files = @(
    @{File="02_USER_RESEARCH_ENGINE.md"; Prefix="UE-"},
    @{File="03_PARTICIPANT_MANAGEMENT.md"; Prefix="PM-"},
    @{File="04_STUDY_EXECUTION.md"; Prefix="SE-"},
    @{File="05_ANALYTICS_INSIGHTS.md"; Prefix="AI-"},
    @{File="06_ENTERPRISE_FEATURES.md"; Prefix="EF-"},
    @{File="07_INTEGRATIONS_API.md"; Prefix="IA-"},
    @{File="08_MOBILE_EXPERIENCE.md"; Prefix="ME-"},
    @{File="09_MONETIZATION_BILLING.md"; Prefix="MB-"}
)

foreach ($item in $files) {
    $content = Get-Content $item.File -Raw
    
    # Replace story patterns (1.1, 1.2, etc.)
    for ($i = 1; $i -le 9; $i++) {
        for ($j = 1; $j -le 9; $j++) {
            $oldPattern = "Story $i.$j"
            $newPattern = $item.Prefix + "{0:D3}" -f (($i-1)*10 + $j)
            $content = $content -replace [regex]::Escape($oldPattern), $newPattern
        }
    }
    
    # Save updated content
    Set-Content -Path $item.File -Value $content -Encoding UTF8
}
```

## 📊 **MIGRATION CHECKLIST**

### **File Updates Required**
- [ ] **02_USER_RESEARCH_ENGINE.md** → UE-001 to UE-008
- [ ] **03_PARTICIPANT_MANAGEMENT.md** → PM-001 to PM-009  
- [ ] **04_STUDY_EXECUTION.md** → SE-001 to SE-012
- [ ] **05_ANALYTICS_INSIGHTS.md** → AI-001 to AI-009
- [ ] **06_ENTERPRISE_FEATURES.md** → EF-001 to EF-009
- [ ] **07_INTEGRATIONS_API.md** → IA-001 to IA-007
- [ ] **08_MOBILE_EXPERIENCE.md** → ME-001 to ME-012
- [ ] **09_MONETIZATION_BILLING.md** → MB-001 to MB-015

### **Story Template Enhancement**
- [ ] Add Epic field to all stories
- [ ] Add Feature Area field to all stories
- [ ] Add Related Stories cross-references
- [ ] Add Dependencies tracking
- [ ] Add Stakeholders list
- [ ] Add User Roles specification

### **Cross-Reference Updates**
- [ ] Update 00_MASTER_INDEX.md with story registry
- [ ] Fix all story links between files
- [ ] Update role-based story indexes
- [ ] Validate all cross-references work

### **Quality Assurance**
- [ ] Verify all story IDs are unique globally
- [ ] Check that numbering follows sequential pattern
- [ ] Ensure all cross-references are valid
- [ ] Test Notion import compatibility

## 🎯 **NEXT STEPS**

1. **Run Migration Script**: Use PowerShell script to batch update all files
2. **Manual Review**: Check each file for accuracy and completeness
3. **Add Metadata**: Enhance stories with new template fields
4. **Update Cross-References**: Fix all story links throughout documentation
5. **Create Story Registry**: Add comprehensive table to master index
6. **Test Import**: Validate Notion import works correctly

---

**Estimated Time**: 2-3 hours for complete migration
**Priority**: High - Enables proper story tracking and team collaboration
**Owner**: Product Management Team
