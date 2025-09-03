'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import * as XLSX from 'xlsx';

interface Contact {
  id: string;
  contact_type: string;
  name: string;
  mobile_phone: string;
  email: string;
  whatsapp_no: string;
}

interface ACPRegistration {
  id: string;
  acp_name: string;
  acp_address: string;
  city: string;
  state: string;
  post_code: string;
  telephone_no: string;
  fax_no?: string;
  id_card_no?: string;
  tax_id?: string;
  sbn_nib?: string;
  pkp?: string;
  agreement: boolean;
  created_at: string;
  updated_at: string;
  store_photo_url?: string;
  form_submission_pdf_format?: string;
  claim_credit_note_to?: string;
  distributor_name?: string;
  master_dealer_name?: string;
  contacts: Contact[];
}

export default function ACPRegistrationSummary() {
  const [data, setData] = useState<ACPRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  useEffect(() => {
    // Check if user is already authenticated within 24 hours
    const authData = localStorage.getItem('acp_auth');
    if (authData) {
      const { timestamp } = JSON.parse(authData);
      const now = Date.now();
      const hoursDiff = (now - timestamp) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setIsAuthenticated(true);
        return;
      } else {
        // Remove expired auth data
        localStorage.removeItem('acp_auth');
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'lukasrado2020!') {
      setIsAuthenticated(true);
      setAuthSuccess('Access granted!');
      setAuthError('');
      
      // Save authentication to localStorage with timestamp
      const authData = {
        authenticated: true,
        timestamp: Date.now()
      };
      localStorage.setItem('acp_auth', JSON.stringify(authData));
      
      setTimeout(() => setAuthSuccess(''), 3000);
    } else {
      setAuthError('Incorrect password. Please try again.');
      setAuthSuccess('');
    }
  };

  const fetchData = async () => {
    try {
      const { data: result, error } = await supabase
        .from('acp_registrations_with_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (data.length === 0) return;

    setExporting(true);
    try {
      // Prepare data for Excel export
      const excelData = data.map((item) => ({
        'Created At': new Date(item.created_at).toLocaleString(),
        'ACP Name': item.acp_name,
        'Address': item.acp_address,
        'City': item.city,
        'State': item.state,
        'Post Code': item.post_code,
        'Telephone': item.telephone_no,
        'Fax': item.fax_no || '',
        'ID Card': item.id_card_no || '',
        'Tax ID': item.tax_id || '',
        'SBN/NIB': item.sbn_nib || '',
        'PKP': item.pkp || '',
        'Agreement': item.agreement ? 'Yes' : 'No',
        'Store Photo URL': item.store_photo_url || '',
        'PDF URL': item.form_submission_pdf_format || '',
        'Claim To': item.claim_credit_note_to || '',
        'Distributor': item.distributor_name || '',
        'Master Dealer': item.master_dealer_name || '',
        'Contacts': item.contacts.map(contact =>
          `${contact.contact_type}: ${contact.name} (${contact.mobile_phone}, ${contact.email})`
        ).join('; ')
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const colWidths = [
        { wch: 20 }, // Created At
        { wch: 20 }, // ACP Name
        { wch: 30 }, // Address
        { wch: 15 }, // City
        { wch: 15 }, // State
        { wch: 10 }, // Post Code
        { wch: 15 }, // Telephone
        { wch: 15 }, // Fax
        { wch: 20 }, // ID Card
        { wch: 20 }, // Tax ID
        { wch: 15 }, // SBN/NIB
        { wch: 25 }, // PKP
        { wch: 10 }, // Agreement
        { wch: 50 }, // Store Photo URL
        { wch: 50 }, // PDF URL
        { wch: 15 }, // Claim To
        { wch: 30 }, // Distributor
        { wch: 30 }, // Master Dealer
        { wch: 50 }  // Contacts
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'ACP Registrations');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `ACP_Registrations_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Access Protected</h2>
          <p className="text-gray-300 text-center mb-4">Please enter the password to access this page.</p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Submit
            </button>
          </form>
          {authError && (
            <p className="text-red-500 text-center mt-4">{authError}</p>
          )}
          {authSuccess && (
            <p className="text-green-500 text-center mt-4">{authSuccess}</p>
          )}
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-4 sticky top-0 z-10 border-b border-white">
        <div className="flex justify-between items-start">
          <div className="flex-1"></div>
          <h1 className="text-2xl font-bold text-center flex-1">ACP Registration Summary</h1>
          <div className="flex-1"></div>
        </div>
      </div>
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <span className="text-gray-300 text-sm font-medium">
          Total: {data.length} Records
        </span>
        <button
          onClick={exportToExcel}
          disabled={data.length === 0 || exporting}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
        >
          {exporting ? 'Exporting...' : 'Excel'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800 border border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Created At</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">ACP Name</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Address</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">City</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">State</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Post Code</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Telephone</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Fax</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">ID Card</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Tax ID</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">SBN/NIB</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">PKP</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Agreement</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Store Photo</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">PDF URL</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Claim To</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Distributor</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Master Dealer</th>
              <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">Contacts</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const isNew = new Date(item.created_at) > new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
              return (
                <tr key={item.id} className={isNew ? "bg-green-600 hover:bg-green-700" : "hover:bg-gray-700"}>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">
                    {isNew && <span className="font-bold text-yellow-400 mr-2">New!</span>}
                    {item.acp_name}
                  </td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.acp_address}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.city}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.state}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.post_code}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.telephone_no}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.fax_no || '-'}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.id_card_no || '-'}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.tax_id || '-'}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.sbn_nib || '-'}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.pkp || '-'}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.agreement ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">
                    {item.store_photo_url ? (
                      <a href={item.store_photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        View Photo
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">
                    {item.form_submission_pdf_format ? (
                      <a href={item.form_submission_pdf_format} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        View PDF
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.claim_credit_note_to || '-'}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.distributor_name || '-'}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{item.master_dealer_name || '-'}</td>
                  <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">
                    {item.contacts.map((contact, index) => (
                      <span key={contact.id}>
                        {contact.contact_type}: {contact.name} ({contact.mobile_phone}, {contact.email})
                        {index < item.contacts.length - 1 && '; '}
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <p className="text-center mt-4 text-gray-400">No registrations found.</p>
      )}
    </div>
  );
}
