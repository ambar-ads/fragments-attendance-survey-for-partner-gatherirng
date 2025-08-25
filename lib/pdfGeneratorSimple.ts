import jsPDF from 'jspdf';

export interface FormData {
  id?: string;
  acpName: string;
  acpAddress: string;
  city: string;
  state: string;
  postCode: string;
  telephoneNo: string;
  faxNo: string;
  photoUrl?: string;
  idCardNo: string;
  taxId: string;
  sbnNib: string;
  pkp: string;
  contacts: Array<{
    type: string;
    name: string;
    mobilePhone: string;
    email: string;
    whatsappNo: string;
  }>;
  agreement: boolean;
  claimCreditNoteTo: 'distributor' | 'master_dealer' | '';
  distributorName: string;
  masterDealerName: string;
  createdAt?: string;
}

export const generateSimplePDF = async (formData: FormData): Promise<{blob: Blob, filename: string}> => {
  console.log('Starting simple PDF generation...');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set default font
  pdf.setFont('helvetica');
  
  let yPos = 15;
  const lineHeight = 6;
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (margin * 2);
  const centerX = pageWidth / 2;

  // Helper function to add text and move yPos
  const addText = (text: string, fontSize: number = 10, fontStyle: string = 'normal', color: string = '#000000', align: string = 'left') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    
    // Convert hex color to RGB
    if (color !== '#000000') {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      pdf.setTextColor(r, g, b);
    } else {
      pdf.setTextColor(0, 0, 0);
    }
    
    // Handle long text with line wrapping
    const lines = pdf.splitTextToSize(text, contentWidth - 10);
    
    // Check if we need a new page
    if (yPos + (lines.length * lineHeight) > pageHeight - 30) {
      pdf.addPage();
      yPos = 20;
    }
    
    if (Array.isArray(lines)) {
      lines.forEach((line: string) => {
        let xPos = margin;
        if (align === 'center') {
          xPos = centerX - (pdf.getTextWidth(line) / 2);
        } else if (align === 'right') {
          xPos = pageWidth - margin - pdf.getTextWidth(line);
        }
        pdf.text(line, xPos, yPos);
        yPos += lineHeight;
      });
    } else {
      let xPos = margin;
      if (align === 'center') {
        xPos = centerX - (pdf.getTextWidth(lines) / 2);
      } else if (align === 'right') {
        xPos = pageWidth - margin - pdf.getTextWidth(lines);
      }
      pdf.text(lines, xPos, yPos);
      yPos += lineHeight;
    }
  };

  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    // Add spacing before section
    yPos += 8;
    
    // Background for header
    pdf.setFillColor(240, 248, 255); // Light blue background
    pdf.rect(margin - 5, yPos - 4, contentWidth + 10, 12, 'F');
    
    // Header text
    addText(title, 13, 'bold', '#1e40af'); // Dark blue color
    
    // Underline
    pdf.setDrawColor(30, 64, 175); // Dark blue
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos - 1, pageWidth - margin, yPos - 1);
    
    yPos += 5;
  };

  // Helper function to add key-value pair with improved styling
  const addKeyValue = (key: string, value: string, isImportant: boolean = false) => {
    const keyColor = isImportant ? '#1e40af' : '#374151'; // Blue for important, gray for normal
    const valueColor = '#000000';
    
    // Background for important fields
    if (isImportant) {
      pdf.setFillColor(249, 250, 251); // Very light gray
      pdf.rect(margin - 2, yPos - 2, contentWidth + 4, lineHeight + 2, 'F');
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    
    // Set color for key
    const r = parseInt(keyColor.slice(1, 3), 16);
    const g = parseInt(keyColor.slice(3, 5), 16);
    const b = parseInt(keyColor.slice(5, 7), 16);
    pdf.setTextColor(r, g, b);
    
    const keyWidth = pdf.getTextWidth(key + ': ');
    pdf.text(key + ':', margin, yPos);
    
    // Set color and style for value
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    // Handle long values with wrapping
    const remainingWidth = contentWidth - keyWidth - 5;
    const valueLines = pdf.splitTextToSize(value || '-', remainingWidth);
    
    if (Array.isArray(valueLines)) {
      valueLines.forEach((line: string, index: number) => {
        const xPos = index === 0 ? margin + keyWidth : margin + 15;
        pdf.text(line, xPos, yPos + (index * lineHeight));
      });
      yPos += (valueLines.length * lineHeight) + 1;
    } else {
      pdf.text(valueLines, margin + keyWidth, yPos);
      yPos += lineHeight + 1;
    }
  };

  // Helper function to add a decorative box
  const addDecorativeBox = (content: string, bgColor: string = '#f0f9ff', textColor: string = '#1e40af') => {
    const boxHeight = 15;
    
    // Set background color
    const bgR = parseInt(bgColor.slice(1, 3), 16);
    const bgG = parseInt(bgColor.slice(3, 5), 16);
    const bgB = parseInt(bgColor.slice(5, 7), 16);
    pdf.setFillColor(bgR, bgG, bgB);
    
    // Draw box
    pdf.roundedRect(margin, yPos - 3, contentWidth, boxHeight, 2, 2, 'F');
    
    // Add border
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin, yPos - 3, contentWidth, boxHeight, 2, 2, 'S');
    
    // Add text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    
    const textR = parseInt(textColor.slice(1, 3), 16);
    const textG = parseInt(textColor.slice(3, 5), 16);
    const textB = parseInt(textColor.slice(5, 7), 16);
    pdf.setTextColor(textR, textG, textB);
    
    pdf.text(content, margin + 5, yPos + 6);
    yPos += boxHeight + 3;
  };

  // Current date
  const currentDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // === HEADER SECTION ===
  // Header background
  pdf.setFillColor(30, 64, 175); // Dark blue
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  // ASUS Logo placeholder (white box with text)
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, yPos, 25, 12, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 64, 175);
  pdf.text('ASUS', margin + 8, yPos + 8);
  
  // Main title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text('ASUS COMMERCIAL PARTNER PROGRAM', margin + 35, yPos + 6);
  
  // Subtitle
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(220, 220, 220);
  pdf.text('Form Pendaftaran ACP - Sistem Partner Registration', margin + 35, yPos + 12);
  
  // Date and ID box (top right)
  const dateBoxWidth = 55;
  pdf.setFillColor(255, 255, 255);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(pageWidth - margin - dateBoxWidth, yPos, dateBoxWidth, 15, 2, 2, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(30, 64, 175);
  pdf.text('TANGGAL:', pageWidth - margin - dateBoxWidth + 3, yPos + 5);
  pdf.text('FORM ID:', pageWidth - margin - dateBoxWidth + 3, yPos + 10);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(currentDate, pageWidth - margin - dateBoxWidth + 3, yPos + 8);
  pdf.text(formData.id?.slice(-8) || 'N/A', pageWidth - margin - dateBoxWidth + 3, yPos + 13);
  
  yPos = 45; // Reset position after header

  // === COMPANY INFORMATION SECTION ===
  addSectionHeader('INFORMASI PERUSAHAAN');
  
  addKeyValue('Nama ACP', formData.acpName, true);
  addKeyValue('Alamat Lengkap', formData.acpAddress);
  
  // Two column layout for city/state/postal
  const col1Width = contentWidth * 0.45;
  const col2Width = contentWidth * 0.45;
  const colGap = contentWidth * 0.1;
  
  // Save current yPos for two-column layout
  const twoColStartY = yPos;
  
  // Column 1
  addKeyValue('Kota', formData.city);
  addKeyValue('Kode Pos', formData.postCode);
  
  // Column 2 (adjust position)
  const col1EndY = yPos;
  yPos = twoColStartY;
  
  // Temporarily adjust margins for second column
  const originalMargin = margin;
  const tempMargin = margin + col1Width + colGap;
  
  // Override addKeyValue for second column
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 65, 81);
  
  pdf.text('Provinsi:', tempMargin, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(formData.state || '-', tempMargin + pdf.getTextWidth('Provinsi: '), yPos);
  
  yPos += lineHeight + 1;
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 65, 81);
  pdf.text('Telepon:', tempMargin, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(formData.telephoneNo || '-', tempMargin + pdf.getTextWidth('Telepon: '), yPos);
  
  // Reset to use the maximum Y position
  yPos = Math.max(col1EndY, yPos + lineHeight + 1);
  
  addKeyValue('Fax', formData.faxNo);

  // === LEGAL INFORMATION SECTION ===
  addSectionHeader('INFORMASI LEGAL');
  
  // Two column layout for legal info
  const legalCol1StartY = yPos;
  
  // Column 1
  addKeyValue('No. KTP', formData.idCardNo);
  addKeyValue('NIB', formData.sbnNib);
  
  // Column 2
  const legalCol1EndY = yPos;
  yPos = legalCol1StartY;
  
  // Second column legal info
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 65, 81);
  
  const legalTempMargin = margin + col1Width + colGap;
  
  pdf.text('NPWP:', legalTempMargin, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(formData.taxId || '-', legalTempMargin + pdf.getTextWidth('NPWP: '), yPos);
  
  yPos += lineHeight + 1;
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 65, 81);
  pdf.text('PKP:', legalTempMargin, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(formData.pkp || '-', legalTempMargin + pdf.getTextWidth('PKP: '), yPos);
  
  yPos = Math.max(legalCol1EndY, yPos + lineHeight + 1);

  // === CONTACT INFORMATION SECTION ===
  addSectionHeader('INFORMASI KONTAK');
  
  formData.contacts.forEach((contact, index) => {
    if (contact.name || contact.mobilePhone || contact.email || contact.whatsappNo) {
      // Contact type header with icon
      yPos += 3;
      
      if (contact.type === 'Owner') {
        addDecorativeBox(`👤 ${contact.type} (Kontak Utama)`, '#fef3c7', '#92400e');
      } else {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(30, 64, 175);
        pdf.text(`📞 ${contact.type}:`, margin, yPos);
        yPos += lineHeight;
      }
      
      // Contact details in organized layout
      if (contact.name) {
        addKeyValue('Nama', contact.name, contact.type === 'Owner');
      }
      
      // Two column for phone and email
      if (contact.mobilePhone || contact.email) {
        const contactTwoColStartY = yPos;
        
        if (contact.mobilePhone) {
          addKeyValue('Telepon', contact.mobilePhone);
        }
        
        const contactCol1EndY = yPos;
        yPos = contactTwoColStartY;
        
        if (contact.email) {
          const contactTempMargin = margin + col1Width + colGap;
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(55, 65, 81);
          pdf.text('Email:', contactTempMargin, yPos);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          
          // Handle long email with wrapping
          const emailLines = pdf.splitTextToSize(contact.email, col1Width - 20);
          if (Array.isArray(emailLines)) {
            emailLines.forEach((line: string, lineIndex: number) => {
              pdf.text(line, contactTempMargin + pdf.getTextWidth('Email: '), yPos + (lineIndex * lineHeight));
            });
            yPos += emailLines.length * lineHeight;
          } else {
            pdf.text(emailLines, contactTempMargin + pdf.getTextWidth('Email: '), yPos);
            yPos += lineHeight;
          }
        }
        
        yPos = Math.max(contactCol1EndY, yPos);
      }
      
      if (contact.whatsappNo) {
        addKeyValue('WhatsApp', contact.whatsappNo);
      }
      
      yPos += 5; // Space between contacts
    }
  });

  // === CREDIT NOTE CLAIM SECTION ===
  addSectionHeader('CLAIM CREDIT NOTE TO');
  
  const claimTo = formData.claimCreditNoteTo === 'distributor' ? 'Distributor' : 'Master Dealer';
  
  // Claim type in decorative box
  addDecorativeBox(`💼 Klaim Credit Note ke: ${claimTo}`, '#f0fdf4', '#166534');
  
  if (formData.claimCreditNoteTo === 'distributor') {
    addKeyValue('Nama Distributor', formData.distributorName, true);
  } else {
    addKeyValue('Nama Master Dealer', formData.masterDealerName, true);
  }

  // === AGREEMENT SECTION ===
  addSectionHeader('PERSETUJUAN');
  
  // Agreement status with checkmark/cross
  const agreementIcon = formData.agreement ? '✅' : '❌';
  const agreementText = formData.agreement ? 'SETUJU' : 'TIDAK SETUJU';
  const agreementColor = formData.agreement ? '#dcfce7' : '#fee2e2';
  const agreementTextColor = formData.agreement ? '#166534' : '#dc2626';
  
  addDecorativeBox(`${agreementIcon} ${agreementText}`, agreementColor, agreementTextColor);
  
  // Agreement details
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(75, 85, 99);
  const agreementLines = pdf.splitTextToSize(
    'Saya setuju untuk bergabung dengan ASUS Commercial Partner Program dan mematuhi semua syarat dan ketentuan yang berlaku.',
    contentWidth - 10
  );
  
  if (Array.isArray(agreementLines)) {
    agreementLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPos);
      yPos += lineHeight;
    });
  } else {
    pdf.text(agreementLines, margin + 5, yPos);
    yPos += lineHeight;
  }

  // === PHOTO SECTION ===
  if (formData.photoUrl) {
    yPos += 8;
    addSectionHeader('FOTO TOKO');
    
    // Photo info box
    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, yPos, contentWidth, 20, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, yPos, contentWidth, 20, 'S');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    pdf.text('📷 Foto toko tersedia di:', margin + 5, yPos + 6);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 64, 175);
    
    // Split long URL
    const urlLines = pdf.splitTextToSize(formData.photoUrl, contentWidth - 10);
    if (Array.isArray(urlLines)) {
      urlLines.forEach((line: string, index: number) => {
        pdf.text(line, margin + 5, yPos + 12 + (index * 4));
      });
    } else {
      pdf.text(urlLines, margin + 5, yPos + 12);
    }
    
    yPos += 25;
  }

  // === FOOTER SECTION ===
  // Move to bottom of page for footer
  const footerY = pageHeight - 25;
  
  // Footer background
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, footerY - 5, pageWidth, 30, 'F');
  
  // Footer border
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(margin, footerY - 2, pageWidth - margin, footerY - 2);
  
  // Footer content
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(30, 64, 175);
  pdf.text(`© ${new Date().getFullYear()} ASUS. All rights reserved.`, margin, footerY + 3);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(107, 114, 128);
  pdf.text('Dokumen ini dibuat secara otomatis dari sistem pendaftaran ASUS Commercial Partner', margin, footerY + 8);
  
  // QR Code placeholder (right side of footer)
  pdf.setFillColor(255, 255, 255);
  pdf.rect(pageWidth - margin - 20, footerY - 2, 15, 15, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(pageWidth - margin - 20, footerY - 2, 15, 15, 'S');
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(107, 114, 128);
  pdf.text('QR Code', pageWidth - margin - 17, footerY + 6);
  pdf.text('Verification', pageWidth - margin - 20, footerY + 9);

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `ACP-Registration-${formData.acpName.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.pdf`;

  console.log('Converting PDF to blob...');

  // Convert to blob
  const blob = pdf.output('blob');

  console.log('Simple PDF generation completed successfully');
  return { blob, filename };
};

export const uploadPDFToStorage = async (blob: Blob, filename: string): Promise<{success: boolean, data?: {publicUrl: string}, error?: string}> => {
  try {
    console.log('Starting PDF upload to storage...');
    
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('bucket', 'asus-pvp-master-media');
    formData.append('folder', 'asus-acp-registration-pdf-form-submission');

    const response = await fetch('/api/upload-pdf', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to upload PDF');
    }

    console.log('PDF uploaded successfully to storage');
    return result;
  } catch (error) {
    console.error('Upload PDF error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
