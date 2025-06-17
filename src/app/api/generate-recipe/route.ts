import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

🌸 MARKA PARFÜM ESANSLARI (Heart & Base Notes - %60):
${esanslar.map(ing => `• ${ing.name} - 4ml`).join('\n') || '• Temel esans bulunmuyor'}

🌿 DESTEKLEYICI HAMMADELER (Top Notes - %30):
${hammadeler.map(ing => `• ${ing.name} - 3ml`).join('\n') || '• Temel hammade bulunmuyor'}

🧪 ÇÖZÜCÜ (Base - %10):
• Etil alkol (%96) - 25ml
• Distile su - 5ml

🔬 MARKA PARFÜM HAZIRLAMA ADIMLARİ:

1. 📊 ÖLÇÜM AŞAMASI:
   - Tüm malzemeleri hassas terazide ölçün
   - Cam malzemeler kullanın (plastik kokular absorbe eder)

2. 💫 MARKA ESANS KARIŞIMI:
   - Önce marka parfüm esanslarını karıştırın
   - Destekleyici hammadeleri yavaşça ilave edin
   - Etil alkolü damla damla ekleyin
   - 5 dakika karıştırın

3. 🕐 OLGUNLAŞTIRMA:
   - Kapalı cam şişede 48 saat bekletin
   - Distile suyu son olarak ekleyin
   - Hafifçe çalkalayın

💡 MARKA PARFÜM TAVSİYELERİ:

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

📝 NOT: Bu reçete marka parfüm esansları kullanılarak hazırlanmıştır. 
OpenAI API sorunu nedeniyle demo versiyon gösterilmektedir.`;
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

    // OpenAI API anahtarı kontrolü
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔑 OpenAI API Key exists:', !!apiKey);
    console.log('🔑 OpenAI API Key length:', apiKey?.length || 0);
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your-openai-api-key-here') {
      console.log('❌ OpenAI API Key invalid, returning demo recipe');
      return NextResponse.json({ recipe: generateDemoRecipe(ingredients, gender, season, dominantScent) });
    }

    console.log('🤖 OpenAI client oluşturuluyor...');
    // OpenAI client'ı initialize et
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Malzeme listesini hazırla
    const hammadeler = ingredients.filter(ing => ing.type === 'hammade').map(ing => ing.name);
    const esanslar = ingredients.filter(ing => ing.type === 'esans').map(ing => ing.name);

    console.log('🌿 Hammadeler:', hammadeler.length, hammadeler);
    console.log('💧 Marka Parfüm Esansları:', esanslar.length, esanslar);

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

    console.log('📋 Detaylı marka parfüm prompt hazırlanıyor...');
    const prompt = `
Sen 20+ yıl deneyimli, uluslararası ödüllü bir master parfümörsün ve marka parfüm reverse engineering uzmanısın. Euphoria, Miss Dior, Tom Ford gibi markaların kompozisyonlarını biliyorsun.

MARKA PARFÜM PROJESI DETAYLARI:
🎯 Hedef Kitle: ${gender}
🌍 Mevsim: ${season} 
🌸 Baskın Koku Profili: ${dominantScent}
🎪 Karakter: ${genderCharacteristics[gender]}
🌿 Mevsim Özelliği: ${seasonCharacteristics[season]}

MEVCUT MALZEME ENVANTERİ:
${hammadeler.length > 0 ? `🌿 DESTEKLEYICI HAMMADELER: ${hammadeler.join(', ')}` : '🌿 HAMMADELER: Yok'}
${esanslar.length > 0 ? `🌸 MARKA PARFÜM ESANSLARI: ${esanslar.join(', ')}` : '💧 ESANSLAR: Yok'}

MARKA PARFÜM KLONLAMA GEREKSİNİMLERİ:
- Konsantrasyon: EXTRAIT DE PARFUM (20-40% esans)
- Orijinal karakter korunmalı
- Kalıcılık: Minimum 12+ saat (marka parfüm seviyesi)
- Sillaj (Yayılım): Yüksek, 1-2 metre mesafe
- Kalite: Orijinal marka parfüme yakın seviye

