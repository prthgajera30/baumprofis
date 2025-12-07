import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.4,
    color: '#333',
    padding: 15 * 2.83465, // 15mm in points
    backgroundColor: 'white',
  },
  headerBox: {
    border: '2 solid #666',
    padding: 20,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  headerFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
    paddingRight: 20,
    borderRight: '1 solid #ddd',
    minHeight: 80,
  },
  customerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 11,
    lineHeight: 1.4,
  },
  rightSection: {
    width: 200,
    textAlign: 'right',
  },
  logo: {
    width: 100,
    height: 60,
    marginBottom: 10,
  },
  logoPlaceholder: {
    width: 100,
    height: 60,
    backgroundColor: '#e0e0e0',
    border: '1 solid #ccc',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 10,
    color: '#666',
  },
  companyInfo: {
    fontSize: 11,
    lineHeight: 1.4,
    textAlign: 'right',
  },
  companyName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  invoiceDetails: {
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 1.4,
  },
  customerAddressSection: {
    marginBottom: 20,
    lineHeight: 1.5,
  },
  salutation: {
    marginBottom: 20,
    lineHeight: 1.4,
  },
  table: {
    width: '100%',
    marginBottom: 10,
    fontSize: 11,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    border: '1 solid #999',
    padding: 8,
  },
  tableCellPos: {
    width: '5%',
    textAlign: 'left',
  },
  tableCellDesc: {
    width: '35%',
    textAlign: 'left',
  },
  tableCellUnitPrice: {
    width: '10%',
    textAlign: 'right',
  },
  tableCellQuantity: {
    width: '10%',
    textAlign: 'center',
  },
  tableCellUnit: {
    width: '10%',
    textAlign: 'center',
  },
  tableCellTotal: {
    width: '15%',
    textAlign: 'right',
  },
  tableBodyRowEven: {
    backgroundColor: 'white',
  },
  tableBodyRowOdd: {
    backgroundColor: '#fafafa',
  },
  totalsSection: {
    alignSelf: 'flex-end',
    minWidth: 200,
    backgroundColor: '#f9f9f9',
    padding: 15,
    border: '1 solid #999',
    marginTop: 10,
    marginBottom: 20,
  },
  totalsTable: {
    width: '100%',
    fontSize: 11,
  },
  totalsRow: {
    flexDirection: 'row',
  },
  totalsCell: {
    paddingBottom: 5,
  },
  totalsCellLabel: {
    width: '70%',
  },
  totalsCellValue: {
    width: '30%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totalRow: {
    borderTop: '2 solid #666',
    backgroundColor: 'white',
    paddingTop: 5,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  paymentBox: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    border: '1 solid #ddd',
  },
  footer: {
    position: 'absolute',
    bottom: 15 * 2.83465,
    left: 15 * 2.83465,
    right: 15 * 2.83465,
    textAlign: 'right',
    fontSize: 11,
    lineHeight: 1.5,
    paddingTop: 20,
    borderTop: '1 solid #ddd',
  },
  signature: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
})

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

interface InvoicePDFTemplateProps {
  invoice: InvoiceData
}

