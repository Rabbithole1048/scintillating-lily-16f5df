# Floatroom

Floatroom is a playful, full-screen room of floating liquid-glass objects. Everything drifts, spins and bounces off the walls and off each other, and you can play with all of it:

- **Drag and fling** any object; it carries your momentum and bounces around.
- **Pinch** with two fingers to resize. Put both fingers on the object, or hold it with one finger and pinch with a second finger anywhere.
- **Long-press** to make an object grow for as long as you hold it.
- **Double-tap** to shrink it.
- **Mouse wheel** over an object resizes it on desktop.
- **The + button** brings more objects into the room. Three glowing dots always orbit around it.

## Tech

Plain HTML, CSS and JavaScript. There's no framework and no build step. The glass look uses `backdrop-filter`, layered gradients and masked rims. Motion, collisions and gestures run in a small custom physics loop driven by Pointer Events. It's hosted on Netlify as a static site from `public/`.

## Run locally

```bash
netlify dev        # or any static server pointed at ./public
```
