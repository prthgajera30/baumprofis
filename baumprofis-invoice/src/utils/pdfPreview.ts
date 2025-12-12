import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Sample invoice data for development preview
export const SAMPLE_INVOICE_DATA = {
  companyName: "Baumprofis",
  companyTaglineLines: ["Baumpflege . Baumsanierung . Baumsicherung", "Baumkontrolle . Gartenpflege", "Baumfällarbeiten (auch Problem- und Risikofällung)"],
  senderName: "Max Mustermann",
  senderStreet: "Baumstraße 123",
  senderZipCity: "12345 Musterstadt",
  senderMobile: "+49 123 456789",
  recipientName: "Kundin Musterfrau",
  recipientLine2: "Muster GmbH & Co. KG",
  recipientStreet: "Kundenweg 456",
  recipientZipCity: "54321 Kundendorf",
  invoiceNumber: "BP-2025-001",
  objectDescription: "Baumpflege und -schnitt am Grundstück Musterstraße 789",
  place: "Musterstadt",
  invoiceDate: "08.12.2025",
  salutation: "Sehr geehrte Frau Musterfrau,",
  introText: "anbei erhalten Sie unsere Rechnung für die durchgeführten Baumpflegearbeiten. Die Arbeiten wurden fachgerecht und nach den neuesten Standards ausgeführt.",
  items: [
    {
      position: 1,
      description: "Fällung eines kranken Baumes",
      unitPrice: 150.00,
      quantity: 1,
      unitLabel: "Stück",
      total: 150.00
    },
    {
      position: 2,
      description: "Kronenschnitt und Auslichtung",
      unitPrice: 75.00,
      quantity: 3,
      unitLabel: "Stunden",
      total: 225.00
    },
    {
      position: 3,
      description: "Entfernung des Schnittguts",
      unitPrice: 50.00,
      quantity: 2,
      unitLabel: "Stunden",
      total: 100.00
    },
    {
      position: 4,
      description: "Entfernung des Schnittguts",
      unitPrice: 50.00,
      quantity: 2,
      unitLabel: "Stunden",
      total: 100.00
    }
  ],
  netTotal: 475.00,
  vatRate: 0.19,
  vatAmount: 90.25,
  grossTotal: 565.25,
  paymentText: "Bitte überweisen Sie den Rechnungsendbetrag über 565,25 € binnen 10 Tagen auf folgendes Konto:",
  bankName: "Musterbank",
  iban: "DE89 3704 0044 0532 0130 00",
  bic: "COBADEFFXXX",
  accountHolder: "Baumprofis GmbH",
  taxId: "DE123456789",
  taxNumber: "123/456/78901"
};

/**
 * Generate a PDF preview in a new browser tab
 * Uses sample data for instant preview without form submission
 */
