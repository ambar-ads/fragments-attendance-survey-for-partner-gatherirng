// Test script to verify PDF generation functionality
const testData = {
  id: 'test-123',
  acpName: 'PT Test Company',
  acpAddress: 'Jl. Test Address No. 123',
  city: 'Jakarta',
  state: 'DKI Jakarta',
  postCode: '12345',
  telephoneNo: '021-12345678',
  faxNo: '021-87654321',
  photoUrl: 'https://llmsjlitpaovnsztoewo.supabase.co/storage/v1/object/public/asus-pvp-master-media/store-photos/test-photo.jpg',
  idCardNo: '1234567890123456',
  taxId: '12.345.678.9-012.000',
  sbnNib: 'SBN123456789',
  pkp: 'PKP123456789',
  contacts: [
    {
      type: 'Owner',
      name: 'John Doe',
      mobilePhone: '08123456789',
      email: 'john.doe@test.com',
      whatsappNo: '08123456789'
    },
    {
      type: 'Contact 1',
      name: 'Jane Smith',
      mobilePhone: '08987654321',
      email: 'jane.smith@test.com',
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
  distributorName: 'PT. SYNNEX METRODATA INDONESIA',
  masterDealerName: '',
  createdAt: new Date().toISOString()
};

console.log('Test data prepared:', JSON.stringify(testData, null, 2));
console.log('You can use this data to test the PDF generation functionality.');
