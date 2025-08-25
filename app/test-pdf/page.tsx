"use client";
import React, { useState } from 'react';
import { generatePDF, FormData as PDFFormData } from '../../lib/pdfGenerator';
import { generatePDFFallback, FormData as PDFFormDataFallback } from '../../lib/pdfGeneratorFallback';
import { generateSimplePDF, FormData as PDFFormDataSimple } from '../../lib/pdfGeneratorSimple';

export default function TestPDF() {
  const [loading, setLoading] = useState(false);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [simpleLoading, setSimpleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleData: PDFFormData = {
    id: 'TEST-123',
    acpName: 'PT Test Company Indonesia',
    acpAddress: 'Jl. Test Road No. 123, Jakarta',
    city: 'Jakarta',
    state: 'DKI Jakarta',
    postCode: '12345',
    telephoneNo: '021-123456',
    faxNo: '021-123457',
    photoUrl: 'https://example.com/photo.jpg',
    idCardNo: '1234567890123456',
    taxId: '12.345.678.9-123.000',
    sbnNib: 'NIB123456789',
    pkp: 'PKP123456789',
    contacts: [
      {
        type: 'Owner',
        name: 'John Doe',
        mobilePhone: '08123456789',
        email: 'john@test.com',
        whatsappNo: '08123456789'
      },
      {
        type: 'Contact 1',
        name: 'Jane Smith',
        mobilePhone: '08987654321',
        email: 'jane@test.com',
        whatsappNo: '08987654321'
      },
      {
        type: 'Contact 2',
        name: '',
        mobilePhone: '',
        email: '',
        whatsappNo: ''
      },
      {
        type: 'Contact 3',
        name: '',
        mobilePhone: '',
        email: '',
        whatsappNo: ''
      }
    ],
    agreement: true,
    claimCreditNoteTo: 'distributor',
    distributorName: 'PT Distributor Test',
    masterDealerName: '',
    createdAt: new Date().toISOString()
  };

  const testSimplePDF = async () => {
    setSimpleLoading(true);
    setError(null);

    try {
      console.log('Testing simple PDF generation...');
      const { blob, filename } = await generateSimplePDF(sampleData);

      // Download the PDF file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Simple PDF test completed successfully');
    } catch (err: unknown) {
      console.error('Simple PDF test failed:', err);
      if (err instanceof Error) {
        setError(`Simple PDF failed: ${err.message}`);
      } else {
        setError('Simple PDF failed with unknown error');
      }
    } finally {
      setSimpleLoading(false);
    }
  };

  const testMainPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Testing main PDF generation...');
      const { blob, filename } = await generatePDF(sampleData);

      // Download the PDF file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Main PDF test completed successfully');
    } catch (err: unknown) {
      console.error('Main PDF test failed:', err);
      if (err instanceof Error) {
        setError(`Main PDF failed: ${err.message}`);
      } else {
        setError('Main PDF failed with unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const testFallbackPDF = async () => {
    setFallbackLoading(true);
    setError(null);

    try {
      console.log('Testing fallback PDF generation...');
      const { blob, filename } = await generatePDFFallback(sampleData);

      // Download the PDF file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Fallback PDF test completed successfully');
    } catch (err: unknown) {
      console.error('Fallback PDF test failed:', err);
      if (err instanceof Error) {
        setError(`Fallback PDF failed: ${err.message}`);
      } else {
        setError('Fallback PDF failed with unknown error');
      }
    } finally {
      setFallbackLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">PDF Generation Test</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={testSimplePDF}
            disabled={loading || fallbackLoading || simpleLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {simpleLoading ? 'Testing Simple PDF...' : 'Test Simple PDF (jsPDF only - RECOMMENDED)'}
          </button>

          <button
            onClick={testMainPDF}
            disabled={loading || fallbackLoading || simpleLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing Main PDF...' : 'Test Main PDF (html2canvas + jsPDF)'}
          </button>

          <button
            onClick={testFallbackPDF}
            disabled={loading || fallbackLoading || simpleLoading}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fallbackLoading ? 'Testing Fallback PDF...' : 'Test Fallback PDF (Basic jsPDF)'}
          </button>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Test Data:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Company: {sampleData.acpName}</li>
            <li>City: {sampleData.city}</li>
            <li>Owner: {sampleData.contacts[0].name}</li>
            <li>Agreement: {sampleData.agreement ? 'Yes' : 'No'}</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500">
          <p>Open browser console to see detailed logs during PDF generation.</p>
        </div>
      </div>
    </div>
  );
}
