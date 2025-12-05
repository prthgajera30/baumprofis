# System Patterns: Firebase + React Architecture

## System Architecture Overview

### Frontend-Backend Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React PWA     │────│   Firebase      │────│   Client Data   │
│                 │    │   Platform      │    │   Storage       │
│ • Components    │    │ • Firestore     │    │ • IndexedDB     │
│ • State Mgmt    │    │ • Auth          │    │ • Cache Layer   │
│ • UI Logic      │    │ • Hosting       │    │ • Offline Sync  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Technical Decisions

### 1. React + TypeScript Foundation
- **TypeScript Enforcement**: All components, hooks, and data structures typed
- **Component Composition**: Modular components with clear responsibility boundaries
- **React 18 Concurrency**: Suspense for loading states, concurrent rendering for performance

### 2. Firebase Data Optimization Pattern
- **Collection-Per-User Security**: `/users/{userId}/collection` isolates data by authenticated user
- **Denormalized Reads**: Computed fields (totalInvoices, totalRevenue) minimize aggregation queries
- **Compound Query Strategy**: Indexed searches for customer name + efficient pagination
- **Real-time Sync**: Selective listeners (not blanket subscriptions) for performance

### 3. Offline-First PWA Architecture
```
User Action → IndexedDB Cache → Optimistic UI Update → Firebase Sync
      ↓                                        ↑
 Error Recovery ←── Sync Conflict Resolution ←──
```

### 4. State Management Pattern
- **Zustand Stores**: Lightweight, typed state slices with actions
- **No Global State**: Component-level state preferred, shared state minimal
- **Server State Sync**: React Query pattern for Firebase data fetching

## Component Relationship Patterns

### Presentation Layer (UI Components)
```typescript
// Component hierarchy follows atomic design
Atoms (Button, Input) → Molecules (FormField) → Organisms (InvoiceForm) → Templates (InvoicePage)
```

### Business Logic Layer (Hooks + Services)
```typescript
// Separation of concerns
useCustomers() // Hook for customer operations
customerService // Firebase operations
customerValidations // Business rules
```

### Data Flow Pattern
```
User Interaction → Action Dispatch → Service Call → Firebase Operation → Cache Update → UI Re-render
```

## Critical Implementation Paths

### Invoice Creation Flow
1. **Draft Creation**: `useInvoiceDraft()` creates temporary ID, sets status to 'draft'
2. **Progressive Enhancement**: Sections unlocked as customer data provided
3. **Auto-save Debounce**: 500ms delayed Firestore write, local cache updates immediately
4. **Validation Chain**: Client-side validation → Server confirmation → Status promotion

### Search & Retrieval Pattern
1. **Multi-level Caching**: IndexedDB (local) → Firebase Cache → Network Fetch
2. **Query Optimization**: Compound indexes for name search, pagination limits
3. **Progressive Loading**: First 25 results instant, lazy load additional pages

### PDF Generation Pipeline
1. **Template Rendering**: React component renders exact template layout
2. **Canvas Conversion**: html2canvas captures pixel-perfect rendering
3. **PDF Assembly**: jsPDF compiles with German locale formatting
4. **Download Optimization**: Progressive chunked download for mobile

## Security & Data Patterns

### Authentication Guards
- **Route Protection**: Firebase Auth required for all data operations
- **Firestore Rules**: User-scoped data access with RLS (Row Level Security)
- **API Key Protection**: Server-side Firebase Admin SDK for operations

### Data Integrity Patterns
- **Atomic Transactions**: Multi-document updates use Firestore transactions
- **Conflict Resolution**: Last-write-wins with client-side merge strategies
- **Backup Automation**: Daily export capabilities, point-in-time recovery

## Performance Optimization Patterns

### Bundle Optimization
- **Code Splitting**: Route-based lazy loading, component chunking
- **Tree Shaking**: Aggressive removal of unused imports
- **Bundle Analysis**: Continuous monitoring of bundle sizes

### Query Efficiency
- **Free Tier Optimization**:
  - Reads: < 50K/day target (current usage: ~2K/day typical)
  - Writes: < 20K/day target (current: ~200/day typical)
  - Storage: < 1GB (target: <50MB for small business)
- **Pagination Strategy**: 25 items per page with cursor-based navigation

### Rendering Performance
- **Virtual Lists**: For invoice/customer lists >100 items
- **Memoization**: React.memo for expensive components
- **Suspense Boundaries**: Graceful loading states

## Design Patterns in Use

### Repository Pattern (Data Layer)
```typescript
class CustomerRepository {
  async findByName(name: string, limit: number = 25) {
    // Optimized compound query
  }
  async create(data: CustomerCreateInput) {
    // Transaction with validation
  }
}
```

### CQRS Pattern (Read/Write Separation)
- **Commands**: Write operations (create, update, delete) with validation
- **Queries**: Read operations optimized for different UI contexts
- **Separation**: Ensures read performance doesn't impact write operations

### Event-Driven State Management
- **Action Creators**: Declarative state updates
- **Reducers**: Pure functions handling state transitions
- **Effects**: Side effects (API calls, localStorage) isolated

## Error Handling & Recovery Patterns

### Graceful Degradation
- **Service Unavailable**: Cached data fallback, offline mode activation
- **Network Errors**: Retry strategies with exponential backoff
- **Data Corruption**: Validation checks with repair options

### User Feedback Pattern
- **Toast Notifications**: Brief success/error confirmations
- **Inline Validation**: Real-time field validation feedback
- **Error Boundaries**: Component-level error isolation

## Testing Strategy Patterns

### Component Testing
- **Visual Regression**: Template accuracy testing
- **Interaction Testing**: User workflow simulation
- **Performance Testing**: Core Web Vitals monitoring

### Integration Testing
- **Firebase Emulators**: Local backend testing
- **E2E Testing**: Critical user journeys (invoice creation, PDF generation)

This architecture provides the foundation for a scalable, maintainable invoice platform that meets performance requirements while staying within free tier limits.
