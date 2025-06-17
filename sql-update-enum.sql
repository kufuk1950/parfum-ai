-- SUPABASE SQL EDITOR'DA ÇALIŞTIR
-- Yeni esans_uret tipini eklemek için

-- 1. Mevcut enum tipini kontrol et
SELECT enumlabel 
FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'ingredient_type';

-- 2. Eğer custom_ingredients tablosunda type sütunu ENUM kullanıyorsa, yeni değeri ekle
ALTER TYPE ingredient_type ADD VALUE 'esans_uret';

-- 3. Eğer ENUM yok ise, direkt TEXT olarak kullanılıyor demektir - kontrol et
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'custom_ingredients' AND column_name = 'type';

-- 4. Alternatif: Eğer ENUM yoksa, CHECK constraint ile kontrol ediliyor olabilir
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'custom_ingredients'::regclass AND conname LIKE '%type%';

-- 5. CHECK constraint varsa, güncelle (örnek)
-- ALTER TABLE custom_ingredients 
-- DROP CONSTRAINT IF EXISTS custom_ingredients_type_check;
-- 
-- ALTER TABLE custom_ingredients 
-- ADD CONSTRAINT custom_ingredients_type_check 
-- CHECK (type IN ('hammade', 'esans', 'esans_uret'));

-- 6. ingredients tablosu için de aynı işlemler
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'ingredients' AND column_name = 'type';

-- 7. ingredients tablosu CHECK constraint kontrolü
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'ingredients'::regclass AND conname LIKE '%type%';

-- ÖNEMLİ NOT: 
-- Bu komutları tek tek çalıştır ve sonuçları kontrol et!
-- Hangi yöntemle type kontrolü yapıldığını öğrendikten sonra uygun komutu çalıştır. 