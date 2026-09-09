# MovieSim

A movie studio management game designed for iOS, with a web prototype planned for testing.

**[Play the five-year demo](https://themvf.github.io/MovieSim/)** — works in desktop and phone browsers. Progress saves on your device.

Build a studio over five years: acquire scripts, discover actors, hire directors, finance productions, market and distribute movies, create sequels, and pursue both profits and awards.

## Design

See [the five-year demo design](DEMO-DESIGN.md) for confirmed decisions, deferred features, and open implementation questions.

## Play locally

Run `npm start` with Node.js 22+, then open http://127.0.0.1:4173. No package installation is needed.

## Status

Playable five-year web demo, version 0.4. Acquire scripts, audition talent, run productions, market and release movies, create sequels, pursue awards, and manage cash and debt. Progress saves on your device.

See [implementation and balance notes](IMPLEMENTATION.md) for the shipped systems, tests, and current limitations. Run `npm test` for simulation checks.

The 0.3 update adds rounded money displays, a monthly release calendar, percentage-based distribution comparisons, weekly movie-card charts with occasional seasonal resurgences, and saved expectations-versus-reality opening reports. Existing saves remain compatible.

The 0.4 update tightens performer estimates to 5/10/15/20-point ranges, adds 58 subgenres and descriptive production scopes, compares cast/director forecasts with delivered work, simplifies studio benefits, and fixes stale announcement navigation.
