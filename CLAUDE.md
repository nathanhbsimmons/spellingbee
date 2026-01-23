# CLAUDE.md - AI Assistant Guide for Spelling Bee Project

**Last Updated:** 2026-01-23
**Repository:** nathanhbsimmons/spellingbee
**Status:** Initial setup phase

## Project Overview

This repository contains a Spelling Bee application. The Spelling Bee is a word puzzle game where players create words using a set of letters, with one required letter that must be included in every word.

### Project Purpose
- Build a Spelling Bee word puzzle game
- Provide an engaging word-finding experience
- Track player progress and scoring

## Repository Status

**CURRENT STATE:** This is a new repository with no code yet. This document will be updated as the project develops.

## Codebase Structure

```
spellingbee/
├── .git/                 # Git version control
└── CLAUDE.md            # This file - AI assistant guide
```

### Expected Structure (To Be Implemented)

The following structure is recommended as the project develops:

```
spellingbee/
├── src/                 # Source code
│   ├── components/      # UI components
│   ├── utils/          # Utility functions
│   ├── services/       # Business logic and services
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
├── tests/              # Test files
├── docs/               # Documentation
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── README.md           # User-facing documentation
└── CLAUDE.md          # This file
```

## Technology Stack

**To Be Determined** - Update this section when technologies are chosen.

Common options for this type of project:
- Frontend: React, Vue, or Svelte
- Language: TypeScript or JavaScript
- Styling: CSS, Tailwind, or styled-components
- Build Tool: Vite, Webpack, or Next.js
- Testing: Jest, Vitest, or Playwright
- State Management: Context API, Redux, or Zustand

## Development Workflow

### Branch Strategy

- **Main Branch:** `main` (or `master`) - Production-ready code
- **Feature Branches:** `claude/claude-md-*` - AI assistant working branches
- **Development Branch:** `develop` - Integration branch (if using gitflow)

### Git Conventions

#### Commits
- Use clear, descriptive commit messages
- Follow conventional commits format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(game): add letter selection logic`
  - Example: `fix(scoring): correct point calculation for pangrams`

#### Pull Requests
- Keep PRs focused on a single feature or fix
- Include test plan in PR description
- Reference related issues with `#issue-number`
- Include the Claude session URL at the bottom

### Code Quality Standards

#### General Principles
1. **Simplicity First:** Don't over-engineer solutions
2. **No Unnecessary Abstractions:** Avoid premature optimization
3. **Security:** Validate input at system boundaries
4. **Testing:** Write tests for business logic and user-facing features
5. **Documentation:** Comment complex logic, not obvious code

#### Code Style
- Use consistent indentation (2 or 4 spaces, to be decided)
- Prefer functional programming patterns where appropriate
- Keep functions small and focused
- Use meaningful variable and function names
- Avoid magic numbers - use named constants

#### TypeScript Conventions (if using TypeScript)
- Enable strict mode
- Prefer interfaces for object shapes
- Use types for unions and primitives
- Avoid `any` - use `unknown` if type is truly unknown
- Export types alongside their implementations

## Key Conventions for AI Assistants

### Before Making Changes

1. **Read Before Editing:** Always read files before modifying them
2. **Understand Context:** Review related files to understand the broader context
3. **Check Existing Patterns:** Follow established patterns in the codebase
4. **Search First:** Use grep/glob to find existing implementations

### Making Changes

1. **Scope of Work:**
   - Only change what's requested
   - Don't refactor unrelated code
   - Don't add features beyond the requirement
   - Keep changes minimal and focused

2. **Testing:**
   - Run existing tests after changes
   - Add tests for new functionality
   - Ensure builds succeed before committing

3. **Documentation:**
   - Update comments if changing complex logic
   - Update README.md if changing user-facing features
   - Update this CLAUDE.md if changing project structure

### Code Patterns to Follow

#### Naming Conventions
```javascript
// Constants: UPPER_SNAKE_CASE
const MAX_WORD_LENGTH = 15;

// Functions: camelCase
function calculateScore(word) { }

// Components: PascalCase
function GameBoard() { }

// Private/internal: _prefixed (if needed)
function _internalHelper() { }
```

#### Error Handling
- Validate user input at entry points
- Use try-catch for async operations that can fail
- Provide user-friendly error messages
- Log errors for debugging

#### File Organization
- One component per file
- Co-locate tests with source files (e.g., `game.ts` and `game.test.ts`)
- Group related utilities together
- Keep file sizes reasonable (<300 lines as a guideline)

## Game-Specific Conventions

### Spelling Bee Rules (Standard)
- 7 letters arranged in a honeycomb pattern
- One center letter (required in all words)
- 6 outer letters (optional)
- Words must be 4+ letters long
- Words can reuse letters
- Pangrams (using all 7 letters) score bonus points

### Scoring System (Standard)
- 4-letter words: 1 point
- Longer words: 1 point per letter
- Pangrams: +7 bonus points

