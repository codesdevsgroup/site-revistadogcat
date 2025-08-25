# User Rules

These rules define my personal preferences for using this assistant.

---------------------------

## Project: site-revistadogcat
This is an Angular 20+ project for a pet magazine website with administrative features. Please follow the specific guidelines below when working on it.

## Project Overview
- **Type**: Pet magazine website with content management system
- **Angular Version**: 20.1.7 (latest stable)
- **Main Features**: Article management, user authentication, pet registration (ExpoDog), subscriptions
- **Architecture**: Modular structure with public and admin areas
- **Build Tool**: Angular CLI with Bun support

## Language Preferences
- By default, always respond in **Portuguese** for explanations and answers, unless I explicitly request another language.
- Comments in code should be in Portuguese, unless I request English.
- All user-facing content and documentation should be in Portuguese.

## Angular Code Preferences
- Follow Angular best practices and style guide (v20+).
- Use **standalone components** as the default approach.
- Include comments only to explain:
  - Complex business logic
  - Important editorial/content management decisions
  - Non-obvious Angular features (e.g., change detection, RxJS operators)
  - API integrations and data transformations
- Avoid commenting obvious code (e.g., `let x = 0; // define x as 0`).
- Use **TypeScript strict typing** wherever possible.
- Prefer **modular, reusable, and maintainable components/services/pipes**.
- If multiple solutions exist, always show:
  1. The simplest and most readable solution first
  2. Then a more advanced or optimized approach

## Project Structure Guidelines
- **Pages**: Organize by public/admin areas
  - `src/app/pages/public/`: Public-facing pages (home, articles, expo-dog, etc.)
  - `src/app/pages/admin/`: Administrative pages (dashboard, user management, etc.)
- **Components**: Reusable UI components in `src/app/components/`
- **Services**: Business logic and API communication in `src/app/services/`
- **DTOs/Interfaces**: Type definitions in respective folders

## Styling and Templates
- Use **SCSS** by default for styling (configured in angular.json).
- **Bootstrap 5.3.6** is available globally for layout and components.
- Prefer Angular **Reactive Forms** for all forms.
- Keep templates clean, use structural directives (`*ngIf`, `*ngFor`) properly.
- Follow responsive design principles for mobile-first approach.
- Use semantic HTML for better accessibility.

## Rich Text Editing
- **TipTap** is configured for rich text editing in articles.
- Available extensions: code blocks, colors, fonts, images, links, text alignment, etc.
- **ngx-markdown** is available for markdown rendering.
- **marked** library is available for markdown parsing.

## RxJS and State Management
- Prefer **RxJS best practices**: `pipe`, `subscribe`, `takeUntil` for cleanup.
- Use Angular Signals for simple state management when appropriate.
- Suggest NgRx only for complex state scenarios.
- Always unsubscribe from observables to prevent memory leaks.

## API and Data Management
- Follow RESTful API conventions.
- Use proper HTTP error handling.
- Implement loading states for better UX.
- Use TypeScript interfaces for API responses.
- Follow the documented API specifications in `/public/docs/`.

## Security and Authentication
- Implement proper route guards for admin areas.
- Use JWT tokens for authentication.
- Validate user permissions before allowing actions.
- Sanitize user inputs, especially in rich text editors.

## Performance Guidelines
- Use OnPush change detection strategy when possible.
- Implement lazy loading for feature modules.
- Optimize images and assets.
- Use trackBy functions in *ngFor loops.

## Testing Guidelines
- Write unit tests for complex business logic.
- Test components with user interactions.
- Mock external dependencies and APIs.
- Follow Angular testing best practices.

## Style Preferences
- Explanations must be **direct and objective**.
- Use lists, sections, and examples when needed.
- Use formatting (bold, code blocks, etc.) to improve clarity.
- Provide code examples relevant to the pet magazine context.

## General Rules
- Always request clarification for ambiguous questions before answering.
- Never assume information not explicitly provided.
- If I request something impossible or highly insecure, suggest a viable alternative.
- Consider the pet magazine context when providing solutions.
- Reference existing documentation in `/public/docs/` when relevant.
- These preferences apply to this Angular project unless overridden by more specific rules.
