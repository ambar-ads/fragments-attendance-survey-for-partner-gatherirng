/**
 * Test component untuk memverifikasi Supabase Storage setup
 * Jalankan di browser untuk test upload functionality
 * 
 * Cara menggunakan:
 * 1. Import component ini di page yang ingin test
 * 2. Render component <SupabaseStorageTest />
 * 3. Test upload file dan lihat hasilnya di console
 */

"use client";
import { useState } from 'react';
import { uploadFileToStorage, deleteFileFromStorage } from './supabaseStorage';

export default function SupabaseStorageTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const uploadResult = await uploadFileToStorage(
        file, 
        'asus-pvp-master-media', 
        'asus-acp-registration-form-store-photo-submission'
      );
      setResult(uploadResult);
      console.log('Upload result:', uploadResult);
    } catch (error) {
      console.error('Upload error:', error);
      setResult({ success: false, error: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!result?.success || !result?.data?.path) {
      alert('No uploaded file to delete');
      return;
    }

    try {
      const deleteSuccess = await deleteFileFromStorage(
        result.data.path, 
        'asus-pvp-master-media'
      );
      console.log('Delete result:', deleteSuccess);
      if (deleteSuccess) {
        setResult(null);
        setFile(null);
        alert('File deleted successfully');
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting file');
    }
  };

  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">Supabase Storage Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select image file (JPG, PNG):
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Test'}
          </button>

          {result?.success && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Delete Test File
            </button>
          )}
        </div>

        {result && (
          <div className="mt-4 p-4 border rounded">
            <h4 className="font-semibold mb-2">Result:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.success && result.data?.publicUrl && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img 
                  src={result.data.publicUrl} 
                  alt="Uploaded test" 
                  className="max-w-xs h-auto border rounded"
                />
                <p className="text-xs text-gray-600 mt-1">
                  URL: {result.data.publicUrl}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