export async function previewInvoicePdf() {
  try {
    // Create temporary HTML element with the invoice template
    const invoiceElement = document.createElement('div');
    invoiceElement.innerHTML = generateInvoiceHTML(SAMPLE_INVOICE_DATA);
    invoiceElement.style.position = 'absolute';
    invoiceElement.style.left = '-9999px';
    invoiceElement.style.width = '210mm';
    invoiceElement.style.backgroundColor = 'white';
    invoiceElement.style.fontFamily = 'Arial, sans-serif';
    invoiceElement.style.fontSize = '12px';
    invoiceElement.style.padding = '20mm';
    invoiceElement.style.paddingBottom = '40mm'; // Extra space for footer

    document.body.appendChild(invoiceElement);

    // Generate canvas from HTML
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width at 96 DPI
      height: 1123 // A4 height at 96 DPI
    });

    // Remove temporary element
    document.body.removeChild(invoiceElement);

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297); // A4 dimensions

    // Create blob and open in new tab
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open PDF in new tab
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`
        <html>
          <head>
            <title>PDF Preview - ${SAMPLE_INVOICE_DATA.invoiceNumber}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
                position: relative;
              }
              .preview-container {
                max-width: 90%;
                margin: 0 auto;
                background: white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: visible;
                position: relative;
              }
              .pdf-frame {
                width: 100%;
                height: 90vh;
                border: none;
                position: relative;
                z-index: 1;
              }
              .ruler-container {
                position: absolute;
                top: 80px;
                left: 5%;
                width: 90%;
                height: 90vh;
                z-index: 100;
                pointer-events: none;
                overflow: visible;
              }
              .horizontal-ruler {
                position: absolute;
                top: 0;
                left: 48px;
                right: 0;
                height: 40px;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #ccc;
                border-bottom: none;
                border-left: none;
                backdrop-filter: blur(1px);
                z-index: 300;
              }
              .horizontal-ruler .marks {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 20px;
              }
              .horizontal-ruler .marks div {
                position: absolute;
                bottom: 0;
                width: 1px;
                height: 10px;
                background: #666;
              }
              .horizontal-ruler .marks .major-mark {
                height: 20px;
              }
              .horizontal-ruler .labels {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 20px;
              }
              .horizontal-ruler .labels div {
                position: absolute;
                bottom: 0;
                font-size: 10px;
                color: #666;
                transform: translateX(-50%);
              }
              .vertical-ruler {
                position: absolute;
                top: 40px;
                left: 0;
                width: 48px;
                height: calc(100% - 40px);
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #ccc;
                border-right: none;
                border-top: none;
                backdrop-filter: blur(1px);
                z-index: 300;
              }
              .vertical-ruler .marks {
                position: absolute;
                top: 0;
                right: 0;
                width: 20px;
                bottom: 0;
              }
              .vertical-ruler .marks div {
                position: absolute;
                right: 0;
                width: 10px;
                height: 1px;
                background: #666;
              }
              .vertical-ruler .marks .major-mark {
                width: 20px;
              }
              .vertical-ruler .labels {
                position: absolute;
                top: 0;
                left: 0;
                width: 28px;
                bottom: 0;
              }
              .vertical-ruler .labels div {
                position: absolute;
                right: 2px;
                width: 26px;
                font-size: 10px;
                color: #666;
                text-align: center;
                transform: translateY(-50%);
              }
              .preview-header {
                background: #2196F3;
                color: white;
                padding: 15px 20px;
                text-align: center;
                position: relative;
                z-index: 2;
              }
              .controls {
                background: #f8f9fa;
                padding: 15px 20px;
                border-top: 1px solid #dee2e6;
                text-align: center;
                position: relative;
                z-index: 2;
              }
              .btn {
                background: #2196F3;
                color: white;
                border: none;
                padding: 8px 16px;
                margin: 0 5px;
                border-radius: 4px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
              }
              .btn:hover {
                background: #1976D2;
              }
            </style>
          </head>
          <body>
            <div class="preview-container">
              <div class="preview-header">
                <h2>PDF Preview - Baumprofis Invoice</h2>
                <p>Sample Invoice #${SAMPLE_INVOICE_DATA.invoiceNumber}</p>
              </div>
              <div class="ruler-container">
                <!-- Horizontal Ruler -->
                <div class="horizontal-ruler">
                  <div class="marks"></div>
                  <div class="labels"></div>
                </div>
                <!-- Vertical Ruler -->
                <div class="vertical-ruler">
                  <div class="marks"></div>
                  <div class="labels"></div>
                </div>
              </div>
              <iframe src="${pdfUrl}" class="pdf-frame"></iframe>
              <div class="controls">
                <a href="${pdfUrl}" download="preview-${SAMPLE_INVOICE_DATA.invoiceNumber}.pdf" class="btn">
                  Download PDF
                </a>
                <button onclick="window.close()" class="btn">
                  Close Preview
                </button>
              </div>
            </div>
            <script>
              // Initialize rulers when page loads and on resize. Align rulers to the displayed PDF iframe.
              window.addEventListener('load', initRulers);

              function initRulers() {
                const iframe = document.querySelector('.pdf-frame');
                createAlignedRulers();
                window.addEventListener('resize', createAlignedRulers);
                if (iframe) {
                  // Ensure rulers align after iframe content (PDF) loads
                  iframe.addEventListener('load', createAlignedRulers);
                }
              }

              function createAlignedRulers() {
                const iframe = document.querySelector('.pdf-frame');
                const horizontalRuler = document.querySelector('.horizontal-ruler');
                const verticalRuler = document.querySelector('.vertical-ruler');
                const rulerContainer = document.querySelector('.ruler-container');

                if (!iframe || !horizontalRuler || !verticalRuler || !rulerContainer) return;

                const marksH = horizontalRuler.querySelector('.marks');
                const labelsH = horizontalRuler.querySelector('.labels');
                const marksV = verticalRuler.querySelector('.marks');
                const labelsV = verticalRuler.querySelector('.labels');

                // Calculate iframe size and position relative to the ruler container
                const containerRect = rulerContainer.getBoundingClientRect();
                const iframeRect = iframe.getBoundingClientRect();
                const pageLeft = iframeRect.left - containerRect.left;
                const pageTop = iframeRect.top - containerRect.top;
                const pageWidth = Math.max(0, iframeRect.width);
                const pageHeight = Math.max(0, iframeRect.height);

                const paperWidthMM = 210; // A4 width in mm
                const paperHeightMM = 297; // A4 height in mm

                // Ensure rulers appear above the iframe
                horizontalRuler.style.zIndex = '200';
                verticalRuler.style.zIndex = '200';

                // Position and size the ruler bars to match the visible PDF page.
                // Use transforms so rulers align cleanly and won't be clipped by container edges.
                horizontalRuler.style.left = pageLeft + 'px';
                horizontalRuler.style.width = pageWidth + 'px';
                horizontalRuler.style.top = pageTop + 'px';
                horizontalRuler.style.transform = 'translateY(-100%)';

                // Position vertical ruler left of the page using its actual width (avoid transforms which may hide it)
                const vWidth = verticalRuler.getBoundingClientRect().width || parseFloat(getComputedStyle(verticalRuler).width) || 48;
                verticalRuler.style.left = (pageLeft - vWidth) + 'px';
                verticalRuler.style.top = pageTop + 'px';
                verticalRuler.style.height = pageHeight + 'px';
                verticalRuler.style.transform = '';
                verticalRuler.style.display = 'block';
                verticalRuler.style.visibility = 'visible';

                // Clear previous marks/labels
                marksH.innerHTML = '';
                labelsH.innerHTML = '';
                marksV.innerHTML = '';
                labelsV.innerHTML = '';

                const pxPerMM_X = pageWidth / paperWidthMM;
                const pxPerMM_Y = pageHeight / paperHeightMM;

                // Horizontal marks: every 10mm, labels every 50mm
                for (let mm = 0; mm <= paperWidthMM; mm += 10) {
                  const pixelPos = Math.round(mm * pxPerMM_X);
                  const mark = document.createElement('div');
                  mark.className = mm % 50 === 0 ? 'major-mark' : '';
                  mark.style.left = pixelPos + 'px';
                  marksH.appendChild(mark);

                  if (mm % 50 === 0) {
                    const label = document.createElement('div');
                    label.textContent = mm + 'mm';
                    label.style.left = pixelPos + 'px';
                    labelsH.appendChild(label);
                  }
                }

                // Vertical marks: every 10mm, labels every 50mm
                for (let mm = 0; mm <= paperHeightMM; mm += 10) {
                  const pixelPos = Math.round(mm * pxPerMM_Y);
                  const mark = document.createElement('div');
                  mark.className = mm % 50 === 0 ? 'major-mark' : '';
                  mark.style.top = pixelPos + 'px';
                  marksV.appendChild(mark);

                  if (mm % 50 === 0) {
                    const label = document.createElement('div');
                    label.textContent = mm + 'mm';
                    label.style.top = pixelPos + 'px';
                    labelsV.appendChild(label);
                  }
                }
              }
            </script>
          </body>
        </html>
      `);
      newTab.document.close();
    }

    // Clean up blob URL after some time
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000); // Revoke after 1 minute

  } catch (error) {
    console.error('PDF preview error:', error);
    alert('Fehler beim Generieren der PDF-Vorschau. Versuchen Sie es erneut.');
  }
}

