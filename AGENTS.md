# AGENTS.md

## What this is
Floatroom is a single-page static toy: liquid-glass objects float around a room and react to touch and mouse input. There's no backend, no persistence and no build step.

## Layout
- `public/index.html`: markup for the backdrop, the room, the header pills, the gesture hint and the dock (the + button plus the three orbiting dots).
- `public/style.css`: all visuals. The `.glass` class is the liquid-glass material. Shape variants (`orb`, `ring`, `capsule`, `squircle`, `blob`, `drop`, `pearl`) are modifier classes. `.glass-ui` is the same material for the UI chrome.
- `public/app.js`: one IIFE that holds the object factory, gesture handling and the physics loop.
- `netlify.toml`: publishes `public/`.

## Non-obvious decisions
- Each object is built as `.obj > .wob > .glass`. `.obj` carries the JS transform (position, rotation, scale). `.wob` carries the one-shot CSS animations (tap jelly, shrink squeeze, collision boop), so they never fight the JS transform or the blob's `border-radius` morph on `.glass`.
- Gestures are tracked per pointer in `pointerOwner` (pointerId → object), and move/up events are handled on `window`. A second finger on empty space joins the pinch of the object that's currently held, which makes small objects easy to pinch.
- Long-press growth only starts if the pointer stays within `MOVE_SLOP` px for `LONG_PRESS_MS`. A tap is anything shorter than `TAP_MS` with no movement, pinch or growth, and two taps within `DOUBLE_TAP_MS` shrink the object.
- Collisions use simple circle impulses weighted by area. Held objects count as infinite mass, so you can shove other objects around.
- The room holds at most `MAX_OBJECTS` (2,000). When it's full, adding a new object immediately removes the oldest one, so spawning can continue without growing DOM or physics work.
- Dense rooms progressively reduce glass effects; collision checks run every other frame above 800 objects to keep animation responsive.
