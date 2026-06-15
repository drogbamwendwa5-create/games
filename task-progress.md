# Task Progress

## Corrections needed across all files:

**card/ project (Memory Card Game):**
- [ ] Fix `useGameLogic.js` - `saveScore` called inside React state updater (side effect in state updater is bad practice)
- [ ] Fix `useGameLogic.js` - `soundEnabled` state in useCallback dependency causing unnecessary recreations

**reaction-game/ project:**
- [ ] Fix `useReactionGame.js` - `getRandomDelay()` always returns 3000ms instead of a random delay

**time/ project (Currently empty Vite template):**
- [ ] Build a complete 3D Chess game using React + Three.js (@react-three/fiber, @react-three/drei)