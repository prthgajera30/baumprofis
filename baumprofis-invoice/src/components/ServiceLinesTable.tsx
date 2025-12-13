import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Button,
  Typography,
  Box,
  Tooltip
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import type { InvoiceLine } from '../hooks/useInvoiceData'

interface ServiceLinesTableProps {
  lines: InvoiceLine[]
  onAddLine: () => void
  onUpdateLine: (lineId: string, field: keyof InvoiceLine, value: string | number) => void
  onRemoveLine: (lineId: string) => void
  lineErrors?: Record<string, string>
  maxLines?: number
}

// Component for managing service line items in invoices
export const ServiceLinesTable: React.FC<ServiceLinesTableProps> = React.memo(({
  lines,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  lineErrors = {},
  maxLines = 50
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Dienstleistungen
        <Typography variant="caption" color="text.secondary">
          ({lines.length}/{maxLines} Positionen)
        </Typography>
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Pos</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Beschreibung</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Anzahl</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Einheit</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Einzelpreis</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Gesamt</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line, index) => (
              <TableRow
                key={line.id}
                sx={{
                  backgroundColor: lineErrors[line.id] ? 'rgba(255, 0, 0, 0.05)' : 'inherit',
                  '&:hover': { backgroundColor: 'grey.25' }
                }}
              >
                <TableCell sx={{ verticalAlign: 'top' }}>
                  {index + 1}
                </TableCell>
                <TableCell sx={{ minWidth: 200 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={line.description}
                    onChange={(e) => onUpdateLine(line.id, 'description', e.target.value)}
                    placeholder="Leistungsbeschreibung"
                    error={!!lineErrors[line.id]}
                    helperText={lineErrors[line.id] ? lineErrors[line.id].split(' | ')[0] : ''}
                    multiline
                    rows={2}
                    sx={{
                      '& .MuiInputBase-root': { fontSize: '0.875rem' }
                    }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ minWidth: 100 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={line.quantity}
                    onChange={(e) => onUpdateLine(line.id, 'quantity', parseFloat(e.target.value) || 1)}
                    inputProps={{
                      min: 0.01,
                      step: 'any',
                      style: { textAlign: 'right' }
                    }}
                    error={!!lineErrors[line.id]}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>
                  <FormControl size="small" error={!!lineErrors[line.id]} fullWidth>
                    <Select
                      value={line.unit}
                      onChange={(e) => onUpdateLine(line.id, 'unit', e.target.value)}
                      sx={{ fontSize: '0.875rem' }}
                    >
                      <MenuItem value="pauschal">pauschal</MenuItem>
                      <MenuItem value="Stunden">Stunden</MenuItem>
                      <MenuItem value="Stück">Stück</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell align="right" sx={{ minWidth: 120 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={line.unitPrice}
                    onChange={(e) => onUpdateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    inputProps={{
                      min: 0,
                      step: 'any',
                      style: { textAlign: 'right' }
                    }}
                    error={!!lineErrors[line.id]}
                    sx={{ width: 100 }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'medium', minWidth: 100 }}>
                  <Typography variant="body2" color="text.primary">
                    {line.total.toFixed(2).replace('.', ',')} €
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  {lines.length > 1 && (
                    <Tooltip title="Position entfernen">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => onRemoveLine(line.id)}
                        sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
        onClick={onAddLine}
        disabled={lines.length >= maxLines}
        sx={{ mb: 2 }}
      >
        Neue Position hinzufügen
      </Button>

      {lines.length >= maxLines && (
        <Typography variant="caption" color="warning.main">
          Maximale Anzahl von {maxLines} Positionen erreicht
        </Typography>
      )}

      {/* Summary info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {lines.length} Position{lines.length !== 1 ? 'en' : ''} insgesamt
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ändern Sie die Werte in den Tabellenzellen, um automatisch neu zu berechnen
        </Typography>
      </Box>
    </Box>
  )
})

ServiceLinesTable.displayName = 'ServiceLinesTable'

export default ServiceLinesTable
