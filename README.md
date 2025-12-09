# SCEU+ (Simple Chrome Extension Utilities Plus)

<p align="center">
  <img src="public/icons/icon-128.png" alt="SCEU+ Logo" width="128" height="128">
</p>

<p align="center">
  A modern Chrome extension suite for <strong>text randomization</strong> and <strong>Unicode domain phishing protection</strong>.
</p>

<p align="center">
  <a href="https://github.com/mhmddesign/SCEU-Plus/releases">
    <img src="https://img.shields.io/github/v/release/mhmddesign/SCEU-Plus?style=flat-square" alt="Release">
  </a>
  <a href="https://github.com/mhmddesign/SCEU-Plus/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/mhmddesign/SCEU-Plus?style=flat-square" alt="License">
  </a>
</p>

---

## 🌟 About

**SCEU+** is a complete modernization of [ThioJoe's Simple-Chrome-Extension-Utilities](https://github.com/ThioJoe/Simple-Chrome-Extension-Utilities), rebuilt from the ground up with:

- ⚛️ **React** + **TypeScript** for type-safe UI
- 🎨 **Tailwind CSS** + **Shadcn/UI** for modern styling
- 📦 **Manifest V3** for Chrome's latest extension platform
- 🔧 **Vite** for fast development and builds

## ✨ Features

### Text Randomizer
| Action | Description |
|--------|-------------|
| `Alt + Click` | Randomize text with fake data |
| `Ctrl + Click` | Blur randomized text |
| `Ctrl + Alt + Click` | Clear text |
| `Ctrl + Z` | Undo last action |
| `Esc` | Pause/Deactivate |

**Options:**
- 4 fake data types: Random, Lorem Ipsum, Names, Addresses
- Adjustable blur intensity (1-20px)
- Regex filter support
- Pause/Resume preserves modifications

### Unicode Domain Warning
- 🛡️ Detects IDN/Punycode phishing domains
- ⚠️ Warning page with highlighted suspicious characters
- ✅ Whitelist trusted domains
- 📝 Warning history log

## 📥 Installation

### From Chrome Web Store
*Coming soon!*

### Manual Installation (Developer Mode)
1. Download the [latest release](https://github.com/mhmddesign/SCEU-Plus/releases)
2. Extract the ZIP file
3. Go to `chrome://extensions`
4. Enable **Developer mode** (toggle in top-right)
5. Click **Load unpacked**
6. Select the `dist` folder

## 🛠️ Development

```bash
# Install dependencies
npm install

# Development server with HMR
npm run dev

# Production build
npm run build
```

After building, load the `dist` folder as an unpacked extension.

## 📁 Project Structure

```
chrome-extension-suite/
├── src/
│   ├── popup/          # Popup dashboard
│   ├── options/        # Options/Settings page
│   ├── warning/        # Unicode warning page
│   ├── background/     # Service worker
│   ├── content/        # Content scripts
│   ├── components/ui/  # Shadcn components
│   ├── stores/         # Zustand state
│   └── types/          # TypeScript types
├── public/icons/       # Extension icons
├── dist/               # Build output
└── manifest.json       # Extension manifest
```

## 🙏 Credits

- **Fork Author:** [Mohammed EL MAACHI](https://x.com/Mohelmaachi)
- **Original Project:** [ThioJoe's Simple-Chrome-Extension-Utilities](https://github.com/ThioJoe/Simple-Chrome-Extension-Utilities)

## 📄 License

This project is open source. See the original project for license details.

---

<p align="center">
  Made with ❤️ by <a href="https://x.com/Mohelmaachi">Mohammed EL MAACHI</a>
</p>
