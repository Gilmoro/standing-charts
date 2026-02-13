# Choir Standing Charts

A web-based visualization tool for planning choir placements on risers with configurable geometry and per-row capacity.

## What's New

This version is tailored for choral risers and includes:

- 🎼 **Layout modes**:
  - Generic curved rows
  - Straight rows
  - Straight center with angled wings toward center
- 🧱 **Variable row/step count** (1-12 rows)
- 👥 **Variable people capacity by row**:
  - Auto capacity from **modules per row × people per module**
  - Optional comma-separated per-row override (example: `16,16,14,12`)
- 🔢 **Assignment by number or by name**
- 🪜 **Wenger Signature preset support** for known dimensions:
  - 72" module width
  - 18" step depth
  - 8" rise
  - default 4 people per 72" module (editable)

## Wenger Signature note

The Wenger product page is script-heavy and blocks some automated browser sessions (403), but published product imagery/spec graphics were reviewed and used for default geometry assumptions above.

## Usage

1. Open `index.html` in a browser.
2. Choose a **Riser Preset** (`Custom`, `Wenger Signature 3-Step`, or `Wenger Signature 4-Step`).
3. Set:
   - **Number of Rows**
   - **Layout Mode**
   - **Assign By** (number or name)
   - **Modules per Row**
   - **People per Module**
4. (Optional) Enter **People Per Row** as comma-separated values to override automatic capacity.
5. Tune geometric sliders (`Curvature`, `Center Straight Section`, `Wing Angle`) as needed.
6. Generate names, edit manually, or clear assignments.

## Files

- `index.html` – controls and app structure
- `styles.css` – visual styling and responsive layout
- `script.js` – layout math, drawing, and assignment logic
