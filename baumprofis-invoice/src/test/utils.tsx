// Test utilities for React components
import type { ReactElement } from 'react'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../hooks/useAuth'
import { theme } from '../theme'

// Custom render function that includes all necessary providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withAuth?: boolean
  withQueryClient?: boolean
}

export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    withAuth = true,
    withQueryClient = true,
    ...renderOptions
  } = options

  // Create query client for React Query
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  // Build component tree with all providers
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    let wrapped = <>{children}</>

    // Add Material-UI Theme Provider
    wrapped = (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {wrapped}
      </ThemeProvider>
    )

    // Add React Query Provider
    if (withQueryClient) {
      wrapped = (
        <QueryClientProvider client={queryClient}>
          {wrapped}
        </QueryClientProvider>
      )
    }

    // Add Auth Provider
    if (withAuth) {
      wrapped = (
        <AuthProvider>
          {wrapped}
        </AuthProvider>
      )
    }

    return wrapped
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Test data generators
export const createMockCustomer = (overrides = {}) => ({
  id: 'customer-123',
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '+49 123 456789',
  address: 'Test Street 123, 12345 Test City',
  ...overrides,
})

export const createMockInvoice = (overrides = {}) => ({
  id: 'invoice-123',
  invoiceNumber: 'TEST-001',
  date: '15.12.2025',
  customerName: 'Test Customer',
  customerAddress: 'Test Street 123',
  customerStreet: 'Test Street 123',
  customerZipCode: '12345',
  customerCity: 'Test City',
  lines: [
    {
      id: 'line-1',
      description: 'Test Service',
      unitPrice: 100,
      quantity: 1,
      unit: 'pauschal' as const,
      total: 100,
    },
  ],
  subtotal: 100,
  vatAmount: 19,
  totalAmount: 119,
  dueDate: '15.01.2026',
  status: 'draft' as const,
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  uid: 'user-123',
  email: 'user@example.com',
  displayName: 'Test User',
  emailVerified: true,
  ...overrides,
})

// Mock functions for testing
export const mockFirebaseFunctions = () => {
  // This would set up common Firebase mock behaviors
  // Implementation depends on specific test needs
}

// Helper to wait for loading states
export const waitForLoadingToFinish = async () => {
  // Implementation depends on how loading is handled in the app
  // Could use testing-library's waitFor
  return Promise.resolve()
}
