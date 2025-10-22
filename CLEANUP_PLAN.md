# Project Documentation Cleanup Plan

**Created:** 2025-10-22
**Status:** Ready to Execute
**Estimated Time:** 15-20 minutes

---

## 📊 Current State Analysis

**Total files in root:** 35+ files (docs, scripts, SQL, HTML)
**Issues identified:**
- ❌ Bubble and Next.js files mixed together
- ❌ 3 versions of header scripts (v1, v2, v3)
- ❌ SQL migration files scattered in root
- ❌ Obsolete documentation (completed steps, outdated guides)
- ❌ No clear separation between production (Bubble) and reference (Next.js)

---

## 🎯 Goal: Clear Separation

```
Root = Project essentials only
bubble/ = Bubble.io production implementation
nextjs/ = Next.js reference implementation
```

---

## 📁 New Directory Structure

```
water-interactive-map/
├── README.md                           # Project overview
├── CLAUDE.md                           # AI assistant guide
│
├── bubble/                             # 🆕 Bubble.io implementation (PRODUCTION)
│   ├── README.md                       # Quick start guide
│   ├── scripts/
│   │   ├── page-header/
│   │   │   ├── bubble-freehand-header-v3-with-render.html  (active)
│   │   │   └── archive/
│   │   │       ├── bubble-freehand-header-v1.html
│   │   │       └── bubble-freehand-header-v2.html
│   │   └── workflows/
│   │       └── bubble-load-drawings.js
│   └── docs/
│       ├── BUBBLE_IMPLEMENTATION_PLAN.md       # Master roadmap
│       ├── STEP_4_LOAD_DRAWINGS.md            # Step 4 reference
│       └── freehand_draw_investigation_report.md
│
├── nextjs/                             # 🆕 Next.js reference implementation
│   ├── README.md                       # Next.js quick start
│   ├── docs/
│   │   ├── AGENTS.md
│   │   ├── DATABASE.md
│   │   ├── SUPABASE_SETUP.md
│   │   ├── SUPABASE_DEPLOYMENT.md
│   │   └── VERCEL_DEPLOYMENT.md
│   ├── scripts/
│   │   ├── cleanup_blob_urls.js
│   │   └── migrate-drawings.js
│   └── sql/
│       ├── supabase-schema.sql
│       ├── supabase-migration-contact-fields-fixed.sql
│       ├── supabase-migration-contact-fields.sql
│       ├── supabase-migration-contact-privacy.sql
│       ├── supabase-migration-issues.sql
│       └── supabase-migration-privacy-complete.sql
│
├── docs/                               # Project-wide documentation
│   ├── PROJECT_CONTEXT.md
│   ├── SESSION_UPDATE_WORKFLOW.md
│   └── archive/
│       ├── REFERENCE_BUBBLE_TRANSFORMATION_PLAN.md
│       ├── REFERENCE_PRD_Interactive_Map_Feature.txt
│       └── DOCUMENTATION_CLEANUP_SUMMARY.md (optional: keep or delete)
│
├── backups/                            # 🆕 Data backups
│   └── drawings-backup.json
│
├── .claude/                            # Claude commands (keep as-is)
├── src/                                # Next.js source (keep as-is)
├── public/                             # Assets (keep as-is)
├── templates/                          # Templates (keep as-is)
└── [config files]                      # package.json, tsconfig.json, etc.
```

---

## ✅ Execution Checklist

### Phase 1: Create New Folders

```bash
# Create main folders
mkdir -p bubble/scripts/page-header/archive
mkdir -p bubble/scripts/workflows
mkdir -p bubble/docs
mkdir -p nextjs/docs
mkdir -p nextjs/scripts
mkdir -p nextjs/sql
mkdir -p backups
mkdir -p docs/archive
```

---

### Phase 2: Move Bubble.io Files

**Active Files:**
```bash
# Move main implementation plan
mv docs/BUBBLE_IMPLEMENTATION_PLAN.md bubble/docs/

# Move freehand investigation
mv docs/freehand_draw_investigation_report.md bubble/docs/

# Move Step 4 guide
mv STEP_4_LOAD_DRAWINGS.md bubble/docs/

# Move active header script
mv bubble-freehand-header-v3-with-render.html bubble/scripts/page-header/

# Move workflow script
mv bubble-load-drawings.js bubble/scripts/workflows/
```

**Archive old versions:**
```bash
# Move old header versions to archive
mv bubble-freehand-header.html bubble/scripts/page-header/archive/bubble-freehand-header-v1.html
mv bubble-freehand-header-v2.html bubble/scripts/page-header/archive/
```

---

### Phase 3: Move Next.js Files

**Documentation:**
```bash
mv AGENTS.md nextjs/docs/
mv DATABASE.md nextjs/docs/
mv SUPABASE_SETUP.md nextjs/docs/
mv SUPABASE_DEPLOYMENT.md nextjs/docs/
mv VERCEL_DEPLOYMENT.md nextjs/docs/
```

**Scripts:**
```bash
mv cleanup_blob_urls.js nextjs/scripts/
mv migrate-drawings.js nextjs/scripts/
```

