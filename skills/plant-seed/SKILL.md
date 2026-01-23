---
name: plant-seed
description: Context-based instant capture and enrichment workflow for planting idea seeds with Instant, Quick, and Deep modes. Use when a user says "plant seed", "new seed", "plant seed --deep", or wants to capture/tend an idea into NotePlan notes and update the index.
---

# Plant Seed Command

Plant ideas you want to tend - instant capture from context, with optional enrichment.

## Triggers
- "plant seed [idea]" → INSTANT mode
- "new seed [idea]" → INSTANT mode
- "plant seed --deep [idea]" → DEEP mode
- After planting: "fill gaps" / "explore" / "later"

## Three-Tier Approach

### Tier 1: INSTANT (Default) - Context-Based Capture
Extract from conversation, create seed immediately, no questions.

### Tier 2: QUICK - Fill Missing Pieces
Ask only for what context didn't capture.

### Tier 3: DEEP - Full Exploration
All questions for thorough context capture.

---

## DEFAULT: Instant Context-Based Planting

**When user says:** "plant seed [about X]"

### Your Process

**1. Extract from Context**

Scan the conversation (last 15-20 messages) for:
- **Core idea:** What is this seed about?
- **Why now:** What makes this timely? (current work, recent discussion, session focus)
- **Excitement:** Any mention of why this matters or excites them
- **Partners:** People or orgs mentioned in relation to this
- **Questions:** Curiosities or open questions they've mentioned
- **Ready conditions:** Any signals mentioned for when to act

**2. Create Seed File Immediately**

Create `$HOME/Library/Containers/co.noteplan.NotePlan-setapp/Data/Library/Application Support/co.noteplan.NotePlan-setapp/Notes/seeds/[seed-name-slug].md`:

```markdown
# [Seed Name]

**Status:** 🌱 Seed - Quick Capture
**Planted:** [YYYY-MM-DD]
**Context:** [What sparked this - conversation, project work, etc.]

## The Core Idea

[Extracted from conversation or user statement]

## Why This Excites Me

[Extracted from conversation or "To explore"]

## Why Now

**Current context:**
[Extracted from: current project work, recent work, session focus, or "Exploring timing"]

## What I'm Thinking About

[Questions/curiosities mentioned in conversation, or empty section to fill later]

## Potential Partners/Collaborators

[People/orgs mentioned, or "To discover"]

## When This Becomes Real

This moves from seed to project when:
- [ ] [Extracted condition or "To define"]
- [ ] [Additional condition or leave blank]

## Notes & Evolution

*Planted from conversation context - enrich as this develops*

---

**Related:**
[Link to related seeds, projects, or work if mentioned in context]
```

**3. Update Seeds Index**

Add to `$HOME/Library/Containers/co.noteplan.NotePlan-setapp/Data/Library/Application Support/co.noteplan.NotePlan-setapp/Notes/seeds/_seeds-index.md`:
```markdown
- [Seed Name](seed-name-slug.md) - 🌱 [One-line from core idea]
```

**4. Show What Was Captured**

```
✅ Seed planted: [Name]

Captured from context:
- [x] Core idea: [summary]
- [x] Why now: [from session/discussion]
- [?] Why this excites you: [if mentioned, else "To explore"]
- [ ] Ready conditions: [if mentioned, else "To define"]

Seed file: $HOME/Library/Containers/co.noteplan.NotePlan-setapp/Data/Library/Application Support/co.noteplan.NotePlan-setapp/Notes/seeds/[filename].md

Want to fill gaps (30 sec), explore deeper (5 min), or tend later?
```

**5. Offer Optional Enrichment**

User can:
- Say nothing / "later" → Done! Can edit file anytime
- "fill gaps" / "quick" → Go to QUICK mode
- "explore" / "deep" → Go to DEEP mode

---

## TIER 2: Quick Mode (Fill Missing Pieces)

**When:** User chooses "fill gaps" or context was minimal

**Ask only what's missing:**

1. **If core idea unclear:** "Tell me more about this seed - what's the core concept?"
2. **If excitement not captured:** "Why does this excite you?"
3. **If ready conditions missing:** "What would make this ready to become real?" (1-2 conditions)

**Then:**
- Update seed file with answers
- Confirm: "✅ Seed enriched with details!"

---

## TIER 3: Deep Mode (Full Exploration)

**When:** User chooses "explore" or "plant seed --deep"

Run full conversational workflow:

### 1. Understand the Seed
- What's the core concept?
- Why does this excite you?
- What sparked this idea?

### 2. Capture Context
- Why now? What makes this timely or relevant?
- What similar things have you done before (if any)?
- Who might this involve or benefit?
- What's different about your position/network/resources now vs before?

### 3. Explore the Potential
- What are you curious about with this idea?
- What questions do you want to think about?
- Who might be good partners or collaborators?
- What could this grow into?

### 4. Define "Ready"
- What would need to be true for this to move from seed to project?
- What signals would tell you it's time to move forward?

### 5. Create Rich Seed File

Use full template:

