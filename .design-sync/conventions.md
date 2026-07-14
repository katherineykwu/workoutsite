# Workout Site conventions

This is the component library for "My Workout" — a personal-training app with two faces: **Kiki's client view** (warm cream + rose) and **Jamie's trainer view** (paper white + army green). Pick ONE theme per screen and stay in it.

## Setup

No provider or wrapper is required — components style themselves via Tailwind utility classes already compiled into `styles.css`. Give pages a themed background (they're designed to sit on one, not on pure white):

- Client view: `bg-[#FAF6F1]` page background, `bg-[#FFFDF9]` for header/hero surfaces.
- Trainer view: `bg-[#F7F6F0]` page background.

## Styling idiom: Tailwind utilities with a fixed hex palette

Style your own layout glue with Tailwind utility classes, using these exact arbitrary-value colors (the app never uses generic Tailwind colors like `red-500`):

| Role | Client (Kiki) | Trainer (Jamie) |
|---|---|---|
| Accent | `#C4706E` rose | `#4A5D23` army green (actions), `#E8730C` orange (highlights), `#FF1A66` pink (accents) |
| Text | `#49443D` (fade with `/40`-style opacity) | `#1A0A1F` |
| Chip / input fill | `#F5F0E8` (hover `#EDE6DA`) | `#F5F3F4` / `#F7F6F0` |
| Card surface | white, `rounded-2xl`/`rounded-3xl`, `border border-black/5` | same |

Usage patterns seen throughout: `bg-[#C4706E]/10` for tinted fills, `text-[#49443D]/40` for muted text, `focus:ring-2 focus:ring-[#C4706E]` on inputs.

## Typography

Two families, already loaded by `styles.css` (Google Fonts):

- Body: Nunito — the default, no class needed.
- Display: Fraunces via the `font-display` class — use on headings, buttons, and stat numbers.

## Custom utility classes (defined in the shipped CSS — use them, don't reinvent)

`font-display`, `shadow-playful`, `shadow-playful-hover`, `btn-playful` (springy press effect for buttons), `hover-pop`, `gradient-pink` (rose gradient for primary CTAs), `texture-grain` (subtle grain overlay for headers), `animate-bounce-in`, `animate-fade-up`, `animate-float`, `animate-wiggle`, `scrollbar-hide`.

Primary CTA recipe: `gradient-pink text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md shadow-[#C4706E]/25 btn-playful font-display`.

## Where the truth lives

Read `styles.css` (and its `_ds_bundle.css` import) for the full compiled class set, and each component's `.prompt.md` + `.d.ts` for its API. Components take fully-typed data objects — see `ExerciseCard.d.ts` for the `Exercise`/`SetLog`/`PersonalBest` shapes used across the library.

## Idiomatic example

```jsx
import { ExerciseCard, EquipmentDisplay } from "workout-app";

<div className="bg-[#FAF6F1] min-h-screen">
  <main className="max-w-2xl mx-auto px-5 py-6">
    <EquipmentDisplay equipmentIds={["dumbbells", "kettlebell", "bench"]} />
    <h2 className="text-xl font-bold text-[#49443D] font-display mb-5">Monday</h2>
    <div className="space-y-4">
      <ExerciseCard
        index={0}
        exercise={{ id: "ex-1", name: "Goblet Squat", sets: 3, reps: "8-10", restSeconds: 90,
          targetWeight: 35, notes: "Chest tall, sit into your heels.", videoType: "none", videoUrl: "" }}
      />
    </div>
  </main>
</div>
```

Notes: `WorkoutToast`, `TemplatePicker`, and `MyEquipmentModal` are fixed full-screen overlays — render them conditionally at the page root. `ProgressChart` needs a width-constrained parent (it fills 100% width, 256px tall). Equipment ids come from the fixed set in `EquipmentDisplay.d.ts` (e.g. `"dumbbells"`, `"kettlebell"`, `"bench"`, `"yoga-mat"`).