MARKA PARFÜM REVERSİNG KURALLARI:
1. Seçilen marka parfüm esanslarının orijinal kompozisyonunu analiz et
2. Bu parfümlerin karakteristik özelliklerini koruyacak formülasyon yap
3. Destekleyici hammadelerle orijinal nota piramidini destekle
4. Top-Heart-Base yapısını marka parfümün orijinaline uygun kur

Lütfen aşağıdaki profesyonel formatta MARKA PARFÜM KLONLAMA reçetesi hazırla:

🏆 MARKA PARFÜM KLONU REÇETESİ 🏆

📊 KONSANTRASYON ANALİZİ:
• Marka Esans Oranı: [%25-40 arası belirt]
• Hammade Destek Oranı: [%10-20 arası belirt]  
• Alkol Oranı: [%40-60 arası belirt]
• Su Oranı: [%5-15 arası belirt]

📋 DETAYLI MALZEME LİSTESİ VE ÖLÇÜMLER:

🔺 TOP NOTES (%20-30) - İlk 15 dakika:
[Her malzemeyi ml/gram cinsinden, marka parfümün üst notalarını yakalayacak şekilde]

💖 HEART NOTES (%40-50) - 1-6 saat:
[Marka parfüm esanslarını burada kullan, orijinal kalp notalarını koru]

🏛️ BASE NOTES (%20-30) - 6+ saat:
[Destekleyici hammadelerle marka parfümün dip notalarını güçlendir]

🧪 ÇÖZÜCÜ VE SABITLEYICI:
• Etil Alkol (96%): [X]ml
• Distile Su: [X]ml
• Fiksatör: [X]ml

🔬 MARKA PARFÜM KLONLAMA TEKNİĞİ:

ADIM 1 - Marka Esans Hazırlığı:
[Marka parfüm esanslarının doğru oranlarla karıştırılması]

ADIM 2 - Nota Piramidi Kurulumu:
[Orijinal parfümün nota yapısını koruyacak hammade eklenmesi]

ADIM 3 - Karakteristik Koruma:
[Marka parfümün ayırt edici özelliklerinin yakalanması]

ADIM 4 - Olgunlaştırma:
[Marka parfüm kalitesinde olgunlaştırma süreci]

💎 MASTER PARFÜMÖR MARKA KLONLAMA TAVSİYELERİ:
[Seçilen marka parfümlerin karakteristiğini korumak için özel teknikler]

📈 BEKLENEN MARKA PARFÜM PERFORMANSİ:
🕐 Kalıcılık: Orijinale yakın performans
📏 Sillaj: Marka parfüm seviyesi
👃 Karakter Benzerliği: %85-95 oranında

🎯 MARKA PARFÜM KARAKTER ANALİZİ:
[Seçilen esansların hangi marka parfüm karakteristiklerini yansıttığı]

Türkçe yanıtla. Her ölçümü ML/GRAM olarak net ver. Marka parfüm kalitesinde profesyonel reçete hazırla.
`;

    console.log('🚀 OpenAI API çağrısı yapılıyor...');
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Sen uzman bir parfümör ve marka parfüm reverse engineering uzmanısın. Türkçe olarak detaylı, profesyonel ve uygulanabilir marka parfüm klonlama reçeteleri hazırlıyorsun."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      });

      console.log('✅ OpenAI API yanıt aldı');
      const recipe = completion.choices[0]?.message?.content || 'Reçete üretilemedi, lütfen tekrar deneyin.';
      console.log('📏 Recipe length:', recipe.length);

      console.log('📤 Response gönderiliyor...');
      return NextResponse.json({ recipe });
      
    } catch (openaiApiError: unknown) {
      console.error('💥 OpenAI API Internal Error:', openaiApiError);
      
      // OpenAI API hatası durumunda demo reçete döndür
      console.log('❌ OpenAI API failed, returning demo recipe');
      return NextResponse.json({ 
        recipe: generateDemoRecipe(ingredients, gender, season, dominantScent)
      });
    }

  } catch (error: unknown) {
    console.error('💥 API Error:', error);
    
    // Quota hatası veya diğer API hataları için demo reçete döndür
    const apiError = error as { status?: number; code?: string };
    if (apiError?.status === 429 || apiError?.code === 'insufficient_quota') {
      console.log('❌ OpenAI quota exceeded, returning demo recipe');
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