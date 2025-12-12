import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCustomers } from '../../hooks/useCustomers'
import { downloadInvoicePdf } from '../../pdf/downloadInvoicePdf'
import { db } from '../../lib/firebase'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { format } from 'date-fns'
import { InvoiceValidationService } from '../../services/validationService'

import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Divider,
  Chip,
  Autocomplete
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'


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
  customerStreet: string
  customerZipCode: string
  customerCity: string
  lines: InvoiceLine[]
  subtotal: number
  vatAmount: number
  totalAmount: number
  dueDate: string
}

export const InvoiceForm = () => {
  const { user } = useAuth()
  const { customers, createCustomer } = useCustomers()
  const [saving, setSaving] = useState(false)
  const [pdfDownloading, setPdfDownloading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({})

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    id: `temp_${Date.now()}`, // Temporary ID for validation
    invoiceNumber: '04138-25',
    status: 'draft',
    date: format(new Date(), 'dd.MM.yyyy'),
    object: 'Baumarbeiten',
    customerName: '',
    customerAddress: '',
    customerStreet: '',
    customerZipCode: '',
    customerCity: '',
    lines: [{ id: '1', description: 'Baumpflegearbeiten', unitPrice: 150.00, quantity: 1, unit: 'pauschal', total: 150.00 }],
    subtotal: 0,
    vatAmount: 0,
    totalAmount: 0,
    dueDate: format(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 'dd.MM.yyyy')
  })

  const calculateTotals = (lines: InvoiceLine[]) => {
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0)
    const vatAmount = subtotal * 0.19
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

  const updateLine = (id: string, field: keyof InvoiceLine, value: string | number) => {
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

  const validateAndSetErrors = async () => {
    try {
      // Use comprehensive validation that includes all business rules
      const validationResult = await InvoiceValidationService.validateForPdfGeneration({
        invoiceNumber: invoiceData.invoiceNumber,
        customerName: invoiceData.customerName,
        customerAddress: invoiceData.customerAddress,
        customerEmail: undefined,
        customerPhone: undefined,
        lines: invoiceData.lines,
        subtotal: invoiceData.subtotal,
        vatAmount: invoiceData.vatAmount,
        totalAmount: invoiceData.totalAmount,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
        object: invoiceData.object
      }, user?.uid, invoiceData.id)

      setValidationErrors(validationResult.errors || {})

      // Check for line-specific errors and validate individual line fields
      const lineErrorsMap: Record<string, string> = {}

      // Validate each service line individually
      invoiceData.lines.forEach((line) => {
        const lineErrors: string[] = []

        // Validate description
        if (!line.description?.trim()) {
          lineErrors.push('Beschreibung ist erforderlich')
        } else if (line.description.trim().length < 3) {
          lineErrors.push('Beschreibung zu kurz (mind. 3 Zeichen)')
        }

        // Validate quantity
        if (line.quantity <= 0) {
          lineErrors.push('Menge muss größer als 0 sein')
        }

        // Validate unit price
        if (line.unitPrice <= 0) {
          lineErrors.push('Einzelpreis muss größer als 0 sein')
        }

        // Validate total calculation
        const expectedTotal = line.unitPrice * line.quantity
        if (Math.abs(line.total - expectedTotal) > 0.01) {
          lineErrors.push('Gesamtpreis-Berechnung ist falsch')
        }

        // If there are any line-specific errors, add them to the map
        if (lineErrors.length > 0) {
          lineErrorsMap[line.id] = lineErrors.join(' | ')
        }
      })

      // Add general lines error if present
      if (validationResult.errors?.lines) {
        invoiceData.lines.forEach(line => {
          if (!lineErrorsMap[line.id]) {
            lineErrorsMap[line.id] = validationResult.errors.lines
          }
        })
      }

      setLineErrors(lineErrorsMap)
      return validationResult
    } catch (error: unknown) {
      console.error('Validation error:', error)
      // Handle validation errors gracefully
      const fallbackErrors: Record<string, string> = {}

      if (error instanceof Error && error.message.includes('invoiceNumber')) {
        fallbackErrors.invoiceNumber = 'Rechnungsnummer bereits vergeben'
      } else if (typeof error === 'string' && error.includes('invoiceNumber')) {
        fallbackErrors.invoiceNumber = 'Rechnungsnummer bereits vergeben'
      }

      setValidationErrors(fallbackErrors)
      return { isValid: false, errors: fallbackErrors }
    }
  }

  const clearValidationErrors = () => {
    setValidationErrors({})
    setLineErrors({})
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      // Validate invoice data before saving
      const validationResult = await validateAndSetErrors()

      // Check for both general validation errors and line-specific errors
      const hasErrors = !validationResult.isValid || Object.keys(lineErrors).length > 0

      if (hasErrors) {
        // Collect all error messages
        const errorMessages = [
          ...Object.values(validationResult.errors || {}),
          ...Object.values(lineErrors)
        ].filter(Boolean)

        if (errorMessages.length > 0) {
          alert(`Bitte korrigieren Sie folgende Fehler:\n\n${errorMessages.join('\n')}`)
          setSaving(false)
          return
        }
      }

      // Auto-create customer if not exists
      let customerToUse = invoiceData

      if (!invoiceData.customerId && invoiceData.customerName && invoiceData.customerAddress) {
        try {
          const newCustomer = await createCustomer({
            name: invoiceData.customerName,
            address: invoiceData.customerAddress,
            email: '', // Optional, can be added later
            phone: ''
          })

          customerToUse = {
            ...invoiceData,
            customerId: newCustomer.id
          }
        } catch (customerError) {
          console.error('Error creating customer:', customerError)
          // Continue without customer link if creation fails
        }
      }

      const dataToSave = {
        ...customerToUse,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Check if this is a new invoice (temporary ID) or an existing one
      const isNewInvoice = !invoiceData.id || invoiceData.id.startsWith('temp_')

      if (isNewInvoice) {
        const docRef = await addDoc(collection(db, 'invoices'), dataToSave)
        setInvoiceData(prev => ({ ...prev, id: docRef.id }))
        alert('Rechnung gespeichert!')
        clearValidationErrors()
      } else {
        await updateDoc(doc(db, 'invoices', invoiceData.id!), dataToSave)
        alert('Rechnung aktualisiert!')
        clearValidationErrors()
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Fehler beim Speichern der Rechnung.')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setPdfDownloading(true)

      // Validate required fields before PDF generation
      const missingFields = []
      if (!invoiceData.customerName?.trim()) missingFields.push('Kundenname')
      if (!invoiceData.customerAddress?.trim()) missingFields.push('Kundenadresse')

      if (missingFields.length > 0) {
        alert(`Bitte füllen Sie folgende Pflichtfelder aus:\n\n${missingFields.join('\n')}`)
        setPdfDownloading(false)
        return
      }



      // Map InvoiceData to BaumprofisInvoicePdfProps
      const pdfProps = {
        // Header / sender (static values from the original template)
        companyName: "Baumprofis",
        companyTaglineLines: [
          "Baumpflege . Baumsanierung . Baumsicherung",
          "Baumkontrolle . Gartenpflege . Baumfällarbeiten",
          "(auch Problem- und Risikofällung)"
        ],
        senderName: "Phidelia Ogbeide",
        senderStreet: "Mühlstraße 22",
        senderZipCity: "65388 Schlangenbad",
        senderMobile: "+49 175 6048985",

        // Recipient
        recipientName: invoiceData.customerName || 'Kundenname',
        recipientLine2: undefined, // Could add if needed
        recipientStreet: invoiceData.customerStreet || 'Straße',
        recipientZipCity: `${invoiceData.customerZipCode || 'PLZ'} ${invoiceData.customerCity || 'Ort'}`,

        // Invoice meta
        invoiceNumber: invoiceData.invoiceNumber,
        objectDescription: invoiceData.object || 'Baumarbeiten',
        place: 'Schlangenbad', // Static from template
        invoiceDate: invoiceData.date,

        salutation: "Sehr geehrte Damen und Herren,",
        introText: "nach Abschluss der gewünschten Arbeiten stelle ich Ihnen diese in Rechnung.",

        // Invoice items - map the lines
        items: invoiceData.lines.map((line, index) => ({
          position: index + 1,
          description: line.description || `Position ${index + 1}`,
          unitPrice: Number(line.unitPrice),
          quantity: Number(line.quantity),
          unitLabel: line.unit === 'Stunden' ? 'Stunden' : (line.unit === 'Stück' ? 'Stück' : 'pauschal'),
          total: Number(line.total)
        })),

        // Totals
        netTotal: Number(invoiceData.subtotal),
        vatRate: 0.19, // 19%
        vatAmount: Number(invoiceData.vatAmount),
        grossTotal: Number(invoiceData.totalAmount),

        paymentText: undefined, // Use default

        // Bank data (static values from template)
        bankName: "Rheingauer Volksbank eG.",
        iban: "DE31 5109 1500 0000 1543 93",
        bic: "GENODE51RGG",
        accountHolder: "Phidelia Ogbeide",

        // Footer tax info (static values)
        taxId: "75961284403",
        taxNumber: "004/853/60532"
      }

      await downloadInvoicePdf(pdfProps)
    } catch (error) {
      console.error('PDF download error:', error)
      alert('Fehler beim Herunterladen der PDF.')
    } finally {
      setPdfDownloading(false)
    }
  }

  return (
    <Card sx={{ maxWidth: 'lg', mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Neue Rechnung erstellen
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
          Professionelle Rechnung für Baumdienstleistungen
        </Typography>

        {/* Company Header */}
        <Box sx={{ textAlign: 'center', mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Baumprofis
          </Typography>
          <Typography variant="body2">
            Baumpflege . Baumsanierung . Baumsicherung
          </Typography>
          <Typography variant="body2">
            Baumkontrolle . Gartenpflege . Baumfällarbeiten
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Phidelia Ogbeide . Mühlstraße 22 . 65388 Schlangenbad
          </Typography>
          <Typography variant="body2">
            Mobil: +49 175 6048985
          </Typography>
        </Box>

        {/* Invoice Details */}
        <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 3, mb: 4 }}>
          <TextField
            fullWidth
            label="Rechnung Nr"
            value={invoiceData.invoiceNumber}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            error={!!validationErrors.invoiceNumber}
            helperText={validationErrors.invoiceNumber}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            fullWidth
            label="Datum"
            value={invoiceData.date}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
            error={!!validationErrors.date}
            helperText={validationErrors.date}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            fullWidth
            label="Zahlungsziel"
            value={invoiceData.dueDate}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
            error={!!validationErrors.dueDate}
            helperText={validationErrors.dueDate}
            sx={{ flex: 1, minWidth: 200 }}
          />
        </Box>

        {/* Object */}
        <TextField
          fullWidth
          label="Objekt/Beschreibung"
          value={invoiceData.object}
          onChange={(e) => setInvoiceData(prev => ({ ...prev, object: e.target.value }))}
          error={!!validationErrors.object}
          helperText={validationErrors.object}
          sx={{ mb: 4 }}
          placeholder="z.B. Baumarbeiten in Koblenz-Lutzel"
        />

        {/* Customer Details */}
        <Typography variant="h6" gutterBottom>
          Kundendetails
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Autocomplete
            options={customers}
            getOptionLabel={(customer) => `${customer.name} - ${customer.address}`}
            onChange={(_, customer) => {
              if (customer) {
                // Parse address into components
                const addressParts = customer.address.split(', ');
                const streetAndNumber = addressParts[0] || '';
                const remainingParts = addressParts[1] ? addressParts[1].split(' ') : ['', ''];
                const zipCode = remainingParts[0].match(/^\d{5}/) ? remainingParts[0] : '';
                const city = remainingParts.filter(part => !/^\d{5}/.test(part)).join(' ') || '';

                setInvoiceData(prev => ({
                  ...prev,
                  customerId: customer.id,
                  customerName: customer.name,
                  customerAddress: customer.address,
                  customerStreet: streetAndNumber,
                  customerZipCode: zipCode,
                  customerCity: city
                }))
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Vorhandenen Kunden suchen"
                placeholder="Kunden auswählen..."
              />
            )}
            renderOption={(props, customer) => (
              <Box component="li" {...props} key={customer.id}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography variant="body1" fontWeight="medium">
                    {customer.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {customer.address}
                  </Typography>
                  {customer.email && (
                    <Typography variant="caption" color="primary">
                      {customer.email}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
            noOptionsText="Keine Kunden gefunden"
            sx={{ mb: 2 }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 3, mb: 2 }}>
            <TextField
              fullWidth
              label="Kundenname"
              value={invoiceData.customerName}
              onChange={(e) => {
                const newName = e.target.value
                setInvoiceData(prev => ({
                  ...prev,
                  customerName: newName,
                  customerId: undefined // Clear customerId when manually changing
                }))
              }}
              error={!!validationErrors.customerName || !!validationErrors.customer}
              helperText={validationErrors.customerName || validationErrors.customer}
              sx={{ flex: 1, minWidth: { xs: '100%', md: 300 } }}
              placeholder="Kundenname für neuen Eintrag"
            />
            <TextField
              fullWidth
              label="Straße & Hausnummer"
              value={invoiceData.customerStreet}
              onChange={(e) => {
                const newStreet = e.target.value
                const combinedAddress = `${newStreet ? `${newStreet}, ` : ''}${invoiceData.customerZipCode} ${invoiceData.customerCity}`.trim()
                setInvoiceData(prev => ({
                  ...prev,
                  customerStreet: newStreet,
                  customerAddress: combinedAddress || '',
                  customerId: undefined // Clear customerId when manually changing
                }))
              }}
              error={!!validationErrors.customerAddress || !!validationErrors.customer}
              helperText={validationErrors.customerAddress || validationErrors.customer}
              sx={{ flex: 1, minWidth: { xs: '100%', md: 300 } }}
              placeholder="z.B. Lohrstr 2"
            />
          </Box>

          <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 3 }}>
            <TextField
              fullWidth
              label="PLZ"
              value={invoiceData.customerZipCode}
            onChange={(e) => {
                const newZip = e.target.value.replace(/\D/g, '').substring(0, 5) // Only numbers, max 5 digits
                const currentStreet = invoiceData.customerStreet || ''
                const currentCity = invoiceData.customerCity || ''
                const combinedAddress = `${currentStreet ? `${currentStreet}, ` : ''}${newZip} ${currentCity}`.trim()
                setInvoiceData(prev => ({
                  ...prev,
                  customerZipCode: newZip,
                  customerAddress: combinedAddress || '',
                  customerId: undefined // Clear customerId when manually changing
                }))
              }}
              error={!!validationErrors.customerAddress || !!validationErrors.customer}
              helperText={validationErrors.customerAddress || validationErrors.customer}
              sx={{ flex: 1, minWidth: 120 }}
              placeholder="z.B. 5602"
            />
            <TextField
              fullWidth
              label="Ort"
              value={invoiceData.customerCity}
              onChange={(e) => {
                const newCity = e.target.value
                const combinedAddress = `${invoiceData.customerStreet ? `${invoiceData.customerStreet}, ` : ''}${invoiceData.customerZipCode} ${newCity}`.trim()
                setInvoiceData(prev => ({
                  ...prev,
                  customerCity: newCity,
                  customerAddress: combinedAddress || '',
                  customerId: undefined // Clear customerId when manually changing
                }))
              }}
              error={!!validationErrors.customerAddress || !!validationErrors.customer}
              helperText={validationErrors.customerAddress || validationErrors.customer}
              sx={{ flex: 1, minWidth: 200 }}
              placeholder="z.B. Koblenz"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Verwenden Sie das Suchfeld oben um vorhandene Kunden zu finden, oder füllen Sie die Felder aus für neue Kunden.
          </Typography>

          {invoiceData.customerId && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label="Vorhandener Kunde ausgewählt"
                color="success"
                variant="outlined"
                icon={<AddIcon />}
              />
            </Box>
          )}
        </Box>

        {/* Invoice Lines */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Dienstleistungen
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pos</TableCell>
                <TableCell>Beschreibung</TableCell>
                <TableCell align="right">Anzahl</TableCell>
                <TableCell>Einheit</TableCell>
                <TableCell align="right">Einzelpreis</TableCell>
                <TableCell align="right">Gesamt</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceData.lines.map((line, index) => (
                <TableRow key={line.id} sx={{ backgroundColor: lineErrors[line.id] ? 'rgba(255, 0, 0, 0.05)' : 'inherit' }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      placeholder="Leistungsbeschreibung"
                      error={!!lineErrors[line.id]}
                      helperText={lineErrors[line.id]}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 1)}
                      inputProps={{ min: 0.01, step: 0.01 }}
                      error={!!lineErrors[line.id]}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" error={!!lineErrors[line.id]}>
                      <Select
                        value={line.unit}
                        onChange={(e) => updateLine(line.id, 'unit', e.target.value)}
                      >
                        <MenuItem value="pauschal">pauschal</MenuItem>
                        <MenuItem value="Stunden">Stunden</MenuItem>
                        <MenuItem value="Stück">Stück</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, step: 0.01 }}
                      error={!!lineErrors[line.id]}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="medium">
                      {line.total.toFixed(2)} €
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {invoiceData.lines.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeLine(line.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addLine}
          sx={{ mb: 3 }}
        >
          Neue Position hinzufügen
        </Button>

        {/* Totals */}
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="body2">
                Summe (Netto): <strong>{invoiceData.subtotal.toFixed(2)} €</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                zzgl. 19% MwSt.: <strong>{invoiceData.vatAmount.toFixed(2)} €</strong>
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">
                Rechnungsbetrag: <strong>{invoiceData.totalAmount.toFixed(2)} €</strong>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Status */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
          <Chip
            label={invoiceData.status === 'draft' ? 'Entwurf' : invoiceData.status === 'finalized' ? 'Finalisiert' : 'Bezahlt'}
            color={invoiceData.status === 'draft' ? 'warning' : invoiceData.status === 'finalized' ? 'success' : 'primary'}
            variant="outlined"
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleSave}
            disabled={saving}
            size="large"
          >
            {saving ? 'Speichere...' : 'Entwurf speichern'}
          </Button>

          {invoiceData.status === 'draft' && (
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                // First validate, then update status and save
                const validationResult = await validateAndSetErrors()

                if (!validationResult.isValid) {
                  const errorMessages = Object.values(validationResult.errors).join('\n')
                  alert(`Bitte korrigieren Sie folgende Fehler:\n\n${errorMessages}`)
                  return
                }

                setInvoiceData(prev => ({ ...prev, status: 'finalized' }))
                await handleSave()
              }}
              size="large"
            >
              Rechnung finalisieren
            </Button>
          )}

          {invoiceData.status === 'finalized' && (
            <Button
              variant="contained"
              color="success"
              onClick={handleDownloadPDF}
              disabled={pdfDownloading}
              size="large"
            >
              {pdfDownloading ? 'PDF wird erstellt...' : 'PDF herunterladen'}
            </Button>
          )}
        </Box>
        </CardContent>
      </Card>
  )
}
