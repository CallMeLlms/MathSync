# Engine UI/UX Polish — Round 2 — 2026-04-29

## Summary
Three Generative engines polished for layout stability, responsive text, and comparison UX.

---

## 1. AdvancedFractionsEngine — Dynamic Text Scaling
**File:** `src/Components/Game/Generative/Engines/AdvancedFractionsEngine.jsx`

- **Question header**: Added `adjustsFontSizeToFit`, `numberOfLines={2}`, `minimumFontScale={0.65}` — prevents long questions from overflowing.
- **Identify text**: Added `adjustsFontSizeToFit`, `numberOfLines={1}`, `minimumFontScale={0.5}`. Reduced base `fontSize` 32 → 26. Added `flexShrink: 1` so it contracts before overflowing the enclosure row.
- **Operator text**: Reduced `fontSize` 48 → 38 — gives fractions flanking the operator more horizontal room.
- **Visual enclosure**: Added `minHeight: 160` — enclosure no longer collapses when content wraps to a second line.

---

## 2. DecimalOrderingEngine — Header Restructure + Slot/Tile Sizing
**File:** `src/Components/Game/Generative/Engines/DecimalOrderingEngine.jsx`

- **Header**: Removed the 3-column flex hack. Question text is now full-width centered on its own row. Toggle moved to its own centered `toggleRow` below.
- **Toggle label**: Renamed "Padding = ON/OFF" → "Align Zeros: ON" / "Align Zeros: OFF" (student-friendly).
- **Toggle style**: `borderWidth: 2`, `borderBottomWidth: 4`, `borderRadius: 20` — consistent with Bulky spec.
- **Slots**: Removed `aspectRatio: 1`. Now `minWidth: 88`, `height: 68`, `paddingHorizontal: 8` — wider rectangles that hold decimal strings cleanly.
- **Choice tiles**: Removed fixed `width: 80, height: 80`. Now `minWidth: 88`, `height: 68`, `paddingHorizontal: 12`.
- **Slot/tile text**: `fontSize` reduced, `adjustsFontSizeToFit` + `minimumFontScale: 0.7` added for padded decimals.
- **Check button**: Renamed "Check Match" → "Check Order" (more accurate label).

---

## 3. MeasurementEngine — Comparison Layout Refactor
**File:** `src/Components/Game/Generative/Engines/MeasurementEngine.jsx`

- **Comparison layout**: Replaced single tall `focalContainer` with a two-zone layout:
  - **Zone A (`vsRow`)**: Two side-by-side mini-cards ("Option A" / "Option B") showing value + unit, connected by a "VS" badge. Compact: `paddingVertical: 16`, value `fontSize: 28`.
  - **Zone B (`hintCard`)**: `MeasurementVisual` extracted from the focal card into a separate labeled hint container with `maxHeight: 150, overflow: 'hidden'` — prevents overflow regardless of content height.
- **Non-comparison layouts**: `focalContainer` now uses `borderWidth: 2, borderBottomWidth: 6` (was `borderWidth: 3` with no depth — now matches Bulky spec).
- **AnimatedChoiceTile**: Renamed prop `width` → `tileWidth` — eliminates shadowing of module-level `SCREEN_WIDTH` constant.
- **Sinking animation**: Replaced `scale` with `translateY` + animated `borderBottomWidth` (5 idle → 2 pressed).
- **Dynamic instruction text**: "Select your answer" → "Answer locked in!" after selection.
- **Submit button removed**: Now auto-submits after 400ms (same pattern as TimeMoneyEngine). Removed `handleSubmit` + `TouchableOpacity` submit button to simplify UX.

---

## Files Modified
- `src/Components/Game/Generative/Engines/AdvancedFractionsEngine.jsx`
- `src/Components/Game/Generative/Engines/DecimalOrderingEngine.jsx`
- `src/Components/Game/Generative/Engines/MeasurementEngine.jsx`
