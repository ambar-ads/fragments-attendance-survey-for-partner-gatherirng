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

export const generatePDFFallback = async (formData: FormData): Promise<{blob: Blob, filename: string}> => {
  console.log('Starting PDF generation with fallback method (jsPDF only)...');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set font
  pdf.setFont('helvetica');
  
  let yPos = 20;
  const lineHeight = 6;
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to add text and move yPos
  const addText = (text: string, fontSize: number = 10, fontStyle: string = 'normal', color: string = '#000000') => {
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
    
    pdf.text(text, margin, yPos);
    yPos += lineHeight;
  };

  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    yPos += 5;
    addText(title, 14, 'bold', '#0066cc');
    pdf.setDrawColor(204, 204, 204);
    pdf.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    yPos += 3;
  };

  // Helper function to check if we need a new page
  const checkNewPage = () => {
    if (yPos > 280) {
      pdf.addPage();
      yPos = 20;
    }
  };

  // Current date
  const currentDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Header
  addText('ASUS COMMERCIAL PARTNER PROGRAM', 18, 'bold', '#0066cc');
  addText('Form Pendaftaran ACP', 12, 'normal', '#666666');
  yPos += 5;
  
  addText(`Tanggal: ${currentDate}`, 10, 'normal', '#666666');
  addText(`ID: ${formData.id || 'N/A'}`, 10, 'normal', '#666666');
  
  // Company Information
  addSectionHeader('INFORMASI PERUSAHAAN');
  
  addText(`Nama ACP: ${formData.acpName}`, 11, 'bold');
  addText(`Alamat: ${formData.acpAddress}`, 10);
  addText(`Kota: ${formData.city}`, 10);
  addText(`Provinsi: ${formData.state}`, 10);
  addText(`Kode Pos: ${formData.postCode}`, 10);
  addText(`Telepon: ${formData.telephoneNo}`, 10);
  addText(`Fax: ${formData.faxNo || '-'}`, 10);

  checkNewPage();

  // Legal Information
  addSectionHeader('INFORMASI LEGAL');
  
  addText(`No. KTP: ${formData.idCardNo || '-'}`, 10);
  addText(`NPWP: ${formData.taxId || '-'}`, 10);
  addText(`NIB: ${formData.sbnNib || '-'}`, 10);
  addText(`PKP: ${formData.pkp || '-'}`, 10);

  checkNewPage();

  // Contact Information
  addSectionHeader('INFORMASI KONTAK');
  
  formData.contacts.forEach((contact, index) => {
    if (contact.name || contact.mobilePhone || contact.email || contact.whatsappNo) {
      yPos += 2;
      addText(`${contact.type}:`, 11, 'bold');
      if (contact.name) addText(`  Nama: ${contact.name}`, 10);
      if (contact.mobilePhone) addText(`  Telepon: ${contact.mobilePhone}`, 10);
      if (contact.email) addText(`  Email: ${contact.email}`, 10);
      if (contact.whatsappNo) addText(`  WhatsApp: ${contact.whatsappNo}`, 10);
      yPos += 2;
      checkNewPage();
    }
  });

  // Credit Note Claim
  addSectionHeader('CLAIM CREDIT NOTE TO');
  
  const claimTo = formData.claimCreditNoteTo === 'distributor' ? 'Distributor' : 'Master Dealer';
  addText(`Klaim ke: ${claimTo}`, 11, 'bold');
  
  if (formData.claimCreditNoteTo === 'distributor') {
    addText(`Nama Distributor: ${formData.distributorName}`, 10);
  } else {
    addText(`Nama Master Dealer: ${formData.masterDealerName}`, 10);
  }

  checkNewPage();

  // Agreement
  addSectionHeader('PERSETUJUAN');
  
  const agreementStatus = formData.agreement ? '✓ SETUJU' : '✗ TIDAK SETUJU';
  addText(agreementStatus, 11, 'bold', formData.agreement ? '#22c55e' : '#ef4444');
  addText('Saya setuju untuk bergabung dengan ASUS Commercial Partner', 10);

  // Photo URL info (if exists)
  if (formData.photoUrl) {
    yPos += 5;
    addText('Foto Toko tersedia di:', 10, 'bold');
    addText(formData.photoUrl, 9, 'normal', '#0066cc');
  }

  // Footer
  yPos = 280;
  pdf.setDrawColor(204, 204, 204);
  pdf.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  
  addText(`© ${new Date().getFullYear()} ASUS. All rights reserved.`, 8, 'normal', '#666666');
  addText('Dokumen ini dibuat secara otomatis dari sistem pendaftaran ASUS Commercial Partner', 8, 'normal', '#666666');

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `ACP-Registration-${formData.acpName.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.pdf`;

  console.log('Converting PDF to blob...');

  // Convert to blob
  const blob = pdf.output('blob');

  console.log('Fallback PDF generation completed successfully');
  return { blob, filename };
};

export const uploadPDFToStorage = async (blob: Blob, filename: string): Promise<{success: boolean, data?: {publicUrl: string}, error?: string}> => {
  try {
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

    return result;
  } catch (error) {
    console.error('Upload PDF error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};