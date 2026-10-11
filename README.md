# Carom

Carom is a top-down paddle duel for the browser. Two paddles face off across a
dark field, a fast ball curves from paddle spin, and two fixed center obstacles
turn ordinary returns into bank-shot puzzles.

## Install

```sh
npm ci
```

## Development

```sh
npm run dev
```

Open the Vite URL in a browser. The game runs entirely on the client: no server
logic, assets, accounts, or API keys are needed.

## Production Build

```sh
npm run build
```

The static site is emitted to `dist/` with `dist/index.html` as its entry point.
It can be served from the root of any static file server.

## Controls

- `W` / `S`: move the left paddle.
- `ArrowUp` / `ArrowDown`: move the right paddle in Versus.
- Solo mode lets either movement key set control the human paddle while the AI
  defends the right side.
- `Enter` or `Space`: confirm menu items.
- `P` or `Escape`: pause and resume during play.
- `Escape`: back out of menus.
- `M`: mute or unmute.

## Checks

```sh
npm run typecheck
npm run lint
npm run format
npm test
```
