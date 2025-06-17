-- Parfüm AI Database Schema
-- Bu dosyayı Supabase SQL Editor'da çalıştır

-- 1️⃣ REÇETELER TABLOSU
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('kadın', 'erkek', 'unisex')),
  season TEXT NOT NULL CHECK (season IN ('ilkbahar', 'yaz', 'sonbahar', 'kış')),
  dominant_scent TEXT NOT NULL,
  recipe TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2️⃣ ÖZEL MALZEMELER TABLOSU  
CREATE TABLE custom_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hammade', 'esans')),
  category TEXT NOT NULL DEFAULT 'özel',
  description TEXT,
  purpose TEXT,
  is_custom BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3️⃣ GİZLENEN DEFAULT MALZEMELER TABLOSU
CREATE TABLE hidden_default_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(ingredient_id, user_id)
);

-- 4️⃣ ROW LEVEL SECURITY (RLS) AKTİVASYONU
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_default_ingredients ENABLE ROW LEVEL SECURITY;

-- 5️⃣ RLS POLİTİKALARI

-- Recipes tablosu politikaları
CREATE POLICY "Users can view their own recipes" ON recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Custom ingredients tablosu politikaları
CREATE POLICY "Users can view their own custom ingredients" ON custom_ingredients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom ingredients" ON custom_ingredients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom ingredients" ON custom_ingredients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom ingredients" ON custom_ingredients
  FOR DELETE USING (auth.uid() = user_id);

-- Hidden ingredients tablosu politikaları
CREATE POLICY "Users can view their own hidden ingredients" ON hidden_default_ingredients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hidden ingredients" ON hidden_default_ingredients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hidden ingredients" ON hidden_default_ingredients
  FOR DELETE USING (auth.uid() = user_id);

-- 6️⃣ UPDATED_AT TETİKLEYİCİSİ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_recipes_updated_at 
  BEFORE UPDATE ON recipes 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7️⃣ İNDEKSLER (Performans için)
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_custom_ingredients_user_id ON custom_ingredients(user_id);
CREATE INDEX idx_custom_ingredients_type ON custom_ingredients(type);
CREATE INDEX idx_hidden_ingredients_user_id ON hidden_default_ingredients(user_id);

-- 8️⃣ BAŞARILI MESAJI
SELECT 'Parfüm AI database schema başarıyla oluşturuldu! 🎉' as message; 