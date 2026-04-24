# Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```
   - Follow prompts to link to your Vercel account
   - Project will auto-detect Vite configuration
   - First deploy creates preview URL
   - Push to `main` branch for production

3. **Deploy via Git**:
   - Push your repo to GitHub/GitLab/Bitbucket
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel auto-detects Vite settings
   - Click "Deploy"

**Configuration**: Already included in `vercel.json`
- Build command: `npm run build`
- Output directory: `dist`
- Headers configured for GLB caching

---

### Option 2: Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. **Install Netlify CLI** (optional):
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy via CLI**:
   ```bash
   netlify deploy --prod
   ```

3. **Deploy via Git**:
   - Push your repo to GitHub/GitLab/Bitbucket
   - Go to [app.netlify.com](https://app.netlify.com)
   - "New site from Git"
   - Select your repository
   - Build settings auto-detected from `netlify.toml`
   - Click "Deploy site"

**Configuration**: Already included in `netlify.toml`

---

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update `vite.config.js`**:
   ```js
   export default defineConfig({
     base: '/myoatlas/', // Your repo name
     // ... rest of config
   });
   ```

3. **Add deploy script to `package.json`**:
   ```json
   "scripts": {
     "deploy": "vite build && gh-pages -d dist"
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**:
   - Go to repo Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` / `root`

---

## Performance Optimization

### Large File Handling
The app includes two large GLB files:
- `anatomy.glb` (24MB)
- `skeleton.glb` (9.4MB)

**Optimizations already configured:**
- Cache headers set to 1 year for GLB files
- Progressive loading with progress bar
- Priority-only mode loads fewer meshes (~85% smaller)

**Optional: Use CDN**
For better global performance, upload GLB files to a CDN:
1. Upload `public/*.glb` to CloudFlare R2, AWS S3, or similar
2. Update paths in `bodyBuilder.js`

---

## Mobile Performance

The app is optimized for mobile:
- Touch gestures (one finger rotate, two finger zoom)
- Responsive sidebars with hamburger menus
- Smaller title and optimized layout for phones
- Priority-only mode recommended for mobile (faster loading)

**Recommended mobile settings:**
- Enable "Priority Only" mode
- Use lower skeleton transparency for better performance

---

## Environment Variables

No environment variables needed! The app is fully static.

---

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown

### Netlify
1. Go to Domain Settings → Custom domains
2. Add domain and follow DNS instructions

---

## Troubleshooting

**Large file upload errors:**
- Vercel/Netlify have 100MB limit per file
- GLB files are 24MB + 9.4MB = OK ✓
- If you add more files, consider CDN

**Build fails:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**404 on routes:**
- Not applicable (single page app)
- All routing handled by Vite

---

## Production Checklist

- [ ] Test both "Full Model" and "Priority Only" modes
- [ ] Test on mobile device
- [ ] Verify GLB files load with progress
- [ ] Test export JSON/PDF functionality
- [ ] Check all rating features work
- [ ] Verify clear rating modals work
- [ ] Test search functionality
- [ ] Verify localStorage persists ratings

---

## Analytics (Optional)

Add analytics to `index.html`:

**Google Analytics:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Plausible (privacy-friendly):**
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```