// Copy the HTML generation logic from downloadInvoicePdf.tsx
function generateInvoiceHTML(props: typeof SAMPLE_INVOICE_DATA): string {
  const {
    companyName,
    companyTaglineLines,
    senderName,
    senderStreet,
    senderZipCity,
    senderMobile,
    recipientName,
    recipientLine2,
    recipientStreet,
    recipientZipCity,
    invoiceNumber,
    objectDescription,
    place,
    invoiceDate,
    salutation,
    introText,
    items,
    netTotal,
    vatRate,
    vatAmount,
    grossTotal,
    paymentText,
    bankName,
    iban,
    bic,
    accountHolder,
    taxId,
    taxNumber,
  } = props;

  const effectivePaymentText = paymentText ||
    `Bitte überweisen Sie den Rechnungsendbetrag über ${formatEuro(grossTotal)} binnen 10 Tagen auf folgendes Konto:`;

  return `
    <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333; width: 100%; min-height: 100vh; position: relative; padding-bottom: 40mm;">
      <!-- Header -->
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">${companyName}</div>
            ${companyTaglineLines.map(line => `<div style="font-size: 10px; color: #666;">${line}</div>`).join('')}
          </td>
          <td style="width: 45%; text-align: right; vertical-align: top;">
            <img src="/logos/baumprofis logo.png" style="width: 100px; height: 100px; object-fit: contain; margin-bottom: 10px;" alt="Company Logo">
          </td>
        </tr>
        <tr>
          <td style="margin-bottom: 20px;">
            <div style="font-size:9px">${senderName} ${senderStreet}</div>
            <div style="font-size:9px">${senderZipCity}</div>

            <div style="margin-top: 20px;">${recipientName}</div>
            ${recipientLine2 ? `<div>${recipientLine2}</div>` : ''}
            <div>${recipientStreet}</div>
            <div>${recipientZipCity}</div>
          </td>
          <td style="width: 45%; text-align: right; vertical-align: top;">
            <div>${companyName}</div>
            <div>${senderName}</div>
            <div>${senderStreet}</div>
            <div>${senderZipCity}</div>
            <div>Mobil: ${senderMobile}</div>
          </td>
        </tr>
      </table>

      <!-- Place and Date -->
      <div style="text-align: right; font-size: 12px; margin-bottom: 12px;">
        ${place}, den ${invoiceDate}
      </div>

      <!-- Invoice Meta -->
      <div style="margin-bottom: 12px;">
        <div style="margin-bottom: 4px;"><strong>Rechnung Nr :</strong> ${invoiceNumber}</div>
        <div><strong>Objekt :</strong> ${objectDescription}</div>
      </div>

      <!-- Intro -->
      <div style="margin-bottom: 12px; margin-top: 12px;">
        <div>${salutation}</div>
        <div>${introText}</div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #333; margin-top: 20px; margin-bottom: 15px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #333; border-right: 1px solid #ddd; font-weight: bold; font-size: 11px; width: 8%;">Pos</th>
            <th style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #333; border-right: 1px solid #ddd; font-weight: bold; font-size: 11px;">Beschreibung</th>
            <th style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #333; border-right: 1px solid #ddd; font-weight: bold; font-size: 11px;">Einzelpreis</th>
            <th style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #333; border-right: 1px solid #ddd; font-weight: bold; font-size: 11px;">Anzahl</th>
            <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #333; border-right: 1px solid #ddd; font-weight: bold; font-size: 11px;">Einheit</th>
            <th style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #333; font-weight: bold; font-size: 11px;">Gesamtpreis</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td style="padding: 6px 12px; text-align: center; border-bottom: 1px solid #eee; border-right: 1px solid #ddd; font-size: 11px; font-weight: bold;">${item.position}</td>
              <td style="padding: 6px 12px; border-bottom: 1px solid #eee; border-right: 1px solid #ddd; font-size: 11px;">${item.description}</td>
              <td style="padding: 6px 12px; text-align: right; border-bottom: 1px solid #eee; border-right: 1px solid #ddd; font-size: 11px;">${formatEuro(item.unitPrice)}</td>
              <td style="padding: 6px 12px; text-align: right; border-bottom: 1px solid #eee; border-right: 1px solid #ddd; font-size: 11px;">${item.quantity}</td>
              <td style="padding: 6px 12px; text-align: center; border-bottom: 1px solid #eee; border-right: 1px solid #ddd; font-size: 11px;">${item.unitLabel}</td>
              <td style="padding: 6px 12px; text-align: right; border-bottom: 1px solid #eee; font-size: 11px;">${formatEuro(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Totals -->
      <table style="margin-left: auto; width: 40%; margin-top: 20px;">
        <tr>
          <td style="text-align: left;">Summe :</td>
          <td style="text-align: right;">${formatEuro(netTotal)}</td>
        </tr>
        <tr>
          <td style="text-align: left;">zzgl. ${vatRate * 100}% MwSt. :</td>
          <td style="text-align: right;">${formatEuro(vatAmount)}</td>
        </tr>
        <tr style="border-top: 2px solid #666;">
          <td style="text-align: left; font-weight: bold;">Rechnungsbetrag :</td>
          <td style="text-align: right; font-weight: bold;">${formatEuro(grossTotal)}</td>
        </tr>
      </table>

      <!-- Payment -->
      <div style="margin-top: 10px;">
        <div>${effectivePaymentText}</div>
      </div>

      <!-- Bank Details -->
      <div style="font-size: 11px; margin-top: 10px;">
        <div>Bank : ${bankName}</div>
        <div style="">IBAN : ${iban}</div>
        <div>BIC : ${bic}</div>
        <div style="">Name : ${accountHolder}</div>
      </div>

      <!-- Closing -->
      <div style="margin-top: 25px;">
        <div>Mit freundlichen Grüßen</div>
        <div style="margin-top: 30px; margin-bottom: 10px;">${senderName}</div>
      </div>

      <!-- Footer - Fixed at bottom with proper margins aligned to page padding -->
      <div style="position: absolute; bottom: 20mm; left: 0; right: 0; font-size: 9px; border-top: 1px solid #ddd; padding-top: 10px; display: flex; justify-content: space-between;">
        <div>${senderName}<br>${senderStreet}<br>${senderZipCity}</div>
        <div style="text-align: right;">IdNr : ${taxId}<br>Steuernummer : ${taxNumber}</div>
      </div>
    </div>
  `;
}

function formatEuro(value: number): string {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}
