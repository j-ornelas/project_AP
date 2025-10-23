# Project AP

A browser-based **multiplayer** axis/power game inspired by classics from the 90s/00s. Two players take turns firing projectiles at each other's domes over a network, adjusting power and angle to hit their opponent.

## Tech Stack

**Frontend:**

- **TypeScript** - Type-safe game logic
- **HTML5 Canvas** - 2D rendering
- **Socket.io Client** - Real-time communication
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern UI styling

**Backend:**

- **Node.js + Express** - Web server
- **Socket.io** - WebSocket server for real-time multiplayer
- **TypeScript** - Type-safe server logic

## Features

- ✅ **Real-time multiplayer** over network
- ✅ **2-6 player support** - Choose how many players you want in your game
- ✅ **Player customization** - Choose your name and color
- ✅ **Smart matchmaking** - Automatic lobby system groups players by game size
- ✅ **Dynamic player positioning** - Domes are distributed evenly across terrain
- ✅ Turn-based gameplay with visual turn indicators
- ✅ **Live player display** - See all players, their health, and whose turn it is
- ✅ Realistic projectile physics with gravity
- ✅ Destructible terrain with crater formation
- ✅ Health system with visual health bars
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
│   │   ├── main.css              # Game UI styles
│   │   └── lobby.css             # Lobby screen styles
│   ├── network/
│   │   └── NetworkManager.ts     # Socket.io client & network communication
│   ├── ui/
│   │   └── LobbyScreen.ts        # Player lobby & matchmaking UI
│   └── game/
│       ├── Game.ts               # Main game loop and multiplayer sync
│       ├── GameState.ts          # Game state management
│       ├── Renderer.ts           # Canvas rendering logic
│       ├── Physics.ts            # Physics calculations
│       ├── InputHandler.ts       # User input handling
│       └── entities/
│           ├── Dome.ts           # Player dome entity
│           ├── Projectile.ts     # Projectile entity
│           └── Terrain.ts        # Terrain generation and modification
├── server/
│   ├── index.ts                  # Express + Socket.io server
│   └── GameRoom.ts               # Game room management & matchmaking
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

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to Render.

**Quick Deploy:**

1. Push code to GitHub
2. Connect to Render with Blueprint (`render.yaml`)
3. Set environment variables (URLs for frontend/backend)
4. Done! 🚀

## How to Play

### Getting Started

1. Open the game in your browser (`http://localhost:3000`)
2. **Enter your name** and **choose your color**
3. **Select number of players** (2-6) for your game
4. Click **"Find Game"**
5. Wait for other players to join (the lobby shows current count)
6. Game starts automatically when all players are ready!

**To test locally:** Open multiple browser windows/tabs and join with different names to fill up a lobby.

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

1. Players take turns firing projectiles in order (**turn indicator** shows whose turn it is)
2. Adjust power (10-100%) and angle (0-180°) to hit opponent domes
3. Direct hits deal damage based on proximity (watch the **health bars**)
4. Projectiles create craters that modify the terrain dynamically
5. Controls are **only active during your turn**
6. **Player cards highlight** the current player with a green glow
7. Last player standing wins! (eliminated players shown dimmed)

### Multiplayer Features

- **Variable player count** - Create 2-6 player games
- **Smart lobby system** - Players are grouped by their desired game size
- **Automatic matchmaking** - Game starts when lobby is full
- **Real-time synchronization** - Game state syncs across all clients
- **Turn-based rotation** - Turns cycle through all players in order
- **Live player tracking** - See all players, their health, and current turn status
- **Dynamic UI** - Player cards update in real-time showing health and status
- **Player customization** - Each player has their chosen name and color
- **Disconnect handling** - Game ends gracefully if any player disconnects

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

- [ ] Game lobbies with multiple rooms
- [ ] Spectator mode
- [ ] Wind effects affecting projectile trajectory
- [ ] Multiple weapon types (missiles, lasers, bombs)
- [ ] Power-ups and special abilities
- [ ] AI opponent for single-player
- [ ] Sound effects and background music
- [ ] Chat system between players
- [ ] Multiple maps/terrain types
- [ ] Ranked matchmaking and ELO system
- [ ] Score tracking and leaderboards
- [ ] Game replays and highlights

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
