import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

interface Ingredient {
  id: string;
  name: string;
  type: 'hammade' | 'esans';
  category: string;
}

interface RequestBody {
  ingredients: Ingredient[];
  gender: 'kadın' | 'erkek' | 'unisex';
  season: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış';
  dominantScent: string;
}

function generateDemoRecipe(
  ingredients: Ingredient[], 
  gender: 'kadın' | 'erkek' | 'unisex', 
  season: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış', 
  dominantScent: string
): string {
  const hammadeler = ingredients.filter(ing => ing.type === 'hammade');
  const esanslar = ingredients.filter(ing => ing.type === 'esans');
  
  const seasonChars = {
    ilkbahar: 'taze ve çiçeksi',
    yaz: 'serinletici ve canlı', 
    sonbahar: 'ılık ve rahatlatıcı',
    kış: 'yoğun ve kalıcı'
  };

  const genderChars = {
    kadın: 'zarif ve feminen',
    erkek: 'güçlü ve maskülen', 
    unisex: 'dengeli ve modern'
  };

  return `🌸 PROFESYONEL PARFÜM REÇETESİ 🌸

📋 MALZEME LİSTESİ VE ORANLAR:

🌿 HAMMADELER (Top Notes - %30):
${hammadeler.map(ing => `• ${ing.name} - 3ml`).join('\n') || '• Temel hammade bulunmuyor'}

💧 ESANSLAR (Heart & Base Notes - %60):
${esanslar.map(ing => `• ${ing.name} - 4ml`).join('\n') || '• Temel esans bulunmuyor'}

🧪 ÇÖZÜCÜ (Base - %10):
• Etil alkol (%96) - 25ml
• Distile su - 5ml

🔬 HAZIRLAMA ADIMLARİ:

1. 📊 ÖLÇÜM AŞAMASI:
   - Tüm malzemeleri hassas terazide ölçün
   - Cam malzemeler kullanın (plastik kokular absorbe eder)

2. 💫 KARIŞIM AŞAMASI:
   - Önce esansları karıştırın (ağır kokular önce)
   - Hammadeleri yavaşça ilave edin
   - Etil alkolü damla damla ekleyin
   - 5 dakika karıştırın

3. 🕐 DİNLENDİRME:
   - Kapalı cam şişede 48 saat bekletin
   - Distile suyu son olarak ekleyin
   - Hafifçe çalkalayın

💡 PROFESYONEL TAVSİYELER:

• 🌡️ SICAKLIK: Oda sıcaklığında (18-22°C) çalışın
• 🧼 HİJYEN: Tüm araçları önce alkolla temizleyin  
• 🌞 IŞIK: Direkt güneş ışığından uzak tutun
• 📦 SAKLAMA: Koyu renkli cam şişe kullanın

⏰ OLGUNLAŞTIRMA TAKVİMİ:

• 🗓️ 1. GÜN: Karışım tamamlanır
• 🗓️ 3. GÜN: İlk koku dengesi oluşur  
• 🗓️ 1. HAFTA: Notalar birleşmeye başlar
• 🗓️ 2-4 HAFTA: Tam olgunluk (önerilen)

🎯 BEKLENİLEN SONUÇ:

Bu reçete ${genderChars[gender]} karakterde, ${season} mevsimi için ${seasonChars[season]} bir parfüm üretecektir.

${dominantScent ? `🌟 Baskın koku profili: ${dominantScent}` : ''}
🔢 Toplam malzeme sayısı: ${ingredients.length}
⏱️ Kalıcılık: 6-8 saat
🌊 Sillaj: Orta seviye

📝 NOT: Bu reçete deneyimli parfümörlerden esinlenerek hazırlanmıştır. 
GROQ API sorunu nedeniyle demo versiyon gösterilmektedir.`;
}

