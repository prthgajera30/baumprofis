import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/Auth/LoginForm'
import { InvoiceForm } from './components/Invoice/InvoiceForm'

function App() {
  const { user, loading, logout } = useAuth()
  const [currentView, setCurrentView] = useState<'dashboard' | 'invoice'>('dashboard')
  const [devMode, setDevMode] = useState(false)

  // Create mock user for development mode
  const mockUser = {
    email: 'dev@baumprofis.com',
    uid: 'dev-user-123'
  }

  // Check for development mode and use mock user
  const isDevMode = typeof window !== 'undefined' && localStorage.getItem('dev-mode') === 'true'
  const currentUser = isDevMode ? mockUser : user

  if (loading && !isDevMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          <header className="py-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Baumprofis Invoice Platform
            </h1>
            <p className="text-gray-600 mt-2">
              Professional invoicing for tree care services
            </p>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg max-w-md mx-auto">
              <p className="text-yellow-800 text-sm mb-2">
                <strong>⚠️ Firebase not configured - see console for setup instructions</strong>
              </p>
              <button
                onClick={() => {
                  // Enable development mode by setting localStorage flag
                  localStorage.setItem('dev-mode', 'true')
                  window.location.reload() // Reload to trigger dev mode
                }}
                className="w-full button-secondary"
              >
                Development Mode - Bypass Login
              </button>
            </div>
          </header>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Baumprofis Invoice Platform
          </h1>
          <div className="flex items-center gap-4">
            {currentView === 'invoice' && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                ← Dashboard
              </button>
            )}
            <span className="text-gray-600">Welcome, {currentUser.email}</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' ? (
          <div className="card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <p className="text-gray-600 mb-4">
              Welcome to your invoice management system. Ready to create professional invoices!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-4">Quick Actions</h3>
                <button
                  onClick={() => setCurrentView('invoice')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 mb-2"
                >
                  + Create New Invoice
                </button>
                <div className="mt-4 text-blue-700">
                  <div>• Search Customers</div>
                  <div>• View Recent Invoices</div>
                  <div>• Export Data</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-800 mb-4">System Status</h3>
                <div className="text-green-700">
                  <div>✅ Firebase Authentication</div>
                  <div>✅ Invoice Form Template</div>
                  <div>✅ Auto-calculations</div>
                  <div>⚠️ Firebase project setup needed</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">
                <strong>Note:</strong> This is a development environment.
                Complete Firebase console setup for production use with data persistence.
              </p>
            </div>
          </div>
        ) : (
          <InvoiceForm />
        )}
      </main>
    </div>
  )
}

export default App
