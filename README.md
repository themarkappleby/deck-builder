# Deck Builder Boss Battler

A digital prototype of a co-op deck builder boss battler card game, built with React and Vite.

## Live Demo

🎮 **Play the game:** [https://themarkappleby.github.io/deck-builder/](https://themarkappleby.github.io/deck-builder/)

## Features

- **Character Building**: Choose your race, class, and god cards to create unique character builds
- **Boss Battles**: Face 3 increasingly difficult bosses with telegraphed actions
- **Deck Building**: Play, purchase, and trash cards to optimize your deck
- **Combat System**: Use attack and block symbols to damage bosses and defend yourself
- **Progression**: Level up your character cards after defeating each boss

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

### Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
1. Build the project
2. Deploy to GitHub Pages

### Manual Deployment

You can also deploy manually using:

```bash
npm run deploy
```

### GitHub Pages Setup

Make sure GitHub Pages is enabled in your repository settings:
1. Go to Settings > Pages
2. Under "Build and deployment", select "GitHub Actions" as the source
3. The site will be deployed to: `https://themarkappleby.github.io/deck-builder/`

## Game Rules

### Setup
1. Select a race, class, and god card (each with two sides)
2. Start with 10 HP and a deck of 5 Attack cards, 4 Block cards, and 1 Purple card

### Gameplay
- **Round Start**: Boss telegraphs their action, players draw 6 cards
- **Player Turn**: Play/purchase/trash cards by paying their cost (discard cards equal to symbol count)
- **Round End**: Boss executes their action, dealing damage or using special abilities

### Card Symbols
- 🔺 Attack: Deal 1 damage to boss (immediately)
- 🔹 Block: Gain 1 block (reduces boss damage at end of round)
- 🟣 Purple: Level 1 race effect
- 🟩 Green: Level 1 class effect
- ⭐️ Star: Level 1 god effect

### Victory & Defeat
- **Win**: Defeat all 3 bosses
- **Lose**: Your HP reaches 0
- **Level Up**: After each boss, level up 2 character cards

## Technology Stack

- React 18
- Vite 5
- CSS3 with modern gradients and animations

## Project Structure

```
/src
  /components
    CharacterSelect.jsx    # Character creation screen
    GameBoard.jsx          # Main game logic and UI
    Card.jsx              # Card component
  gameData.js             # Card definitions and game data
  App.jsx                 # Root component
  main.jsx               # Entry point
```

## Future Enhancements

- Token mechanics (blood tokens, rage tokens, etc.)
- Special boss abilities (curse, dragon breath with block penetration)
- More races, classes, gods, and bosses
- Multiplayer support (2-4 players)
- Save/load game state
- Card animations and visual effects
- Sound effects and music

## License

MIT
