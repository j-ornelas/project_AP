# Project AP

A browser-based axis/power game inspired by classics from the 90s/00s. Two players take turns firing projectiles at each other's domes, adjusting power and angle to hit their opponent.

## Tech Stack

- **TypeScript** - Type-safe game logic
- **HTML5 Canvas** - 2D rendering
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern UI styling

## Features

- ✅ Turn-based gameplay
- ✅ Realistic projectile physics with gravity
- ✅ Destructible terrain with crater formation
- ✅ Health system for domes
- ✅ Visual projectile trails
- ✅ Keyboard and mouse controls
- ✅ Responsive canvas rendering

## Project Structure

```
project_AP/
├── index.html                    # Main HTML entry point
├── src/
│   ├── main.ts                   # Application entry point
│   ├── styles/
│   │   └── main.css              # UI styles
│   └── game/
│       ├── Game.ts               # Main game loop and orchestration
│       ├── GameState.ts          # Game state management
│       ├── Renderer.ts           # Canvas rendering logic
│       ├── Physics.ts            # Physics calculations
│       ├── InputHandler.ts       # User input handling
│       └── entities/
│           ├── Dome.ts           # Player dome entity
│           ├── Projectile.ts     # Projectile entity
│           └── Terrain.ts        # Terrain generation and modification
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts               # Vite build configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How to Play

### Controls

**Mouse:**

- Use the **Power** slider to adjust shot power (10-100%)
- Use the **Angle** slider to adjust firing angle (0-90°)
- Click **Fire!** button to shoot

**Keyboard:**

- `Arrow Up/Down` - Adjust power
- `Arrow Left/Right` - Adjust angle
- `Space` or `Enter` - Fire projectile

### Gameplay

1. Players take turns firing projectiles
2. Adjust power and angle to hit your opponent's dome
3. Direct hits deal damage based on proximity
4. Projectiles create craters that modify the terrain
5. First player to destroy their opponent's dome wins!

## Code Architecture

### Game Loop

The game uses a standard game loop with delta time for smooth animation:

- **Update**: Physics calculations and collision detection
- **Render**: Draw terrain, domes, and projectiles

### Entity System

- `Dome`: Player structures with health
- `Projectile`: Flying projectiles with physics
- `Terrain`: Procedurally generated hills with crater deformation

### Physics

Simple Newtonian physics:

- Gravity: 500 pixels/second²
- Parabolic trajectories
- Collision detection with terrain

## Future Enhancements

Potential features to add:

- [ ] Multiplayer support (Socket.io)
- [ ] Wind effects
- [ ] Multiple weapon types
- [ ] Power-ups and special abilities
- [ ] AI opponent
- [ ] Sound effects and music
- [ ] Game menu and settings
- [ ] Multiple maps/terrain types
- [ ] Score tracking and leaderboards

## Development

### Linting

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## License

See LICENSE file for details.

## Contributing

Feel free to submit issues and pull requests!
