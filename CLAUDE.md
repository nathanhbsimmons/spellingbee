# CLAUDE.md - AI Assistant Guide for Spelling Bee Project

**Last Updated:** 2026-01-23
**Repository:** nathanhbsimmons/spellingbee
**Status:** Active - Spelling Quiz Application Implemented

## Project Overview

This repository contains an interactive **Spelling Quiz** application designed for children (age 9) to practice weekly spelling words. Unlike the traditional NYT Spelling Bee word puzzle, this is an educational tool focused on helping students learn and master their spelling word lists.

### Project Purpose
- Provide an interactive way for children to practice spelling words
- Use text-to-speech to help with pronunciation
- Offer encouraging, gamified feedback to build confidence
- Track progress and identify words that need more practice
- Work seamlessly across desktop, tablet, and mobile devices

## Repository Status

**CURRENT STATE:** Initial version complete with all core features implemented as a standalone HTML application.

## Codebase Structure

```
spellingbee/
├── .git/                  # Git version control
├── spelling-quiz.html     # Main application (standalone HTML/CSS/JS)
├── README.md             # User-facing documentation and usage guide
└── CLAUDE.md             # This file - AI assistant guide
```

### Architecture Notes

The application is intentionally designed as a **single, self-contained HTML file** for maximum portability and ease of use:

- **No build process required**: Opens directly in any modern browser
- **No dependencies**: All code is vanilla HTML/CSS/JavaScript
- **Offline capable**: Works without internet connection
- **Cross-platform**: Runs on any device with a web browser
- **Privacy-focused**: No external requests, no data collection

This architecture was chosen because:
1. Parents/teachers can easily download and use without technical setup
2. Works on school computers with restricted internet access
3. No installation or npm packages required
4. Easy to share via email or USB drive
5. Perfect for a child's educational tool

## Technology Stack

**Current Implementation:**
- **HTML5**: Semantic markup for structure
- **CSS3**: Modern styling with flexbox, grid, gradients, and animations
- **Vanilla JavaScript (ES6+)**: No frameworks or libraries
- **Web Speech API**: Browser-native text-to-speech functionality
- **LocalStorage**: Could be added for persistence (not currently used)

**Browser APIs Used:**
- `window.speechSynthesis`: Text-to-speech for word pronunciation
- `Map`: Efficient state management for word statistics
- DOM APIs: Event listeners, dynamic content updates
- CSS Animations: Smooth transitions and visual feedback

**Design Choices:**
- **No Framework**: Keeps file size small and eliminates dependencies
- **Embedded Styles**: All CSS in `<style>` tags for portability
- **Embedded Scripts**: All JavaScript in `<script>` tags
- **Comic Sans MS Font**: Child-friendly, playful typography
- **Gradient Backgrounds**: Engaging purple color scheme
- **Large Touch Targets**: Optimized for tablet/mobile use

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

### JavaScript Patterns in This Application

The spelling-quiz.html file follows these patterns:

```javascript
// State management using Map for word tracking
let wordStats = new Map();

// Initialize state for each word
function initializeWord(word) {
    wordStats.set(word, {
        attempts: 0,
        skipped: false,
        firstTry: true,
        completed: false,
        revealed: false
    });
}

// Event listeners on DOM elements
document.getElementById('input').addEventListener('input', handleInput);

// DOM manipulation for screen transitions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Template strings for dynamic content
element.innerHTML = `<strong>Word:</strong> ${word}`;
```

**Key Patterns:**
1. **Map for efficient lookups**: `wordStats` uses Map instead of objects
2. **Event delegation**: Event listeners attached to specific elements
3. **Class toggling**: `.active` class controls screen visibility
4. **Template literals**: Dynamic HTML generation with template strings
5. **Array methods**: `.forEach()`, `.filter()`, `.map()` for data processing
6. **Async speech**: Text-to-speech using browser API callbacks
7. **Timeout delays**: `setTimeout()` for UX timing (delays between actions)

## Application-Specific Conventions

### Spelling Quiz Rules
- User provides custom word list at session start
- Each word is presented with audio pronunciation
- Context sentences generated automatically with underscores
- Unlimited attempts allowed per word
- Words can be skipped and revisited
- Reveal option available after skipping once
- Quiz completes when all words are spelled correctly

### Achievement System
- **⭐ Gold Star**: Word spelled correctly on first try (without revealing)
- **✅ Checkmark**: Word mastered (needed multiple tries or help)
- Progress tracked with visual progress bar
- Encouraging messages throughout the session

