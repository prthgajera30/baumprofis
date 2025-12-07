import React, { useState, useEffect } from 'react'

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
  const [logoError, setLogoError] = useState(false)

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

  // Check if logo exists
  useEffect(() => {
    const img = new Image()
    img.onload = () => setLogoError(false)
    img.onerror = () => setLogoError(true)
    img.src = '/logos/baumprofis logo.png'
  }, [])

  return (
    <div
      id="invoice-pdf-template"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
        color: '#333',
        width: '210mm',
        minHeight: '297mm',
        margin: '0',
        padding: '15mm',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        position: 'relative',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact'
      }}

    >
      {/* Company Header Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          border: '2px solid #666',
          padding: '20px 15px',
          marginBottom: '10px',
          backgroundColor: '#fafafa'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%'
          }}>
            {/* Left side: Customer data (visible through envelope window) */}
            <div style={{
              flex: 1,
              paddingRight: '20px',
              borderRight: '1px solid #ddd',
              minHeight: '80px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#333'
              }}>
                {invoice.customerName || 'Kundenname'}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#666',
                marginBottom: '4px'
              }}>
                Gartengestaltung und Baumdienst
              </div>
              <div style={{
                fontSize: '11px',
                lineHeight: '1.4'
              }}>
                {invoice.customerStreet ? `${invoice.customerStreet}, ${invoice.customerZipCode} ${invoice.customerCity}` : 'Adresse'}
              </div>
            </div>

            {/* Right side: Company Logo and Contact Info */}
            <div style={{
              flex: '0 0 auto',
              textAlign: 'right',
              maxWidth: '200px'
            }}>
              {/* Logo */}
              <div style={{ marginBottom: '10px' }}>
                {!logoError ? (
                  <img
                    src="/logos/baumprofis logo.png"
                    alt="Baumprofis Logo"
                    style={{
                      width: '100px',
                      height: '60px',
                      objectFit: 'contain',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div style={{
                    width: '100px',
                    height: '60px',
                    backgroundColor: '#e0e0e0',
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#666'
                  }}>
                    Logo
                  </div>
                )}
              </div>

              {/* Company contact info under logo */}
              <div style={{
                fontSize: '11px',
                lineHeight: '1.4',
                textAlign: 'right'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                  Baumprofis
                </div>
                <div style={{ marginBottom: '2px' }}>
                  Phidelia Ogbeide
                </div>
                <div style={{ marginBottom: '2px' }}>
                  Mühlstraße 22
                </div>
                <div style={{ marginBottom: '2px' }}>
                  65388 Schlangenbad
                </div>
                <div>
                  Mobil: +49 175 6048985
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Header - Right Aligned */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
      }}>
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0 0 5px 0',
            color: '#333'
          }}>
            Rechnung Nr: {invoice.invoiceNumber}
          </h2>
        </div>
        <div style={{
          textAlign: 'right',
          fontSize: '12px',
          lineHeight: '1.4'
        }}>
          <div style={{ marginBottom: '2px' }}>
            <strong>Objekt:</strong> {invoice.object || 'Baumarbeiten'}
          </div>
          <div>
            Schlangenbad, den {formatGermanDate(invoice.date)}
          </div>
        </div>
      </div>

      {/* Customer Address Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ lineHeight: '1.5' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
            {invoice.customerName || 'Kundenname'}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            Gartengestaltung und Baumdienst
          </div>
          <div style={{ fontSize: '11px' }}>
            {invoice.customerStreet ? `${invoice.customerStreet}, ${invoice.customerZipCode} ${invoice.customerCity}` : 'Adresse'}
          </div>
        </div>
      </div>

      {/* Salutation */}
      <div style={{ marginBottom: '20px', lineHeight: '1.4' }}>
        Sehr geehrte Damen und Herren,<br />
        nach Abschluss der gewünschten Arbeiten stelle ich Ihnen diese in Rechnung.
      </div>

      {/* Invoice Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '10px',
        fontSize: '11px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{
              border: '1px solid #999',
              padding: '8px 6px',
              textAlign: 'left',
              fontWeight: 'bold',
              width: '5%',
              backgroundColor: '#e8e8e8'
            }}>Pos</th>
            <th style={{
              border: '1px solid #999',
              padding: '8px 6px',
              textAlign: 'left',
              fontWeight: 'bold',
              width: '35%',
              backgroundColor: '#e8e8e8'
            }}>Beschreibung</th>
            <th style={{
              border: '1px solid #999',
              padding: '8px 6px',
              textAlign: 'left',
              fontWeight: 'bold',
              width: '10%',
              backgroundColor: '#e8e8e8'
            }}>EinzelPreis</th>
            <th style={{
              border: '1px solid #999',
              padding: '8px 6px',
              textAlign: 'left',
              fontWeight: 'bold',
              width: '10%',
              backgroundColor: '#e8e8e8'
            }}>Anzahl</th>
            <th style={{
              border: '1px solid #999',
              padding: '8px 6px',
              textAlign: 'center',
              fontWeight: 'bold',
              width: '10%',
              backgroundColor: '#e8e8e8'
            }}>Einheit</th>
            <th style={{
              border: '1px solid #999',
              padding: '8px 6px',
              textAlign: 'right',
              fontWeight: 'bold',
              width: '15%',
              backgroundColor: '#e8e8e8'
            }}>Gesamtpreis</th>

          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line, index) => (
            <tr key={line.id}>
              <td style={{
                border: '1px solid #999',
                padding: '8px 6px',
                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
              }}>
                {index + 1}
              </td>
              <td style={{
                border: '1px solid #999',
                padding: '8px 6px',
                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
              }}>
                {line.description || `Position ${index + 1}`}
              </td>
              <td style={{
                border: '1px solid #999',
                padding: '8px 6px',
                textAlign: 'right',
                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
              }}>
                {formatCurrency(line.unitPrice)}
              </td>
              <td style={{
                border: '1px solid #999',
                padding: '8px 6px',
                textAlign: 'center',
                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
              }}>
                {line.quantity}
              </td>
              <td style={{
                border: '1px solid #999',
                padding: '8px 6px',
                textAlign: 'center',
                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
              }}>
                {line.unit}
              </td>
              <td style={{
                border: '1px solid #999',
                padding: '8px 6px',
                textAlign: 'right',
                fontWeight: 'bold',
                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
              }}>
                {formatCurrency(line.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '10px',
        marginBottom: '20px'
      }}>
        <div style={{
          minWidth: '200px',
          backgroundColor: '#f9f9f9',
          padding: '15px',
          border: '1px solid #999'
        }}>
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ paddingBottom: '5px', border: 'none' }}>Summe:</td>
                <td style={{ paddingBottom: '5px', textAlign: 'right', fontWeight: 'bold', border: 'none' }}>
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '5px', border: 'none' }}>zzgl. 19% MwSt.:</td>
                <td style={{ paddingBottom: '5px', textAlign: 'right', fontWeight: 'bold', border: 'none' }}>
                  {formatCurrency(invoice.vatAmount)}
                </td>
              </tr>
              <tr style={{ borderTop: '2px solid #666', backgroundColor: 'white' }}>
                <td style={{ paddingTop: '5px', fontWeight: 'bold', fontSize: '14px', border: 'none' }}>
                  Rechnungsbetrag:
                </td>
                <td style={{
                  paddingTop: '5px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none'
                }}>
                  {formatCurrency(invoice.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Instructions */}
      <div style={{
        fontSize: '11px',
        lineHeight: '1.5',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '2px'
      }}>
        Bitte überweisen Sie den Rechnungsbetrag über {formatCurrency(invoice.totalAmount)} binnen 10 Tagen auf folgendes Konto:<br />
        <br />
        Name: Phidelia Ogbeide<br />
        Bank: Rheingauer Volksbank eG.<br />
        IBAN: DE31 5109 1500 0000 1543 93<br />
        BIC: GENODE51RGG
      </div>

      {/* Footer Signature */}
      <div style={{
        position: 'absolute',
        bottom: '15mm',
        left: '15mm',
        right: '15mm',
        textAlign: 'right',
        fontSize: '11px',
        lineHeight: '1.5',
        paddingTop: '20px',
        borderTop: '1px solid #ddd'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#333'
        }}>
          Mit freundlichen Grüßen
        </div>
        <div style={{ marginBottom: '10px' }}>
          Phidelia Ogbeide
        </div>
        <div>
          Mühlstraße 22<br />
          65388 Schlangenbad<br />
          IdNr: 75961284403<br />
          Steuernummer: 004 853 60532
        </div>
      </div>
    </div>
  )
}

export default InvoicePDFTemplate
