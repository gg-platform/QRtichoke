<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## React QR Code Generator Project

A single-page React application for generating customizable QR codes with real-time preview, color customization, and download functionality.

### Architecture Overview

**Core Pattern**: Monolithic React component (`src/App.tsx`) with all QR generation logic, UI state, and styling in one file (~500 lines).

**Key Components**:
- Single `App.tsx` component manages all state via React hooks
- Fluent UI React v9 components for consistent design system
- QRCode.js library for QR generation with Canvas API
- Custom color conversion utilities (hex ↔ HSV) for ColorPicker integration
- Toast notifications for user feedback

### Technology Stack
- **React 19.1** with functional components and hooks (no class components)
- **TypeScript 5.9** with strict typing
- **Fluent UI React v9** - use exclusively for all UI components
- **QRCode.js 1.5.4** for QR generation
- **Vite 7.1** for development and build

### Brand Colors (CSS Custom Properties)
- Primary dark green: **3A5233**
- Orange accent: **FF7B54**
- Coral accent: **FF8C69** 
- Secondary green: **4A6741**

### Development Workflow

**Development Commands**:
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # TypeScript compile + Vite build
npm run lint         # ESLint with TypeScript support
npm run preview      # Preview production build
```

**Testing Build Output**:
```bash
npm run build && python -m http.server 8000 --directory dist
```

### Code Patterns & Conventions

**State Management**: Single component state with `useState` hooks:
```tsx
const [text, setText] = useState('')
const [options, setOptions] = useState<QROptions>({...})
const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
```

**Fluent UI Integration**: 
- Use `makeStyles` for component styling
- Leverage `tokens` for consistent spacing/colors
- Implement Popover + ColorPicker pattern for color selection
- Toast notifications via `useToastController` hook

**TypeScript Interfaces**:
- `QROptions` interface defines QR generation parameters
- `ValidationError` interface for input validation feedback

**Custom Utilities**:
- Color conversion functions (`hexToHsv`, `hsvToHex`) in App.tsx
- Validation logic with error/warning classification
- Canvas-based QR code generation and download functionality

### File Structure Insights

- `src/Helpers/` contains legacy JS utilities (config.js, helpers.js) - mostly unused
- Main application logic centralized in `src/App.tsx`
- Global styles in `src/App.css` with responsive design breakpoints
- ESLint configured for TypeScript + React hooks + React Refresh

### Integration Points

**QRCode.js Usage**:
```tsx
QRCode.toDataURL(text, options)  // Returns base64 PNG data URL
```

**Fluent UI Theme**: App wrapped in `FluentProvider` with `webLightTheme` in `main.tsx`

**Color Picker Integration**: Custom hex ↔ HSV conversion required for Fluent UI ColorPicker component

### Accessibility Features
- Keyboard navigation support
- Screen reader compatibility
- Focus management with custom focus styles
- Semantic HTML structure with proper ARIA labels