### Word State Tracking
Each word maintains:
- `attempts`: Number of spelling attempts
- `skipped`: Whether word was skipped at least once
- `firstTry`: Whether it was correct on first attempt
- `completed`: Whether word is mastered
- `revealed`: Whether the answer was shown

### UI/UX Patterns
- **Auto-focus**: Input field automatically focused for immediate typing
- **Auto-play**: Word audio plays automatically when loaded
- **Real-time validation**: Feedback given as user types
- **Clear on error**: Error message clears when user starts typing
- **Skip queue**: Skipped words move to end of queue

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
- **Text-to-speech not working:**
  - Check browser compatibility (Chrome/Safari recommended)
  - Verify user has interacted with page (auto-play restrictions)
  - Check device volume and browser audio permissions
  - Some browsers require HTTPS for speech synthesis

- **Word validation issues:**
  - Validation is case-insensitive (`toLowerCase()` used)
  - Check for extra whitespace in word list input
  - Verify `trim()` is working on user input

- **State not updating:**
  - Check Map operations (`wordStats.get()`, `wordStats.set()`)
  - Verify DOM updates are triggered after state changes
  - Ensure correct word index management

- **Responsive design issues:**
  - Test media queries at different breakpoints
  - Check flexbox/grid layouts on various devices
  - Verify touch targets are at least 44px for mobile

### Debugging Tools
- Browser DevTools (Console, Elements, Network)
- Speech Synthesis API console (`speechSynthesis.getVoices()`)
- Console logging (remove before commit)
- Debugger breakpoints
- Mobile device simulators in DevTools
- Accessibility inspector for WCAG compliance

### Testing Checklist
- [ ] Test on Chrome, Safari, Firefox, Edge
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test on tablet (landscape and portrait)
- [ ] Test with different word list sizes (5, 10, 20+ words)
- [ ] Test skip and reveal functionality
- [ ] Test audio with muted/unmuted states
- [ ] Test keyboard navigation
- [ ] Verify progress bar accuracy

## Resources

### External References
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - Text-to-speech documentation
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations) - Animation reference
- [Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design) - Mobile-first design
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [Child-Friendly UX](https://www.nngroup.com/articles/kids-web-usability/) - Design for children

### Educational Resources
- Grade-level spelling word lists
- Common Core spelling standards
- Age-appropriate vocabulary lists
- Phonics and spelling patterns

### Documentation Files
- **README.md** - User-facing documentation, usage guide, troubleshooting
- **CLAUDE.md** - This file - Technical documentation for AI assistants
- **spelling-quiz.html** - Inline documentation in code comments (add if needed)

## Project Roadmap

### Phase 1: Foundation ✅ Complete
- [x] Choose technology stack (Vanilla HTML/CSS/JS)
- [x] Set up project structure (Single file architecture)
- [x] Create documentation (README.md, CLAUDE.md)

### Phase 2: Core Functionality ✅ Complete
- [x] Word list input system
- [x] Text-to-speech integration
- [x] Spelling validation with real-time feedback
- [x] Skip and reveal functionality
- [x] Unlimited retry mechanism

### Phase 3: Enhancements ✅ Complete
- [x] Progress tracking with visual bar
- [x] Context sentence generation
- [x] Gamification (gold stars, encouraging messages)
- [x] Completion summary screen
- [x] Review mode for struggled words

### Phase 4: Polish ✅ Complete
- [x] Responsive design (mobile, tablet, desktop)
- [x] Smooth animations and transitions
- [x] Child-friendly color scheme
- [x] Large touch targets for young users
- [x] Auto-focus and keyboard support

### Phase 5: Potential Future Enhancements
- [ ] Save/load word lists to localStorage
- [ ] Multiple quiz sessions tracking
- [ ] Print certificates of completion
- [ ] Adjustable difficulty levels
- [ ] Custom encouragement messages
- [ ] Multiple voice options for text-to-speech
- [ ] Timer mode (optional timed challenges)
- [ ] Parent/teacher dashboard
- [ ] Export progress reports
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Word categories/themes
- [ ] Achievement badges collection

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

- **2026-01-23 (Initial):** Created CLAUDE.md for empty repository baseline
- **2026-01-23 (v1.0):** Updated with complete Spelling Quiz application details
  - Added spelling-quiz.html (standalone application)
  - Added README.md (user documentation)
  - Documented architecture, tech stack, and conventions
  - Updated roadmap to reflect completed features

---

**For Questions or Updates:** This is a living document. Update it as the project evolves to help future AI assistants and developers understand the codebase.
