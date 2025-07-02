## Agentic Coding Agents Guide

This document provides guidelines for AI agents to effectively contribute to this repository.

### Build and Test Commands

- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type Check**: `npm run check`
- **Format**: `npm run format`

There is no specific command for running a single test. Use `npm run check` to type-check the entire project.

### Code Style

- **Formatting**: Code is formatted with Prettier. Use tabs, single quotes, and a print width of 100.
- **Imports**: Imports are organized by `prettier-plugin-organize-imports`.
- **Types**: All code must be strictly typed, as defined in `tsconfig.json`.
- **Naming Conventions**: Use camelCase for variables and functions, and PascalCase for Svelte components.
- **Error Handling**: Use try/catch blocks for asynchronous operations and throw errors where appropriate.
- **Components**: Create components in their own directories with an `index.ts` file to export them.
- **Dependencies**: Use `pnpm` for package management.

## Development Workflow: Spec → Code

THESE INSTRUCTIONS ARE CRITICAL!

They dramatically improve the quality of the work you create.

### Phase 1: Requirements First

When asked to implement any feature or make changes, ALWAYS start by asking:
"Should I create a Spec for this task first?"

IF user agrees:

- Create a markdown file in `.opencode/scopes/FeatureName.md`
- Interview the user to clarify:
- Purpose & user problem
- Success criteria
- Scope & constraints
- Technical considerations
- Out of scope items

### Phase 2: Review & Refine

After drafting the Spec:

- Present it to the user
- Ask: "Does this capture your intent? Any changes needed?"
- Iterate until user approves
- End with: "Spec looks good? Type 'GO!' when ready to implement"

### Phase 3: Implementation

ONLY after user types "GO!" or explicitly approves:

- Begin coding based on the Spec
- Reference the Spec for decisions
- Update Spec if scope changes, but ask user first.

### File Organization

\`\`\`

.opencode/
├── scopes/
│ ├── FeatureName.md # Shared/committed Specs
│ └── .local/ # Git-ignored experimental Specs
│ └── Experiment.md

\`\`\`

**Remember: Think first, ask clarifying questions, _then_ code. The Spec is your north star.**

(source: https://lukebechtel.com/blog/vibe-speccing)
