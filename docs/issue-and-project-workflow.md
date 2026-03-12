# Issue and Project Workflow

This document defines the **standard workflow for issues, labels, and project status**. It is intended for maintainers, contributors, and automation tools working within the repository. It is designed for a pnpm monorepo where work may span multiple packages.

---

## Table of Contents

- [Issue Title Format](#issue-title-format)
- [Label System](#label-system)
    - [Type](#type)
    - [Utility](#utility)
    - [Scope](#scope)
    - [Category (Optional)](#category-optional)
    - [Domain (Optional)](#domain-optional)
- [Issue Template](#issue-template)
  - [Field: Issue Type](#field-issue-type)
  - [Field: Scope](#field-scope)
  - [Field: Category](#field-category)
  - [Field: Domain](#field-domain)
  - [Issue Body Structure](#issue-body-structure)
- [GitHub Project](#github-project)
  - [Status Field](#status-field)
  - [Automation Rules](#automation-rules)
  - [Milestones](#milestones)
- [Pull Requests](#pull-requests)
- [Developer Workflow](#developer-workflow)
  - [Workflow Process](#workflow-process)
  - [Branch Naming](#branch-naming)
  - [Philosophy](#philosophy)

---

## Issue Title Format

Standard title format:

```txt
<scope>: <short summary>
```

Examples:

```txt
ui: evidence pane should support pinned items
core: proposal dedupe logic incorrect
api-server: proposal endpoint should validate schemaId
repo: standardize issue label automation
ui: explore lazy loading for evidence pane
```

Scope corresponds to the monorepo package name or a repository-level scope.

---

## Label System

Labels are divided into structured groups. Each issue should normally have **one `type` label and one `scope` label**. `category`, `domain`, and `utility` labels are optional and should be added only when they improve filtering or triage.

Each label group uses a shared color in GitHub so labels are easier to scan:

| Prefix     | Color     | Purpose                              |
| ---------- | --------- | ------------------------------------ |
| `type`     | `#70cc53` | Kind of work                         |
| `scope`    | `#6f42c1` | Where in the monorepo                |
| `category` | `#0e8a16` | Cross-cutting technical area         |
| `domain`   | `#e99695` | Feature area or product system       |
| `utility`  | `#fbca04` | Workflow and triage helpers          |

---

### Type

Type identifies what kind of work the issue represents.

| Label         | Meaning                             | When to Use                                    |
| ------------- | ----------------------------------- | ---------------------------------------------- |
| 🐛 bug        | Something broken or incorrect       | Incorrect behavior, regressions, errors        |
| ✨ feature    | New functionality                   | Adds capability or new behavior                |
| 🔧 task       | General development work            | Maintenance, investigation, small improvements |
| ♻️ refactor   | Internal code restructuring         | Improves structure without changing behavior   |
| 📝 docs       | Documentation work                  | README, guides, comments                       |
| 🧹 chore      | Maintenance or tooling work         | Formatting, dependency updates, config         |
| 💡 idea       | Future concept or rough improvement | Brainstorming or non-actionable items          |

---

### Utility

Utility labels help with workflow and triage rather than describing the work itself.

| Label              | Meaning              | When to Use                                          |
| ------------------ | -------------------- | ---------------------------------------------------- |
| 📌 stub            | Placeholder issue    | Quick capture with incomplete description            |
| 🏷️ needs-triage    | Needs classification | Type, scope, or category is still unclear            |
| 🚧 blocked         | Work cannot proceed  | Waiting on a dependency, decision, or external work  |

---

### Scope

Scope identifies **where the work lives in the monorepo**. In most cases this maps directly to a package name without the npm scope prefix. `repo` is the exception — it covers cross-cutting work that spans multiple packages.

| Label                | Maps To                     | When to Use                                                |
| -------------------- | --------------------------- | ---------------------------------------------------------- |
| 🗂️ root             | `@gbt/root`                 | Workspace root scripts or config                           |
| 🔀 repo             | cross-cutting               | CI, build, repo policy, or work spanning multiple packages |
| 🛝 playground       | `@operator/playground`      | Playground application                                     |
| 🗄️ adapter-drizzle  | `@operator/adapter-drizzle` | Drizzle adapter changes                                    |
| 💾 adapter-local    | `@operator/adapter-local`   | Local adapter changes                                      |
| � api-client       | `@operator/api-client`      | API client or SDK work                                     |
| 🖥️ api-server       | `@operator/api-server`      | API server work                                            |
| ⚙️ core             | `@operator/core`            | Core logic                                                 |
| 🗃️ store            | `@operator/store`           | Data or state layer                                        |
| 🧩 ui               | `@operator/ui`              | UI, components, or interaction work                        |

---

### Category (Optional)

Category describes the **cross-cutting technical area** the issue concerns, regardless of which package it lives in.

| Label          | Meaning                | When to Use                                        |
| -------------- | ---------------------- | -------------------------------------------------- |
| 🏗️ build       | Build system           | tsc, pnpm, Vite, Rollup, tsup, or packaging config |
| 🤖 ci          | Continuous integration | GitHub Actions, release workflows, or automation   |
| 📦 deps        | Dependency management  | Upgrades or dependency cleanup                     |
| 🛠️ dx          | Developer experience   | Linting, formatting, local tooling, editor setup   |
| 🔒 security    | Security               | Auth, secrets, permissions, or vulnerability fixes |
| ⚡ perf        | Performance            | Profiling or performance optimization              |

---

### Domain (Optional)

Domain describes the **product or feature area** the issue concerns. It is distinct from `scope` (which package owns the code) and `category` (which technical layer). An issue can have both `scope:ui` and `domain:evidence` — they answer different questions.

| Label                  | Meaning                        | When to Use                              |
| ---------------------- | ------------------------------ | ---------------------------------------- |
| 🎨 ui                  | General UI / layout            | Styling, layout, or generic UI work      |
| 🔬 evidence            | Evidence system                | Evidence pane, items, or attachments     |
| 📋 proposals           | Proposal system                | Proposal pane, ranking, or submission    |
| 🕓 patch-history       | Patch and history              | Undo/redo, patch log, or history view    |
| 📎 attachments         | Attachments                    | File or media attachments to evidence    |
| 📐 schema-form         | Schema and form rendering      | JSON Schema, Zod, or form field logic    |
| 🌐 api                 | API layer                      | Endpoints, request handling, or clients  |
| 🧪 dev-environment     | Developer environment          | Local setup, tooling, or dev config      |
| 📖 storybook           | Storybook                      | Stories, addon config, or visual testing |

---

## Issue Template

The following describes how **GitHub issue template fields map to the label system above**.

### Field: Issue Type

Dropdown maps to a `type:*` label (lowercase slug of the selected option):

```txt
Feature      → type:feature
Bug          → type:bug
Task         → type:task
Refactor     → type:refactor
Docs         → type:docs
Chore        → type:chore
Idea         → type:idea
```

### Field: Scope

Dropdown maps to a `scope:*` label (must match Scope labels above):

```txt
root
repo
playground
adapter-drizzle
adapter-local
api-client
api-server
core
store
ui
```

### Field: Category

Dropdown maps to a `category:*` label (optional):

```txt
build
ci
deps
dx
security
perf
```

### Field: Domain

Dropdown maps to a `domain:*` label (optional). These correspond to the original subsystem selector:

```txt
UI                → domain:ui
Evidence System   → domain:evidence
Proposal System   → domain:proposals
Patch / History   → domain:patch-history
Attachments       → domain:attachments
Schema / Form     → domain:schema-form
API               → domain:api
Dev Environment   → domain:dev-environment
Storybook         → domain:storybook
```

### Issue Body Structure

```md
## Summary
Short description of the problem or feature.

## Requirements
- [ ] Required work item
- [ ] Required work item

## Notes
Extra context, links, screenshots, or examples.
```

Optional sections when needed:

```md
## Open Questions
Anything still uncertain.

## Blockers
- Blocked by #123
- Depends on #456
```

Issue links use `#<number>` — GitHub will render them as clickable references. Use `Closes #123` or `Fixes #123` in a pull request to auto-close the issue on merge.

> **VS Code tip:** Markdown task lists in issues can be converted to tracked sub-issues using the lightbulb action that appears when you hover a `- [ ]` checkbox item.

---

## GitHub Project

TODO: add project URL and project ID here

Issues appear as project cards and move across the board as work progresses. The Status field represents the Kanban column.

### Status Field

| Status        | Meaning                            | Trigger           |
| ------------- | ---------------------------------- | ----------------- |
| 📥 Inbox      | Newly created issue                | Issue created     |
| 📋 Backlog    | Captured but not yet prioritized   | Initial triage    |
| ✅ Ready      | Clearly defined and ready to start | Maintainer review |
| 🔨 In Progress | Development started               | Branch created    |
| 👀 In Review  | Pull request opened                | PR linked         |
| 🎉 Done       | Work merged or completed           | PR merged         |

### Automation Rules

- Issue created → `Status = Inbox`
- Branch created → `Status = In Progress`
- Pull request opened → `Status = In Review`
- Pull request merged → `Status = Done`

### Milestones

Milestones represent **larger goals or releases** that group related issues together.

A milestone typically corresponds to:

- a planned release
- a major feature set
- a project phase

Examples:

```txt
v0.1 MVP
v0.2 Schema Editor
v0.3 API Stabilization
```

Recommended usage:

- Assign milestones to issues that contribute to a release
- Track progress via the milestone completion percentage
- Close the milestone when the release is shipped

---

## Pull Requests

Issues and pull requests serve different purposes.

- **Issues** represent planning and tracked work.
- **Pull requests** represent implementation and review.

Recommended relationship:

1. Open an issue first for planned work.
2. Create a branch from the issue when work starts (GitHub's "Create a branch" button on the issue page does this directly).
3. Open a pull request that links the issue.
4. Merge the pull request to complete the issue.

Useful linking keywords in PR descriptions:

```txt
Closes #123
Fixes #123
Related to #123
Blocked by #123
```

When a PR uses a closing keyword, GitHub automatically closes the linked issue on merge.

---

## Developer Workflow

### Workflow Process

1. Create issue using template
2. Issue appears in **Inbox**
3. Triage → move to **Backlog** or **Ready**
4. Create branch from issue → moves to **In Progress**
5. Open PR → moves to **In Review**
6. Merge PR → moves to **Done**

### Branch Naming

```txt
feat/<scope>-short-desc
fix/<scope>-short-desc
refactor/<scope>-short-desc
docs/<scope>-short-desc
chore/<scope>-short-desc
```

Examples:

```txt
feat/ui-evidence-pane
fix/core-proposal-ranking
docs/repo-issue-workflow
```

### Philosophy

Issues represent **work planning**, not commits.

Commits may vary during development, but issues define:

- intent
- scope
- requirements

They serve as the durable planning layer.

