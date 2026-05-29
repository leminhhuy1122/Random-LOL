# Random LOL

Random LOL is a cinematic League of Legends companion web app for quickly randomizing champions, generating 5v5 teams, and looking up player profiles through Riot APIs.

This web app was created through **vibe coding**: fast, idea-driven building where design direction, product feel, and implementation evolve together in the same flow.

## Highlights

- Random 1 champion with a roulette-style cinematic reveal.
- Generate 1-team or 2-team 5v5 lineups.
- Player lookup by Riot ID with rank, match history, champion stats, and performance panels.
- Vietnamese and English UI with instant language switching.
- Hextech / Riot Client inspired interface.
- Local settings for language, theme, effects, sound, region, and default team mode.
- Ready for deployment on Vercel.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React
- Riot Data Dragon and Riot API

## Environment Variables

Create a `.env.local` file for local development:

```env
RIOT_API_KEY=your_riot_api_key_here
```

On Vercel, add the same variable in:

`Project Settings -> Environment Variables`

`RIOT_API_KEY` is required for player lookup. Champion data and random features use Riot Data Dragon.

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build Check

```bash
npm run lint
npm run build
```

## Deploy To Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Vercel should auto-detect **Next.js**.
4. Add `RIOT_API_KEY` in Environment Variables.
5. Deploy.

The included `vercel.json` pins the expected commands:

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev"
}
```

## Project Notes

Random LOL is a fan-made tool and is not endorsed by Riot Games. League of Legends assets and data are provided through Riot Data Dragon and Riot APIs.

