import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCustomers } from '../../hooks/useCustomers'
import type { Customer } from '../../hooks/useCustomers'
import { db } from '../../lib/firebase'
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'
import { format } from 'date-fns'
import { ArrowLeft, ArrowRight, Check, User, FileText, Calculator, Download } from 'lucide-react'

interface InvoiceLine {
  id: string
  description: string
  unitPrice: number
  quantity: number
  unit: 'Stunden' | 'Stück' | 'pauschal'
  total: number
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  object: string
  customerId?: string
  customerName: string
  customerAddress: string
  lines: InvoiceLine[]
  subtotal: number
  vatAmount: number
  totalAmount: number
  dueDate: string
}

const STEPS = [
  { id: 'customer', title: 'Kunde auswählen', icon: User, description: 'Wählen Sie einen Kunden oder erstellen Sie einen neuen' },
  { id: 'details', title: 'Rechnungsdaten', icon: FileText, description: 'Grunddaten der Rechnung' },
  { id: 'services', title: 'Dienstleistungen', icon: Calculator, description: 'Leistungen und Positionen hinzufügen' },
  { id: 'review', title: 'Prüfen & Speichern', icon: Check, description: 'Rechnung überprüfen und herunterladen' }
]

export const InvoiceWizard = () => {
  const { user } = useAuth()
  const { customers, customerSearchTerm, searchCustomers, createCustomer } = useCustomers()
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `R${format(new Date(), 'yy')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    date: format(new Date(), 'dd.MM.yyyy'),
    object: '',
    customerName: '',
    customerAddress: '',
    lines: [{ id: '1', description: '', unitPrice: 0, quantity: 1, unit: 'pauschal', total: 0 }],
    subtotal: 0,
    vatAmount: 0,
    totalAmount: 0,
    dueDate: format(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 'dd.MM.yyyy')
  })

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    name: '', email: '', phone: '', address: ''
  })

  // Customer Wizard Step
  const CustomerStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <User className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kunde auswählen</h2>
        <p className="text-gray-600">Wählen Sie einen bestehenden Kunden oder erstellen Sie einen neuen</p>
      </div>

      <div className="space-y-6">
        {/* Search existing customers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-4">Bestehender Kunde</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={customerSearchTerm}
              onChange={(e) => searchCustomers(e.target.value)}
              placeholder="Suchen nach Namen, E-Mail oder Adresse..."
              className="form-input"
            />

            <div className="max-h-60 overflow-y-auto">
              {customers
                .filter(customer =>
                  customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                  customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                  customer.address.toLowerCase().includes(customerSearchTerm.toLowerCase())
                )
                .map(customer => (
                  <div
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setInvoiceData(prev => ({
                        ...prev,
                        customerId: customer.id,
                        customerName: customer.name,
                        customerAddress: customer.address
                      }))
                      setShowNewCustomerForm(false)
                    }}
                    className={`border rounded-lg p-4 mb-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedCustomer?.id === customer.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-600">{customer.address}</div>
                    {customer.email && <div className="text-sm text-blue-600">{customer.email}</div>}
                    {selectedCustomer?.id === customer.id && (
                      <div className="mt-2 text-blue-600 font-medium">✓ Ausgewählt</div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Add new customer option */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <button
            onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
          >
            <span>+ Neuen Kunden hinzufügen</span>
          </button>

          {showNewCustomerForm && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name *"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  required
                />
                <input
                  type="email"
                  placeholder="E-Mail"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="Telefon"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Adresse *"
                  value={newCustomerData.address}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, address: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <button
                onClick={async () => {
                  if (!newCustomerData.name || !newCustomerData.address) {
                    alert('Name und Adresse sind erforderlich')
                    return
                  }
                  try {
                    const newCust = await createCustomer(newCustomerData)
                    setSelectedCustomer(newCust)
                    setInvoiceData(prev => ({
                      ...prev,
                      customerId: newCust.id,
                      customerName: newCust.name,
                      customerAddress: newCust.address
                    }))
                    setShowNewCustomerForm(false)
                    setNewCustomerData({ name: '', email: '', phone: '', address: '' })
                    alert('Kunde erfolgreich erstellt!')
                  } catch (error) {
                    alert('Fehler beim Erstellen des Kunden')
                  }
                }}
                className="btn btn-primary w-full"
              >
                Kunden erstellen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Details Wizard Step
  const DetailsStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rechnungsdaten</h2>
        <p className="text-gray-600">Grunddaten der Rechnung festlegen</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
        <div>
          <label className="form-label">Rechnungsnummer</label>
          <input
            type="text"
            value={invoiceData.invoiceNumber}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            className="form-input"
            placeholder="z.B. R2025-001"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Datum</label>
            <input
              type="text"
              value={invoiceData.date}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
              className="form-input"
              placeholder="dd.MM.yyyy"
            />
          </div>
          <div>
            <label className="form-label">Zahlungsziel</label>
            <input
              type="text"
              value={invoiceData.dueDate}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="form-input"
              placeholder="dd.MM.yyyy"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Objekt/Beschreibung</label>
          <input
            type="text"
            value={invoiceData.object}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, object: e.target.value }))}
            className="form-input"
            placeholder="Arbeiten..."
          />
        </div>
      </div>
    </div>
  )

  // Services Wizard Step
  const ServicesStep = () => {
    const addLine = () => {
      setInvoiceData(prev => ({
        ...prev,
        lines: [...prev.lines, {
          id: Date.now().toString(),
          description: '',
          unitPrice: 0,
          quantity: 1,
          unit: 'pauschal',
          total: 0
        }]
      }))
    }

    const updateLine = (id: string, field: keyof InvoiceLine, value: any) => {
      setInvoiceData(prev => {
        const updatedLines = prev.lines.map(line => {
          if (line.id === id) {
            const updatedLine = { ...line, [field]: value }
            if (field === 'unitPrice' || field === 'quantity') {
              updatedLine.total = Number(updatedLine.unitPrice) * Number(updatedLine.quantity)
            }
            return updatedLine
          }
          return line
        })
        return { ...prev, lines: updatedLines }
      })
    }

    const removeLine = (id: string) => {
      if (invoiceData.lines.length > 1) {
        setInvoiceData(prev => ({
          ...prev,
          lines: prev.lines.filter(line => line.id !== id)
        }))
      }
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Calculator className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dienstleistungen</h2>
          <p className="text-gray-600">Fügen Sie alle Service-Leistungen hinzu</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Beschreibung</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Menge</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Einheit</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Einzelpreis</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Total</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lines.map((line, index) => (
                  <tr key={line.id} className="border-t border-gray-200">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                        className="form-input"
                        placeholder="Leistungsbeschreibung..."
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 1)}
                        className="form-input text-right w-20"
                        min="0.01"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={line.unit}
                        onChange={(e) => updateLine(line.id, 'unit', e.target.value)}
                        className="form-input text-center"
                      >
                        <option value="Stunden">Stunden</option>
                        <option value="Stück">Stück</option>
                        <option value="pauschal">pauschal</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="form-input text-right w-24"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-right font-medium">
                        {line.total.toFixed(2)} €
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {invoiceData.lines.length > 1 && (
                        <button
                          onClick={() => removeLine(line.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Position entfernen"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addLine}
            className="btn btn-secondary mt-4"
          >
            + Neue Position hinzufügen
          </button>

          {/* Totals Summary */}
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-end space-y-2">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Summe (Netto): <span className="font-medium">{invoiceData.subtotal.toFixed(2)} €</span>
                </div>
                <div className="text-sm text-gray-600">
                  MwSt. (19%): <span className="font-medium">{invoiceData.vatAmount.toFixed(2)} €</span>
                </div>
                <div className="text-lg font-bold text-gray-900 border-t pt-1">
                  Gesamt: {invoiceData.totalAmount.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Review Wizard Step
  const ReviewStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rechnung prüfen</h2>
        <p className="text-gray-600">Überprüfen Sie alle Angaben bevor Sie speichern</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
        {/* Invoice Header */}
        <div className="border-b pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rechnungsdaten</h3>
              <p><strong>Nr:</strong> {invoiceData.invoiceNumber}</p>
              <p><strong>Datum:</strong> {invoiceData.date}</p>
              <p><strong>Fällig am:</strong> {invoiceData.dueDate}</p>
              {invoiceData.object && <p><strong>Objekt:</strong> {invoiceData.object}</p>}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Kunde</h3>
              <p className="font-medium">{invoiceData.customerName}</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.customerAddress}</p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Positionen</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Pos.</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Beschreibung</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Menge</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Einheit</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Einzelpreis</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lines.map((line, index) => (
                  <tr key={line.id} className="border-b">
                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                    <td className="px-4 py-2 text-sm">{line.description}</td>
                    <td className="px-4 py-2 text-sm text-right">{line.quantity}</td>
                    <td className="px-4 py-2 text-sm text-center">{line.unit}</td>
                    <td className="px-4 py-2 text-sm text-right">{line.unitPrice.toFixed(2)} €</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">{line.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-6">
          <div className="flex justify-end">
            <div className="text-right space-y-1">
              <p className="text-sm text-gray-600">Summe (Netto): <span className="font-medium">{invoiceData.subtotal.toFixed(2)} €</span></p>
              <p className="text-sm text-gray-600">zzgl. 19% MwSt.: <span className="font-medium">{invoiceData.vatAmount.toFixed(2)} €</span></p>
              <p className="text-xl font-bold text-gray-900 border-t pt-2">Rechnungsbetrag: {invoiceData.totalAmount.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-6">
          <div className="flex justify-center gap-4">
            <button
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Speichere...' : 'Rechnung erstellen & PDF herunterladen'}
            </button>
            <button
              className="btn btn-secondary"
              disabled={saving}
            >
              Nur speichern (Entwurf)
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const calculateTotals = (lines: InvoiceLine[]) => {
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0)
    const vatAmount = subtotal * 0.19 // German VAT 19%
    const totalAmount = subtotal + vatAmount
    return { subtotal, vatAmount, totalAmount }
  }

  useEffect(() => {
    const totals = calculateTotals(invoiceData.lines)
    setInvoiceData(prev => ({ ...prev, ...totals }))
  }, [invoiceData.lines])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const isPending = index > currentStep

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <div className={`ml-3 ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : ''}`}>
                    {step.title}
                  </div>
                  {isActive && (
                    <div className="text-xs text-gray-500">{step.description}</div>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {currentStep === 0 && <CustomerStep />}
        {currentStep === 1 && <DetailsStep />}
        {currentStep === 2 && <ServicesStep />}
        {currentStep === 3 && <ReviewStep />}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="btn btn-ghost disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Zurück
          </button>

          <button
            onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
            disabled={currentStep === STEPS.length - 1}
            className="btn btn-primary flex items-center gap-2"
          >
            Weiter
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
