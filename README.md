# Floatroom

Floatroom is a full-screen physics playground for 16 floating glass forms and seven placeable forces:

- **Drag forms together** to merge any pair into a basic orb.
- Choose forms from the **Forms** button.
- Place **Sand, Water, Air, Fire, Laser, Sunlight,** or **Magnetlight** anywhere in the room to influence motion. Sand and Fire share a radial blast; Sunlight and Magnetlight share an orbiting attraction. Sand/Fire and Laser can remove forms, but one protected form always remains.
- The displayed zero-object goal is an intentionally locked challenge.

## Tech

Plain HTML, CSS and JavaScript. There's no framework and no build step. The glass look uses `backdrop-filter` and layered gradients. Motion and collisions run in a `requestAnimationFrame` loop that follows the display refresh rate (including 120 Hz displays where supported). GitHub Pages serves the static site from `docs/`; Netlify publishes `public/`.

## Run locally

```bash
python3 -m http.server 8000 --directory docs
```
