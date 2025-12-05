import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../lib/firebase'
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore'
import { format } from 'date-fns'

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

  const generatePDF = () => {
    // TODO: Implement PDF generation with jsPDF
    alert('PDF generation will be implemented next')
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
      </div>
    </div>
  )
}
