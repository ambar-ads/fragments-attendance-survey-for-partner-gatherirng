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
  claimCreditNoteTo: 'distributor' | 'master_dealer' | '';
  distributorName: string;
  masterDealerName: string;
  createdAt?: string;
}

export const generatePDF = async (formData: FormData): Promise<{blob: Blob, filename: string}> => {
  console.log('Starting PDF generation with html2canvas method...');
  // Normalize: create an uppercased copy of user-input fields for PDF output
  const normalizeToUpper = (s: string | undefined | null) => (s === undefined || s === null) ? '' : String(s).toUpperCase();

  const upper: FormData = {
    ...formData,
    acpName: normalizeToUpper(formData.acpName),
    acpAddress: normalizeToUpper(formData.acpAddress),
    city: normalizeToUpper(formData.city),
    state: normalizeToUpper(formData.state),
    postCode: normalizeToUpper(formData.postCode),
    telephoneNo: normalizeToUpper(formData.telephoneNo),
    faxNo: normalizeToUpper(formData.faxNo),
    photoUrl: formData.photoUrl,
    idCardNo: normalizeToUpper(formData.idCardNo),
    taxId: normalizeToUpper(formData.taxId),
    sbnNib: normalizeToUpper(formData.sbnNib),
    pkp: normalizeToUpper(formData.pkp),
    contacts: (formData.contacts || []).map(c => ({
      type: normalizeToUpper(c.type),
      name: normalizeToUpper(c.name),
      mobilePhone: normalizeToUpper(c.mobilePhone),
      email: normalizeToUpper(c.email),
      whatsappNo: normalizeToUpper(c.whatsappNo)
    })),
    claimCreditNoteTo: formData.claimCreditNoteTo,
    distributorName: normalizeToUpper(formData.distributorName),
    masterDealerName: normalizeToUpper(formData.masterDealerName),
    createdAt: formData.createdAt
  };
  
  // Helper: fetch an image and convert to data URL so html2canvas can render it reliably
  const fetchImageAsDataURL = async (url: string | undefined): Promise<string | null> => {
    try {
      if (!url) return null;
      
      // Add timeout and proper headers for Supabase images
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 8000); // Reduced timeout to 8 seconds
      
      const res = await fetch(url, {
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'image/*',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.warn(`Failed to fetch image: ${res.status} ${res.statusText}`);
        return null;
      }
      
      const blob = await res.blob();
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => {
          console.warn('FileReader error');
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      // Handle abort errors gracefully
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('Image fetch aborted due to timeout');
        return null;
      }
      console.warn('Failed to fetch image as data URL:', err);
      return null;
    }
  };

  // Preload logo as data URL
  const logoPath = '/ASUS_BUSINESS_standard_whitekbg_Mar 2025.png';
  const logoDataUrl = await fetchImageAsDataURL(logoPath);

  // Create a temporary div to render the PDF content
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  // Use a width that maps to A4 at 96dpi with some printable margin
  tempDiv.style.width = '794px'; // A4 width in pixels at 96 DPI
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '48px 48px';
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.fontFamily = 'Inter, Arial, sans-serif';
  tempDiv.style.setProperty('-webkit-font-smoothing', 'antialiased');
  tempDiv.style.setProperty('-moz-osx-font-smoothing', 'grayscale');
  tempDiv.style.textRendering = 'optimizeLegibility';
  
  // Current date for the form
  const currentDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  console.log('Creating HTML content for PDF...');

  tempDiv.innerHTML = `
  <div style="max-width: 714px; margin: 0 auto; background: white; color: #000;">
      <!-- Header with Logo -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; border-bottom: 2px solid #0066cc; padding-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 160px; height: auto; display: flex; align-items: center; justify-content: flex-start;">
            ${logoDataUrl ? `<img src="${logoDataUrl}" alt="ASUS Business" style="max-height:56px; object-fit:contain;"/>` : `<div style=\"width:48px;height:48px;background-color:#0066cc;border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;\">ASUS</div>`}
          </div>
          <div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #0066cc;">ASUS Commercial Partner Program</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #000;">Form Pendaftaran ACP</p>
          </div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #666; min-width:120px;">
          <p style="margin: 0;">Tanggal: ${currentDate}</p>
          <p style="margin: 0;">ID: ${formData.id || 'N/A'}</p>
        </div>
      </div>

      <!-- Company Information -->
      <div style="margin-bottom: 28px;">
  <h2 style="font-size: 17px; font-weight: 700; margin-bottom: 18px; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
          Informasi Perusahaan
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="font-size: 13px; font-weight: 700; color: #000;">Nama ACP:</label>
            <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${upper.acpName}</p>
          </div>
          <div>
            <label style="font-size: 13px; font-weight: 700; color: #000;">Kota:</label>
            <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${upper.city}</p>
          </div>
        </div>
        <div style="margin-bottom: 14px;">
          <label style="font-size: 13px; font-weight: 700; color: #000;">Alamat:</label>
          <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${upper.acpAddress}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
          <div>
            <label style="font-size: 13px; font-weight: 700; color: #000;">Provinsi:</label>
            <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${upper.state}</p>
          </div>
          <div>
            <label style="font-size: 13px; font-weight: 700; color: #000;">Kode Pos:</label>
            <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${upper.postCode}</p>
          </div>
          <div>
            <label style="font-size: 13px; font-weight: 700; color: #000;">Telepon:</label>
            <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${upper.telephoneNo}</p>
          </div>
        </div>
        <div style="margin-bottom: 14px;">
          <label style="font-size: 13px; font-weight: 700; color: #000;">Fax:</label>
          <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${upper.faxNo || '-'}</p>
        </div>
      </div>

      <!-- Legal Information -->
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 17px; font-weight: 700; margin-bottom: 18px; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
          Informasi Legal
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="font-size: 13px; font-weight: 700; color: #000;">No. KTP:</label>
            <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${formData.idCardNo || '-'}</p>
          </div>
          <div>
            <label style="font-size: 13px; font-weight: 700; color: #000;">NPWP:</label>
            <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${formData.taxId || '-'}</p>
          </div>
          <div>
            <label style="font-size: 13px; font-weight: 700; color: #000;">NIB:</label>
            <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${formData.sbnNib || '-'}</p>
          </div>
          <div>
            <label style="font-size: 13px; font-weight: 700; color: #000;">PKP:</label>
            <p style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; color:#000;">${formData.pkp || '-'}</p>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 17px; font-weight: 700; margin-bottom: 18px; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
          Informasi Kontak
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
              <tr style="background-color: #f5f5f5; color:#000;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Tipe Kontak</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Nama</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Telepon</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Email</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            ${formData.contacts.map(contact => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; font-weight: ${contact.type === 'Owner' ? '700' : '400'}; color:#000;">${contact.type}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; color:#000;">${(contact.name || '-').toString().toUpperCase()}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; color:#000;">${(contact.mobilePhone || '-').toString().toUpperCase()}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; color:#000;">${(contact.email || '-').toString().toUpperCase()}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; color:#000;">${(contact.whatsappNo || '-').toString().toUpperCase()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Credit Note Claim Section -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Claim Credit Note to
        </h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
          <div style="margin-bottom: 10px;">
            <span style="font-size: 14px; font-weight: bold; color: #333;">Klaim ke: </span>
            <span style="font-size: 14px; color: #0066cc; font-weight: bold;">
              ${upper.claimCreditNoteTo === 'distributor' ? 'DISTRIBUTOR' : 'MASTER DEALER'}
            </span>
          </div>
          ${upper.claimCreditNoteTo === 'distributor' ? `
            <div>
              <span style="font-size: 14px; font-weight: bold; color: #333;">Nama Distributor: </span>
              <span style="font-size: 14px; color: #333;">${upper.distributorName}</span>
            </div>
          ` : `
            <div>
              <span style="font-size: 14px; font-weight: bold; color: #333;">Nama Master Dealer: </span>
              <span style="font-size: 14px; color: #333;">${upper.masterDealerName}</span>
            </div>
          `}
        </div>
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
      <div style="margin-top: 15px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #666;">
        <p style="margin: 0;">© ${new Date().getFullYear()} ASUS. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">Dokumen ini dibuat secara otomatis dari sistem pendaftaran ASUS Commercial Partner</p>
      </div>
    </div>
  `;

  document.body.appendChild(tempDiv);

  try {
    console.log('Generating canvas from HTML...');
    // Generate canvas from the div
    // Render the temporary DOM to canvas. We embedded images as data URLs so CORS shouldn't be an issue.
    // Choose scale to improve output resolution; avoid extreme values to prevent OOM.
    const desiredScale = (window.devicePixelRatio || 1) * 2.5; // Increased scale for better quality
    const scale = Math.min(3, Math.max(2, desiredScale)); // Increased min and max scale for better quality

    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: 794,
      height: tempDiv.scrollHeight,
      foreignObjectRendering: false,
      imageTimeout: 8000, // Increased timeout for higher quality rendering
      removeContainer: true
    });

    console.log('Canvas generated successfully, creating PDF...');

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configure PDF page and margins
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const pdfMargin = 12; // outer margin in mm (left/right/top/bottom)

    // Use content width (mm) for the rendered image (respect left/right margins)
    const contentWidthMm = pageWidth - pdfMargin * 2;

    // Calculate pixel-per-mm using canvas width (px) <-> content width (mm)
  const pxPerMm = canvas.width / contentWidthMm;
  const pageHeightPx = Math.floor(pageHeight * pxPerMm);

    // Number of pages needed
    const totalHeightPx = canvas.height;
    let renderedHeight = 0;
    let pageIndex = 0;

    while (renderedHeight < totalHeightPx) {
      // Slice a portion of the canvas for this page
      const sliceHeightPx = Math.min(pageHeightPx, totalHeightPx - renderedHeight);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );
      }

      // Use toDataURL with higher quality JPEG compression for better output
      const imgData = pageCanvas.toDataURL('image/jpeg', 0.95); // Increased to 95% quality for better resolution

      if (pageIndex > 0) pdf.addPage();
      // Calculate slice height in mm and add image with correct height to preserve quality
      const sliceHeightMm = Math.round((sliceHeightPx / pxPerMm) * 100) / 100; // two decimals
      pdf.addImage(imgData, 'JPEG', pdfMargin, pdfMargin, contentWidthMm, sliceHeightMm);

      renderedHeight += sliceHeightPx;
      pageIndex += 1;
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `ACP-Registration-${(upper.acpName || 'N/A').replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.pdf`;

    console.log('PDF created successfully, generating blob...');

    // Convert to blob
    const blob = pdf.output('blob');

    console.log('PDF generation completed successfully');
    return { blob, filename };
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw error;
  } finally {
    // Clean up
    console.log('Cleaning up temporary DOM elements...');
    document.body.removeChild(tempDiv);
  }
};

export const uploadPDFToStorage = async (blob: Blob, filename: string): Promise<{success: boolean, data?: {publicUrl: string}, error?: string}> => {
  try {
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('bucket', 'asus-pvp-master-media');
    formData.append('folder', 'asus-acp-registration-pdf-form-submission');

    // Add timeout and abort controller with better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 60000); // Increased to 60 seconds for large files

    const response = await fetch('/api/upload-pdf', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const result = await response.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Upload PDF error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Upload timed out. File might be too large. Please try again or use a smaller image.'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: 'Unknown error occurred during upload'
    };
  }
};
