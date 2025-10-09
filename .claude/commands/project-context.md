# PROJECT_CONTEXT.md — Continuous Project Memory 
 **📖 How to Update**                            

 **Quick update**: Manually add compressed session entry (5-10 lines) 
 **AI-assisted**: Type `/session-end` and approve generated summary   
 **Keep brief**: Document decisions, not implementation details 
A single source of truth for project status, decisions, and session history. 


### Session X: YYYY-MM-DD (Brief Title)

**Work Done:**
- Bullet 1 (what was accomplished)
- Bullet 2 (what was built/changed)

**Key Decisions:** (only NEW decisions)
- Decision 1
- Decision 2

**Status:** [Complete / In Progress / Blocked]

---

## What to Update in PROJECT_CONTEXT.md

1. Add new session entry (above) to the Session Log section
2. Update "Current Focus" if the goal changed
3. Add to "Open Questions" if new blockers emerged
4. Update "Next Steps" checklist with remaining work

## What NOT to Include
- ❌ Detailed implementation steps (→ already in commit messages)
- ❌ Code snippets (→ in git history)
- ❌ Explanations of known architecture (→ in CLAUDE.md)
- ❌ Duplicate information already documented

## Keep It Brief
- Session entry: 5–10 lines max
- Focus on what changed, not how
- Document decisions, not implementation details