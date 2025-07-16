## Navis MVP Frontend Build: Tech Stack, Coding Preferences, and Project Scope

This document guides all frontend development queries and contributions for the Navis MVP, especially when using GitHub Copilot. It aligns with Navis’s product vision, technical requirements, and best practices.

---

## Overview

Navis is developing an AI-powered customer service and sales platform focused on real-time call transcription, live RAG (Retrieval-Augmented Generation) assistance, and actionable analytics. The MVP frontend must deliver a fast, intuitive, and extensible user experience for agents and admins, supporting workflows like live call handling, ticket management, and analytics dashboards.

---

## Tech Stack

- **Framework:** React (version 18 or higher) for scalable, component-driven user interfaces.
- **State Management:** Redux Toolkit for predictable and scalable state management.
- **Styling:** Tailwind CSS for utility-first, rapid prototyping and a consistent design system.
- **UI Primitives:** Headless UI or Radix UI for accessible, unopinionated components such as modals and popovers.
- **Forms:** React Hook Form for fast, scalable form handling with validation and error management.
- **API Communication:** Axios or Fetch for promise-based HTTP client functionality and RESTful API integration.
- **Authentication:** Auth0 or Firebase Auth for secure, scalable authentication (if required for MVP).
- **Testing:** Jest and React Testing Library for reliable unit and integration testing.
- **Development Tools:** ESLint, Prettier, and Husky to enforce code quality, formatting, and pre-commit checks.
- **Deployment:** Vercel or Netlify for fast CI/CD, preview deployments, and custom domain support.

---

## Coding Preferences

- Use functional components and React Hooks only; avoid class components.
- Prefer TypeScript for all new code. If TypeScript is not possible, use JSDoc for type hints.
- Build modular, reusable components that follow the single responsibility principle.
- Design for responsive layouts by default (mobile-first).
- Abstract all business logic and API calls away from UI components.
- Use Tailwind utility classes for all styling; avoid inline styles and CSS-in-JS unless necessary.

**File/Folder Structure:**
- `src/components/` for reusable UI components.
- `src/pages/` for route-level components.
- `src/store/` for Redux slices and store configuration.
- `src/hooks/` for custom React hooks.
- `src/services/` for API clients and business logic.
- `src/styles/` for Tailwind configuration and global styles.
- `src/utils/` for helper functions.

**Code Quality:**
- All code must pass ESLint and Prettier checks before merging.
- Write unit tests for all logic-heavy components and utilities.
- Use meaningful commit messages following the Conventional Commits style.
- Document all exported functions and components with JSDoc or TypeScript types.

**Accessibility:**
- Ensure all interactive elements are keyboard accessible.
- Use semantic HTML and ARIA attributes where appropriate.
- Test critical workflows with screen readers.

**Collaboration:**
- Develop all new features and bugfixes in feature branches, merged via pull requests.
- Require at least one code review for each pull request before merging.
- Use GitHub Issues for all tasks and bugs; link pull requests to relevant issues.

---

## Project Scope 

**Core User Flows:**
- Agent Dashboard: View active tickets, join/leave calls, and see live transcription and AI suggestions.
- Live Call Window: Two-pane UI—one for real-time transcript/notes, one for RAG-powered answers/scripts.
- Ticket Management: Create, assign, and resolve tickets, attaching call data and AI insights to each ticket.
- Analytics Dashboard: Display call metrics, sentiment analysis, script adherence, and agent performance.
- Admin Panel: Manage users, view aggregate analytics, and configure workflows (if time permits).

**Key Features:**
- Real-time updates via WebSocket or polling for call and transcript data.
- Dynamic RAG output formatting (newbie, intermediate, experienced modes).
- Responsive UI for desktop and mobile.
- Basic authentication (if required for MVP).
- Error handling and loading states for all asynchronous actions.

**Out of Scope (for MVP):**
- Advanced CRM integrations beyond basic ticketing.
- Full-featured notification system.
- Extensive settings or customization panels.

---

**Attach or reference this document for all tech stack, coding, and scope questions. If a query is out of scope or requires backend changes, flag it and suggest a follow-up with the backend team. Prioritize clarity, maintainability, and alignment with Navis’s product vision in all code and design decisions.**