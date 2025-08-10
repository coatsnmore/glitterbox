# ✨ SpaceCat's Glitterbox

A modern portfolio website showcasing interactive games, tech demos, and creative coding projects. Built with Astro for fast, static site generation.

## 🎮 Live Demos

- **🌲 Forest Game** - Interactive forest exploration game with procedurally generated environments
- **🚀 Space Game** - Space shooter adventure with physics and audio
- **🎉 Best Friend Party** - Interactive party game with cat characters
- **🧟 Vampire Survivors Clone** - Action survival game with canvas rendering
- **🌿 Survival Game** - 3D survival experience built with Three.js
- **📱 Wellness Tracker** - Progressive Web App for daily wellness and journaling

## 🏗️ Tech Stack

- **Framework**: [Astro](https://astro.build) - Static site generator
- **Styling**: CSS with modern glassmorphism effects
- **Game Technologies**: 
  - Vite for build tooling
  - Matter.js for physics (Space Shooter)
  - Tone.js for audio (Space Shooter)
  - Three.js for 3D graphics (Survival)
  - Canvas API for 2D rendering (Vampire)
- **PWA Features**: Service workers, local storage, offline support
- **Deployment**: Ready for deployment to spacecat.org

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd glitterbox
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:4321`

## 📁 Project Structure

```
glitterbox/
├── apps/
│   └── wellness-tracker/     # PWA wellness tracking app
├── games/
│   ├── best-friend-party/    # Cat party game (Vite + vanilla JS)
│   ├── chill-forest/         # Forest exploration game (Vite + vanilla JS)
│   ├── space-shooter/        # Space game (Vite + Matter.js + Tone.js)
│   └── survival/             # 3D survival game (Vite + Three.js)
├── public/
│   ├── best-friend-party/    # Built game assets
│   ├── forest/               # Forest game assets
│   ├── space/                # Space game assets
│   ├── survival/             # Survival game assets
│   ├── vampire/              # Vampire game assets
│   ├── wellness/             # Wellness app assets
│   └── favicon.png           # SpaceCat brand favicon
├── src/
│   ├── assets/
│   │   ├── spacecat_logo_glitterbox_style_transparent.png
│   │   └── glitterbox_combined_transparent.png
│   ├── components/
│   │   └── Welcome.astro     # Main landing page
│   ├── layouts/
│   │   └── Layout.astro      # Base layout template
│   └── pages/
│       ├── index.astro       # Home page
│       ├── about.astro       # About page
│       ├── forest.astro      # Forest game page
│       ├── space.astro       # Space game page
│       ├── best-friend-party.astro  # Party game page
│       ├── survival.astro    # Survival game page
│       ├── vampire.astro     # Vampire game page
│       └── wellness.astro    # Wellness app page
└── package.json
```

## 🎮 Game Details

### 🌲 Chill Forest
- **Type**: Procedural forest exploration
- **Tech**: Vanilla JavaScript, Vite
- **Features**: Dynamic environment generation, interactive elements

### 🚀 Space Shooter
- **Type**: Physics-based space combat
- **Tech**: Matter.js physics, Tone.js audio, Vite
- **Features**: Realistic physics, sound effects, responsive controls

### 🎉 Best Friend Party
- **Type**: Interactive party game
- **Tech**: Vanilla JavaScript, Vite
- **Features**: Cat characters, party mechanics

### 🧟 Vampire Survivors Clone
- **Type**: Action survival
- **Tech**: Canvas API, vanilla JavaScript
- **Features**: Real-time combat, enemy spawning

### 🌿 Survival Game
- **Type**: 3D survival experience
- **Tech**: Three.js, Vite
- **Features**: 3D graphics, immersive environment

## 📱 App Details

### Wellness Tracker
- **Type**: Progressive Web App
- **Tech**: Vanilla JavaScript, PWA features
- **Features**: 
  - Daily goal tracking
  - Food logging
  - Personal notes/journaling
  - Local storage
  - Offline support
  - Service worker registration

## 🎨 Design Features

- **Dark Tech Theme**: Deep blue/purple gradients with animated overlays
- **Glassmorphism UI**: Modern backdrop blur effects and transparency
- **Responsive Design**: Optimized for desktop and mobile
- **Brand Integration**: SpaceCat branding with Glitterbox product focus
- **Smooth Animations**: Hover effects and transitions throughout

## 🎮 Adding New Games

To add a new game to the portfolio:

1. **Create game directory**:
   ```bash
   mkdir public/your-game-name
   ```

2. **Add game files** to `public/your-game-name/`

3. **Create Astro page** at `src/pages/your-game-name.astro`:
   ```astro
   ---
   import Layout from '../layouts/Layout.astro';
   ---
   
   <Layout>
     <div id="game-container">
       <iframe 
         src="/your-game-name/index.html" 
         width="100%" 
         height="100%" 
         frameborder="0"
         style="border: none;"
       ></iframe>
     </div>
   </Layout>
   ```

4. **Update asset paths** in your game's HTML to include the subdirectory (e.g., `/your-game-name/assets/`)

5. **Add link** to the main page in `src/components/Welcome.astro`

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to spacecat.org

The site is configured for deployment to spacecat.org. Build files will be generated in the `./dist/` directory.

## 🎯 Available Scripts

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |

### Individual Game Development

Each game can be developed independently:

```bash
cd games/your-game-name
npm install
npm run dev
```

## 🌟 Features

- **Fast Loading**: Static site generation for optimal performance
- **SEO Optimized**: Built-in meta tags and structured data
- **Accessible**: Semantic HTML and ARIA labels
- **Modern CSS**: CSS Grid, Flexbox, and custom properties
- **Game Integration**: Seamless iframe embedding for interactive content
- **PWA Support**: Progressive Web App capabilities for mobile
- **Cross-Platform**: Works on desktop, mobile, and tablets

## 🛠️ Development Tools

- **Vite**: Fast build tool for modern web development
- **Astro**: Static site generator with component support
- **Modern JavaScript**: ES6+ features and modules
- **CSS Grid/Flexbox**: Modern layout systems
- **Responsive Design**: Mobile-first approach

## 📝 License

This project is part of the SpaceCat portfolio. All rights reserved.

---

**Built with ❤️ by SpaceCat**