### Data Requirements
- Dictionary/word list for validation
- Letter set generation algorithm
- Score tracking and persistence
- Progress levels (e.g., Beginner → Genius)

## Common Tasks

### Adding a New Feature
1. Create a new branch from main (or develop)
2. Read relevant existing code
3. Implement the feature following existing patterns
4. Add tests
5. Update documentation if needed
6. Commit with clear message
7. Run tests and build
8. Push to branch

### Fixing a Bug
1. Reproduce the bug
2. Identify root cause
3. Read affected files
4. Fix the issue (minimal change)
5. Add regression test
6. Commit and push

### Updating Dependencies
1. Check for breaking changes
2. Update package.json
3. Run tests to verify compatibility
4. Update code if APIs changed
5. Document any migration steps

## Testing Strategy

### Unit Tests
- Test pure functions and utilities
- Test business logic (scoring, validation)
- Mock external dependencies

### Integration Tests
- Test component interactions
- Test API endpoints (if applicable)
- Test state management

### E2E Tests
- Test critical user paths
- Test game flow from start to finish
- Test on multiple browsers/devices

## Performance Considerations

- **Word List:** Optimize dictionary lookups (use Set or Trie)
- **Rendering:** Minimize re-renders in game UI
- **State Updates:** Batch state updates where possible
- **Bundle Size:** Code-split if app grows large

## Security Considerations

- **Input Validation:** Sanitize user-provided words
- **XSS Prevention:** Escape any user-generated content
- **Data Privacy:** Don't store unnecessary personal data
- **API Security:** Rate limit if backend exists

## Accessibility Guidelines

- **Keyboard Navigation:** All interactive elements keyboard-accessible
- **Screen Readers:** Proper ARIA labels
- **Color Contrast:** Meet WCAG AA standards
- **Focus Indicators:** Clear focus states
- **Text Sizing:** Support text zoom

## Debugging Tips

### Common Issues
- **Word not accepted:** Check dictionary source and validation logic
- **Score incorrect:** Verify scoring algorithm matches rules
- **State not updating:** Check state management implementation
- **Performance slow:** Profile rendering and optimize hot paths

### Debugging Tools
- Browser DevTools
- React DevTools (if using React)
- Console logging (remove before commit)
- Debugger breakpoints

## Resources

### External References
- [NYT Spelling Bee](https://www.nytimes.com/puzzles/spelling-bee) - Original game for reference
- Word lists: SCOWL, Enable, or other open-source dictionaries
- Design inspiration: Honeycomb patterns, color schemes

### Documentation to Update
- README.md - User-facing project description
- CONTRIBUTING.md - Contribution guidelines (if created)
- API.md - API documentation (if backend exists)

## Project Roadmap

### Phase 1: Foundation (Current)
- [ ] Choose technology stack
- [ ] Set up project structure
- [ ] Configure build tools
- [ ] Set up testing framework

### Phase 2: Core Game
- [ ] Implement letter selection
- [ ] Create game board UI
- [ ] Add word validation
- [ ] Implement scoring system

### Phase 3: Features
- [ ] Add progress tracking
- [ ] Implement hints system
- [ ] Add shuffle/rearrange letters
- [ ] Show word list/found words

### Phase 4: Polish
- [ ] Add animations
- [ ] Improve mobile experience
- [ ] Add sound effects
- [ ] Implement dark mode

### Phase 5: Advanced
- [ ] Add daily puzzles
- [ ] Implement leaderboards
- [ ] Add social sharing
- [ ] Create puzzle editor

## Notes for AI Assistants

### When Starting a New Task
1. Read this file first
2. Check current project structure
3. Review recent commits for context
4. Ask clarifying questions if requirements unclear

### Best Practices
- **Use TodoWrite tool** for multi-step tasks
- **Read before editing** - always
- **Test your changes** - run builds and tests
- **Keep commits atomic** - one logical change per commit
- **Follow existing patterns** - consistency is key
- **Security first** - validate inputs, avoid vulnerabilities
- **Simple solutions** - don't over-engineer

### What NOT to Do
- ❌ Don't create files unnecessarily
- ❌ Don't refactor code that's not broken
- ❌ Don't add features that weren't requested
- ❌ Don't use placeholders in code
- ❌ Don't skip tests
- ❌ Don't commit sensitive data
- ❌ Don't ignore build/test failures

### Communication
- Be concise and technical
- Explain complex decisions
- Reference file paths with line numbers: `src/game.ts:42`
- Include "why" in commit messages, not just "what"

## Maintenance

### Keeping CLAUDE.md Updated

This file should be updated when:
- Project structure changes significantly
- New technologies are added
- Coding conventions are established
- Common patterns emerge
- New team members join
- Architecture decisions are made

### Version History

- **2026-01-23:** Initial creation - empty repository baseline

---

**For Questions or Updates:** This is a living document. Update it as the project evolves to help future AI assistants and developers understand the codebase.