**SQL Files:**
```bash
mv supabase-schema.sql nextjs/sql/
mv supabase-migration-contact-fields-fixed.sql nextjs/sql/
mv supabase-migration-contact-fields.sql nextjs/sql/
mv supabase-migration-contact-privacy.sql nextjs/sql/
mv supabase-migration-issues.sql nextjs/sql/
mv supabase-migration-privacy-complete.sql nextjs/sql/
```

---

### Phase 4: Move Backups & Archive

```bash
# Move backup data
mv drawings-backup.json backups/

# Archive outdated docs (if keeping)
mv docs/DOCUMENTATION_CLEANUP_SUMMARY.md docs/archive/
```

---

### Phase 5: Delete Obsolete Files

```bash
# Delete completed/duplicate workflow guides
rm BUBBLE_WORKFLOW_GUIDE.md          # Completed Steps 3-5, info in IMPLEMENTATION_PLAN
rm BUBBLE_FREEHAND_GUIDE.md          # Duplicate of WORKFLOW_GUIDE
rm STEP_3_QUICK_REFERENCE.md         # Info in IMPLEMENTATION_PLAN
rm STEP_4_TESTING.md                 # Testing info in IMPLEMENTATION_PLAN

# Delete testing/dev-only scripts
rm bubble-test-render.js             # Testing script, not production
```

---

### Phase 6: Create README Files

**Create bubble/README.md:**
```markdown
# Bubble.io Implementation

Production implementation of Water Infrastructure Interactive Map for Bubble.io.

## Quick Start

1. **Page Header Script:** Copy `scripts/page-header/bubble-freehand-header-v3-with-render.html`
2. **Load Drawings:** Use `scripts/workflows/bubble-load-drawings.js`
3. **Implementation Guide:** See `docs/BUBBLE_IMPLEMENTATION_PLAN.md`

## Current Status

✅ Phase 3 (Step 3-5): Freehand drawing, load, selection - **COMPLETE**
🚧 Phase 3 (Step 6+): Additional drawing tools - **NEXT**

## Documentation

- **BUBBLE_IMPLEMENTATION_PLAN.md** - Complete 8-week roadmap
- **STEP_4_LOAD_DRAWINGS.md** - Step 4 reference guide
- **freehand_draw_investigation_report.md** - Technical research

## Scripts

- **page-header/** - Scripts to inject in Bubble page header
- **workflows/** - JavaScript for Bubble workflows
```

**Create nextjs/README.md:**
```markdown
# Next.js Reference Implementation

Reference implementation using Next.js 15, React 19, and Supabase.

## Purpose

This is the **reference implementation** used to:
- Define exact feature behavior
- Test complex interactions
- Extract patterns for Bubble implementation

## Quick Start

```bash
npm install
npm run dev
```

See `docs/` for deployment and database setup.

## Documentation

- **AGENTS.md** - Client/server architecture rules
- **DATABASE.md** - SQLite implementation
- **SUPABASE_SETUP.md** - Supabase migration guide
- **VERCEL_DEPLOYMENT.md** - Deployment instructions
```

---

### Phase 7: Update Main Documentation

**Update CLAUDE.md** with new paths:
```markdown
## 📚 Documentation Map

| Document | Purpose | Location |
|----------|---------|----------|
| **CLAUDE.md** | AI assistant guide | Root |
| **BUBBLE_IMPLEMENTATION_PLAN.md** | Bubble roadmap | bubble/docs/ |
| **PROJECT_CONTEXT.md** | Session history | docs/ |
| **AGENTS.md** | Next.js architecture | nextjs/docs/ |
```

**Update README.md** with new structure:
```markdown
## 📁 Project Structure

- `bubble/` - Bubble.io production implementation
- `nextjs/` - Next.js reference implementation
- `src/` - Next.js source code
- `docs/` - Project-wide documentation
```

---

## 🎯 Expected Result

**Root directory after cleanup:**
```
.claude/
.git/
backups/
bubble/
docs/
nextjs/
public/
src/
templates/
CLAUDE.md
README.md
CLEANUP_PLAN.md
[config files: package.json, tsconfig.json, etc.]
```

**Total files in root: ~15** (down from 35+)

---

## ✅ Verification Checklist

After cleanup, verify:

- [ ] `bubble/` contains only Bubble.io files
- [ ] `nextjs/` contains only Next.js files
- [ ] Root contains only essential project files
- [ ] All paths in CLAUDE.md updated
- [ ] README.md reflects new structure
- [ ] bubble/README.md exists with quick start
- [ ] nextjs/README.md exists with quick start
- [ ] No broken references in documentation
- [ ] Git tracks all moved files (use `git mv` if possible)

---

## 🔄 Rollback Plan

If issues occur, restore from git:
```bash
git checkout .
git clean -fd
```

Or manually move files back using this plan in reverse.

---

## 📝 Notes

- Keep `templates/bubble.io-techlead-agents.md` - may be useful template
- Keep `.DS_Store` files or add to `.gitignore` (macOS metadata)
- Archive old header versions instead of deleting (may need reference)
- SQL files moved to nextjs/sql/ as they're Supabase-specific (Next.js backend)

---

**Ready to execute in next session!** 🚀
