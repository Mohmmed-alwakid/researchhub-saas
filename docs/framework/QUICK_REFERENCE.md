# 🎯 Framework Quick Reference

## Commands
```bash
npm run start-improvement     # Start new improvement
npm run team-dashboard       # View team progress  
npm run update-progress     # Update completion %
npm run quality-gates       # Run all validators
npm run pre-deploy         # Pre-deployment check
```

## Quality Gates
- ✅ TypeScript compilation (0 errors)
- ✅ Automated validation passing
- ✅ All completion criteria met
- ✅ Code review completed

## Completion Criteria Guidelines
- **Specific**: "All buttons use design system"
- **Measurable**: "95% accessibility score"
- **Achievable**: Realistic scope
- **Relevant**: Impacts user/business value
- **Time-bound**: Clear completion definition

## Status Meanings
- **NOT_STARTED**: Criteria defined, work not begun
- **IN_PROGRESS**: Implementation in progress
- **COMPLETED**: All criteria met, quality gates passed

## Framework Files
- `.framework/` - Team framework tools
- `completion-tracking.json` - Progress data
- `scripts/` - Individual validators
- `docs/framework/` - Documentation
