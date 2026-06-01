'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Inter font for clean typography and specialized formatting
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'flex-start',
  },

  headerLeft: {
    flex: 1,
  },

  headerRight: {
    flex: 1,
    textAlign: 'right',
    alignItems: 'flex-end',
  },

  logoContainer: {
    marginBottom: 8,
    overflow: 'hidden',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoPlaceholder: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: '#000000',
    fontWeight: 'bold',
  },

  titleBlock: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginTop: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 1,
  },

  docId: {
    fontSize: 9,
    color: '#000000',
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'left',
  },

  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 1,
  },

  companyAddress: {
    fontSize: 7.5,
    color: '#000000',
    lineHeight: 1.3,
    maxWidth: 220,
  },

  gstin: {
    fontSize: 7.5,
    color: '#000000',
    marginTop: 3,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTop: '1.5px solid #000000',
    marginTop: 5,
    marginBottom: 8,
  },

  billingColumn: {
    flex: 1,
  },

  datesColumn: {
    flex: 1,
    textAlign: 'right',
  },

  sectionLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#000000',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  clientName: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 3,
  },

  clientAddress: {
    fontSize: 8,
    color: '#000000',
    lineHeight: 1.4,
    maxWidth: 240,
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
  },

  dateLabel: {
    fontSize: 8,
    color: '#000000',
    marginRight: 5,
    fontWeight: 'normal',
    textTransform: 'uppercase',
  },

  dateValue: {
    fontSize: 8,
    color: '#000000',
    fontWeight: 'bold',
  },

  tableContainer: {
    marginTop: 5,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: '#000000',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
  },

  tableRow: {
    flexDirection: 'row',
  },

  cell: {
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#000000',
    padding: 6,
    justifyContent: 'center',
  },

  headerText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
  },

  cellText: {
    fontSize: 8.5,
    color: '#000000',
    lineHeight: 1.3,
  },

  colSL: { width: '5%', textAlign: 'center' },
  colDesc: { width: '40%' },
  colUnit: { width: '10%', textAlign: 'center' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },

  summaryLabelCell: {
    width: '80%',
    textAlign: 'right',
    fontWeight: 'bold',
    paddingRight: 10,
    textTransform: 'uppercase',
    fontSize: 8,
  },

  summaryValueCell: {
    width: '20%',
    textAlign: 'right',
    fontWeight: 'bold',
  },

  filler: {
    flexGrow: 1,
    flexDirection: 'row',
  },

  bottomArea: {
    marginTop: 'auto',
    paddingTop: 10,
  },

  // UPDATED
  bottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
  },

  bankContainer: {
    flex: 1,
    marginRight: 15,
  },

  bankBox: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 2,
    border: '1px solid #000000',
  },

  bankTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  bankText: {
    fontSize: 7.5,
    color: '#000000',
    marginBottom: 1.5,
    lineHeight: 1.1,
  },

  // UPDATED
  signatoryContainer: {
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingTop: 4,
    display: 'flex',
  },

  signatureImage: {
    maxHeight: 40,
    maxWidth: 120,
    marginBottom: 4,
    objectFit: 'contain',
  },

  signatoryName: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
    textAlign: 'center',
  },

  signatoryLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    color: '#000000',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontWeight: 'normal',
  },

  notesArea: {
    marginBottom: 8,
  },

  // UPDATED
  termsArea: {
    marginTop: 8,
    paddingTop: 6,
  },
  footer: {
    marginTop: 10,
    textAlign: 'center',
    paddingTop: 8,
    borderTop: '1px solid #000000',
  },

  footerText: {
    fontSize: 8,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontWeight: 'bold',
  },
});

interface PDFProps {
  type: 'quote' | 'invoice';
  data: any;
  items: any[];
  profile: any;
  client: any;
}

