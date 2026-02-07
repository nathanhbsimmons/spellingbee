# Spelling Word Collector - Project Brief

## Overview
A low-anxiety spelling practice app that separates performance from evaluation. Kids collect words (with delightful animations) during practice, then review them together with a parent afterward. No immediate right/wrong feedback—just progress and growth.

## Core Principles
- **No real-time grading** - every typed word gets "collected" as-is
- **Joyful feedback** - animations and positive reinforcement for engagement, not correctness
- **Parent-child collaboration** - review phase is done together
- **Themed collections** - kid chooses the visual theme each week to maintain interest
- **Separation of concerns** - practice mode vs. review mode are distinct experiences

---

## Sprint 1: Foundation & Core Loop
**Goal**: Get the basic practice loop working with minimal styling

### Features
- Simple word list management (parent can add/edit the week's spelling words)
- Practice mode: display word counter (e.g., "Word 3 of 10")
- Text input field for typing the word
- "Next Word" button that saves the typed word and moves to the next
- Store all typed words in memory (just an array for now)
- After last word, show "All done collecting!" message

### Technical Notes
- Use React with local state
- Store word list and typed words in component state
- No backend needed yet - everything in-memory
- Focus on the flow, not the visuals

---

## Sprint 2: Audio Playback
**Goal**: Add word pronunciation so kid can practice independently

### Features
- "Play Word" button that reads the current word aloud
- Auto-play word when moving to next word (optional toggle)
- Use Web Speech API for text-to-speech
- Fallback message if browser doesn't support speech

### Technical Notes
- Implement using `window.speechSynthesis`
- Add voice selection if available (let parent choose preferred voice)
- Handle edge cases (Safari mobile, etc.)

---

## Sprint 3: First Collection Theme - Garden
**Goal**: Make word collection feel magical

### Features
- When word is typed and "Next" is clicked, animate a flower appearing in a garden
- Garden visualization shows one flower per collected word
- Flowers appear in a row or scattered pattern
- Simple SVG or CSS-based flowers (different colors/types for variety)
- Pleasant sound effect when flower appears
- Garden persists as you add more words

### Technical Notes
- Use Framer Motion or CSS animations for flower appearance
- SVG for flower graphics (keep it simple - circles and stems work fine)
- Consider using Howler.js for sound effects or just HTML5 audio
- Flowers should appear sequentially, not all at once

---

## Sprint 4: Review Mode
**Goal**: Build the collaborative review experience

### Features
- After collecting all words, enter "Review Mode"
- Show collected words in garden alongside correct spellings
- Correct words get visual celebration (flower blooms fully, sparkles)
- Incorrect words show the correct spelling below the typed version
- "Fix" button for each incorrect word → opens input to retype
- When fixed, flower blooms with animation
- Progress tracker: "5 bloomed, 2 to tend"

### Technical Notes
- Simple string comparison for correct/incorrect (case-insensitive)
- Store "fixed" state for each word
- Keep original typed word visible even after fix
- Parent and child review together - no auto-grading

---

## Sprint 5: Multiple Themes
**Goal**: Let kid choose their collection theme

### Features
- Theme selection screen at start: Garden, Space, Treasure, Aquarium
- **Garden**: flowers (already built)
- **Space**: stars forming constellations
- **Treasure**: gems/coins filling a chest
- **Aquarium**: fish swimming into a tank
- Each theme has its own collection animation and review visuals
- Theme choice persists for the week's practice session

### Technical Notes
- Abstract the collection visual into a theme system
- Each theme is a component with consistent API (onCollect, onReview, etc.)
- SVG graphics for each theme
- Theme-appropriate sound effects

---

## Sprint 6: Persistence & Word List Management
**Goal**: Save progress and make word management easier

### Features
- LocalStorage to save word lists between sessions
- Parent admin panel to:
  - Create new word lists (with name like "Week of Jan 15")
  - Edit existing lists
  - Delete old lists
  - Select which list is active
- Save practice sessions (kid can pause and resume)
- History view: see past weeks' practice sessions

### Technical Notes
- Use localStorage with JSON serialization
- Word list schema: `{ id, name, words: [], createdAt }`
- Practice session schema: `{ listId, theme, typedWords: [], completedAt }`
- Add simple parent PIN or password to access admin panel

---

## Sprint 7: Polish & Delight
**Goal**: Add finishing touches that make it feel professional

### Features
- Smooth page transitions
- Celebratory animation when all words are bloomed in review
- Option to print/export the week's words
- Keyboard shortcuts (Enter to submit word, etc.)
- Responsive design (works on tablet)
- Custom sound effect options (kid can choose sound pack)
- Encouraging messages during collection ("Great job collecting!")

### Technical Notes
- Page transitions with Framer Motion
- Consider confetti.js for celebration
- Print stylesheet for word export
- Touch-friendly button sizes for tablet
- Sound packs as swappable JSON config

---

## Sprint 8: Advanced Features (Optional)
**Goal**: Add features that increase engagement over time

### Features
- **Context sentences**: parent can add example sentence for each word
- **Word history**: kid can see their collected gardens from previous weeks
- **Streak counter**: days practiced in a row
- **Custom themes**: kid can design their own collection theme (choose colors, icons)
- **Multiple profiles**: if you have multiple kids
- **Practice mode variations**:
  - Reverse mode (show word, type from memory)
  - Letter scramble (unscramble the word)

### Technical Notes
- These are nice-to-haves - only build if the core experience is solid
- Focus on what actually helps reduce anxiety and increase practice
- Get feedback from your kid after each sprint

---

## Technical Stack Recommendations
- **Framework**: React (with Vite for fast dev)
- **Styling**: Tailwind CSS for rapid UI development
- **Animation**: Framer Motion
- **Audio**: Web Speech API + Howler.js for sound effects
- **Storage**: LocalStorage (upgrade to IndexedDB if needed)
- **Deployment**: Vercel or Netlify (simple static hosting)

## Development Approach
- Build one sprint at a time
- Test each sprint with your kid before moving to next
- Be willing to pivot based on what actually reduces her anxiety
- Prioritize the experience over feature completeness
- Remember: the goal is practice without anxiety, not gamification for its own sake

## Success Metrics
- Kid voluntarily chooses to practice
- No tears during practice sessions
- Asks to "collect more words"
- Improved spelling test scores (but this is secondary to reduced anxiety)
