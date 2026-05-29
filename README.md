# Random LOL

Random LOL is a cinematic League of Legends randomizer and companion web app.

Live demo: https://random-lol-ochre.vercel.app/

Built with a **vibe coding** workflow: fast, visual, iterative development where product idea, UI mood, and code evolve together until the app feels right.

## What It Does

Random LOL helps League of Legends players quickly create fun picks and lineups:

- Random 1 champion with a cinematic roulette reveal.
- Generate random 5v5 teams.
- Look up a player by Riot ID.
- View rank, recent match history, champion stats, and performance insights.
- Switch instantly between Vietnamese and English.
- Customize theme, effects, sound, region, and default team mode.

## Demo

Try it here:

https://random-lol-ochre.vercel.app/

## Vibe Coding Note

This project was shaped through vibe coding: building by feel, flow, and fast feedback.

The goal was not only to make a utility, but to make a small web experience that feels like a game client: dark, cinematic, Hextech-inspired, and fun to click.

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

## Features

### Random Champion Roulette

A cinematic single champion randomizer with roulette motion, reveal states, champion art, role info, summoner spells, and suggested items.

### Random Team 5v5

Generate one or two League-style team lineups with lane filtering and side-based team layouts.

### Player Lookup

Search by Riot ID to inspect:

- Profile information
- Solo/Duo and Flex rank
- Recent match history
- Champion usage
- Win rate and performance panels

### Language Support

The app supports:

- Vietnamese
- English

Language changes apply instantly without reloading and are saved locally.

### Settings

Settings include:

- Language
- Theme
- Effects level
- Sound preference
- Default region
- Default team mode
- Local history clearing

## Environment Variables

For local development, create `.env.local`:

```env
RIOT_API_KEY=your_riot_api_key_here
```

For Vercel, add the same variable in:

```text
Project Settings -> Environment Variables
```

`RIOT_API_KEY` is required for player lookup. Champion data and randomizer features use Riot Data Dragon.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Check Build

```bash
npm run lint
npm run build
```

## Deploy To Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Use the default Next.js settings.
4. Add `RIOT_API_KEY` to Environment Variables.
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

## Disclaimer

Random LOL is a fan-made project and is not endorsed by Riot Games.

League of Legends assets and data are provided through Riot Data Dragon and Riot APIs.