export const DocumentPDF = ({ type, data, items, profile, client }: PDFProps) => {
  console.log("PDF PROFILE DATA", profile);
  const isInvoice = type === 'invoice';
  const docNumber = isInvoice ? data.invoiceNumber : data.quoteNumber;

  const clientName =
    data.clientId === 'one-time'
      ? data.oneTimeClientName
      : client?.name;

  const clientAddress =
    data.clientId === 'one-time'
      ? data.oneTimeClientAddress
      : client?.address;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isValidImage = (url?: string) => {
    if (!url) return false;
    const trimmed = url.trim();

    return (
      (trimmed.startsWith('http') ||
        trimmed.startsWith('data:image/')) &&
      !trimmed.includes('<svg')
    );
  };

  const hasValidLogo = isValidImage(profile?.logoUrl);
  const hasValidSign = isValidImage(
    profile?.authorizedSignatoryImageUrl
  );

  const logoSize = (profile?.logoSize || 128) * 0.45;

  const gstPercentage = data.isGstEnabled
    ? data.totalAmount > 0
      ? Math.round(
          (data.totalGSTAmount / data.totalAmount) * 100
        )
      : 18
    : 0;



  return (
    <Document title={`${type.toUpperCase()} - ${docNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoContainer, { width: logoSize, height: logoSize, alignSelf: 'flex-start' }]}>
              {hasValidLogo ? (
                <Image src={profile.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <View style={[styles.logoPlaceholder, { width: logoSize, height: logoSize }]}>
                  <Text style={[styles.logoText, { fontSize: logoSize * 0.3 }]}>
                    {profile?.name?.split(/\s+/).filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'ZL'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{type.toUpperCase()}</Text>
              <Text style={styles.docId}>{docNumber}</Text>
            </View>
          </View>
          <View
  style={{
    width: 260,
    alignItems: 'flex-end',
  }}
>
  <Text
    style={{
      fontSize: 11,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 4,
      textAlign: 'right',
    }}
  >
    {profile?.name || 'YOUR BUSINESS'}
  </Text>

  <Text
    style={{
      fontSize: 8,
      color: '#000000',
      lineHeight: 1.4,
      textAlign: 'right',
    }}
  >
    {profile?.address || 'Business Address'}
  </Text>
{profile?.gstNumber && (
    <Text
      style={{
        fontSize: 8,
        color: '#000000',
        marginTop: 4,
        fontWeight: 'bold',
        textAlign: 'right',
      }}
    >
      GSTIN: {profile.gstNumber}
    </Text>
  )}
  <Text
    style={{
      fontSize: 9,
      color: '#000000',
      marginTop: 4,
      
      textAlign: 'right',
    }}
  >
    Phone: {profile?.contactPhone}
  </Text>

  <Text
    style={{
      fontSize: 9,
      color: '#000000',
      
      textAlign: 'right',
    }}
  >
    Email: {profile?.contactEmail}
  </Text>

  
</View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.billingColumn}>
            <Text style={styles.sectionLabel}>{isInvoice ? 'Billed To' : 'Quote For'}</Text>
            <Text style={styles.clientName}>{clientName || 'Valued Client'}</Text>
            <Text style={styles.clientAddress}>{clientAddress || 'No billing address provided'}</Text>
          </View>
          <View style={styles.datesColumn}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Issue Date:</Text>
              <Text style={styles.dateValue}>{data.issueDate ? new Date(data.issueDate).toLocaleDateString('en-IN') : '-'}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>{isInvoice ? 'Due Date:' : 'Valid Until:'}</Text>
              <Text style={styles.dateValue}>
                {isInvoice 
                  ? (data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-IN') : '-')
                  : (data.validUntilDate ? new Date(data.validUntilDate).toLocaleDateString('en-IN') : '-')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={[styles.colSL, styles.cell]}><Text style={styles.headerText}>#</Text></View>
            <View style={[styles.colDesc, styles.cell]}><Text style={styles.headerText}>Description</Text></View>
            <View style={[styles.colUnit, styles.cell]}><Text style={styles.headerText}>Unit</Text></View>
            <View style={[styles.colQty, styles.cell]}><Text style={styles.headerText}>Qty</Text></View>
            <View style={[styles.colPrice, styles.cell]}><Text style={styles.headerText}>Rate</Text></View>
            <View style={[styles.colTotal, styles.cell]}><Text style={styles.headerText}>Total</Text></View>
          </View>

          {items.map((item, index) => (
            <View key={item.id || index} style={styles.tableRow} wrap={false}>
              <View style={[styles.colSL, styles.cell]}><Text style={styles.cellText}>{index + 1}</Text></View>
              <View style={[styles.colDesc, styles.cell]}><Text style={styles.cellText}>{item.description}</Text></View>
              <View style={[styles.colUnit, styles.cell]}><Text style={[styles.cellText, { textAlign: 'center' }]}>{item.unit || '-'}</Text></View>
              <View style={[styles.colQty, styles.cell]}><Text style={[styles.cellText, { textAlign: 'center' }]}>{item.quantity}</Text></View>
              <View style={[styles.colPrice, styles.cell]}><Text style={[styles.cellText, { textAlign: 'right' }]}>{formatCurrency(item.unitPrice)}</Text></View>
              <View style={[styles.colTotal, styles.cell]}><Text style={[styles.cellText, { textAlign: 'right', fontWeight: 'bold' }]}>{formatCurrency(item.totalLineItemAmount || (item.quantity * item.unitPrice))}</Text></View>
            </View>
          ))}

          <View style={styles.filler}>
            <View style={[styles.colSL, styles.cell]} />
            <View style={[styles.colDesc, styles.cell]} />
            <View style={[styles.colUnit, styles.cell]} />
            <View style={[styles.colQty, styles.cell]} />
            <View style={[styles.colPrice, styles.cell]} />
            <View style={[styles.colTotal, styles.cell]} />
          </View>

          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.summaryLabelCell, styles.cell]}><Text style={[styles.cellText, { fontWeight: 'bold' }]}>SUBTOTAL</Text></View>
            <View style={[styles.summaryValueCell, styles.cell]}><Text style={[styles.cellText, { fontWeight: 'bold' }]}>{formatCurrency(data.totalAmount)}</Text></View>
          </View>
          
          {data.isGstEnabled !== false && (
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.summaryLabelCell, styles.cell]}><Text style={[styles.cellText, { fontWeight: 'bold' }]}>GST ({gstPercentage}%)</Text></View>
              <View style={[styles.summaryValueCell, styles.cell]}><Text style={[styles.cellText, { fontWeight: 'bold' }]}>{formatCurrency(data.totalGSTAmount || 0)}</Text></View>
            </View>
          )}

          <View style={[styles.tableRow, { backgroundColor: '#F8FAFC' }]} wrap={false}>
            <View style={[styles.summaryLabelCell, styles.cell]}><Text style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: 8 }}>TOTAL PAYABLE</Text></View>
            <View style={[styles.summaryValueCell, styles.cell]}><Text style={{ fontSize: 10, fontWeight: 'bold' }}>{formatCurrency(data.totalAmount + (data.totalGSTAmount || 0))}</Text></View>
          </View>
        </View>

        <View style={styles.bottomArea} wrap={false}>
          {data.notes && (
            <View style={styles.notesArea}>
              <Text style={styles.sectionLabel}>Notes</Text>
              <Text style={{ fontSize: 8, color: '#000000', lineHeight: 1.4 }}>{data.notes}</Text>
            </View>
          )}

<View style={styles.bottomGrid}>
  <View style={styles.bankContainer}>
    {profile?.bankAccountNumber && (
      <View style={styles.bankBox}>
        <Text style={styles.bankTitle}>Bank Details</Text>
        <Text style={styles.bankText}>
          Bank: {profile.bankName || '-'}
        </Text>
        <Text style={styles.bankText}>
          A/C: {profile.bankAccountName || profile.name}
        </Text>
        <Text style={styles.bankText}>
          No: {profile.bankAccountNumber}
        </Text>
        <Text style={styles.bankText}>
          IFSC: {profile.bankRoutingNumber || '-'}
        </Text>
      </View>
    )}
  </View>

  {/* UPDATED SIGNATORY SECTION */}
  <View
    style={{
      width: 180,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {hasValidSign && (
      <Image
        src={profile.authorizedSignatoryImageUrl}
        style={{
          width: 120,
          height: 45,
          objectFit: 'contain',
          marginBottom: 6,
          alignSelf: 'center',
        }}
      />
    )}

    <Text
      style={{
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
        marginBottom: 3,
      }}
    >
      {data.authorizedSignatory ||
        profile.authorizedSignatoryName}
    </Text>

    <Text
      style={{
        fontSize: 7,
        textAlign: 'center',
        letterSpacing: 1,
        textTransform: 'uppercase',
        width: '100%',
      }}
    >
      AUTHORIZED SIGNATORY
    </Text>
  </View>
</View>
          {profile?.defaultTerms && (
            <View style={styles.termsArea}>
              <Text style={[styles.sectionLabel, { fontSize: 6.5, marginBottom: 2 }]}>Terms & Conditions</Text>
              <Text style={{ fontSize: 6.5, color: '#64748B', lineHeight: 1.2 }}>{profile.defaultTerms}</Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for your business</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};