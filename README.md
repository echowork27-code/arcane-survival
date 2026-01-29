# 🔮 Arcane Survival

A magical survival arena game for Telegram Mini Apps, inspired by Hogwarts Legacy's dark mystical aesthetic.

![Game Preview](https://via.placeholder.com/800x450/1A1A3E/D4AF37?text=Arcane+Survival)

## ✨ Features

- **Immersive Storytelling**: Opening narrative, wave introductions, mentor tips, and unlockable lore
- **Dark Magical Aesthetic**: Deep purples, gold accents, mystical effects, Gothic UI
- **Touch Controls**: Virtual joystick for movement, attack button for spell casting
- **Wave-based Survival**: Face increasingly difficult waves of magical creatures
- **Spell System**: Collect and switch between Fire, Ice, and Lightning spells
- **Combo System**: Chain kills for multiplied scores
- **Codex**: Unlock lore entries by reaching milestones
- **Telegram Integration**: Haptic feedback, cloud saves, user identification

## 🎮 Gameplay

You are the last apprentice of the Arcane Order. Dark creatures have breached the ancient wards. The elders have fallen. Only you remain.

**Survive. Grow stronger. Reclaim what was lost.**

### Controls
- **Left Side**: Virtual joystick for movement
- **Right Side**: Attack button to cast spells
- **Keyboard** (for testing): WASD/Arrows to move, Space to attack

### Enemies
- 👻 **Shadow Wisps**: Fast, erratic, but weak
- ⚔️ **Corrupted Knights**: Slow, armored, hit hard
- 🌀 **Void Wraiths**: Swift hunters that can phase
- 👑 **Bosses**: Powerful champions of darkness (every 5-10 waves)

### Spells
- 🔥 **Ignis (Fire)**: Balanced damage and speed
- ❄️ **Glacius (Ice)**: Slightly slower, consistent damage
- ⚡ **Fulmen (Lightning)**: High damage, very fast

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd mini-survival-arena

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📱 Telegram Mini App Setup

1. **Create a Bot**: Talk to [@BotFather](https://t.me/BotFather) on Telegram
2. **Get a Web App URL**: Deploy your built game to a HTTPS server
3. **Configure the Mini App**: 
   ```
   /newapp - Create new mini app
   Choose your bot
   Provide the app URL
   Set a short name
   ```

### Testing in Telegram
- Use the Mini App directly via bot
- Or use Test Mode in Telegram Desktop (right-click Mini Apps button → Enable Test Mode)

## 🎨 Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Deep Purple | `#2D1B4E` | Primary background accent |
| Dark Blue | `#1A1A3E` | Main background |
| Gold | `#D4AF37` | Highlights, text, UI accents |
| Mystical Cyan | `#4ECDC4` | Secondary accents, magic effects |

### Typography
- **Cinzel**: Headers, UI buttons, titles
- **Crimson Text**: Body text, narrative, dialogue

### Effects
- Subtle particle effects (sparkles, mist)
- Screen shake on hits
- Glow effects on spells and UI
- Fade transitions between scenes

## 📁 Project Structure

```
mini-survival-arena/
├── index.html              # Entry HTML with Telegram SDK
├── package.json            # Dependencies
├── vite.config.js          # Build configuration
├── src/
│   ├── main.js             # Game initialization
│   ├── config.js           # Game constants and settings
│   ├── scenes/
│   │   ├── BootScene.js    # Asset generation & loading
│   │   ├── IntroScene.js   # Opening narrative
│   │   ├── MenuScene.js    # Main menu
│   │   ├── GameScene.js    # Core gameplay
│   │   ├── GameOverScene.js # Death screen & stats
│   │   └── CodexScene.js   # Lore collection
│   ├── entities/
│   │   ├── Player.js       # Player character
│   │   └── Enemy.js        # Enemy types
│   ├── ui/
│   │   ├── VirtualJoystick.js  # Touch movement
│   │   ├── AttackButton.js     # Touch attack
│   │   └── DialogBox.js        # Narrative display
│   ├── data/
│   │   ├── waves.js        # Wave configurations
│   │   ├── lore.js         # Codex entries
│   │   └── dialogue.js     # All game text
│   ├── utils/
│   │   └── telegram.js     # Telegram WebApp integration
│   └── styles/
│       └── main.css        # Base styles
└── README.md
```

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Core gameplay loop
- [x] Touch controls
- [x] Wave system
- [x] Spell system
- [x] UI/UX
- [x] Telegram integration

### Phase 2 (Future)
- [ ] Sound effects & ambient music
- [ ] More enemy types
- [ ] Power-ups and abilities
- [ ] Daily challenges
- [ ] Leaderboards via Telegram Cloud

### Phase 3 (Future)
- [ ] Boss battles with unique mechanics
- [ ] Character skins
- [ ] Achievement system
- [ ] Social features (share scores)

## 🛠 Technical Notes

### Performance
- All assets are procedurally generated (no external images needed)
- Optimized for mobile touch input
- Efficient particle systems
- Physics-based movement

### Landscape Mode
The game is designed for landscape orientation. A "rotate device" overlay appears in portrait mode.

### Browser Compatibility
- Modern browsers (Chrome, Safari, Firefox)
- Telegram WebView (iOS and Android)

## 📝 Audio Notes

Audio is not implemented in this version but the code is structured to add:
- **Ambient**: Dark, mystical background music
- **SFX**: Spell casts, enemy hits, deaths, UI clicks
- **Voice**: Optional narrator for story moments

## 🙏 Credits

- Game Engine: [Phaser 3](https://phaser.io/)
- Build Tool: [Vite](https://vitejs.dev/)
- Platform: [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- Fonts: [Google Fonts](https://fonts.google.com/) (Cinzel, Crimson Text)
- Inspiration: Hogwarts Legacy, Vampire Survivors

## 📄 License

MIT License - feel free to use, modify, and distribute!

---

*"The shadows test you. Stand firm, apprentice."*
