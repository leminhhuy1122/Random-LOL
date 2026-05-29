<div align="center">

# Random LOL

### A cinematic League of Legends randomizer built with **vibe code**

Random champions, build playful 5v5 teams, and look up Riot player profiles in a Hextech-inspired web experience.

<br />

## [Open Live Demo](https://random-lol-ochre.vercel.app/)

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

</div>

---

## Live Website

The project is deployed here:

### [https://random-lol-ochre.vercel.app/](https://random-lol-ochre.vercel.app/)

Click the link above to try the app directly in your browser.

---

## About Random LOL

Random LOL is a fan-made League of Legends companion web app focused on fun randomization and a strong game-client feeling.

It is designed for quick moments like:

- "Give me one random champion to play."
- "Generate a 5v5 team lineup."
- "Look up this Riot ID and show useful stats."
- "Make the random experience feel cinematic, not plain."

The UI takes inspiration from Riot Client / Hextech vibes: dark panels, glowing accents, champion splash art, roulette motion, and polished control panels.

---

## Built With Vibe Code

This project was made through **vibe code**.

That means the web app was built by following the feeling of the product as much as the feature list: fast iterations, visual feedback, playful UI decisions, and code shaped around the intended mood.

The goal was not just to make a tool.  
The goal was to make a randomizer that feels fun to open, click, and show to friends.

---

## Features

### Champion Roulette

Random 1 champion with a cinematic roulette reveal, champion art, lane role, spells, items, and animated result states.

### Random Team 5v5

Generate 1-team or 2-team League-style lineups with lane filtering and side-based layouts.

### Player Lookup

Search by Riot ID and view:

- Profile information
- Solo/Duo and Flex rank
- Recent match history
- Champion stats
- Win rate and performance panels

### Bilingual UI

Instant language switching:

- Vietnamese
- English

The selected language is saved locally.

### Settings Panel

Customize:

- Language
- Theme
- Effects level
- Sound preference
- Default region
- Default team mode
- Local history data

---

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React
- Riot Data Dragon
- Riot API
- Vercel

---

## Environment Variables

Create `.env.local` for local development:

```env
RIOT_API_KEY=your_riot_api_key_here
```

On Vercel, add the same variable in:

```text
Project Settings -> Environment Variables
```

`RIOT_API_KEY` is required for player lookup. Champion data and random champion features use Riot Data Dragon.

---

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Build Check

```bash
npm run lint
npm run build
```

---

## Deploy To Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Keep the default Next.js settings.
4. Add `RIOT_API_KEY` in Environment Variables.
5. Deploy.

The project includes `vercel.json`:

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev"
}
```

---

## Disclaimer

Random LOL is a fan-made project and is not endorsed by Riot Games.

League of Legends assets and data are provided through Riot Data Dragon and Riot APIs.
