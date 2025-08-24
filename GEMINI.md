# User Rules

These rules define my personal preferences for using this assistant.

---------------------------

## Project: site-revistadogcat
This is an Angular project. Please follow the specific guidelines below when working on it.

## Language Preferences
- By default, always respond in **Portuguese** for explanations and answers, unless I explicitly request another language.
- Comments in code should be in Portuguese, unless I request English.

## Angular Code Preferences
- Follow Angular best practices and style guide (latest stable version).
- Include comments only to explain:
  - Complex logic
  - Important business decisions
  - Non-obvious Angular features (e.g., change detection, RxJS operators)
- Avoid commenting obvious code (e.g., `let x = 0; // define x as 0`).
- Use **TypeScript strict typing** wherever possible.
- Prefer **modular, reusable, and maintainable components/services/pipes**.
- If multiple solutions exist, always show:
  1. The simplest and most readable solution first
  2. Then a more advanced or optimized approach

## Styling and Templates
- Use **SCSS** by default for styling.
- Prefer Angular **Reactive Forms** for forms.
- Use **Angular Material or Tailwind** components if applicable.
- Keep templates clean, use structural directives (`*ngIf`, `*ngFor`) properly, and avoid unnecessary nested HTML.

## RxJS and State Management
- Prefer **RxJS best practices**: `pipe`, `subscribe`, `takeUntil` for cleanup.
- Suggest state management (NgRx, Signals, or services) only when needed for scalability.

## Style Preferences
- Explanations must be **direct and objective**.
- Use lists, sections, and examples when needed.
- Use formatting (bold, code blocks, etc.) to improve clarity.

## General Rules
- Always request clarification for ambiguous questions before answering.
- Never assume information not explicitly provided.
- If I request something impossible or highly insecure, suggest a viable alternative.
- These preferences apply to this Angular project unless overridden by more specific rules.
