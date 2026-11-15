# 🚀 Hamilton's Mission: A Space Adventure

**Team Hamilton // NASA Space Apps Challenge**

> *An interactive 16-bit retro space survival & systems-engineering game that teaches students how real NASA space hazards force critical operational trade-offs.*

🔗 **Play Live:** https://isah-eng.github.io/hamilton-mission/

---

### 🎯 Overview & Educational Goal
Space exploration is a constant battle against limited resources and coupled subsystems. Inspired by **Margaret Hamilton** and historic NASA missions, **Hamilton's Mission: A Space Adventure** puts players in command of a Lunar Research Station (Mode 1) and an Autonomous Mars Habitat (Mode 2).

Instead of memorizing isolated facts, players experience **systems engineering**:
- **Coupled Trade-Offs:** Boosting the magnetic shield drains reactor power; running MOXIE oxygen conversion consumes overnight battery reserves.
- **Cascade Effects:** Decisions trigger delayed consequences in subsequent turns.
- **20-Minute Earth-Mars Latency (Mode 2):** When communication with Earth is delayed, onboard AI **APOLLO** switches to Autonomous Mode, challenging players to interpret raw NASA sensor charts on their own.

---

### 🛰️ NASA Open Data & Scientific Integration
Every environmental hazard and telemetry chart in the game is grounded in real NASA datasets and mission archives:
- **NASA DONKI (Space Weather Database):** Solar flare classes and Coronal Mass Ejection (CME) speeds (`km/s`) and proton flux (`pfu`).
- **LRO (Lunar Reconnaissance Orbiter):** South Pole solar irradiance drops (`W/m²`), Diviner surface thermal loads (`K`), and CRaTER radiation spikes.
- **Mars Perseverance & Curiosity Instruments:** MEDA dust optical depth (`tau`), MOXIE $\text{CO}_2$-to-$\text{O}_2$ power trade-offs, and RAD cosmic radiation metrics.
- **Historic NASA Archives:** Apollo 13 power rationing (1970), Skylab thermal parasol deployment (1973), and the August 1972 solar storm.
- **Citizen Science Bridge:** Completing each phase unlocks direct pathways to real NASA citizen science initiatives (**GLOBE Observer**, **Sungrazer**, **Aurorasaurus**, and **AI4Mars**).

---

### 🛠️ Technical Architecture
Built with **zero external frameworks** for instant loading on any school computer or browser:
- **HTML5 Canvas Pixel Engine (`js/canvasEngine.js`):** Custom sprite renderer, segmented resource bars with damage trails, bilingual UI (`EN` / `PT`), and animated APOLLO copilot diagnostics.
- **Simulation & Telemetry Engine (`js/simulation.js`):** Real-time net-outcome calculator, phase-to-phase resource persistence, canvas telemetry curve plotter, and downloadable PNG **Mars Commander Certificate**.
- **NASA Data Service (`js/nasaService.js`):** Live fetch integration with NASA DONKI API paired with a resilient offline mission dataset fallback.
- **8-Bit Web Audio Synthesizer (`js/audioEngine.js`):** Procedural retro sound effects and space-opera background music generated via the Web Audio API (no external audio files required).

---

### 🏆 Note for Judges (`JUDGE PASS`)
To allow evaluators to test both game modes immediately without playing through all 9 Lunar turns first, click **`JUDGE PASS: M1 (STATION)`** in the top navigation bar to toggle directly into **Mode 2: Mars Expedition** (complete with EVA Space Suit and raw telemetry mode).
