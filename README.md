# Floatroom

Floatroom is a full-screen physics playground for 16 floating glass forms and seven placeable forces, with up to 1,000 forms on screen:

- **Bring matching forms together** to split them into four smaller forms of the same shape. Different forms bounce apart. Splitting can continue until the 1,000-form limit is reached.
- Keep the **Forms+** picker open while dragging forms onto the room; tap a form in the picker to add it near the dock.
- Use the pencil button to draw a rectangular frame. Forms that enter it stay inside; forms outside continue moving freely. Draw another frame by selecting the pencil again.
- Use **Clear** to remove all forms at once. Placed forces and drawn frames stay in the room.
- Controls and gameplay hints stay hidden at startup and appear only when an action needs an explanation.
- Place **Sand, Water, Air, Fire, Laser, Sunlight,** or **Magnetlight** anywhere in the room to influence motion. Drag a force to move it; select it to pin or release it. Sand and Fire share a radial blast; Sunlight and Magnetlight share an orbiting attraction. Sand/Fire and Laser can remove forms, but one protected form always remains.
- The normal effects preserve one form; the **Clear** button intentionally bypasses that protection. The displayed zero-object goal remains an intentionally locked challenge for regular gameplay.
- Desktop and mobile layouts are supported; small distant lights add depth to the backdrop.

## Tech

Plain HTML, CSS and JavaScript. There's no framework and no build step. The glass look uses `backdrop-filter` and layered gradients. Motion and collisions run in a `requestAnimationFrame` loop that follows the display refresh rate (including 120 Hz displays where supported). GitHub Pages serves the static site from `docs/`; Netlify publishes `public/`.

## Run locally

```bash
python3 -m http.server 8000 --directory docs
```
