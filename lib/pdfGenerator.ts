import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  createdAt?: string;
}

export const generatePDF = async (formData: FormData): Promise<{blob: Blob, filename: string}> => {
  // Create a temporary div to render the PDF content
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '794px'; // A4 width in pixels at 96 DPI
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '40px';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  
  // Current date for the form
  const currentDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  tempDiv.innerHTML = `
    <div style="max-width: 714px; margin: 0 auto; background: white;">
      <!-- Header with Logo -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <img src="/ASUS_Logo.svg" alt="ASUS Logo" style="height: 40px; width: auto;" />
          <div>
            <h1 style="margin: 0; font-size: 18px; font-weight: bold; color: #0066cc;">ASUS Commercial Partner Program</h1>
            <p style="margin: 0; font-size: 12px; color: #666;">Form Pendaftaran ACP</p>
          </div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #666;">
          <p style="margin: 0;">Tanggal: ${currentDate}</p>
          <p style="margin: 0;">ID: ${formData.id || 'N/A'}</p>
        </div>
      </div>

      <!-- Company Information -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Informasi Perusahaan
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <label style="font-size: 12px; font-weight: bold; color: #555;">Nama ACP:</label>
            <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.acpName}</p>
          </div>
          <div>
            <label style="font-size: 12px; font-weight: bold; color: #555;">Kota:</label>
            <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.city}</p>
          </div>
        </div>
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; font-weight: bold; color: #555;">Alamat:</label>
          <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.acpAddress}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
          <div>
            <label style="font-size: 12px; font-weight: bold; color: #555;">Provinsi:</label>
            <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.state}</p>
          </div>
          <div>
            <label style="font-size: 12px; font-weight: bold; color: #555;">Kode Pos:</label>
            <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.postCode}</p>
          </div>
          <div>
            <label style="font-size: 12px; font-weight: bold; color: #555;">Telepon:</label>
            <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.telephoneNo}</p>
          </div>
        </div>
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; font-weight: bold; color: #555;">Fax:</label>
          <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.faxNo || '-'}</p>
        </div>
      </div>

      <!-- Store Photo Section -->
      ${formData.photoUrl ? `
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Foto Toko
        </h2>
        <div style="text-align: center;">
          <img src="${formData.photoUrl}" alt="Store Photo" style="max-width: 300px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;" />
        </div>
      </div>
      ` : ''}

      <!-- Legal Information -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Informasi Legal
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <label style="font-size: 12px; font-weight: bold; color: #555;">No. KTP:</label>
            <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.idCardNo || '-'}</p>
          </div>
          <div>
            <label style="font-size: 12px; font-weight: bold; color: #555;">NPWP:</label>
            <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.taxId || '-'}</p>
          </div>
          <div>
            <label style="font-size: 12px; font-weight: bold; color: #555;">NIB:</label>
            <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.sbnNib || '-'}</p>
          </div>
          <div>
            <label style="font-size: 12px; font-weight: bold; color: #555;">PKP:</label>
            <p style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${formData.pkp || '-'}</p>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Informasi Kontak
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tipe Kontak</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nama</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Telepon</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Email</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            ${formData.contacts.map(contact => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; font-weight: ${contact.type === 'Owner' ? 'bold' : 'normal'};">${contact.type}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${contact.name || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${contact.mobilePhone || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${contact.email || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${contact.whatsappNo || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Agreement Section -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Persetujuan
        </h2>
        <div style="display: flex; align-items: center; gap: 10px; background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
          <span style="font-size: 18px; color: ${formData.agreement ? '#22c55e' : '#ef4444'};">
            ${formData.agreement ? '✓' : '✗'}
          </span>
          <span style="font-size: 14px; color: #333;">
            Saya setuju untuk bergabung dengan ASUS Commercial Partner
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #666;">
        <p style="margin: 0;">© ${new Date().getFullYear()} ASUS. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">Dokumen ini dibuat secara otomatis dari sistem pendaftaran ASUS Commercial Partner</p>
      </div>
    </div>
  `;

  document.body.appendChild(tempDiv);

  try {
    // Generate canvas from the div
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: 794,
      height: tempDiv.scrollHeight
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ACP-Registration-${formData.acpName.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.pdf`;

    // Convert to blob
    const blob = pdf.output('blob');

    return { blob, filename };
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
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
