import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCustomers } from '../../hooks/useCustomers'
import { db } from '../../lib/firebase'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { format } from 'date-fns'

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
  InputLabel,
  Grid,
  IconButton,
  Divider,
  Chip,
  Autocomplete,
  ListItem,
  ListItemText,
  ListItemButton
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

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '04138/25',
    status: 'draft',
    date: format(new Date(), 'dd.MM.yyyy'),
    object: '',
    customerName: '',
    customerAddress: '',
    customerStreet: '',
    customerZipCode: '',
    customerCity: '',
    lines: [{ id: '1', description: '', unitPrice: 0, quantity: 1, unit: 'pauschal', total: 0 }],
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

      if (invoiceData.id) {
        await updateDoc(doc(db, 'invoices', invoiceData.id), dataToSave)
        alert('Rechnung aktualisiert!')
      } else {
        const docRef = await addDoc(collection(db, 'invoices'), dataToSave)
        setInvoiceData(prev => ({ ...prev, id: docRef.id }))
        alert('Rechnung gespeichert!')
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Fehler beim Speichern der Rechnung.')
    } finally {
      setSaving(false)
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
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            fullWidth
            label="Datum"
            value={invoiceData.date}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            fullWidth
            label="Zahlungsziel"
            value={invoiceData.dueDate}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
            sx={{ flex: 1, minWidth: 200 }}
          />
        </Box>

        {/* Object */}
        <TextField
          fullWidth
          label="Objekt/Beschreibung"
          value={invoiceData.object}
          onChange={(e) => setInvoiceData(prev => ({ ...prev, object: e.target.value }))}
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
            onChange={(event, customer) => {
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
              <Box component="li" {...props}>
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
                const combinedAddress = `${invoiceData.customerStreet ? `${invoiceData.customerStreet}, ` : ''}${newZip} ${invoiceData.customerCity}`.trim()
                setInvoiceData(prev => ({
                  ...prev,
                  customerZipCode: newZip,
                  customerAddress: combinedAddress || '',
                  customerId: undefined // Clear customerId when manually changing
                }))
              }}
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
                <TableRow key={line.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      placeholder="Leistungsbeschreibung"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 1)}
                      inputProps={{ min: 0.01, step: 0.01 }}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small">
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
              onClick={() => {
                setInvoiceData(prev => ({ ...prev, status: 'finalized' }))
                handleSave()
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
              onClick={() => {
                // TODO: PDF generation
                alert('PDF generation will be implemented next')
              }}
              size="large"
            >
              PDF herunterladen
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
