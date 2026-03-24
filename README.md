# Lyriks Music App

A modern React + Vite music discovery and preview player app.

## Highlights
- Discover top songs
- Search songs by keyword
- Artist and song detail pages
- Related songs by artist
- In-app preview playback
- Responsive UI with Tailwind CSS

## Tech Stack
- React 18
- Redux Toolkit + RTK Query
- React Router v6
- Tailwind CSS
- Vite
- Vitest (unit testing)

## API
This project uses public iTunes endpoints (no API key required).

## Getting Started
1. Install dependencies:
   npm install
2. Run development server:
   npm run dev
3. Open the URL shown by Vite.

## Scripts
- npm run dev: start dev server
- npm run build: create production build
- npm run preview: preview production build
- npm test: run unit tests

## Branching and TDD Flow
- main: stable release branch
- chore/github-readiness: repository standards and GitHub files
- test/tdd-normalizers: red-green unit test commits for track normalization

## Project Structure
- src/components: reusable UI components
- src/pages: route-level pages
- src/redux: store, slices, and API service
- src/assets: static assets and constants

## License
MIT
