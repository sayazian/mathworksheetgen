# Learning Project Prompt — Example Template

I want us to work together to build a project that doubles as a learning
exercise and a portfolio piece. Read this entire prompt before responding —
the structure matters as much as the goals.

## The project

**What we're building:** A "math worksheet generator" — a full-stack web app where
I can enter a math topic and receive a worksheet.

**Why this project:** It has real domain shape (not a todo clone), exercises
auth, CRUD, relational data, an LLM integration, and a public/private
permission model — enough surface area to demonstrate competence without
sprawling into a multi-month build.

**Stack:** React + TypeScript on the frontend, you choose the backend.

**Scope discipline:** If a feature isn't on this list, we don't build it
without an explicit conversation. Feature creep is the enemy.

## My background

I'm familiar with Java, JavaScript (the language, not the React ecosystem),
and MySQL. I've built backend services and CRUD apps before. I have **not**
worked with React, TypeScript, the modern JS tooling ecosystem (Vite, npm
workspaces, etc.), or Postgres specifically. Translate from what I know
rather than starting from zero — when you introduce a React concept, anchor
it in something I'd recognize from Java/JS where the analogy holds, and flag
where the analogy breaks.

## How we'll work — read this carefully


## Deliverables (in order)

Before any application code:

1. A **PRD** — one page, in the repo, covering scope, user stories, non-goals.
2. An **architecture doc** — one page, the box-and-arrow version. Components,
   data flow, where the LLM call lives.
3. A **task breakdown** — milestones with rough order. We'll work through
   these one at a time.

Then we build, and as we go we add:

4. **ADRs** for non-obvious decisions (why Supabase over raw Postgres, why
   this state management approach, etc.). Two to four total is plenty.
5. A **README** that a stranger could follow to run the project, and that
   an interviewer could skim to understand what it is and what I learned.
6. **Tests** — at least the critical-path stuff. Not 100% coverage theater.
7. **A deployed URL.**

Finally, after we ship:

8. A **retrospective** where *I* explain back to *you* what I learned, what
   surprised me, and what I'd do differently. You critique my retrospective
   and point out things I'm still fuzzy on. This is the most important step
   — don't let me skip it.

## On the AI-development meta-goal

I want to learn the workflow, not just use it. So:

- When you use a particular prompting technique or workflow pattern (PRP,
  spec-first, etc.), name it and briefly explain why it fits the moment.
- Maintain a running `AI_WORKFLOW.md` in the repo where we capture the
  patterns we used and when they worked or didn't. This becomes part of
  the portfolio.
- Periodically point out moments where you would have done something
  differently if I'd prompted you better — those are the highest-leverage
  lessons.

## Guardrails

- **Don't over-engineer.** If you reach for a library or pattern, justify
  it against the simpler alternative. "Industry standard" isn't a reason
  by itself.
- **Time-box research.** When you research something, spend the equivalent
  of ~10 minutes and summarize the 2–3 options before recommending one.
  Don't disappear into a research spiral.
- **Push back on me.** If I ask for something that's a bad idea given the
  goals above, say so. Sycophantic agreement is worse than useless here.
- **Flag your uncertainty.** When you're guessing about a current best
  practice or library API, say so and verify before we depend on it.

## What I want from your first response

Don't start coding. Don't even start the PRD yet. First response should be:

1. Any clarifying questions about the project scope or my background that
   would meaningfully change the plan.
2. A proposed week-by-week (or session-by-session) plan at the milestone
   level — what we tackle first, what builds on what, where the natural
   "stop and refactor" points are.
3. A flag for any part of this prompt you think is unrealistic or in
   tension with the others, before we commit to it.

Then we'll go from there.
