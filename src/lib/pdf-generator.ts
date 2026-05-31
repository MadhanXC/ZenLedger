
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { DocumentPDF } from '@/components/pdf/DocumentPDF';

/**
 * Generates and downloads a high-fidelity vector PDF using @react-pdf/renderer.
 * This ensures selectable text, sharp vector graphics, and standard A4 sizing.
 */
export async function generatePDF(type: 'invoice' | 'quote', data: any, lineItems: any[], profile: any, client: any) {
  try {
    // Generate the PDF blob using our specialized DocumentPDF component
    const blob = await pdf(
      React.createElement(DocumentPDF, {
        type,
        data,
        items: lineItems,
        profile,
        client
      })
    ).toBlob();

    const docNumber = type === 'invoice' ? data.invoiceNumber : data.quoteNumber;
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_${docNumber}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
