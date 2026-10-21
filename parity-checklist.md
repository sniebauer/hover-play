# Hover! comparison checklist

Updated 2026-10-15. This is a tracked list of remaining differences and verification gaps, not a claim of complete game parity. Original evidence comes from the CD executable/resources, controlled execution of its routines, and retained Windows 95 captures. Browser-only conveniences are identified separately.

## Current correction batch

| ID | Status | Difference and acceptance check | Owner |
| --- | --- | --- | --- |
| G01 | Fixed and verified | Browser controller clamps craft positions to decoded map bounds after original collision responses. Removed; 4,608 native/controller samples plus existing gameplay regressions match. See `evidence/gameplay-boundary-radar-2026-10-15.md`. | Gameplay |
| U01 | Fixed and verified | Clear Scores replaces the High Scores contents; original shows a nested **Hover!** warning over the inactive parent. Caption, original icon, buttons, cancellation and focus restored; browser checks pass. Native reference: `evidence/dialogs/windows95-clear-confirmation.png`. | HUD/fonts |
| U02 | Fixed and verified | F4 can activate fullscreen while About is open. Modal guard restored; F4, F2, F9 and Ctrl+C isolation checked in the browser. | Integration + browser QA |
| U03 | Fixed and verified | Fullscreen removes the native viewport aspect ratio and stretches the cockpit. 4:3 restored at desktop, phone portrait and short landscape sizes. | HUD/fonts + browser QA |
| H01 | Fixed and verified | Original Help says right-clicking cockpit regions opens information about that region. Right-click / What's This? now routes all seven regions to original content. All 4,378 native hit tests match, including hidden rear view; browser interaction checks pass. See `evidence/cockpit-help-2026-10-15.md`. | Integration |
| U04 | Fixed and verified | Menu keyboard navigation lacks Alt+letter access and Left/Right menu traversal. Resource mnemonics, first/last item focus, traversal and modal isolation restored; browser checks pass. This is resource-backed behavior, not native event-trace equality. | Integration |
| G04 | Fixed and verified | Radar symbols were painted in the wrong order at overlaps. Original shared item order, human, drones and active walls restored; 256 native compositions / 3,128,320 indexed pixels match. | Gameplay |
| H03 | Glyphs verified; full viewer comparison open | Windows 95 GDI captures establish regular/bold MS Sans Serif and the Times em dash. Help uses captured pixel masks: 439 glyphs and 12 whole strings match in the browser with zero RGB/advance differences; five actual WinHelp lines match 2,475 ink pixels. Bold advances, overhang and the Times baseline are corrected. Actual viewer bold/small-caps treatment remains open. See `evidence/help-fonts-2026-10-15.md`. | Integration + HUD/fonts + browser QA |
| H02 | Routing fixed and verified | Restored question-mark buttons and original control Help across six dialogs. Twelve original WinHelp dispatches, 75 topic routes and seven explicit no-help entries verified. Browser checks pass for all six dialogs, including disabled controls, group headings, nested focus and no accidental activation. Two actual WinHelp popup layouts now match at desktop and 390px: Set Keys 319×45 and Objects 312×60, including every word position. Other popup types and native F1 event delivery remain comparison boundaries. See `evidence/dialog-help-2026-10-15.md`. | Integration + browser QA |
| U05 | Geometry and fixed text corrected | Native captures establish Restart 323×119, Play Again 381×139 and Clear Scores 320×119. Actual original Restart confirms all control positions. Prompts, captions, button labels and close controls use native pixels; desktop browser rectangles match. See `evidence/messagebox-geometry-2026-10-15.md`. | HUD/fonts + browser QA |
| U08 | Feedback mechanism fixed and verified | Canvas sizing moved out of ResizeObserver delivery into the existing game frame. Synthetic probe warnings fell from 3 to 0; actual fullscreen and pending-resize disposal pass. The ordinary cycle produced no warnings in either version, so the historical full-app trigger remains unidentified. See `evidence/resize-2026-10-15.md`. | Gameplay + browser QA |

## Playthrough and audio batch — October 15

