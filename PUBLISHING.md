# Publishing Guide

## 🚀 GitHub Release

### 1. Prepare the Release
```bash
# Build production
npm run build

# Create a ZIP of the dist folder
```

### 2. Create Release on GitHub
1. Go to your repo: https://github.com/mhmddesign/SCEU-Plus
2. Click **Releases** → **Draft a new release**
3. Click **Choose a tag** → Type `v1.0.0` → **Create new tag**
4. **Release title:** `SCEU+ v1.0.0`
5. **Description:** Copy the changelog/features
6. **Attach files:** Upload `sceu-plus-v1.0.0.zip` (the dist folder zipped)
7. Click **Publish release**

---

## 🏪 Chrome Web Store

### 1. Create Developer Account
1. Go to: https://chrome.google.com/webstore/devconsole
2. Pay one-time $5 registration fee
3. Verify identity if required

### 2. Prepare Assets
You'll need:
- **Icons:** 128x128 PNG (you have this)
- **Screenshots:** 1280x800 or 640x400 (at least 1, up to 5)
- **Promotional tile:** 440x280 PNG (optional but recommended)
- **Description:** 132 characters max for short, full description below

### 3. Prepare Extension Package
```bash
# Build production
npm run build

# Create ZIP (DO NOT include node_modules or src)
cd dist
# Select all files in dist → Create ZIP
```

### 4. Submit to Chrome Web Store
1. Go to Developer Console
2. Click **+ New Item**
3. Upload the ZIP file of your `dist` folder
4. Fill in:
   - **Name:** SCEU+ (Simple Chrome Extension Utilities Plus)
   - **Summary:** Modern text randomization and Unicode domain phishing protection
   - **Description:** Full feature list
   - **Category:** Productivity
   - **Language:** English
5. Upload screenshots
6. Set visibility (Public/Unlisted)
7. Submit for review

### 5. Review Process
- Usually takes 1-3 business days
- You may get feedback requiring changes
- Once approved, extension goes live!

---

## 📋 Checklist Before Publishing

- [ ] Test all features work correctly
- [ ] Icons display properly
- [ ] Options page loads
- [ ] Warning page works with IDN domains
- [ ] Credits show correctly
- [ ] No console errors
- [ ] Build completes without warnings