```markdown
# [Seed Name]

**Status:** 🌱 Seed - Deep Exploration
**Planted:** [YYYY-MM-DD]

## The Core Idea

[Detailed 1-2 sentence description]

## Why This Excites Me

[What makes this compelling, why it matters]

## Context & Background

[Any relevant history, similar past experiences, what sparked this]

## Why Now

**Current state:**
- [Your network/position/resources]
- [Market/community conditions]
- [Personal readiness/capacity]

**What's different:**
- [Changes that make this more viable/interesting now]

## What I'm Thinking About

- [Open questions]
- [Curiosities to explore]
- [Possibilities to consider]
- [Conversations to have]

## Potential Partners/Collaborators

- [People who might be interested]
- [Organizations that align]
- [Communities this could serve]

## Seeds This Could Grow

- [Possible forms this could take]
- [Different scales or scopes]
- [Related ideas this connects to]

## When This Becomes Real

This moves from seed to project when:
- [ ] [Condition 1]
- [ ] [Condition 2]
- [ ] [Condition 3]

## Notes & Evolution

[Capture thoughts, conversations, insights as this develops]

---

**Related Seeds:**
- [Link to related seeds if any]
```

### 6. Confirm
```
✅ Seed planted with full exploration: [Name]

Rich context captured:
- Core idea & background
- Why now & what's different
- Open questions & curiosities
- Potential partners & collaborators
- Ready conditions

Seed file: $HOME/Library/Containers/co.noteplan.NotePlan-setapp/Data/Library/Application Support/co.noteplan.NotePlan-setapp/Notes/seeds/[filename].md

Seeds show up in regular workflows - tend as thoughts evolve!
```

---

## Context Extraction Guidelines

### What to Look For

**In conversation history (last 15-20 messages):**
- User describing an idea or concept
- Mentions of why something matters
- Discussion of timing or opportunity
- Names of people or organizations
- Questions or curiosities expressed
- Conditions or milestones mentioned

**From session context:**
- Current project being worked on
- Recent work (what's top of mind)
- Active reminders (related ideas)
- Files recently opened/edited

### How to Extract

**Core idea:**
- Direct from user's statement: "plant seed about X"
- Or from recent discussion of X in conversation
- Extract essence in 1-2 sentences

**Why now:**
- Look for recent work context: "we've been working on Y, which relates to X"
- Session focus: "this came up while building Z"
- Default if unclear: "Exploring opportunity and timing"

**Excitement/Why this matters:**
- Look for: "I think this could...", "This is cool because...", "I'm excited about..."
- Infer from enthusiasm in discussion
- Default if not clear: "To explore and articulate"

**Partners:**
- Names mentioned in relation to idea
- Organizations discussed
- Communities this might serve
- Default: "To discover"

**Ready conditions:**
- Look for: "when X happens", "if Y is true", "once Z is in place"
- Mentioned milestones or signals
- Default: "To define"

---

## Guidelines

### For Instant Mode (Default)
- Capture what's available, mark what's missing
- Don't guess if context is unclear - mark as "To explore"
- Always create something immediately
- Make it easy to enrich later
- Show user what was captured vs what's unknown

### For All Modes
- Keep tone conversational and exploratory
- Don't push for action - seeds are about thinking
- Help articulate excitement, not just logistics
- Make files easy to return to and evolve
- Seeds should feel alive, not bureaucratic

---

## Example: Instant Mode in Action

**Conversation:**
```
User: "We should bring back Freelance Fest. It was such a cool format - inverted job fair where freelancers had booths and companies browsed. Did it in 2020 pre-COVID and it worked really well."

User: "plant seed"
```

**Andy extracts:**
- Core: Freelance Fest - inverted job fair (freelancers have booths, companies browse)
- History: Ran in 2020 pre-COVID, worked well
- Why now: Recent discussion about events (implied)
- Partners: Freelancers, companies (implied from format)

**Andy creates seed immediately, shows:**
```
✅ Seed planted: Freelance Fest

Captured from context:
- [x] Core idea: Inverted job fair where freelancers have booths, companies browse
- [x] Background: Ran successfully in 2020 pre-COVID
- [x] Format: Freelancers present, companies explore
- [ ] Why this excites you now: To explore
- [ ] What's different vs 2020: To explore
- [ ] Ready conditions: To define

Seed file: $HOME/Library/Containers/co.noteplan.NotePlan-setapp/Data/Library/Application Support/co.noteplan.NotePlan-setapp/Notes/seeds/freelance-fest.md

Want to fill gaps (30 sec), explore what's different now (5 min), or tend later?
```

**User says "later"** → Done! 5 seconds total, seed captured.

---

## Performance Targets

- **Instant mode:** <10 seconds (context extraction + file creation)
- **Quick mode:** <2 minutes (only missing pieces)
- **Deep mode:** ~8-10 minutes (thorough as today)

**Time savings vs current:**
- Instant: 99% faster (10 sec vs 8 min)
- Quick: 75% faster (2 min vs 8 min)
- Deep: Same quality, same time
