import { useState, useEffect } from 'react'
import { useCustomers } from '../../hooks/useCustomers'
import type { Customer } from '../../hooks/useCustomers'
import { format } from 'date-fns'
import { ArrowLeft, ArrowRight, Check, User, FileText, Calculator } from 'lucide-react'
import { useFormValidation } from '../../hooks/useFormValidation'
import { ValidationMessage } from '../ui/ValidationMessage'

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
  const { customers, searchCustomers, createCustomer } = useCustomers()
  const validation = useFormValidation()
  const [currentStep, setCurrentStep] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

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
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                searchCustomers(e.target.value)
              }}
              placeholder="Suchen nach Namen, E-Mail oder Adresse..."
              className="form-input"
            />

            <div className="max-h-60 overflow-y-auto">
              {customers
                .filter(customer =>
                  customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  customer.address.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <div>
                    <input
                      type="text"
                      placeholder="Name *"
                      value={newCustomerData.name}
                      onChange={(e) => {
                        setNewCustomerData(prev => ({ ...prev, name: e.target.value }))
                        validation.touch('newCustomerName')
                      }}
                      onBlur={() => validation.validateNewCustomer(newCustomerData)}
                      className={`form-input ${validation.hasError('newCustomer') || validation.hasError('newCustomerName') ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                    <ValidationMessage error={validation.getErrorMessage('newCustomer') || validation.getErrorMessage('newCustomerName')} />
                  </div>
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
                {invoiceData.lines.map((line) => (
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

  // Check if all data is valid for review step
  const canAccessReviewStep = () => {
    return canProceedToNextStep(0) && canProceedToNextStep(1) && canProceedToNextStep(2)
  }

  const handleCreateInvoiceAndDownload = async () => {
    try {

      // CRITICAL BLOCK: IMMEDIATE REJECTION FOR ANY MISSING REQUIRED DATA
      // This is a fail-fast check that catches even the smallest gap

      // Must have customer selected
      if (!selectedCustomer) {
        alert('RECHNUNG BLOCKIERT: Sie müssen zuerst einen Kunden auswählen oder einen neuen Kunden erstellen.')
        setCurrentStep(0)
        return false // Absolutely stop
      }

      // Must have customer name and address filled
      if (!invoiceData.customerName?.trim() || !invoiceData.customerAddress?.trim()) {
        alert('RECHNUNG BLOCKIERT: Kundendaten sind unvollständig. Name und Adresse müssen ausgefüllt sein.')
        setCurrentStep(0)
        return false
      }

      // Must have object description
      if (!invoiceData.object?.trim()) {
        alert('RECHNUNG BLOCKIERT: Das Objekt-Feld muss ausgefüllt sein (z.B. "Baumarbeiten am Grundstück Musterweg 123").')
        setCurrentStep(1)
        return false
      }

      // Must have at least one valid service line
      if (!invoiceData.lines.some(line => line.description.trim() && line.unitPrice > 0 && line.quantity > 0)) {
        alert('RECHNUNG BLOCKIERT: Sie müssen mindestens eine Dienstleistung mit Beschreibung, Preis und Menge hinzufügen.')
        setCurrentStep(2)
        return false
      }

      // BLOCK 0: REFRESH DETECTION - Force complete wizard restart
      console.log('Checking for empty/unchanged state...')
      const hasCustomerBeenSelected = !!selectedCustomer
      const hasObjectBeenFilled = !!invoiceData.object?.trim()
      const linesValid = invoiceData.lines.some(line =>
        line.description?.trim() && line.unitPrice > 0 && line.quantity > 0
      )

      console.log('Customer selected:', hasCustomerBeenSelected)
      console.log('Object filled:', hasObjectBeenFilled)
      console.log('Valid lines:', linesValid)

      if (!hasCustomerBeenSelected) {
        alert('🚫 BLOCKED: Kein Kunde ausgewählt!\n\nBitte wählen Sie einen Kunden aus oder erstellen Sie einen neuen Kunden.')
        setCurrentStep(0)
        return
      }

      if (!hasObjectBeenFilled) {
        alert('🚫 BLOCKED: Objekt-Beschreibung fehlt!\n\nGeben Sie eine Beschreibung der Arbeit ein (z.B. "Baumarbeiten").')
        setCurrentStep(1)
        return
      }

      if (!linesValid) {
        alert('🚫 BLOCKED: Keine gültigen Dienstleistungen!\n\nFügen Sie mindestens eine Position mit Beschreibung und Preis hinzu.')
        setCurrentStep(2)
        return
      }

      // BLOCK 1: Identity Check - Ensure user actually entered real data
      const validationResult = await validation.validateInvoiceData(invoiceData)
      console.log('Schema validation result:', validationResult)

      if (!validationResult) {
        const errors = validation.getAllErrors()
        console.error('Schema validation errors:', errors)
        alert(`🚫 SCHEıma FEHLER:\nDie Daten entsprechen nicht den erforderlichen Formaten.`)
        return
      }

      // BLOCK 2: Quality Assessment - Reject meaningless data
      const placeholderPatterns = [
        'kundenname', 'kunde', 'name', 'musterkunde', 'john doe', 'max mustermann',
        'straße', 'straße', 'straße', 'walterweg', 'musterstraße', 'beispielstraße',
        'ort', 'plz', 'stadt', 'stadt', 'stadt', 'musterstadt', 'beispielstadt',
        'position', 'leistung', 'dienst', 'arbeiten', 'arbeit', 'test', 'muster', 'beispiel'
      ]

      // Check customer data quality
      if (placeholderPatterns.some(p => invoiceData.customerName.toLowerCase().includes(p))) {
        alert('🚫 BLOCKED: Ungültiger Kundenname!\n\nVerwenden Sie Platzhaltertexte wie "Kundenname" oder "Musterkunde" nicht.')
        setCurrentStep(0)
        return
      }

      if (placeholderPatterns.some(p => invoiceData.customerAddress.toLowerCase().includes(p))) {
        alert('🚫 BLOCKED: Ungültige Adresse!\n\nVerwenden Sie keine Platzhalteradressen.')
        setCurrentStep(0)
        return
      }

      if (placeholderPatterns.some(p => invoiceData.object.toLowerCase().includes(p))) {
        alert('🚫 BLOCKED: Ungültige Objekt-Beschreibung!\n\nBeschreiben Sie die tatsächlich durchgeführten Arbeiten.')
        setCurrentStep(1)
        return
      }

      // Check service line quality
      for (let i = 0; i < invoiceData.lines.length; i++) {
        const line = invoiceData.lines[i]
        if (placeholderPatterns.some(p => line.description.toLowerCase().includes(p))) {
          alert(`🚫 BLOCKED: Position ${i+1} enthält Platzhaltertext!\n\nBeschreiben Sie konkrete Arbeiten wie "Fällen eines kranken Baumes".`)
          setCurrentStep(2)
          return
        }
      }

      // BLOCK 3: Business Logic Validation
      if (invoiceData.lines.some(line => line.unitPrice <= 0 || line.unitPrice > 99999)) {
        alert('🚫 BLOCKED: Ungültige Preise!\n\nPreise müssen zwischen 0.01€ und 99.999€ liegen.')
        setCurrentStep(2)
        return
      }

      if (invoiceData.lines.some(line => line.quantity <= 0 || line.quantity > 1000)) {
        alert('🚫 BLOCKED: Ungültige Mengen!\n\nMengen müssen zwischen 0.01 und 1000 liegen.')
        setCurrentStep(2)
        return
      }

      if (invoiceData.totalAmount <= 0) {
        alert('🚫 BLOCKED: Gesamtbetrag ungültig!\n\nDie Rechnung muss einen positiven Betrag haben.')
        return
      }

      if (invoiceData.totalAmount > 50000) {
        alert('🚫 BLOCKED: Betrag zu hoch!\n\nBei Beträgen über 50.000€ nehmen Sie bitte Rücksprache gehalten.')
        return
      }

      console.log('✅===ALL VALIDATION PASSED===✅')

      // CREATE PDF ONLY IF ALL 4 BLOCKS PASS
      const pdfProps = {
        companyName: "Baumprofis",
        companyTaglineLines: ["Baumpflege . Baumsanierung . Baumsicherung", "Baumkontrolle . Gartenpflege", "Baumfällarbeiten (auch Problem- und Risikofällung)"],
        senderName: "Max Mustermann",
        senderStreet: "Baumstraße 123",
        senderZipCity: "12345 Musterstadt",
        senderMobile: "+49 123 456789",
        recipientName: invoiceData.customerName,
        recipientLine2: '',
        recipientStreet: invoiceData.customerAddress.split('\n')[0] || invoiceData.customerAddress,
        recipientZipCity: invoiceData.customerAddress.split('\n').slice(1).join('\n') || invoiceData.customerAddress,
        invoiceNumber: invoiceData.invoiceNumber,
        objectDescription: invoiceData.object,
        place: "Musterstadt",
        invoiceDate: invoiceData.date,
        salutation: "Sehr geehrte Damen und Herren,",
        introText: "anbei erhalten Sie unsere Rechnung für die durchgeführten Baumpflegearbeiten. Die Arbeiten wurden fachgerecht und nach den neuesten Standards ausgeführt.",
        items: invoiceData.lines.map((line, index) => ({
          position: index + 1,
          description: line.description,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          unitLabel: line.unit,
          total: line.total
        })),
        netTotal: invoiceData.subtotal,
        vatRate: 0.19,
        vatAmount: invoiceData.vatAmount,
        grossTotal: invoiceData.totalAmount,
        paymentText: `Bitte überweisen Sie den Rechnungsendbetrag über ${invoiceData.totalAmount.toFixed(2)} € binnen 10 Tagen auf folgendes Konto:`,
        bankName: "Musterbank",
        iban: "DE89 3704 0044 0532 0130 00",
        bic: "COBADEFFXXX",
        accountHolder: "Baumprofis GmbH",
        taxId: "DE123456789",
        taxNumber: "123/456/78901"
      }

      console.log('🎉 PDF CREATION ENABLED - Downloading invoice...', pdfProps.invoiceNumber)

      // Import and call the PDF download function
      const { downloadInvoicePdf } = await import("../../pdf/downloadInvoicePdf")
      await downloadInvoicePdf(pdfProps)

      alert('✅ PDF erfolgreich heruntergeladen!')

    } catch (error) {
      console.error('❌ PDF creation failed:', error)
      alert('❌ Fehler beim Erstellen der PDF. Bitte versuchen Sie es erneut.')
    }
  }

  // Review Wizard Step
  const ReviewStep = () => {
    // Prevent access if validation fails
    if (!canAccessReviewStep()) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Validierung erforderlich</h2>
            <p className="text-gray-600">Bitte vervollständigen Sie alle Schritte bevor Sie die Rechnung erstellen können.</p>
          </div>

          <div className="bg-red-50 rounded-lg border border-red-200 p-8 text-center">
            <ValidationMessage
              error="Alle Schritte müssen valide Daten enthalten, bevor die Rechnung erstellt werden kann."
            />

            <div className="mt-6">
              <button
                onClick={() => setCurrentStep(0)}
                className="btn btn-primary"
              >
                Zum ersten Schritt zurückkehren
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
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
                onClick={handleCreateInvoiceAndDownload}
                className="btn btn-primary"
                disabled={validation.isValidating}
              >
                {validation.isValidating ? 'Validierung läuft...' : 'Rechnung erstellen & PDF herunterladen'}
              </button>
              <button
                onClick={() => alert('Entwurf speichern - noch nicht implementiert')}
                className="btn btn-secondary"
                disabled={validation.isValidating}
              >
                Nur speichern (Entwurf)
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

  // Navigation guard - force user back if they try to access invalid steps
  useEffect(() => {
    if (currentStep === 0) return // Always allow step 0

    // If current step is not valid, redirect to the first invalid step
    for (let step = 0; step < currentStep; step++) {
      if (!canProceedToNextStep(step)) {
        setCurrentStep(step)
        break
      }
    }
  }, [currentStep, selectedCustomer, invoiceData])

  // Validation functions for step navigation
  const canProceedToNextStep = (step: number): boolean => {
    switch (step) {
      case 0: // Customer step
        return !!selectedCustomer
      case 1: // Details step
        return !!(invoiceData.invoiceNumber.trim() && invoiceData.date && invoiceData.object.trim())
      case 2: // Services step
        return invoiceData.lines.length > 0 &&
               invoiceData.lines.every(line => line.description.trim() && line.unitPrice > 0 && line.quantity > 0) &&
               invoiceData.totalAmount > 0
      default:
        return true
    }
  }

  const handleNextStep = async () => {
    if (currentStep < STEPS.length - 1) {
      // Validate current step before proceeding
      if (canProceedToNextStep(currentStep)) {
        setCurrentStep(prev => prev + 1)
      } else {
        // Show validation errors for current step
        if (currentStep === 0) {
          if (!selectedCustomer) {
            alert('Bitte wählen Sie einen Kunden aus oder erstellen Sie einen neuen.')
          }
        } else if (currentStep === 1) {
          const missing = []
          if (!invoiceData.invoiceNumber.trim()) missing.push('Rechnungsnummer')
          if (!invoiceData.date) missing.push('Datum')
          if (!invoiceData.object.trim()) missing.push('Objekt-Beschreibung')
          if (missing.length > 0) {
            alert(`Folgende Felder sind erforderlich: ${missing.join(', ')}`)
          }
        } else if (currentStep === 2) {
          const invalidLines = invoiceData.lines.filter(line =>
            !line.description.trim() || line.unitPrice <= 0 || line.quantity <= 0
          )
          if (invalidLines.length > 0) {
            alert('Bitte vervollständigen Sie alle Positionen mit gültigen Beschreibungen, Preisen und Mengen.')
          } else if (invoiceData.totalAmount <= 0) {
            alert('Die Gesamtsumme muss größer als 0 sein.')
          }
        }
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            // Disable steps that haven't been completed yet
            const canNavigateToStep = index === 0 || // Always allow step 0
              (index === 1 && canProceedToNextStep(0)) || // Allow step 1 if step 0 is complete
              (index === 2 && canProceedToNextStep(0) && canProceedToNextStep(1)) || // Allow step 2 if steps 0-1 are complete
              (index === 3 && canAccessReviewStep()) // Allow step 3 only if all validation passes

            const isDisabled = !canNavigateToStep && !isActive

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    isDisabled ? 'bg-gray-400 text-white cursor-not-allowed' :
                    'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer'
                  }`}
                  onClick={!isDisabled && !isActive ? () => setCurrentStep(index) : undefined}
                >
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <div className={`ml-3 ${isActive ? 'text-gray-900' : isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
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
            onClick={handleNextStep}
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