export async function POST(request: NextRequest) {
  console.log('🍃 Generate Recipe API çağrıldı');
  let ingredients: Ingredient[] = [];
  let gender: 'kadın' | 'erkek' | 'unisex' = 'unisex';
  let season: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış' = 'ilkbahar';
  let dominantScent = '';
  
  try {
    const body: RequestBody = await request.json();
    console.log('📝 Request body:', JSON.stringify(body, null, 2));
    ({ ingredients, gender, season, dominantScent } = body);

    if (!ingredients || ingredients.length === 0) {
      console.log('❌ Malzeme listesi boş!');
      return NextResponse.json(
        { error: 'En az bir malzeme seçmelisiniz' },
        { status: 400 }
      );
    }

    // GROQ API anahtarı kontrolü
    const apiKey = process.env.GROQ_API_KEY;
    console.log('🔑 GROQ API Key exists:', !!apiKey);
    console.log('🔑 GROQ API Key length:', apiKey?.length || 0);
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your-groq-api-key-here') {
      console.log('❌ GROQ API Key invalid, returning demo recipe');
      return NextResponse.json({ recipe: generateDemoRecipe(ingredients, gender, season, dominantScent) });
    }

    console.log('🤖 GROQ client oluşturuluyor...');
    // GROQ client'ı initialize et
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Malzeme listesini hazırla
    const hammadeler = ingredients.filter(ing => ing.type === 'hammade').map(ing => ing.name);
    const esanslar = ingredients.filter(ing => ing.type === 'esans').map(ing => ing.name);

    console.log('🌿 Hammadeler:', hammadeler.length, hammadeler);
    console.log('💧 Esanslar:', esanslar.length, esanslar);

    // Mevsim özelliklerini belirle
    const seasonCharacteristics = {
      ilkbahar: 'hafif, taze, çiçeksi, uyanık hissettiren',
      yaz: 'serinletici, hafif, narenciye ağırlıklı, enerjik',
      sonbahar: 'ılık, baharatlı, odunsu, rahatlatıcı',
      kış: 'yoğun, sıcak, oryantal, derin ve kalıcı'
    };

    // Cinsiyet özelliklerini belirle
    const genderCharacteristics = {
      kadın: 'çiçeksi, zarif, feminen, romantik',
      erkek: 'güçlü, maskülen, odunsu, karakterli',
      unisex: 'dengeli, modern, evrensel, sofistike'
    };

    console.log('📋 Detaylı prompt hazırlanıyor...');
    const prompt = `
Sen 20+ yıl deneyimli, uluslararası ödüllü bir parfümörsün. EXTRAIT DE PARFUM konsantrasyonunda (%20-40 esans oranı), yüksek yayılım ve uzun kalıcılık hedefleyen profesyonel bir reçete hazırlayacaksın.

PROJE DETAYLARI:
🎯 Hedef Kitle: ${gender}
🌍 Mevsim: ${season} 
🌸 Baskın Koku Profili: ${dominantScent}
🎪 Karakter: ${genderCharacteristics[gender]}
🌿 Mevsim Özelliği: ${seasonCharacteristics[season]}

MEVCUT MALZEME ENVANTERİ:
${hammadeler.length > 0 ? `🌿 HAMMADELER: ${hammadeler.join(', ')}` : '🌿 HAMMADELER: Yok'}
${esanslar.length > 0 ? `💧 ESANSLAR: ${esanslar.join(', ')}` : '💧 ESANSLAR: Yok'}

PARFÜM GEREKSİNİMLERİ:
- Konsantrasyon: EXTRAIT DE PARFUM (20-40% esans)
- Toplam Hacim: 50ml (nihai ürün)
- Kalıcılık: Minimum 12+ saat
- Sillaj (Yayılım): Yüksek, 1-2 metre mesafe
- Kalite: Nişe parfüm seviyesi
- Bütçe: Premium segment

ZORUNLU TEKNIK GEREKSINIMLER:
1. Tüm ölçümleri ML ve GRAM cinsinden ver
2. Top-Heart-Base nota piramidini takip et
3. Alkol bazını %96 etil alkol kullan
4. Fiksatör olarak misk veya amber dahil et
5. pH dengesi için distile su ekle

Lütfen aşağıdaki profesyonel formatta DETAYLI reçete hazırla:

🏆 EXTRAIT PARFÜM REÇETESİ 🏆

📊 KONSANTRASYON ANALİZİ:
• Esans Oranı: [%25-40 arası belirt]
• Alkol Oranı: [%50-65 arası belirt]  
• Su Oranı: [%5-15 arası belirt]
• Fiksatör Oranı: [%3-8 arası belirt]

📋 DETAYLI MALZEME LİSTESİ VE ÖLÇÜMLER:

🔺 TOP NOTES (%20-30) - İlk 15 dakika:
[Her malzemeyi ml/gram cinsinden, örnek: "Bergamot Esansı: 3.2ml"]

💖 HEART NOTES (%40-50) - 1-6 saat:
[Her malzemeyi ml/gram cinsinden]

🏛️ BASE NOTES (%20-30) - 6+ saat:
[Her malzemeyi ml/gram cinsinden]

🧪 ÇÖZÜCÜ VE SABITLEYICI:
• Etil Alkol (96%): [X]ml
• Distile Su: [X]ml
• Fiksatör (misk/amber): [X]ml

🔬 PROFESYONEL HAZIRLAMA TEKNİĞİ:

ADIM 1 - Esans Karışımı:
[Base notalardan başla, precise timing]

ADIM 2 - Maserasyon:
[Heart notları dahil et, süre belirt]

ADIM 3 - Top Nota İlavesi:
[En son, dikkatli karıştırma]

ADIM 4 - Alkol Entegrasyonu:
[Damla damla teknik, emülsiyon önleme]

ADIM 5 - Dinlendirme:
[Sıcaklık, zaman, ortam koşulları]

💎 MASTER PARFÜMÖR TAVSİYELERİ:
• Molecular binding için ultrasonik banyo kullan
• Maturation için 4-8 hafta karanlık ortam
• Spray test için minimum 72 saat bekle
• [Diğer profesyonel ipuçları]

📈 PERFORMANS TAHMİNİ:
🕐 Kalıcılık: [X saat]
📏 Sillaj: [X metre]
🌡️ Optimum uygulama sıcaklığı: [X°C]
👃 Koku yoğunluğu: [1-10 arası]

🎯 FINAL PARFÜM PROFİLİ:
[Detaylı koku evrimi, karakter analizi]

⚠️ KALİTE KONTROL:
• pH: 5.5-6.5 arası olmalı
• Renk: [Beklenen renk]
• Berraklık: [Bulanıklık kontrolü]

Türkçe yanıtla. Her ölçümü ML/GRAM olarak net ver. Extrait kalitesinde profesyonel reçete hazırla.
`;

    console.log('🚀 GROQ API çağrısı yapılıyor...');
    
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Sen uzman bir parfümörsün. Türkçe olarak detaylı, profesyonel ve uygulanabilir parfüm reçeteleri hazırlıyorsun."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.8,
      });

      console.log('✅ GROQ API yanıt aldı');
      const recipe = completion.choices[0]?.message?.content || 'Reçete üretilemedi, lütfen tekrar deneyin.';
      console.log('📏 Recipe length:', recipe.length);

      console.log('📤 Response gönderiliyor...');
      return NextResponse.json({ recipe });
      
    } catch (groqApiError: unknown) {
      console.error('💥 GROQ API Internal Error:', groqApiError);
      
      // GROQ API hatası durumunda demo reçete döndür
      console.log('❌ GROQ API failed, returning demo recipe');
      return NextResponse.json({ 
        recipe: generateDemoRecipe(ingredients, gender, season, dominantScent)
      });
    }

  } catch (error: unknown) {
    console.error('💥 API Error:', error);
    
    // Quota hatası veya diğer API hataları için demo reçete döndür
    const apiError = error as { status?: number; code?: string };
    if (apiError?.status === 429 || apiError?.code === 'insufficient_quota') {
      console.log('❌ GROQ quota exceeded, returning demo recipe');
      return NextResponse.json({ 
        recipe: generateDemoRecipe(ingredients, gender, season, dominantScent)
      });
    }
    
    console.error('💥 Final error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { error: 'Reçete üretilirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') },
      { status: 500 }
    );
  }
} 