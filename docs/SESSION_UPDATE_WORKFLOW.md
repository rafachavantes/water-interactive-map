# Session Update Workflow Guide

**Version**: 2.0
**Last Updated**: 2025-10-09

---

## 🎯 Quick Reference

**End of session? Choose one:**

1. **AI-Assisted** (recommended): Type `/session-end` → review → approve (30 seconds)
2. **Manual Quick**: Copy template from `.claude/commands/project-context.md` → fill in 2-3 bullets → save (2 minutes)

---

## 📋 Workflow Options

### Option 1: AI-Assisted (Recommended) ⚡

**Best for**: Regular sessions with code changes, discussions, or decisions

**Steps**:
1. At end of session, type: `/session-end`
2. AI generates compressed summary from conversation history
3. Review the generated entry
4. Approve or request edits
5. AI updates `docs/PROJECT_CONTEXT.md` automatically

**Time**: ~30 seconds

**Example**:
```
You: /session-end

Claude: Here's the summary for Session 5:

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

Does this look good? I'll add it to PROJECT_CONTEXT.md after you approve.
```

---

### Option 2: Manual Quick Update ✍️

**Best for**: Trivial sessions, quick fixes, or when AI isn't needed

**Steps**:
1. Open `.claude/commands/project-context.md` for template
2. Copy the session entry format
3. Fill in 2-3 bullet points of what was done
4. Paste to `docs/PROJECT_CONTEXT.md` under "Session Log"
5. Update "Last Updated" date

**Time**: ~2 minutes

**Template** (from `.claude/commands/project-context.md`):
```markdown
### Session X: YYYY-MM-DD (Brief Title)

**Work Done:**
- Bullet 1 (what was accomplished)
- Bullet 2 (what was built/changed)

**Key Decisions:** (only NEW decisions)
- Decision 1

**Status:** [Complete/In Progress/Blocked]
```

---

## ✅ What to Include

### DO Document:
- ✅ What was accomplished (2-3 bullets)
- ✅ NEW decisions made this session
- ✅ Files created/modified (high level)
- ✅ Status changes (blocked → unblocked, etc.)
- ✅ Commit hashes (if code was committed)

### DON'T Document:
- ❌ Detailed implementation steps (→ in commit messages)
- ❌ Code snippets (→ in git history)
- ❌ Known architecture explanations (→ in CLAUDE.md)
- ❌ Information already in BUBBLE_IMPLEMENTATION_PLAN.md
- ❌ How things were implemented (just what changed)

---

## 📏 Length Guidelines

**Target**: 5-10 lines per session entry

**Good Examples**:

✅ **Concise Session** (5 lines):
```markdown
### Session 3: 2025-10-09 (Bubble Feature Planning)

**Work Done:** Integrated "Create Entity from Drawing" into BUBBLE_IMPLEMENTATION_PLAN.md
**Decisions:** ✅ ValidEntityTypes option set, ✅ Admin-only workflow
**Status:** Feature documented
```

✅ **Standard Session** (8 lines):
```markdown
### Session 5: 2025-10-09 (Documentation Optimization)

**Work Done:**
- Streamlined CLAUDE.md: 47KB → 11KB (-77% reduction)
- Compressed PROJECT_CONTEXT.md session logs
- Archived obsolete docs with REFERENCE_ prefix

**Key Decisions:** Each doc now has single clear purpose
**Commits:** `de27033`
**Status:** Complete
```

❌ **Too Verbose** (50+ lines):
```markdown
### Session 5: 2025-10-09 (Documentation Optimization)

**Duration:** 2 hours
**Participants:** User (Rafa) + Claude Code
**Context:** User requested documentation cleanup due to token usage concerns...

**Activities:**
1. Analyzed all documentation files
2. Identified redundancies:
   - CLAUDE.md duplicated 80% of BUBBLE_IMPLEMENTATION_PLAN.md
   - PROJECT_CONTEXT had verbose session logs
   [continues for 40 more lines...]
```

---

## 🔄 Update Checklist

After adding session entry:

- [ ] Session entry added to "Session Log" section
- [ ] "Last Updated" date updated at bottom
- [ ] "Current Focus" updated if goal changed
- [ ] "Next Steps" updated with remaining work
- [ ] Entry is 5-10 lines (not 50+ lines)

---

## 📂 Where Things Are Documented

To avoid redundancy, know where information lives:

| Information Type | Document It In |
|------------------|----------------|
| Project overview, tech stack | CLAUDE.md |
| Bubble implementation phases | docs/BUBBLE_IMPLEMENTATION_PLAN.md |
| What happened in sessions | docs/PROJECT_CONTEXT.md |
| Code changes, how things work | Git commit messages |
| Next.js architecture rules | AGENTS.md |
| Freehand drawing technical proof | docs/freehand_draw_investigation_report.md |

**Rule of Thumb**: If it's already documented elsewhere, just reference it, don't duplicate it.

---

## 🗄️ Archive Strategy

**Every 10 sessions** (or when PROJECT_CONTEXT.md exceeds 20KB):

1. Create `docs/ARCHIVE_YYYY_QX_SESSIONS.md`
2. Move sessions 1-10 to archive file
3. Keep only last 5-10 sessions in PROJECT_CONTEXT.md
4. Add link to archive at top of SESSION_LOG section

**Example Archive Link**:
```markdown
## 📝 Session Log

> **Previous sessions**: See [ARCHIVE_2025_Q4_SESSIONS.md](ARCHIVE_2025_Q4_SESSIONS.md)

### Session 11: 2025-10-15 (Current)
...
```

---

## 💡 Tips for Better Session Updates

1. **Use AI-assisted when possible** - It's faster and more consistent
2. **Write session notes during work** - Don't try to remember everything at the end
3. **Focus on outcomes** - "Added feature X" not "Wrote 500 lines of code for feature X"
4. **Link to commits** - Let git messages explain the how
5. **Document decisions** - These are often forgotten and valuable later
6. **Be honest about status** - If blocked, say blocked (helps future you)

---

## 🚀 Quick Start

**First time?**

1. Type `/session-end` at end of this session
2. Review what AI generates
3. Approve it
4. Done! Use this workflow every session.

**Already familiar?**

Use `/session-end` for 90% of sessions. Only do manual updates for trivial sessions where AI would be overkill.

---

## 📊 Expected Results

**Before** (old verbose format):
- Time: 5 minutes to write session summary
- Length: 50-100 lines per session
- Duplication: High (repeating info from other docs)
- Token cost: ~2,000 tokens per session entry

**After** (new compressed format):
- Time: 30 seconds (AI-assisted) or 2 minutes (manual)
- Length: 5-10 lines per session
- Duplication: None (references other docs)
- Token cost: ~200 tokens per session entry

**Savings**: 90% less time, 90% fewer tokens, 100% clearer

---

**Questions?** See `.claude/commands/session-end.md` for the AI prompt template.
