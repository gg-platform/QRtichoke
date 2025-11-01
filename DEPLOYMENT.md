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

1. **Repository Setup**
   - [ ] Push code to GitHub repository
   - [ ] Enable GitHub Pages in repository settings
   - [ ] Select "main" as source
   - [ ] Workflow will automatically deploy on push to main

2. **Domain Setup (Optional)**
   - [ ] Add custom domain in repository settings
   - [ ] Update CNAME record in DNS
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