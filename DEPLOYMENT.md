# Deployment Checklist

## Pre-Deployment

- [ ] Run security audit: `npm run security:check`
- [ ] Fix any vulnerabilities: `npm run audit:fix`
- [ ] Run linting: `npm run lint`
- [ ] Test production build: `npm run build`
- [ ] Preview build locally: `npm run preview`
- [ ] Update version number in package.json
- [ ] Update repository URLs in package.json
- [ ] Verify all environment variables are set

## GitHub Pages Deployment

### Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to the main branch.

**Setup Steps:**

1. **Enable GitHub Pages** 
   - [ ] Go to your repository settings
   - [ ] Navigate to "Pages" section
   - [ ] Under "Source", select "GitHub Actions"
   - [ ] The workflow will automatically trigger on the next push

2. **Repository Configuration**
   - [ ] Ensure repository is public (or you have GitHub Pro/Enterprise)
   - [ ] Push code to the `main` branch
   - [ ] The GitHub Action will automatically build and deploy

3. **Access Your Site**
   - [ ] Visit: `https://gg-platform.github.io/QRtichoke/`
   - [ ] Deployment status: Check the "Actions" tab in your repository

### Manual GitHub Pages Deployment

If you prefer manual deployment:

```bash
# Build for GitHub Pages
npm run deploy:github

# The dist folder will be built with the correct base path
# Upload the contents to your GitHub Pages branch
```

4. **Custom Domain (Optional)**
   - [ ] Add custom domain in repository settings
   - [ ] Update CNAME record in DNS to point to: `gg-platform.github.io`
   - [ ] Enable "Enforce HTTPS"

## Alternative Deployments

### Netlify
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Login: `netlify login`
- [ ] Deploy: `npm run deploy:netlify`

### Vercel
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `npm run deploy:vercel`

### Manual Static Hosting
- [ ] Run: `npm run build`
- [ ] Upload `dist/` folder contents to your hosting provider
- [ ] Configure server to serve `index.html` for all routes
- [ ] Add security headers (see netlify.toml for reference)

## Post-Deployment

- [ ] Test all functionality in production
- [ ] Verify security headers are applied
- [ ] Test QR code generation and download
- [ ] Test color picker functionality
- [ ] Verify rate limiting works
- [ ] Test clipboard functionality (requires HTTPS)
- [ ] Check mobile responsiveness
- [ ] Validate accessibility features
- [ ] Monitor for any console errors
- [ ] Test across different browsers

## Security Verification

- [ ] Check CSP headers are applied
- [ ] Verify XSS protection headers
- [ ] Test input sanitization works
- [ ] Confirm rate limiting prevents abuse
- [ ] Validate file download security
- [ ] Check clipboard requires HTTPS

## Performance Checks

- [ ] Lighthouse audit score > 90
- [ ] Core Web Vitals pass
- [ ] Assets are properly cached
- [ ] Code splitting is working (check Network tab)
- [ ] Images and fonts optimized

## SEO & Meta

- [ ] Update title and meta description
- [ ] Add Open Graph meta tags
- [ ] Submit sitemap to search engines
- [ ] Verify robots.txt is accessible

## Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor performance metrics
- [ ] Track usage analytics
- [ ] Set up uptime monitoring