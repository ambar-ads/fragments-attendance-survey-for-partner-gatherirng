-- Testing Script untuk Sales Training Participants (Simple Column Approach)
-- Jalankan setelah migration selesai

-- 1. Test Insert Data dengan Participant 1 dan 2
INSERT INTO public.event_rsvps (
  name, phone, email, company, food_preference, attending,
  st_participant_01_name, st_participant_01_phone, st_participant_01_email, st_participant_01_food_preference,
  st_participant_02_name, st_participant_02_phone, st_participant_02_email, st_participant_02_food_preference
) VALUES (
  'Test User 1',
  '08123456789', 
  'test1@company.com',
  'PT Test Company 1',
  'Daging',
  true,
  'Alice Training',
  '08111111111',
  'alice@company.com',
  'Vegan',
  'Bob Training',
  '08222222222',
  'bob@company.com',
  'Ikan'
);

-- 2. Test Insert Data dengan Participant 1 saja
INSERT INTO public.event_rsvps (
  name, phone, email, company, food_preference, attending,
  st_participant_01_name, st_participant_01_phone, st_participant_01_email, st_participant_01_food_preference
) VALUES (
  'Test User 2',
  '08987654321',
  'test2@company.com', 
  'PT Test Company 2',
  'Ikan',
  true,
  'Charlie Training',
  '08333333333',
  'charlie@company.com',
  'Daging'
);

-- 3. Verify data tersimpan dengan benar
SELECT 
  id, name, company,
  st_participant_01_name,
  st_participant_01_food_preference,
  st_participant_02_name,
  st_participant_02_food_preference
FROM public.event_rsvps 
WHERE st_participant_01_name IS NOT NULL AND st_participant_01_name != ''
ORDER BY created_at DESC;

-- 4. Test View
SELECT * FROM event_rsvps_with_training_participants LIMIT 5;

-- 5. Test Functions
SELECT * FROM get_training_participants_count_by_company();
SELECT * FROM get_all_training_participants() LIMIT 10;

-- 6. Test Constraint (ini akan gagal - seharusnya)
-- Uncomment untuk test constraint validation
/*
INSERT INTO public.event_rsvps (
  name, phone, email, company, food_preference, attending,
  st_participant_01_name, st_participant_01_phone, st_participant_01_email, st_participant_01_food_preference
) VALUES (
  'Test Invalid',
  '08123456789',
  'invalid@test.com',
  'PT Invalid',
  'Daging', 
  true,
  'Test Name',
  '08111111111',
  'test@email.com',
  'InvalidFood'
);
*/

-- 7. Cleanup test data (uncomment jika ingin hapus test data)
/*
DELETE FROM public.event_rsvps 
WHERE name IN ('Test User 1', 'Test User 2', 'Test Invalid');
*/
