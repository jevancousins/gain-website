# Gain media library

Human-readable inventory of everything in `public/media/`. Whenever you add, remove, or re-identify a photo, update this file — then ask Claude to sync the matching `IMAGE_META` entry in `src/lib/utils.ts` so code and docs stay aligned.

All images are served from `/media/...` paths and referenced via the `IMAGES` constant in `src/lib/utils.ts`.

**Status values:**
- `current` — safe to use anywhere.
- `archive` — contains former staff or historical scenes. Keep available, but place with care — never as the primary "Meet your coach" or "Meet the team" image on pages that represent Gain today.

---

## Gym — current

### `gym/box-coaching.jpg`  · status: current
Hallum coaching and spotting a female client (40s) as she steps onto a box in the gym. GAIN logo clearly visible on the back of Hallum's t-shirt.

### `gym/stretching.jpg`  · status: current
Hallum coaching and doing the same warm-up stretch as a male client (60s). Both looking at each other smiling in the gym.

### `gym/warmup.jpg`  · status: current
Near-duplicate of `stretching.jpg` — Hallum warming up with the male client (60s). Possibly different crop/size; treat as an alternate of the same scene.

### `gym/group-class.jpg`  · status: current
Hallum coaching a small-group class of four clients (2 male, 2 female, various ages) doing ab exercises on mats in the gym.

### `gym/lunges.jpg`  · status: current
Two female clients (20s–30s) doing two different leg exercises with dumbbells in the gym. No coach visible.

### `gym/wide.jpg`  · status: current
Wide atmospheric shot of the empty gym floor — racks, weights, equipment.

## Gym — archive (former staff, use with care)

### `gym/coach-member.jpg`  · status: archive
**Aaron Goacher (former Gain PT)** smiling while a female client (40s) does a seated overhead barbell press. Aaron is prominently in frame. Avoid as a primary "coach" image; usable in atmospheric contexts if the audience understands it's the wider facility, not "your coach today".

### `gym/coach-member-alt.jpg`  · status: archive
**Aaron Goacher (former Gain PT)** in conversation with the same female client, likely giving advice on an exercise. Aaron is prominently in frame. Same placement guidance as above.

### `gym/two-training.jpg`  · status: archive
**Aaron Goacher and Becky Brown** watching on as a female client does an exercise in the background. Both Aaron and Becky have their backs to the camera, displaying the GAIN logo on their t-shirts. Faces are not visible — can be used as an atmospheric background shot more freely than the other Aaron images.

## Studio

### `studio/yoga.jpg`  · status: current
The studio set up for yoga / meditation — mats, singing bowls on a woven rug, Buddha wall art, turquoise curtains. No people.

## Sauna & cold plunge

### `sauna/plunge-wide.jpg`  · status: current
Wide shot of the sauna + cold plunge room. Wooden cold plunge tub, sauna cabin, night-sky mountain mural on the wall, herringbone floor.

### `sauna/plunge-close.jpg`  · status: current
Close-up of the wooden cold plunge tub with the night-sky mural behind.

### `sauna/cabin.jpg`  · status: current
Side view of the cold plunge and infrared sauna cabin.

## Headshots

### `hallum.jpg`  · status: current
Headshot of Hallum smiling against a plain background. The canonical "Meet Hallum" portrait.

### `becky.jpg`  · status: current
Headshot of Becky smiling against a plain background.

## Group / archival

### `team.jpg`  · status: archive
**Original Gain team photo.** Hallum stood in the background; Aaron Goacher, Becky Brown, the physio, and Ash Mugasa seated in the gym smiling. Do **not** use as "the current team" — Aaron, the physio, and Ash are no longer at Gain. Only use where historical context is explicit.

## Brand

### `logo.png`  · status: current
Gain Strength Therapy circular wordmark logo.

## Videos

### `videos/hero-1080.mp4` & `videos/hero-720.mp4`  · status: current
Homepage hero background loop. Dark, moody, training scene.

### `videos/facility-a-1080.mp4` & `videos/facility-a-720.mp4`  · status: current
Facilities page gym-section loop.

### `videos/facility-b-1080.mp4` & `videos/facility-b-720.mp4`  · status: current
Facilities page studio-section loop.

---

## How to edit this file from the GitHub app

1. Open the repo in the app and navigate to `public/media/README.md`.
2. Tap the pencil icon to edit.
3. Update or add an entry (follow the same heading + `status` + description pattern).
4. Commit directly to `main` with a short message like `docs: update media README`.
5. Next time Claude is working on the site, ask it to sync `IMAGE_META` in `src/lib/utils.ts` to match.
