import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCustomers } from '../../hooks/useCustomers'
import type { Customer } from '../../hooks/useCustomers'
import { db } from '../../lib/firebase'
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore'
import { format } from 'date-fns'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { FileText } from 'lucide-react'

interface InvoiceLine {
  id: string
  description: string
  unitPrice: number
  quantity: number
  unit: 'Stunden' | 'Stück' | 'pauschal'
  total: number
}

interface InvoiceData {
  id?: string
  customerId?: string
  invoiceNumber: string
  status: 'draft' | 'finalized' | 'paid'
  date: string
  object: string
  customerName: string
  customerAddress: string
  lines: InvoiceLine[]
  subtotal: number
  vatAmount: number
  totalAmount: number
  dueDate: string
}

export const InvoiceForm = () => {
  const { user } = useAuth()
  const { customers, searchCustomers } = useCustomers()
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '04138/25',
    status: 'draft',
    date: format(new Date(), 'dd.MM.yyyy'),
    object: '',
    customerName: '',
    customerAddress: '',
    lines: [{ id: '1', description: '', unitPrice: 0, quantity: 1, unit: 'pauschal', total: 0 }],
    subtotal: 0,
    vatAmount: 0,
    totalAmount: 0,
    dueDate: format(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 'dd.MM.yyyy') // 10 days from now
  })
  const [saving, setSaving] = useState(false)

  // Filtered customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.address.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()))
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

  const addLine = () => {
    const newLine: InvoiceLine = {
      id: Date.now().toString(),
      description: '',
      unitPrice: 0,
      quantity: 1,
      unit: 'pauschal',
      total: 0
    }
    setInvoiceData(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }))
  }

  const updateLine = (id: string, field: keyof InvoiceLine, value: any) => {
    setInvoiceData(prev => {
      const updatedLines = prev.lines.map(line => {
        if (line.id === id) {
          const updatedLine = { ...line, [field]: value }
          if (field === 'unitPrice' || field === 'quantity') {
            updatedLine.total = updatedLine.unitPrice * updatedLine.quantity
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

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const dataToSave = {
        ...invoiceData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (invoiceData.id) {
        await updateDoc(doc(db, 'invoices', invoiceData.id), dataToSave)
        alert('Invoice updated successfully!')
      } else {
        const docRef = await addDoc(collection(db, 'invoices'), dataToSave)
        setInvoiceData(prev => ({ ...prev, id: docRef.id }))
        alert('Invoice saved successfully!')
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Error saving invoice. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleFinalize = () => {
    setInvoiceData(prev => ({
      ...prev,
      status: 'finalized',
      finalizedAt: new Date().toISOString()
    }))
  }

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setInvoiceData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerAddress: customer.address
    }))
    setShowCustomerSearch(false)
    setCustomerSearchTerm('')
  }

  const clearCustomerSelection = () => {
    setSelectedCustomer(null)
    setInvoiceData(prev => ({
      ...prev,
      customerId: undefined,
      customerName: '',
      customerAddress: ''
    }))
  }

  const pdfGenerationRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    if (!pdfGenerationRef.current) {
      alert('PDF generation failed: Invoice template not found')
      return
    }

    try {
      // Generate canvas from invoice template
      const canvas = await html2canvas(pdfGenerationRef.current, {
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 800,
        height: pdfGenerationRef.current.scrollHeight
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Calculate dimensions to fit A4 page
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Download the PDF
      const filename = `Rechnung_${invoiceData.invoiceNumber.replace('/', '_')}.pdf`
      pdf.save(filename)

      alert(`PDF erfolgreich heruntergeladen als: ${filename}`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('PDF-Erstellung fehlgeschlagen. Bitte versuchen Sie es erneut.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Neue Rechnung erstellen</h1>
        <p className="text-gray-600">Professionelle Rechnung für Baumdienstleistungen</p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        {/* Company Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Baumprofis</h2>
          <p className="text-gray-700">Baumpflege . Baumsanierung . Baumsicherung</p>
          <p className="text-gray-700">Baumkontrolle . Gartenpflege . Baumfällarbeiten</p>
          <p className="text-gray-700 mt-4">Phidelia Ogbeide . Mühlstraße 22 . 65388 Schlangenbad</p>
          <p className="text-gray-700">Mobil: +49 175 6048985</p>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Rechnung Nr:</label>
            <input
              type="text"
              value={invoiceData.invoiceNumber}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Datum:</label>
            <input
              type="text"
              value={invoiceData.date}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        {/* Object/Job Description */}
        <div className="mb-8">
          <label className="block text-gray-700 font-bold mb-2">Objekt:</label>
          <input
            type="text"
            value={invoiceData.object}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, object: e.target.value }))}
            className="w-full px-3 py-2 border rounded"
            placeholder="z.B. Baumarbeiten in Koblenz-Lutzel"
          />
        </div>

        {/* Customer Selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Kunde auswählen</h3>
            <div className="flex gap-2">
              {customers.length > 0 && (
                <button
                  onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  {showCustomerSearch ? 'Auswahl schließen' : 'Kunden durchsuchen'}
                </button>
              )}
              {selectedCustomer && (
                <button
                  onClick={clearCustomerSelection}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Auswahl aufheben
                </button>
              )}
            </div>
          </div>

          {/* Customer Selection Interface */}
          {showCustomerSearch && (
            <div className="border rounded-lg p-4 bg-gray-50 mb-4">
              <div className="mb-4">
                <input
                  type="text"
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  placeholder="Suche nach Namen, E-Mail oder Adresse..."
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              {filteredCustomers.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  {customers.length === 0
                    ? "Keine Kunden gefunden. Fügen Sie zuerst Kunden hinzu."
                    : "Keine Kunden entsprechen Ihrer Suche."}
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="cursor-pointer border rounded p-3 mb-2 bg-white hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.address}</div>
                      {customer.email && (
                        <div className="text-sm text-blue-600">{customer.email}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Customer Indicator */}
          {selectedCustomer && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <strong>{selectedCustomer.name}</strong>
                <span className="text-gray-600">ausgewählt</span>
              </div>
            </div>
          )}
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Kunde:</label>
            <input
              type="text"
              value={invoiceData.customerName}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, customerName: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
              placeholder="Kundenname"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Adresse:</label>
            <textarea
              value={invoiceData.customerAddress}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, customerAddress: e.target.value }))}
              className="w-full px-3 py-2 border rounded h-20"
              placeholder="Straße, PLZ Ort"
            />
          </div>
        </div>

        {/* Invoice Lines */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Leistungen</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Pos</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Beschreibung</th>
                <th className="border border-gray-300 px-4 py-2">Einzelpreis</th>
                <th className="border border-gray-300 px-4 py-2">Anzahl</th>
                <th className="border border-gray-300 px-4 py-2">Einheit</th>
                <th className="border border-gray-300 px-4 py-2">Gesamt</th>
                <th className="border border-gray-300 px-4 py-2">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.lines.map((line, index) => (
                <tr key={line.id}>
                  <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      className="w-full p-1"
                      placeholder="Leistungsbeschreibung"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full p-1 text-right"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 1)}
                      className="w-full p-1 text-right"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={line.unit}
                      onChange={(e) => updateLine(line.id, 'unit', e.target.value as any)}
                      className="w-full p-1"
                    >
                      <option value="pauschal">pauschal</option>
                      <option value="Stunden">Stunden</option>
                      <option value="Stück">Stück</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {line.total.toFixed(2)} €
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {invoiceData.lines.length > 1 && (
                      <button
                        onClick={() => removeLine(line.id)}
                        className="text-red-600 hover:text-red-800 mr-2"
                      >
                        Entfernen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addLine}
            className="mt-4 btn-primary"
          >
            Neue Position hinzufügen
          </button>
        </div>

        {/* Totals */}
        <div className="border-t-2 pt-4 mb-8">
          <div className="flex justify-end mb-2">
            <span className="font-bold">Summe: {invoiceData.subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-end mb-2">
            <span className="font-bold">zzgl. 19% MwSt.: {invoiceData.vatAmount.toFixed(2)} €</span>
          </div>
          <div className="flex justify-end">
            <span className="font-bold text-xl">Rechnungsbetrag: {invoiceData.totalAmount.toFixed(2)} €</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary"
          >
            {saving ? 'Speichere...' : 'Entwurf speichern'}
          </button>

          {invoiceData.status === 'draft' && (
            <button
              onClick={() => {
                handleFinalize()
                handleSave()
              }}
              className="btn-primary"
            >
              Rechnung finalisieren
            </button>
          )}

          {invoiceData.status === 'finalized' && (
            <button
              onClick={generatePDF}
              className="btn-primary"
            >
              PDF herunterladen
            </button>
          )}
        </div>

        {/* Hidden PDF Template for clean PDF generation */}
        <div
          ref={pdfGenerationRef}
          className="absolute -top-[9999px] left-0 w-full max-w-4xl bg-white p-8 text-black"
          style={{ fontSize: '12px', lineHeight: '1.4' }}
        >
          {/* Company Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Baumprofis</h2>
            <p className="mb-1">Baumpflege . Baumsanierung . Baumsicherung</p>
            <p className="mb-1">Baumkontrolle . Gartenpflege . Baumfällarbeiten</p>
            <p className="mt-4">Phidelia Ogbeide . Mühlstraße 22 . 65388 Schlangenbad</p>
            <p>Mobil: +49 175 6048985</p>
          </div>

          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-4">Rechnung</h3>
              <p className="mb-1"><strong>Rechnung Nr:</strong> {invoiceData.invoiceNumber}</p>
              <p><strong>Datum:</strong> {invoiceData.date}</p>
            </div>
            <div className="flex-1 text-right">
              <div className="mb-2"><strong>Objekt:</strong></div>
              <div>{invoiceData.object || '-'}</div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <h4 className="font-bold mb-2">Rechnungsempfänger:</h4>
            <div className="border border-gray-300 p-4 bg-gray-50">
              <p className="font-medium">{invoiceData.customerName}</p>
              <p className="whitespace-pre-line">{invoiceData.customerAddress}</p>
            </div>
          </div>

          {/* Invoice Lines */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-1 text-left font-bold text-sm">Pos</th>
                  <th className="border border-gray-400 px-2 py-1 text-left font-bold text-sm">Beschreibung</th>
                  <th className="border border-gray-400 px-2 py-1 text-center font-bold text-sm">Anzahl</th>
                  <th className="border border-gray-400 px-2 py-1 text-center font-bold text-sm">Einheit</th>
                  <th className="border border-gray-400 px-2 py-1 text-right font-bold text-sm">Einzelpreis</th>
                  <th className="border border-gray-400 px-2 py-1 text-right font-bold text-sm">Gesamt</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lines.map((line, index) => (
                  <tr key={line.id}>
                    <td className="border border-gray-400 px-2 py-1 text-center">{index + 1}</td>
                    <td className="border border-gray-400 px-2 py-1">{line.description || '-'}</td>
                    <td className="border border-gray-400 px-2 py-1 text-center">{line.quantity}</td>
                    <td className="border border-gray-400 px-2 py-1 text-center">{line.unit}</td>
                    <td className="border border-gray-400 px-2 py-1 text-right">{line.unitPrice.toFixed(2)} €</td>
                    <td className="border border-gray-400 px-2 py-1 text-right">{line.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-4">
            <div className="w-48">
              <div className="flex justify-between mb-2">
                <span>Summe (Netto):</span>
                <span>{invoiceData.subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>zzgl. 19% MwSt.:</span>
                <span>{invoiceData.vatAmount.toFixed(2)} €</span>
              </div>
              <div className="border-t-2 pt-2 flex justify-between font-bold">
                <span>Rechnungsbetrag:</span>
                <span className="text-lg">{invoiceData.totalAmount.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mt-8">
            <p className="mb-2"><strong>Zahlungsfrist:</strong> {invoiceData.dueDate}</p>
            <p className="text-sm text-gray-600">
              Bitte überweisen Sie den Betrag unter Angabe der Rechnungsnummer innerhalb von 10 Tagen ohne Abzug auf das vereinbarte Konto.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-4 border-t text-center">
            <p className="text-sm">Vielen Dank für Ihren Auftrag!</p>
            <p className="text-xs text-gray-600 mt-1">
              Diese Rechnung wurde automatisch erstellt und ist ohne Unterschrift gültig.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
