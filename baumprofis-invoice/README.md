# Baumprofis Invoice Platform

A professional invoice management system for tree care and gardening services, built with React, TypeScript, and Firebase.

## Features

- 📄 **Professional Invoice Creation**: Generate polished invoices for tree care and gardening services
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🔐 **Firebase Authentication**: Secure user authentication and data management
- 📋 **Customer Management**: Store and manage customer information
- 💾 **Firestore Database**: Real-time data synchronization and offline support
- 📊 **PDF Generation**: High-quality PDF invoices with professional formatting
- 🛠️ **Live PDF Preview**: Development tools for instant template preview and debugging

## Live PDF Preview Development Tools

### 🚀 Quick Start

The platform includes built-in development tools for rapid PDF template development:

#### Keyboard Shortcuts
- **Ctrl+Shift+P**: Instant PDF preview with sample data
- **Ctrl+Shift+D**: Open development menu
- **Esc**: Close any open dialogs

#### Access Methods
1. **Floating Action Buttons** (bottom-right corner):
   - Blue button: Direct PDF preview
   - Purple button: Development menu

2. **Development Menu**:
   - Access via Ctrl+Shift+D or purple FAB
   - View keyboard shortcuts
   - Open PDF preview with sample data

#### Development Mode Setup
The development tools are automatically available when:
1. Running in development mode (`npm run dev`)
2. You can bypass Firebase login by clicking "Entwicklungsmodus - Login umgehen"

### Sample Data
The preview uses realistic Baumprofis sample data including:
- Company information and branding
- Sample tree care services
- Realistic pricing and tax calculations
- Professional formatting and layout

### Benefits for Development
- ⚡ **Instant Feedback**: See template changes immediately without form submission
- 🎯 **No Data Entry**: Test with pre-populated sample data
- 🔄 **Real-time Development**: Edit code and see changes instantly
- 🐛 **Easy Debugging**: Identify PDF formatting issues quickly
- 📱 **Cross-platform Testing**: Preview works on all devices

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Material-UI (MUI)
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **PDF Generation**: jsPDF + html2canvas
- **State Management**: React Hooks
- **Development**: ESLint + TypeScript

## Project Structure

```
baumprofis-invoice/
├── src/
│   ├── components/           # React components
│   │   ├── Auth/            # Authentication components
│   │   ├── Customers/       # Customer management
│   │   ├── Invoice/         # Invoice creation and PDF
│   │   ├── Invoices/        # Invoice history
│   │   ├── FirebaseSetup/   # Firebase configuration
│   │   └── Dev/             # Development tools
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── utils/               # Helper functions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
└── dist/                    # Build output
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (for production use)

### Installation

1. **Clone and setup**:
   ```bash
   cd baumprofis-invoice
   npm install
   ```

2. **Firebase Configuration** (Optional for development):
   - Create a Firebase project
   - Copy your config to `src/lib/firebase.ts`
   - Or use development mode to bypass authentication

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Development Workflow

### Testing PDF Templates
1. Make changes to PDF template components
2. Press `Ctrl+Shift+P` to preview instantly
3. Review changes in the new browser tab
4. Use download button in preview for detailed inspection
5. Iterate until perfect

### Using Development Mode
1. Start development server: `npm run dev`
2. Click "Entwicklungsmodus - Login umgehen" to bypass Firebase
3. Use keyboard shortcuts or floating buttons for instant PDF previews

### Building and Deployment
1. Ensure all tests pass: `npm run build`
2. Deploy `dist/` folder to your hosting platform
3. Configure Firebase rules for production

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Features in Detail

### Invoice Creation
- Professional invoice templates
- Automatic tax calculations
- Customer information management
- Service item tracking
- PDF generation with company branding

### Customer Management
- Add, edit, and delete customers
- Search and filter capabilities
- Customer history tracking
- Contact information management

### Development Tools
- Live PDF preview system
- Sample data for testing
- Keyboard shortcuts for efficiency
- Development-only visibility
- Professional UI with Material-UI

## Contributing

1. Use the live PDF preview system for rapid development
2. Test changes with `npm run build`
3. Ensure TypeScript compilation passes
4. Follow the existing code structure and patterns

## License

This project is part of the Baumprofis invoice management system.

---

**Development Tip**: Use Ctrl+Shift+P anytime during development to instantly preview your PDF template changes with realistic sample data!
