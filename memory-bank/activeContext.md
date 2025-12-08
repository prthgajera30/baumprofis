# Active Context - Baumprofis Invoice Platform

## Current State Summary
**Last Updated:** December 8, 2025, 8:22 AM

### Recent PDF Formatting Fixes Completed
- **Footer Margin Alignment**: Fixed footer positioning from `left: 20mm, right: 20mm` to `left: 0, right: 0` with proper padding (`padding: 10px 20px`) to align with page margins
- **Logo Integration**: Successfully added company logo display in PDF header
  - Logo displays at 100x100px in top right corner above sender address
  - Uses default company logo from `/logos/baumprofis logo.png`
  - Always displays (no conditional rendering)
- **Code Cleanup**: Removed unused dependencies and files
  - Uninstalled `@react-pdf/renderer` package (54 packages removed)
  - Removed unused `BaumprofisInvoicePdf.tsx` file
  - Fixed TypeScript compilation errors

### Technical Implementation Details
- **PDF Generation Method**: jsPDF + html2canvas (NOT @react-pdf/renderer)
- **Logo Path**: `/logos/baumprofis logo.png` (served from public directory)
- **Footer Styling**: `position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 20px`
- **Build Status**: TypeScript compilation successful, production build working

### Current Build Issues (Optimization Needed)
- Large chunks (>500kB) detected during build
- Bundle size warnings suggest using dynamic import() for code-splitting
- ManualChunks configuration recommended for better performance

### Active Development Server
- Running on `http://localhost:5173/`
- HMR (Hot Module Replacement) active
- All changes immediately available for testing

### Deployment Status
- Firebase project: `baumprofis-invoice-platf-3a831`
- Current production URL: `https://baumprofis-invoice-platf-3a831.web.app`
- Firestore rules deployed and active
- Authentication configured and working

## Next Immediate Tasks
1. Update all memory bank files with current state
2. Implement bundle optimization for deployment
3. Final build testing and deployment
4. Git commit and push to remote repository

## Important Patterns & Preferences
- Always use relative paths for public assets (e.g., `/logos/filename.png`)
- PDF generation uses HTML template approach with html2canvas
- Footer positioning must align with page padding for consistency
- Logo should always display in professional invoices
- Bundle optimization is critical for production performance
