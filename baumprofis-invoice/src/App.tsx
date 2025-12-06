import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/Auth/LoginForm'
import { InvoiceForm } from './components/Invoice/InvoiceForm'
import { InvoiceWizard } from './components/Wizard/InvoiceWizard'
import { CustomerManager } from './components/Customers/CustomerManager'
import { InvoiceHistory } from './components/Invoices/InvoiceHistory'
import { FirebaseRulesHelper } from './components/FirebaseSetup/FirebaseRulesHelper'

function App() {
  const { user, loading, logout } = useAuth()
  const [currentView, setCurrentView] = useState<'dashboard' | 'invoice' | 'invoice-wizard' | 'customers' | 'invoice-history' | 'firebase-setup'>('dashboard')
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
            {(currentView === 'invoice' || currentView === 'invoice-wizard' || currentView === 'customers' || currentView === 'invoice-history' || currentView === 'firebase-setup') && (
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

      <main className="content-area py-8">
        {currentView === 'dashboard' ? (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="hero-section mb-12">
              <div className="text-center">
                <h1 className="h1 mb-4">
                  Baumprofis Invoice Platform
                </h1>
                <p className="body-large opacity-95">
                  Professionelle Rechnungserstellung für Baumpflege & Gartenarbeiten
                </p>
                <p className="caption mt-3 opacity-80">
                  Schnell • Zuverlässig • Professionell
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid mb-12">
              <div className="stat-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <div className="stat-number text-green-600">2.547,80 €</div>
                    <div className="stat-label">Gesamtumsatz</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div>
                    <div className="stat-number text-blue-600">12</div>
                    <div className="stat-label">Rechnungen</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <div className="stat-number text-purple-600">8</div>
                    <div className="stat-label">Kunden</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <div className="stat-number text-amber-600">‹ 3min</div>
                    <div className="stat-label">Durchschnitt</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="card-modern">
                <div
                  className="card-modern-action cursor-pointer"
                  onClick={() => setCurrentView('invoice')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">⚡</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Schnell erstellen</h3>
                    <p className="text-sm opacity-90">Direkte Rechnungserstellung für erfahrene Nutzer</p>
                  </div>
                </div>
              </div>

              <div className="card-modern">
                <div
                  className="card-modern-action cursor-pointer"
                  onClick={() => setCurrentView('invoice-wizard')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🧙‍♂️</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Assistent</h3>
                    <p className="text-sm opacity-90">Schritt-für-Schritt-Anleitung für Neulinge</p>
                  </div>
                </div>
              </div>

              <div className="card-modern">
                <div
                  className="card-modern-action cursor-pointer"
                  onClick={() => setCurrentView('invoice-history')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📋</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Rechnungsübersicht</h3>
                    <p className="text-sm opacity-90">Verwalten und suchen Sie Ihre erstellten Rechnungen</p>
                  </div>
                </div>
              </div>

              <div className="card-modern">
                <div
                  className="card-modern-action cursor-pointer"
                  onClick={() => setCurrentView('customers')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">👥</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Kunden verwalten</h3>
                    <p className="text-sm opacity-90">Pflegen Sie Ihre Kundendatenbank für schnellen Zugriff</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card-modern p-8 bg-gray-50 border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="h4 mb-4 text-gray-900">System Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Firebase Authentication</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Firestore Data Persistence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Professional PDF Generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Invoice History & Search</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Customer Management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Auto-calculations & VAT</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="h4 mb-4 text-gray-900">Schnellstart-Tipps</h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white p-3 rounded-lg border">
                      <strong>Neue Rechnung:</strong> Kunden auswählen oder hinzufügen, Service-Leistungen eingeben
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <strong>PDF generieren:</strong> Rechnung finalisieren, dann "PDF herunterladen" verwenden
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <strong>Kunden suchen:</strong> Überall schnelle Kundenauswahl verfügbar
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : currentView === 'invoice-history' ? (
          <InvoiceHistory />
        ) : currentView === 'customers' ? (
          <CustomerManager />
        ) : currentView === 'firebase-setup' ? (
          <FirebaseRulesHelper />
        ) : currentView === 'invoice-wizard' ? (
          <InvoiceWizard />
        ) : (
          <InvoiceForm />
        )}
      </main>
    </div>
  )
}

export default App
