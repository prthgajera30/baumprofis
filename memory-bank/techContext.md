# Technical Context: Technology Stack & Development Environment

## Core Technology Stack

### Frontend Framework
- **React 18** with Concurrent Features
  - useTransition for non-blocking state updates
  - Suspense for progressive loading
  - SuspenseList for coordinating loading states
- **TypeScript 5.3+** with strict mode enabled
  - Interface-driven development for invoice/customer data models
  - Utility types for Firebase document structures
  - Generic constraints for reusable components

### UI Implementation
- **Custom CSS Framework**: Tailwind-inspired utility classes
  - Complete set of layout, spacing, and component utilities
  - Professional business styling for invoice platform
  - Mobile-first responsive design
  - Accessible color schemes and typography
- **Professional Component Library**: Custom built-in components
  - Tables, forms, cards optimized for invoice workflows
  - Status indicators and navigation elements
  - Mobile-optimized touch targets

### State Management & Data Fetching
- **Zustand** for client state management
  - Lightweight alternative to Redux/Context
  - Type-safe actions and selectors
  - Persistence layer for cross-session state
- **React Query** for server state management
  - Automatic caching and background refetching
  - Optimistic updates for better UX
  - Error handling and retry logic

### Backend-as-a-Service
- **Firebase Platform** (All services free tier optimized)
  - **Firestore**: NoSQL document database with real-time sync
  - **Firebase Auth**: Secure authentication with email/password
  - **Firebase Hosting**: Global CDN deployment with auto-scaling
  - **Firebase Storage**: (Future) Photo attachments with automatic backups

### PDF Generation & File Handling
- **jsPDF** + **html2canvas** for template-accurate PDF creation
  - Client-side generation (no server required)
  - Pixel-perfect rendering of German invoice template
  - Automatic download with browser compatibility
- **File-saver** for cross-platform downloads

### Development & Build Tools
- **Vite** as build tool and dev server
  - Lightning-fast HMR (Hot Module Replacement)
  - Optimized production builds with code splitting
  - Plugin ecosystem for advanced features
- **ESLint** + **Prettier** for code quality
  - TypeScript-aware linting rules
  - Consistent formatting across the team
  - Pre-commit hooks for quality gates

## Development Environment Configuration

### Local Development Setup
```json
{
  "project": "baumprofis-invoice-platform",
  "environment": "development",
  "ports": {
    "vite": 5173,
    "firebase": 5000
  }
}
```

### Firebase Project Structure
```
/baumprofis-invoice-platform/
├── firestore/
│   ├── rules.rules     # Security rules for data access
│   └── indexes.json    # Compound query indexes
├── hosting/
│   ├── public/         # Static assets
│   └── rewrites.json   # SPA routing support
└── functions/          # (Future) Server-side functions
```

### Dependencies Matrix

| Category | Package | Version | Purpose |
|----------|---------|---------|----------|
| **Core Framework** | react | ^18.2.0 | UI components with hooks |
| | react-dom | ^18.2.0 | DOM rendering |
| | react-router-dom | ^6.20.0 | Client-side routing |
| **State Management** | zustand | ^4.4.0 | Lightweight state container |
| | @tanstack/react-query | ^5.0.0 | Server state management |
| **UI Components** | @radix-ui/react-* | Various | Headless UI primitives |
| | tailwindcss | ^3.3.0 | Utility-first CSS |
| | lucide-react | ^0.294.0 | Consistent iconography |
| **Firebase SDK** | firebase | ^10.7.0 | Full Firebase platform access |
| **PDF Generation** | jspdf | ^2.5.0 | PDF creation from canvas |
| | html2canvas | ^1.4.1 | HTML to canvas conversion |
| **Development** | vite | ^5.0.0 | Fast build tool |
| | typescript | ^5.3.0 | Type-safe JavaScript |
| | @vitejs/plugin-react | ^4.2.0 | React plugin for Vite |

## Technical Constraints & Limitations

### Firebase Free Tier Boundaries
- **Storage**: 1GB total (target: <50MB for invoicing data)
- **Reads**: 50K/day (projected: ~2K/day after optimization)
- **Writes**: 20K/day (projected: ~200/day after debouncing)
- **Downloads**: 100GB/month (minimal with client-side operations)
- **Hosting**: 10GB/month bandwidth (static app, well within limits)

### Browser Support Targets
- **Modern Browsers**: Chrome/Firefox/Edge (ES2020+ features)
- **Mobile**: iOS Safari 15+, Android Chrome 100+
- **Progressive Enhancement**: Core functionality works offline via PWA
- **Fallback Support**: Graceful degradation for older browsers

### Performance Budgets
- **Bundle Size**: <200KB gzipped (current React + shadcn/ui)
- **First Contentful Paint**: <1.5 seconds
- **Time to Interactive**: <2 seconds
- **Lighthouse Score**: >95 overall performance

### Security Constraints
- **No Client-Side Secrets**: All Firebase config public (Firebase handles security)
- **CORS Policy**: Firebase domains only for data access
- **Authentication Scope**: Email/password only (social logins not required)
- **Data Encryption**: Firebase automatic TLS + database encryption

## Development Workflow Patterns

### Git Strategy
- **Trunk-Based Development**: Main branch deployment
- **Feature Branches**: `feature/invoice-form`, `feature/customer-search`
- **Release Tags**: Semantic versioning (v1.0.0, v1.1.0)
- **PR Reviews**: Required for all changes with automated checks

### Testing Strategy
- **Unit Tests**: Jest + React Testing Library for components
- **Integration Tests**: Firebase emulators for backend interactions
- **E2E Tests**: Playwright for critical user journeys
- **Visual Tests**: Storybook + Chromatic for UI regression

### Deployment Pipeline
```bash
# Development workflow
npm run dev          # Vite dev server with hot reload
npm run preview      # Production build preview
npm run build        # Optimized production bundle

# Quality gates
npm run type-check   # TypeScript compilation
npm run lint         # Code quality checks
npm run test         # Unit and integration tests

# Deployment
firebase deploy      # Hosting + Firestore rules update
```

### Environment Variables
```javascript
// .env.local (development)
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=baumprofis-dev.firebaseapp.com

// .env.production (production)
VITE_FIREBASE_API_KEY=your_prod_api_key
VITE_FIREBASE_AUTH_DOMAIN=baumprofis-prod.firebaseapp.com
```

This technical foundation provides the robust, scalable platform needed to build and maintain the Baumprofis invoice management system efficiently and securely.
