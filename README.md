# 🌸 Parfüm AI - Yapay Zeka Parfüm Reçetesi Oluşturucu

Modern, responsive ve kullanıcı dostu parfüm reçetesi oluşturma uygulaması.

## ✨ Özellikler

- 🤖 **AI Destekli Reçete Üretimi** - Groq API ile akıllı parfüm reçeteleri
- 📱 **Responsive Tasarım** - Tüm cihazlarda mükemmel çalışır
- 💾 **Reçete Kaydetme** - Favori reçetelerinizi saklayın
- 🖼️ **Resim İndirme** - Reçetelerinizi PNG formatında indirin
- 🧪 **Malzeme Yönetimi** - Özel hammade ve esanslar ekleyin
- ⚡ **Akıllı Eşleştirme** - Esanslara uygun hammadeleri AI ile bulun

## 🚀 Hızlı Başlangıç

### 1. Projeyi Klonlayın
```bash
git clone <repo-url>
cd parfum-ai
npm install
```

### 2. Environment Variables
`.env.local` dosyası oluşturun:

```env
# Groq API Key (Zorunlu)
GROQ_API_KEY=your_groq_api_key_here

# Supabase (Veri kalıcılığı için - opsiyonel)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Çalıştırın
```bash
npm run dev
```

## 📊 Veri Kalıcılığı Seçenekleri

### 🔄 Şu Anki Durum (localStorage)
- ✅ Hızlı ve basit
- ❌ Sadece o tarayıcıda çalışır
- ❌ Farklı cihazlarda veriler gözükmez

### 🌟 Önerilen Çözümler

#### 1. 🥇 **Supabase (Ücretsiz & Kolay)**
```bash
# 1. Supabase hesabı açın: https://supabase.com
# 2. Yeni proje oluşturun
# 3. SQL Editor'da tabloları oluşturun:

-- Reçeteler tablosu
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  gender TEXT NOT NULL,
  season TEXT NOT NULL,
  dominant_scent TEXT NOT NULL,
  recipe TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);

-- Malzemeler tablosu
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  is_custom BOOLEAN DEFAULT false,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

# 4. API keys'leri .env.local'e ekleyin
```

#### 2. 🥈 **Vercel Postgres**
```bash
# Vercel dashboard'dan Postgres ekleyin
# Otomatik environment variables alırsınız
```

#### 3. 🥉 **MongoDB Atlas**
```bash
# MongoDB Atlas'ta ücretsiz cluster oluşturun
# Connection string'i .env.local'e ekleyin
```

## 🔧 Teknolojiler

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Headless UI
- **Icons:** Lucide React
- **AI:** Groq API
- **Image Generation:** html2canvas
- **Animation:** Transition API

## 📁 Proje Yapısı

```
parfum-ai/
├── src/
│   ├── app/
│   │   ├── api/generate-recipe/route.ts  # AI API endpoint
│   │   └── page.tsx                      # Ana uygulama
│   └── lib/
├── lib/
│   └── supabase.ts                       # Database konfigürasyonu
└── README.md
```

## 🌍 Deploy Etme

### Vercel'a Deploy
```bash
# 1. Vercel hesabı açın
# 2. GitHub'a push edin
# 3. Vercel'da import edin
# 4. Environment variables'ları ekleyin:
#    - GROQ_API_KEY
#    - NEXT_PUBLIC_SUPABASE_URL (opsiyonel)
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY (opsiyonel)
```

## 🔑 API Keys Alma

### Groq API Key (Zorunlu)
1. [Groq Console](https://console.groq.com)'a gidin
2. Hesap açın (ücretsiz)
3. API Keys bölümünden yeni key oluşturun

### Supabase Keys (Opsiyonel - Veri kalıcılığı için)
1. [Supabase](https://supabase.com)'te hesap açın
2. Yeni proje oluşturun
3. Settings > API'dan keys'leri alın

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 Destek

Sorunlar için [GitHub Issues](https://github.com/your-username/parfum-ai/issues) kullanın.

---

**🌸 Parfüm AI ile hayalinizdeki parfüm reçetelerini oluşturun!**
# Force Vercel Redeploy
