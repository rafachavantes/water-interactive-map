# Session End - Auto-Generate Summary

Read the conversation history from this session and generate a compressed summary for `docs/PROJECT_CONTEXT.md`.

## Instructions

1. **Identify session number**: Check the latest session in `docs/PROJECT_CONTEXT.md` and increment by 1

2. **Extract key points from this session**:
   - What tasks were completed?
   - What new decisions were made?
   - What files were created/modified?
   - What changed in project status?
   - Were there any git commits?

3. **Generate compressed entry** following this exact format:

```markdown
### Session X: YYYY-MM-DD (Brief Title)

**Work Done:**
- [2-3 bullet points of main accomplishments]

**Key Decisions:** (only if NEW decisions were made)
- [List only NEW decisions, skip this section if none]

**Commits:** [commit hash(es) if any]
**Status:** [Complete/In Progress/Blocked]
```

4. **Show me the formatted entry** for my approval before making any changes

5. **After I approve**, you should:
   - Add the entry to the "Session Log" section in `docs/PROJECT_CONTEXT.md`
   - Update the "Last Updated" date at the bottom
   - Update "Current Focus" if the project goal changed
   - Update "Next Steps" if needed

## Important Rules

- Keep entry to **5-10 lines MAX** (not counting the template structure)
- Focus on **WHAT changed**, not HOW it was implemented
- **Omit** information already documented in CLAUDE.md or BUBBLE_IMPLEMENTATION_PLAN.md
- Only document **NEW** decisions (don't repeat known architecture/patterns)
- If the session was just questions/discussion with no changes, create a 2-line entry
- Use the exact format shown above (don't add extra sections)

## Example Good Entry

```markdown
### Session 5: 2025-10-09 (Documentation Optimization)

**Work Done:**
- Streamlined CLAUDE.md: 47KB → 11KB (-77% reduction)
- Compressed PROJECT_CONTEXT.md session logs
- Archived obsolete docs with REFERENCE_ prefix

**Key Decisions:**
- Each doc now has single clear purpose (no duplication)
- AI-assisted session updates via /session-end command

**Commits:** `de27033`
**Status:** Complete
```

## Example Too Verbose (Don't Do This)

```markdown
### Session 5: 2025-10-09 (Documentation Optimization)

**Duration:** 2 hours
**Participants:** User + Claude
**Context:** User requested documentation cleanup...

**Activities:**
1. Analyzed all documentation files for redundancy
2. Identified 80% duplication between CLAUDE.md and BUBBLE_IMPLEMENTATION_PLAN.md
3. Created new streamlined CLAUDE.md with the following sections:
   - Project Overview
   - Documentation Map
   [continues for 50+ lines...]
```

---

Now generate the summary for the current session and show it to me for approval.
