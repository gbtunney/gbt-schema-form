# Suggested GitHub Issue Workflow

1. Save the planning docs under `docs/planning/`.
2. Add the issue form under `.github/ISSUE_TEMPLATE/`.
3. Create the labels listed in the GitHub native issue spec.
4. Turn on project auto-add workflows if desired.
5. Use Copilot Chat or the GitHub CLI to convert sections into issues.

## Copilot prompt — create issues

```text
Read docs/planning/operator-editor-github-issue-spec.md and create one GitHub issue for each numbered issue.
Use the exact titles, labels, and body structure.
After creating the issues, add each issue to the Operator Editor project.
Set Status to Inbox.
Set Subsystem based on the issue title and body.
Set Priority to Medium unless the issue is clearly urgent.
```

## Copilot prompt — organize the project

```text
Review the issues in the Operator Editor project.
For each issue, set the Subsystem field to the best match, set Status to Inbox, Spec, Ready, In Progress, or Done based on the issue body, and flag obvious bugs as High priority.
Do not rename issues unless the title is unclear.
```
