# design-sync notes — workout-site

- This is a Next.js **app**, not a packaged library: no dist, no Storybook. The bundle entry is the hand-written barrel `.design-sync/ds-entry.ts` (all 16 components are default exports, so `export * from` synth mode would drop them — the barrel re-exports each as a named export). If a component is added to `src/components/`, add a line to the barrel AND an entry to `componentSrcMap` in config.json.
- CSS is compiled at sync time by `cfg.buildCmd` (Tailwind v4 CLI) from `.design-sync/tailwind-entry.css`, which imports `src/app/globals.css` and adds Google-Fonts imports for Nunito/Fraunces plus the `--font-nunito`/`--font-fraunces` vars that next/font normally sets. **Run buildCmd before the converter on every re-sync** — the output lives in gitignored `.design-sync/.cache/`.
- Fonts are remote (`[FONT_REMOTE]` from Google Fonts) — expected, not a miss.
- The machine render check has never run: no playwright on this machine and the user declined the ~200MB install (chose to review in browser). All 16 previews were instead verified by screenshots in the in-app browser (2026-07-14) and graded good. Grades in `.design-sync/.cache/review/` are from that manual pass.
- ProgressChart: recharts' entrance animation freezes at 0% in static preview renders, hiding the line — the authored preview injects `.recharts-line-curve { stroke-dasharray: none !important; }`. If recharts is upgraded, re-check.
- VideoPlayer: the youtube variant renders an external iframe (CSP-blocked in the design sandbox, and shows "Video unavailable" even locally) — the preview uses the upload-type native `<video>` variant instead.
- Overlay components (WorkoutToast, TemplatePicker, MyEquipmentModal, PasswordGate) use fixed full-screen positioning — they have `cardMode: single` + viewport overrides in config.json.
- Interaction-only states (search box focus ring, hover effects, video playback) are not statically renderable — skipped by design.
- `ds-bundle/` vanished mid-run once (temp-cleaner or similar); it is fully regenerable — just re-run buildCmd + the converter.

## Known render warns

- `[FONT_REMOTE]` "Nunito", "Fraunces" — deliberate (Google Fonts at runtime).
- `[RENDER_SKIPPED]` — expected until playwright is installed on this machine.

## Re-sync risks

- The render check has never machine-run; if playwright gets installed later, run a full validate to get a true baseline.
- Component API changes won't propagate to previews automatically — the authored previews in `.design-sync/previews/` hard-code prop shapes (Exercise, WorkoutLog, PersonalBest). If `src/lib/types.ts` changes, previews may compile but show stale-shaped data.
- The barrel + componentSrcMap are a manual name index — a new component silently misses the sync until both are updated.
- Tailwind-compiled CSS only includes classes used in `src/` at sync time; app CSS changes require re-running buildCmd (recorded in config) before the converter.
