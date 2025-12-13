import React from 'react'
import { Paper, Typography, Box, Divider } from '@mui/material'
import type { InvoiceData } from '../hooks/useInvoiceData'

interface InvoiceTotalsPanelProps {
  invoiceData: InvoiceData
  className?: string
}

// Component for displaying calculated invoice totals
// Uses the calculated values from invoiceData (computed by useInvoiceCalculations hook)
export const InvoiceTotalsPanel: React.FC<InvoiceTotalsPanelProps> = React.memo(({
  invoiceData,
  className
}) => {
  return (
    <Paper sx={{ p: 3, bgcolor: 'grey.50' }} className={className}>
      <Typography variant="h6" gutterBottom>
        Rechnungsbeträge
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Box sx={{ minWidth: 250 }}>
          {/* Subtotal */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Summe (Netto):
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {invoiceData.subtotal.toFixed(2).replace('.', ',')} €
            </Typography>
          </Box>

          {/* VAT */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              zzgl. 19% MwSt.:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {invoiceData.vatAmount.toFixed(2).replace('.', ',')} €
            </Typography>
          </Box>

          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" color="primary">
              Rechnungsbetrag:
            </Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {invoiceData.totalAmount.toFixed(2).replace('.', ',')} €
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Status indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            bgcolor: invoiceData.status === 'draft' ? 'warning.main' :
                    invoiceData.status === 'finalized' ? 'success.main' : 'primary.main',
            color: 'white',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: '0.7rem'
          }}
        >
          {invoiceData.status === 'draft' ? 'Entwurf' :
           invoiceData.status === 'finalized' ? 'Finalisiert' : 'Bezahlt'}
        </Typography>
      </Box>
    </Paper>
  )
})

InvoiceTotalsPanel.displayName = 'InvoiceTotalsPanel'

export default InvoiceTotalsPanel