const InvoicePDFTemplate: React.FC<InvoicePDFTemplateProps> = ({ invoice }) => {
  // Format German date
  const formatGermanDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Format German currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={styles.headerBox}>
            <View style={styles.headerFlex}>
              {/* Left side: Customer data (visible through envelope window) */}
              <View style={styles.leftSection}>
                <Text style={styles.customerName}>
                  {invoice.customerName || 'Kundenname'}
                </Text>
                <Text style={styles.subtitle}>
                  Gartengestaltung und Baumdienst
                </Text>
                <Text style={styles.address}>
                  {invoice.customerStreet ? `${invoice.customerStreet}, ${invoice.customerZipCode} ${invoice.customerCity}` : 'Adresse'}
                </Text>
              </View>

              {/* Right side: Company Logo and Contact Info */}
              <View style={styles.rightSection}>
                <Image
                  src="/logos/baumprofis logo.png"
                  style={styles.logo}
                />
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>
                    Baumprofis
                  </Text>
                  <Text style={{ marginBottom: 2 }}>
                    Phidelia Ogbeide
                  </Text>
                  <Text style={{ marginBottom: 2 }}>
                    Mühlstraße 22
                  </Text>
                  <Text style={{ marginBottom: 2 }}>
                    65388 Schlangenbad
                  </Text>
                  <Text>
                    Mobil: +49 175 6048985
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceTitle}>
            Rechnung Nr: {invoice.invoiceNumber}
          </Text>
          <View style={styles.invoiceDetails}>
            <Text style={{ marginBottom: 2 }}>
              <Text style={{ fontWeight: 'bold' }}>Objekt:</Text> {invoice.object || 'Baumarbeiten'}
            </Text>
            <Text>
              Schlangenbad, den {formatGermanDate(invoice.date)}
            </Text>
          </View>
        </View>

        {/* Customer Address Section */}
        <View style={styles.customerAddressSection}>
          <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>
            {invoice.customerName || 'Kundenname'}
          </Text>
          <Text style={{ fontSize: 11, color: '#666' }}>
            Gartengestaltung und Baumdienst
          </Text>
          <Text style={{ fontSize: 11 }}>
            {invoice.customerStreet ? `${invoice.customerStreet}, ${invoice.customerZipCode} ${invoice.customerCity}` : 'Adresse'}
          </Text>
        </View>

        {/* Salutation */}
        <View style={styles.salutation}>
          <Text>Sehr geehrte Damen und Herren,</Text>
          <Text>nach Abschluss der gewünschten Arbeiten stelle ich Ihnen diese in Rechnung.</Text>
        </View>

        {/* Invoice Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellPos]}>Pos</Text>
            <Text style={[styles.tableCell, styles.tableCellDesc]}>Beschreibung</Text>
            <Text style={[styles.tableCell, styles.tableCellUnitPrice]}>EinzelPreis</Text>
            <Text style={[styles.tableCell, styles.tableCellQuantity]}>Anzahl</Text>
            <Text style={[styles.tableCell, styles.tableCellUnit]}>Einheit</Text>
            <Text style={[styles.tableCell, styles.tableCellTotal]}>Gesamtpreis</Text>
          </View>
          {invoice.lines.map((line, index) => (
            <View key={line.id} style={[styles.tableRow, index % 2 === 0 ? styles.tableBodyRowEven : styles.tableBodyRowOdd]}>
              <Text style={[styles.tableCell, styles.tableCellPos]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.tableCellDesc]}>{line.description || `Position ${index + 1}`}</Text>
              <Text style={[styles.tableCell, styles.tableCellUnitPrice]}>{formatCurrency(line.unitPrice)}</Text>
              <Text style={[styles.tableCell, styles.tableCellQuantity]}>{line.quantity}</Text>
              <Text style={[styles.tableCell, styles.tableCellUnit]}>{line.unit}</Text>
              <Text style={[styles.tableCell, styles.tableCellTotal]}>{formatCurrency(line.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text style={[styles.totalsCell, styles.totalsCellLabel]}>Summe:</Text>
              <Text style={[styles.totalsCell, styles.totalsCellValue]}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={[styles.totalsCell, styles.totalsCellLabel]}>zzgl. 19% MwSt.:</Text>
              <Text style={[styles.totalsCell, styles.totalsCellValue]}>{formatCurrency(invoice.vatAmount)}</Text>
            </View>
            <View style={[styles.totalsRow, styles.totalRow]}>
              <Text style={[styles.totalsCell, styles.totalsCellLabel, styles.totalLabel]}>Rechnungsbetrag:</Text>
              <Text style={[styles.totalsCell, styles.totalsCellValue, styles.totalValue]}>{formatCurrency(invoice.totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.paymentBox}>
          <Text>Bitte überweisen Sie den Rechnungsbetrag über {formatCurrency(invoice.totalAmount)} binnen 10 Tagen auf folgendes Konto:</Text>
          <Text>{'\n'}</Text>
          <Text>Name: Phidelia Ogbeide</Text>
          <Text>Bank: Rheingauer Volksbank eG.</Text>
          <Text>IBAN: DE31 5109 1500 0000 1543 93</Text>
          <Text>BIC: GENODE51RGG</Text>
        </View>

        {/* Footer Signature */}
        <View style={styles.footer} fixed>
          <Text style={styles.signature}>
            Mit freundlichen Grüßen
          </Text>
          <Text style={{ marginBottom: 10 }}>
            Phidelia Ogbeide
          </Text>
          <Text>
            Mühlstraße 22{'\n'}
            65388 Schlangenbad{'\n'}
            IdNr: 75961284403{'\n'}
            Steuernummer: 004 853 60532
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default InvoicePDFTemplate