- [x] **G05 — Completed input-only matches:** 16 independent games at start levels 1–16 match 48,218 original world ticks, 330,934 craft snapshots and 996 ordered sound requests: five wins and eleven losses. All five winning bonuses match the original completion handler; all 16 result countdown/controller flows pass. No gameplay runtime correction was needed. See `evidence/gameplay-playthroughs-2026-10-15.md`.
- [x] **A02 — Mixed sound channel replacement:** recovered original WaveMix behavior from 130 cases / 422 calls and 2,378 game request records. Same-channel effects now replace preceding effects, other channels remain active, and obsolete async loads cannot restart or spoil newer playback. Real Web Audio channel ownership checks pass. See `evidence/wavemix-channels-2026-10-15.md`.
- [x] **G06 — Browser replay witness:** the complete 1,398-tick Castle input route passes at normal speed and accelerated speed through the shipping controller and renderer, including all nine sound requests. The actual win continues through 60 result ticks and the level-2 opening with score 7,200. This is one browser witness; the other fifteen complete games are offline native/controller comparisons.
- [x] **A03 — Music repeat audit:** the single rendered music pass loses continuing synthesizer state at repeat. Confirmed for all three tracks using the pinned replacement SoundFont; original Windows device PCM was not captured. No speculative crossfade or asset change was made. See `evidence/music-loop-audit-2026-10-15.md`.

## Current priority

The user has deferred font and Help-window differences. Active work is complete input-only playthrough coverage, result/level transitions, original sound channel behavior and audio continuity. Deferred visual items remain recorded below and do not block this work.

## Remaining comparisons

- [x] **U05 — Message-box geometry:** all three layouts are captured on Windows 95; actual original Restart confirms dimensions and controls. Fixed text and close/focus pixels are recovered. Complete window pixels, held-down controls and parent-relative placement remain separate comparisons.
- [ ] **U06 — Complete desktop composition (deferred):** bitmap HUD layers, selected text and instruments have bounded native comparisons. Full menu/dialog/cockpit composition, scaling and all text weights have not been shown identical. Windows 95 regular/bold GDI masks and metrics are captured; Help now uses those masks. Other dynamic dialog labels still use outline fonts and retain browser antialiasing differences.
- [ ] **U07 — Help viewer (deferred):** original topic text, bitmaps, audio and internal links are recovered. Two regular-text popup layouts, source paragraph spacing and position-dependent checker shadows are corrected. The second capture has an unresolved yellow-background dither phase (2,392 pixels); complete viewer chrome, other wrapping/positioning cases, bold/small-caps treatment and native underline geometry remain open. See `evidence/help-popup-2026-10-15/panel-reconstruction.md`.
- [ ] **G02 — Full playthrough coverage:** sixteen independent input-only games now cover start levels 1–16 and all three profiles. An uninterrupted campaign, Difficult-profile wins, more seeds/profile combinations and input-driven equipment use remain open. Earlier controlled fixtures cover equipment separately.
- [ ] **G03 — Native event cadence:** compare Windows timer, repaint, keyboard and radar blink timing in a responsive original session. A routine replay does not establish live timing parity.
- [ ] **R01 — Complete moving frames:** render routines, detail modes, geometry and temporary walls have extensive bounded comparisons. Complete live original-versus-browser frames at matching poses and times remain incomplete.
- [ ] **A01 — Audio output:** mixed-effect channel replacement now matches bounded original WaveMix calls and real Web Audio checks. Original PCM mixing, sample conversion, driver timing and MIDI-device timbre remain separate. The music repeat audit confirms that a single rendered pass does not retain synthesizer tails across repeats; see `evidence/music-loop-audit-2026-10-15.md`. Browser MIDI still uses a replacement instrument bank.


## Deliberate browser additions

- Q/E strafing, touch controls, browser fullscreen and the surrounding browser status UI need an explicit fidelity-mode decision before removal. They are not original-game parity claims.
- Browser Help retains original content in an accessible web viewer; Windows WinHelp itself is not being emulated.

## Previous font/dialog release gate

- [x] Preserve native raw fixtures and distinguish API probes, actual original captures, browser comparisons and inferred behavior.
- [x] Verify 439 browser glyphs, 12 whole strings, mixed Times baseline, text selection and link navigation.
- [x] Verify three native message-box layouts and actual original Restart geometry/text; compare desktop and 390px browser controls.
- [x] Compare both original WinHelp popups, five native text lines, content-fit dimensions and desktop/narrow word positions.
- [x] Verify popup Escape/focus return, selection, outside-click dismissal and integrated dialog/cockpit Help.
- Final source checks, build, publication and production verification are recorded in the durable release delivery record outside this pre-publication source snapshot.

## Playthrough/audio release gate

- [x] Preserve complete recorded inputs, per-tick native state and actual native winning completion records.
- [x] Compare original channel policy and async replacement, failure and disposal behavior.
- [x] Run the real-time browser witness and automatic next-level transition.
- Final browser lifecycle checks, build, publication and production verification are recorded in the durable release delivery record outside this pre-publication source snapshot.
