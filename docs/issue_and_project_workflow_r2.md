# Issue and Project Workflow r2

This document defines the standard workflow for issues, labels, templates, and project status. It is intended for maintainers, contributors, and automation working within the repository. It assumes a pnpm monorepo where work may span multiple packages.

TODO: add table of contents if this gets much longer

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
```

Scope corresponds to the monorepo package name or a repository-level scope.

## Label System

Labels are divided into structured groups. Each issue should normally have one `type` label and one `scope` label. `category` and `utility` labels are optional and should be added only when they improve filtering or triage.

### Label Prefix Groups

These are the four label groups used in this repository.

```txt
type
scope
category
utility
```

### Label Colors

Each label group should use a shared color in GitHub so labels are easier to scan.

```txt
type      #70cc53
scope     #6f42c1
category  #0e8a16
utility   #fbca04
```

These colors apply to all labels within each group.

## Labels

### Type

Type identifies what kind of work the issue represents.

| Label    | Meaning                             | When to Use                                    |
| -------- | ----------------------------------- | ---------------------------------------------- |
| bug      | Something broken or incorrect       | Incorrect behavior, regressions, errors        |
| feature  | New functionality                   | Adds capability or new behavior                |
| task     | General development work            | Maintenance, investigation, small improvements |
| refactor | Internal code restructuring         | Improves structure without changing behavior   |
| docs     | Documentation work                  | README, guides, comments                       |
| chore    | Maintenance or tooling work         | Formatting, dependency updates, config         |
| idea     | Future concept or rough improvement | Brainstorming or non-actionable items          |

### Utility

Utility labels help with workflow and triage rather than describing the work itself.

| Label        | Meaning              | When to Use                                         |
| ------------ | -------------------- | --------------------------------------------------- |
| stub         | Placeholder issue    | Quick capture with incomplete description           |
| needs-triage | Needs classification | Type, scope, or category is still unclear           |
| blocked      | Work cannot proceed  | Waiting on a dependency, decision, or external work |

### Scope

Scope identifies where the work lives in the monorepo. In most cases, this should map directly to a package name without the npm scope prefix.

| Label           | Maps To                     | When to Use                                                |
| --------------- | --------------------------- | ---------------------------------------------------------- |
| root            | `@gbt/root`                 | Workspace root scripts or config                           |
| repo            | cross-cutting               | CI, build, repo policy, or work spanning multiple packages |
| playground      | `@operator/playground`      | Playground application                                     |
| adapter-drizzle | `@operator/adapter-drizzle` | Drizzle adapter changes                                    |
| adapter-local   | `@operator/adapter-local`   | Local adapter changes                                      |
| api-client      | `@operator/api-client`      | API client or SDK work                                     |
| api-server      | `@operator/api-server`      | API server work                                            |
| core            | `@operator/core`            | Core logic                                                 |
| store           | `@operator/store`           | Data or state layer                                        |
| ui              | `@operator/ui`              | UI, components, or interaction work                        |

### Category

Category is optional. It describes the conceptual area of work rather than the package it lives in.

| Label    | Meaning                | When to Use                                        |
| -------- | ---------------------- | -------------------------------------------------- |
| build    | Build system           | tsc, pnpm, Vite, Rollup, tsup, or packaging config |
| ci       | Continuous integration | GitHub Actions, release workflows, or automation   |
| deps     | Dependency management  | Upgrades or dependency cleanup                     |
| dx       | Developer experience   | Linting, formatting, local tooling, editor setup   |
| security | Security               | Auth, secrets, permissions, or vulnerability fixes |
| perf     | Performance            | Profiling or performance optimization              |

TODO: decide whether the current system-area dropdown should stay under `category` or become a separate field such as `domain`

## Issue Template Mapping

This section describes how GitHub issue template fields map to the label system.

### Issue Type

The issue form should collect a high-level issue type and map it to a `type:*` label.

Recommended dropdown:

```txt
Feature
Bug
Task
Refactor
Docs
Chore
Idea
```

Maps to (label uses the lowercase slug form of the selected option):

```txt
type:<slug>
```

### Scope

The issue form should collect the monorepo scope and map it to a `scope:*` label.

Dropdown options:

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

Maps to:

```txt
scope:*
```

### Category or Domain

This is the part that currently needs a naming decision.

Your original subsystem list is not the same thing as scope. It describes a conceptual feature area, not a package. In this document, that is closer to a domain or system area than to scope.

If you want to keep only the current four label groups, this list fits best under `category`, but the values should be normalized. If you want clearer separation, rename the field to `Domain` in the issue template and map it to `category:*` labels behind the scenes.

Recommended normalized values based on your original list:

```txt
ui
evidence
proposals
patch-history
attachments
schema-form
api
dev-environment
storybook
```

Suggested user-facing dropdown labels:

```txt
UI
Evidence System
Proposal System
Patch / History
Attachments
Schema / Form
API
Dev Environment
Storybook
```

Maps to:

```txt
category:*
```

TODO: decide whether the label prefix should remain `category:` or become `domain:`

## Issue Body Structure

Each issue should use a lightweight structure that is still detailed enough to plan work.

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

This keeps the default issue body short while still allowing structured follow-up when needed.

TODO: add note about VS Code lightbulb support for converting markdown task lists into tracked sub-issues or linked issues where applicable TODO: add note about issue linking with `#123` TODO: verify whether checklist items in README can create issues directly, or whether that requires GitHub tasklist conversion from issues/PRs instead

