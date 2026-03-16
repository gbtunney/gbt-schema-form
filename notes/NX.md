# 🌸 Nx ↔️ pnpm Equivalency Table

This table maps **Nx** concepts to the standard **pnpm/npm** world you already know.

| **Nx Term**   | **pnpm / npm Equivalent** | **What it actually is**                                              |
| :------------ | :------------------------ | :------------------------------------------------------------------- |
| **Target**    | `script`                  | A task defined in `package.json` (e.g., `build`, `test`).            |
| **Executor**  | `command`                 | The tool running the task (e.g., `vite`, `tsc`, or `nx:run-script`). |
| **Project**   | `workspace package`       | A folder with a `package.json` or `project.json`.                    |
| **Affected**  | `git diff`                | Only the projects changed since `main`.                              |
| **Cache**     | `node_modules/.cache`     | Stored results so you never run the same `build` twice.              |
| **Inputs**    | `files` / `env`           | The files Nx watches to decide if it needs to re-run a task.         |
| **DependsOn** | `pre-scripts`             | Tells Nx: "Don't build me until my dependencies are built."          |

---

### ✨ Real-World Example

If your `@operator/core/package.json` looks like this:

```json
{
  "name": "@operator/core",
  "scripts": {
    "build:ts": "tsc --build"
  }
}
```
