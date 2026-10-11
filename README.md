# Floatroom

Floatroom is a full-screen physics playground for 16 floating glass forms and seven placeable forces. Spawning is capped at 10 forms by default; **Advanced → Unlimited** opts into the 2,000-form technical limit. Two small, differently colored orbs start circling the room; a smaller, faster third flies in from outside after three seconds, then a smaller fourth flies in three seconds later. Once it arrives, all four glow in distinct colors and slowly grow to medium-small size:

- **Bring matching forms together** to split them into four smaller forms of the same shape. Different forms bounce apart. Automatic splitting is off by default; when enabled, splitting respects the 10-form limit or the 2,000-form technical limit when Unlimited is active.
- Keep the **Forms+** picker open while dragging forms onto the room; tap a form in the picker to add it at the saved spawn point, initially positioned just above the dock. Use **Set spawn point** in the picker to move that point.
- Use the pencil button to draw a rectangular frame around forms. Forms enclosed by a drawn frame, or dragged and dropped into one, stay inside; free-floating forms cannot enter a frame on their own.
- **Clear Objects**, **Clear Forces**, and **Clear Frames** independently remove their respective items.
- **Game** starts a 60-second color-matching challenge: nudge a form into the blinking target, avoid one differently colored stone orbiting it (two from 50 points, three from 90), and build an ongoing combo multiplier. Targets spawn within the map near the forms, and usable orbs appear close to each target. Their orbit speed increases with score. At low scores, game stones stay visible longer and usable orbs spawn more frequently; the orb spawn interval grows with score. From 10 points, rockets cross the room and jostle nearby forms. Each form can split only once per round. Objects bounce at the map edges instead of wrapping, and recurring spawn points pause so you choose when to add more forms. Panning and zooming remain available.
- **Stats** beside the floating-object count reveals split totals, the fastest object's speed record, mean velocity, a kinetic index, estimated glass area, and the app version (v1.1.0).
- Use the music button beside the floating-object count to start or pause the included looping soundtrack. Music never starts automatically.
- Pinch forms to resize them. Pinch a force to adjust its influence radius; double-click a force or focus it and press Delete to remove it. Sand, Fire, and Laser make nearby objects glow without damaging them.
- Use **Magic** to reveal or hide the additional controls; its compact labels and symbols fit the glass dock.
- Drag an empty part of the room to pan the map. Pinch with two fingers or use the mouse wheel/trackpad to zoom around the fixed center of the screen; dragging forms and forces still moves only those items. The backdrop stays full-screen and shifts subtly with camera movement to create parallax.
- **Advanced** lets you toggle automatic splitting (off by default; matching forms split rarely at 1:200 while off), opt into **Unlimited** spawning (⚠ up to 2,000 forms), apply size 1, 2, 3, or random sizes to current and future forms, change their colors, select a softly fading glass background, explode a random form, or place recurring spawn points. Spawners pause automatically at the current object limit; click a point to pause/resume it, or double-click/press Delete to remove it. Clear Objects also removes recurring spawners.
- Controls and gameplay hints stay hidden at startup and appear only when an action needs an explanation.
- Place **Sand, Water, Air, Fire, Laser, Sunlight,** or **Magnetlight** anywhere in the room to influence motion. Drag a force to move it; select it to pin or release it. Pinch adjusts its influence radius. Sand, Fire, and Laser only make nearby forms glow; Water swirls, Air pushes, and Sunlight/Magnetlight attract.
- The normal effects preserve one form; the **Clear** button intentionally bypasses that protection. The displayed zero-object goal remains an intentionally locked challenge for regular gameplay.
- Desktop and mobile layouts are supported. On small screens the map starts zoomed out, with a limited zoom-in range; spawned and dragged objects stay within the reachable map bounds. The backdrop shifts color subtly and small distant lights add depth. The Floatroom wordmark uses the same six-orb logo as Forms+, with three orbit speeds.

## Tech

Plain HTML, CSS and JavaScript. There's no framework and no build step. The glass look uses `backdrop-filter` and layered gradients. Motion and collisions run in a `requestAnimationFrame` loop that follows the display refresh rate (including 120 Hz displays where supported). GitHub Pages serves the static site from `docs/`; Netlify publishes `public/`.

## Run locally

```bash
python3 -m http.server 8000 --directory docs
```