## Pull Request Relationship

Issues and pull requests serve different purposes.

Issues represent planning and tracked work.

Pull requests represent implementation and review.

Recommended relationship:

- open an issue first for planned work
- create a branch from the issue when work starts
- open a pull request that links the issue
- merge the pull request to complete the issue

Useful linking patterns:

```txt
Closes #123
Fixes #123
Related to #123
Blocked by #123
```

When a pull request uses a closing keyword such as `Closes #123`, GitHub can automatically close the linked issue when the pull request is merged.

## GitHub Project

TODO: add project URL and project metadata here

### Status Field

These statuses belong to the GitHub Project status field, not to issue labels.

Issues appear as project cards and move across the board as work progresses.

| Status      | Meaning                            | Trigger           |
| ----------- | ---------------------------------- | ----------------- |
| Inbox       | Newly created issue                | Issue created     |
| Backlog     | Captured but not yet prioritized   | Initial triage    |
| Ready       | Clearly defined and ready to start | Maintainer review |
| In Progress | Development started                | Branch created    |
| In Review   | Pull request opened                | PR linked         |
| Done        | Work merged or completed           | PR merged         |

### Automation Rules

Recommended GitHub Project automation:

- Issue created -> `Status = Inbox`
- Branch created -> `Status = In Progress`
- Pull request opened -> `Status = In Review`
- Pull request merged -> `Status = Done`

### Milestones

Milestones represent larger goals or releases that group related issues together.

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

Use milestones to answer:

- What work belongs to the same release?
- How close is a release to completion?

Recommended usage:

- assign milestones to issues that contribute to a release
- track progress via milestone completion percentage
- close the milestone when the release ships

Milestones are optional but useful for medium- and long-term planning across multiple issues.

## Developer Workflow

### Workflow Process

This is the normal issue-to-merge lifecycle.

1. Create an issue using the template.
2. The issue appears in `Inbox`.
3. Triage the issue into `Backlog` or `Ready`.
4. Create a branch from the issue.
5. The issue moves to `In Progress`.
6. Open a pull request.
7. The issue moves to `In Review`.
8. Merge the pull request.
9. The issue moves to `Done`.

TODO: note that GitHub can create a branch directly from the issue UI TODO: decide whether to pin this workflow somewhere visible

### Branch Naming

Recommended branch naming:

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

## Philosophy

Issues represent planning, not commits.

Commits may vary during development, but issues define:

- intent
- scope
- requirements

They serve as the durable planning layer.

## Issue Template YAML

```yaml
name: Issue
description: Create a new tracked issue
labels: []
title: "[scope] short summary"
body:
  - type: dropdown
    id: issue_type
    attributes:
      label: Issue Type
      description: What kind of work is this?
      options:
        - Feature
        - Bug
        - Task
        - Refactor
        - Docs
        - Chore
        - Idea
    validations:
      required: true

  - type: dropdown
    id: scope
    attributes:
      label: Scope
      description: Which package or repository scope does this affect?
      options:
        - root
        - repo
        - playground
        - adapter-drizzle
        - adapter-local
        - api-client
        - api-server
        - core
        - store
        - ui
    validations:
      required: true

  - type: dropdown
    id: category
    attributes:
      label: Domain
      description: Which system area does this affect?
      options:
        - UI
        - Evidence System
        - Proposal System
        - Patch / History
        - Attachments
        - Schema / Form
        - API
        - Dev Environment
        - Storybook
    validations:
      required: false

  - type: textarea
    id: summary
    attributes:
      label: Summary
      description: Short description of the problem or request
      placeholder: Describe the issue briefly.
    validations:
      required: true

  - type: textarea
    id: requirements
    attributes:
      label: Requirements
      description: Checklist or acceptance criteria
      placeholder: |
        - [ ] Requirement 1
        - [ ] Requirement 2
    validations:
      required: false

  - type: textarea
    id: notes
    attributes:
      label: Notes
      description: Extra context, links, screenshots, blockers, or references
      placeholder: |
        Related to #123
        Blocked by #456
    validations:
      required: false
```

## Issue Template Markdown

```md
## Summary

Short description of the problem or feature.

## Requirements

- [ ] Required work item
- [ ] Required work item

## Notes

Extra context, links, screenshots, blockers, or references.

## Optional Links

- Related to #123
- Blocked by #456
```
