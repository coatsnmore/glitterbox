# ✨ SpaceCat's Glitterbox

A modern portfolio website showcasing interactive games, tech demos, and creative coding projects. Built with Astro for fast, static site generation.

## 🎮 Live Demos

 - **🌲 Forest Game** - Interactive forest exploration game
 - **🌳 Forest Explorer** - First-person trailblazing adventure
 - **🚀 Space Game** - Space shooter adventure
 - **More coming soon!**

## 🏗️ Tech Stack

- **Framework**: [Astro](https://astro.build) - Static site generator
- **Styling**: CSS with modern glassmorphism effects
- **Deployment**: Ready for deployment to spacecat.org

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio-website
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
/
├── public/
│   ├── forest/          # Forest game assets
│   ├── forest-explorer/ # Forest explorer game assets
│   ├── space/           # Space game assets
│   └── favicon.png      # SpaceCat brand favicon
├── src/
│   ├── assets/
│   │   ├── spacecat_logo_glitterbox_style_transparent.png
│   │   └── glitterbox_combined_transparent.png
│   ├── components/
│   │   └── Welcome.astro    # Main landing page
│   ├── layouts/
│   │   └── Layout.astro     # Base layout template
│   └── pages/
│       ├── index.astro          # Home page
│       ├── forest.astro         # Forest game page
│       ├── forest-explorer.astro # Forest explorer game page
│       └── space.astro          # Space game page
└── package.json
```

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

## 🌟 Features

- **Fast Loading**: Static site generation for optimal performance
- **SEO Optimized**: Built-in meta tags and structured data
- **Accessible**: Semantic HTML and ARIA labels
- **Modern CSS**: CSS Grid, Flexbox, and custom properties
- **Game Integration**: Seamless iframe embedding for interactive content

## 📝 License

This project is part of the SpaceCat portfolio. All rights reserved.

---

**Built with ❤️ by SpaceCat**
