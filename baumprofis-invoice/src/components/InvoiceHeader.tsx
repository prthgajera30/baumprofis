import React from 'react'
import { Box, TextField, Typography, Card, CardContent } from '@mui/material'
import type { InvoiceData } from '../hooks/useInvoiceData'

interface InvoiceHeaderProps {
  invoiceData: InvoiceData
  onFieldChange: (field: keyof InvoiceData, value: string) => void
  validationErrors?: Record<string, string>
}

// Component for invoice header with company branding and basic metadata fields
export const InvoiceHeader: React.FC<InvoiceHeaderProps> = React.memo(({
  invoiceData,
  onFieldChange,
  validationErrors = {}
}) => {
  return (
    <>
      {/* Company Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Baumprofis
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Baumpflege . Baumsanierung . Baumsicherung
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Baumkontrolle . Gartenpflege . Baumsicherung
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Phidelia Ogbeide . Mühlstraße 22 . 65388 Schlangenbad
            </Typography>
            <Typography variant="body1">
              Mobil: +49 175 6048985
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Neue Rechnung erstellen
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Professionelle Rechnung für Baumdienstleistungen
          </Typography>

          {/* Invoice metadata fields */}
          <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Rechnung Nr"
              value={invoiceData.invoiceNumber}
              onChange={(e) => onFieldChange('invoiceNumber', e.target.value)}
              error={!!validationErrors.invoiceNumber}
              helperText={validationErrors.invoiceNumber}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              fullWidth
              label="Datum"
              value={invoiceData.date}
              onChange={(e) => onFieldChange('date', e.target.value)}
              error={!!validationErrors.date}
              helperText={validationErrors.date}
              sx={{ flex: 1, minWidth: 200 }}
              placeholder="dd.MM.yyyy"
            />
            <TextField
              fullWidth
              label="Zahlungsziel"
              value={invoiceData.dueDate}
              onChange={(e) => onFieldChange('dueDate', e.target.value)}
              error={!!validationErrors.dueDate}
              helperText={validationErrors.dueDate}
              sx={{ flex: 1, minWidth: 200 }}
              placeholder="dd.MM.yyyy"
            />
          </Box>

          {/* Object description */}
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Objekt/Beschreibung"
              value={invoiceData.object}
              onChange={(e) => onFieldChange('object', e.target.value)}
              error={!!validationErrors.object}
              helperText={validationErrors.object}
              placeholder="z.B. Baumarbeiten in Koblenz-Lutzel"
            />
          </Box>
        </CardContent>
      </Card>
    </>
  )
})

InvoiceHeader.displayName = 'InvoiceHeader'

export default InvoiceHeader
