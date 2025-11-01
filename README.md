# React QR Code Generator

A modern, secure, responsive QR code generator built with React 19, TypeScript, and Fluent UI. Generate custom QR codes with various styling options and download them instantly - with enterprise-grade security features.

![React QR Code Generator](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Fluent UI](https://img.shields.io/badge/Fluent%20UI-v9-green) ![Vite](https://img.shields.io/badge/Vite-7.1-purple) ![Security](https://img.shields.io/badge/Security-Hardened-red)

## 🌟 Features

- **Real-time QR Code Generation**: Generate QR codes instantly as you type
- **Advanced Color Picker**: Full Fluent UI color picker with HSV/RGB controls
- **Customizable Styling**: 
  - Adjustable size (128px - 1024px with security constraints)
  - Custom foreground and background colors
  - Error correction levels (L, M, Q, H)
- **Security-First Design**: 
  - Input sanitization with DOMPurify
  - Rate limiting protection
  - Content Security Policy (CSP)
  - XSS protection
- **Enhanced Input Validation**: Smart validation with security checks and helpful messages
- **Secure Download**: Sanitized filenames and validation
- **Clipboard Security**: Secure clipboard operations with fallbacks
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Modern UI**: Built with Fluent UI React v9 components

## 🔒 Security Features

### Input Sanitization
- **DOMPurify Integration**: All user input is sanitized to prevent XSS attacks
- **Pattern Detection**: Automatically detects and blocks potentially dangerous content patterns
- **Control Character Filtering**: Removes harmful control characters while preserving valid input

### Rate Limiting & Abuse Prevention
- **Generation Throttling**: Maximum 30 QR code generations per minute
- **Minimum Intervals**: 100ms minimum between consecutive generations
- **Resource Protection**: Prevents excessive resource consumption

### Content Security Policy (CSP)
- **Strict CSP Headers**: Prevents XSS, clickjacking, and other injection attacks
- **Resource Origin Control**: Only allows loading from trusted sources
- **Script Execution Protection**: Blocks inline script execution

### Secure Data Handling
- **Validated Downloads**: All file downloads are validated before processing
- **Sanitized Filenames**: Prevents directory traversal and malicious filenames
- **Clipboard Security**: Secure clipboard operations with HTTPS requirement
- **Data URL Validation**: Ensures generated QR codes are valid PNG format

### Build Security
- **Source Map Protection**: Source maps disabled in production builds
- **Dependency Auditing**: Automated security vulnerability scanning
- **Minification**: Code obfuscation and size optimization

## 🎨 Brand Colors

- **Primary Dark Green**: `#3A5233`
- **Accent Orange**: `#FF7B54`
- **Coral Accent**: `#FF8C69`
- **Green Brand**: `#4A6741`

```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react_qr_code_generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📖 Usage

1. **Enter Text**: Type or paste any text, URL, or data into the input field
2. **Customize Options**: 
   - Select error correction level based on your scanning needs
   - Adjust size using the slider
   - Choose custom colors for foreground and background
3. **Generate**: QR code generates automatically as you type
4. **Download**: Click the download button to save your QR code as a PNG file

### Error Correction Levels

- **Low (7%)**: Suitable for clean environments
- **Medium (15%)**: Recommended for general use
- **Quartile (25%)**: Good for environments with some damage risk
- **High (30%)**: Best for harsh environments or small QR codes

## 🏗️ Tech Stack

- **React 19** - Modern React with latest features and hooks
- **TypeScript 5.9** - Type safety and better developer experience
- **Fluent UI React v9** - Microsoft's design system components
- **Vite 7.1** - Fast build tool and development server
- **QRCode.js 1.5.4** - QR code generation library
- **TinyColor** - Advanced color manipulation
- **DOMPurify** - HTML sanitization for security

## 📁 Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Application-specific styles
├── main.tsx         # Application entry point
├── index.css        # Global styles with brand colors
└── assets/          # Static assets
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (secure build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality
- `npm run audit` - Security vulnerability audit
- `npm run audit:fix` - Fix security vulnerabilities automatically
- `npm run security:check` - Complete security and dependency check

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🚀 Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment:

1. Ensure your repository is public or you have GitHub Pro
2. Push your code to the main branch
3. Go to repository Settings > Pages
4. Select "GitHub Actions" as source
5. The workflow will automatically build and deploy

The site will be available at: `https://yourusername.github.io/QRtichoke`


## 🎯 Features in Detail

### Advanced Color Picker
- Full HSV color space control with ColorArea, ColorSlider, and AlphaSlider
- Real-time color preview with TinyColor integration
- Secure color validation and sanitization
- OK/Cancel pattern for color selection

### Security-Enhanced Validation System
- Multi-layer input sanitization with DOMPurify
- Dangerous pattern detection (JavaScript URLs, script tags, etc.)
- Character limit enforcement (2953 characters max for QR codes)
- Control character filtering and validation
- Real-time feedback with security warnings

### Rate Limiting & Protection
- Client-side rate limiting (30 generations per minute)
- Minimum generation interval (100ms) to prevent spam
- Resource usage monitoring and protection
- Graceful degradation with user feedback

### Secure File Operations
- Validated file downloads with sanitized filenames
- Secure clipboard operations requiring HTTPS
- Data URL format validation for all generated QR codes
- Protection against directory traversal attacks

### Responsive Design
- Mobile-first approach with touch-friendly controls
- Adaptive grid layout for different screen sizes
- Optimized color picker for mobile interaction
- Progressive enhancement for larger screens

### Accessibility & Security
- Proper ARIA labels and roles for screen readers
- Keyboard navigation support with focus management
- High contrast color combinations for visibility
- Secure context requirements for advanced features
- CSP headers preventing XSS and injection attacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [QRCode.js](https://github.com/soldair/node-qrcode) for QR code generation
- [Fluent UI](https://react.fluentui.dev/) for the component library
- [Vite](https://vitejs.dev/) for the excellent development experience