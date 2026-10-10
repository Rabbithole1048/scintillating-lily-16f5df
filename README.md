# Floatroom

Floatroom is a full-screen physics playground for 16 floating glass forms and seven placeable forces, with up to 1,000 forms on screen:

- **Bring matching forms together** to split them into four smaller forms of the same shape. Different forms bounce apart. Splitting can continue until the 1,000-form limit is reached.
- Keep the **Forms+** picker open while dragging forms onto the room; tap a form in the picker to add it at the saved spawn point. Use **Set spawn point** in the picker to move that point.
- Use the pencil button to draw a rectangular frame around forms. Forms enclosed by a drawn frame, or dragged and dropped into one, stay inside; free-floating forms cannot enter a frame on their own.
- **Clear Objects**, **Clear Forces**, and **Clear Frames** independently remove their respective items.
- Pinch forms to resize them. Pinch a force to adjust its influence radius; double-click a force or focus it and press Delete to remove it. Sand, Fire, and Laser make nearby objects glow without damaging them.
- Use **Magic** to reveal or hide the additional controls; button captions remain visible in the compact dock.
- Drag an empty part of the room to pan the map. Pinch with two fingers or use the mouse wheel/trackpad to zoom around the fixed center of the screen; dragging forms and forces still moves only those items. The backdrop stays full-screen and shifts subtly with camera movement to create parallax.
- **Advanced** applies size 1, 2, 3, or random sizes to current and future forms, changes their colors, selects a softly fading glass background, explodes a random form, or places recurring spawn points. Each active point creates a random form every 1.8 seconds; click a point to pause/resume it, or double-click/press Delete to remove it. Clear Objects also removes recurring spawners.
- Controls and gameplay hints stay hidden at startup and appear only when an action needs an explanation.
- Place **Sand, Water, Air, Fire, Laser, Sunlight,** or **Magnetlight** anywhere in the room to influence motion. Drag a force to move it; select it to pin or release it. Pinch adjusts its influence radius. Sand, Fire, and Laser only make nearby forms glow; Water swirls, Air pushes, and Sunlight/Magnetlight attract.
- The normal effects preserve one form; the **Clear** button intentionally bypasses that protection. The displayed zero-object goal remains an intentionally locked challenge for regular gameplay.
- Desktop and mobile layouts are supported; the backdrop shifts color subtly and small distant lights add depth. The Floatroom wordmark uses the same six-orb logo as Forms+, with three orbit speeds.

## Tech

Plain HTML, CSS and JavaScript. There's no framework and no build step. The glass look uses `backdrop-filter` and layered gradients. Motion and collisions run in a `requestAnimationFrame` loop that follows the display refresh rate (including 120 Hz displays where supported). GitHub Pages serves the static site from `docs/`; Netlify publishes `public/`.

## Run locally

```bash
python3 -m http.server 8000 --directory docs
```
