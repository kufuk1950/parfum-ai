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
  perfumeVolume: 50 | 100;
}

function generateDemoRecipe(
  ingredients: Ingredient[], 
  gender: 'kadın' | 'erkek' | 'unisex', 
  season: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış', 
  dominantScent: string,
  perfumeVolume: 50 | 100
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

  // Matematik hesaplamaları - SU YOK!
  const totalVolume = perfumeVolume;
  const esansVolume = Math.round(totalVolume * 0.25); // %25 esans
  const hammadeVolume = Math.round(totalVolume * 0.10); // %10 hammade
  const alcoholVolume = totalVolume - esansVolume - hammadeVolume; // Geri kalan alkol

  // Malzeme başına dağılım
  const esansPerItem = esanslar.length > 0 ? Math.round(esansVolume / esanslar.length * 10) / 10 : 0;
  const hammadePerItem = hammadeler.length > 0 ? Math.round(hammadeVolume / hammadeler.length * 10) / 10 : 0;

  return `🏆 MARKA PARFÜM KLONU REÇETESİ (${totalVolume}ml) 🏆

📊 KONSANTRASYON ANALİZİ:
• Marka Esans Oranı: %25 (${esansVolume}ml)
• Hammade Destek Oranı: %10 (${hammadeVolume}ml)
• Alkol Oranı: %65 (${alcoholVolume}ml)
• Su Oranı: %0 (Su kullanılmıyor)

📋 DETAYLI MALZEME LİSTESİ (${totalVolume}ml için):

🌸 MARKA PARFÜM ESANSLARI (${esansVolume}ml toplam):
${esanslar.map(ing => `• ${ing.name} - ${esansPerItem}ml`).join('\n') || '• Marka esans seçilmedi'}

🌿 DESTEKLEYICI HAMMADELER (${hammadeVolume}ml toplam):
${hammadeler.map(ing => `• ${ing.name} - ${hammadePerItem}ml`).join('\n') || '• Hammade seçilmedi'}

🧪 ÇÖZÜCÜ:
• Etil alkol (%96) - ${alcoholVolume}ml

🔬 PROFESYONEL MANYETIK KARIŞTIRICI TEKNİĞİ:

HAZIRLIK:
📐 Cam beher (${totalVolume + 20}ml kapasiteli)
🧲 Manyetik çubuk (2-3cm boyunda)
⚡ Manyetik karıştırıcı cihazı
🌡️ Oda sıcaklığı (18-22°C)

ADIM 1 - BEHER HAZIRLIĞI (2 dakika):
• Cam beheri ve manyetik çubuğu alkol ile temizleyin
• Manyetik çubuğu beherin merkezine yerleştirin
• Beheri manyetik karıştırıcının üzerine koyun

ADIM 2 - MARKA ESANS EKLEME (3 dakika):
• Manyetik karıştırıcıyı düşük hızda çalıştırın (200-300 RPM)
• Marka parfüm esanslarını sırasıyla ekleyin:
${esanslar.map(ing => `  → ${ing.name}: ${esansPerItem}ml`).join('\n') || '  → Esans eklenmedi'}
• Her esans eklemesi arasında 30 saniye bekleyin

ADIM 3 - HAMMADE ENTEGRASYONU (5 dakika):
• Hızı 150-250 RPM'e düşürün (köpük oluşmasın)
• Destekleyici hammadeleri yavaşça ekleyin:
${hammadeler.map(ing => `  → ${ing.name}: ${hammadePerItem}ml`).join('\n') || '  → Hammade eklenmedi'}
• 3-4 dakika karıştırın (berrak karışım için)

ADIM 4 - ALKOL ENTEGRASYONu (8 dakika):
• Hızı 100-200 RPM'e düşürün
• Etil alkolü çok yavaş damla damla ekleyin (${alcoholVolume}ml)
• 5-6 dakika karıştırın (emülsiyon önleme)
• Karışım tamamen berrak olmalı

ADIM 5 - SON KARIŞIM (5 dakika):
• Hızı 300-400 RPM'e çıkarın
• 3-4 dakika daha karıştırın
• Son 1 dakika çok düşük hızda (100 RPM)

⏱️ TOPLAM SÜRE: ~25 dakika
🔄 TOPLAM RPM RANGE: 100-400 RPM

📦 AKTARMA VE SAKLAMA:
• Karıştırıcıyı durdurun ve manyetik çubuğu çıkarın
• Parfümü koyu cam şişeye aktarın (huni kullanın)
• Şişeyi sıkıca kapatın ve etiketleyin

🕐 MASERASYON PROGRAMI:
• 1. GÜN: Karışım tamamlandı
• 3. GÜN: İlk dengeleme, hafifçe çalkalayın
• 1. HAFTA: Nota birleşimi başlar
• 2. HAFTA: %50 olgunluk
• 4. HAFTA: Tam olgunluk (TEST ZAMANIN!)

💡 MANYETIK KARIŞTIRIC TAVSİYELERİ:

• 🚫 YÜKSEK HIZ KULLANMAYIN: Köpük ve oksidasyon yaratır
• ⏰ ACELİ OLMAYIN: Yavaş karıştırma daha iyi sonuç verir
• 🌡️ SICAKLIK KONTROLÜ: Soğuk ortamda çalışın
• 🧲 MANYETİK ÇUBUK: Temiz ve pürüzsüz olmalı

🎯 BEKLENİLEN SONUÇ:

Bu reçete ${genderChars[gender]} karakterde, ${season} mevsimi için ${seasonChars[season]} bir parfüm üretecektir.

${dominantScent ? `🌟 Baskın koku profili: ${dominantScent}` : ''}
🔢 Toplam malzeme sayısı: ${ingredients.length}
⏱️ Kalıcılık: 8-12 saat  
🌊 Sillaj: Yüksek seviye
📏 Toplam hacim: ${totalVolume}ml
⚡ Karıştırma süresi: 25 dakika

📝 NOT: Manyetik karıştırıcı ile profesyonel parfüm yapım tekniği!

⚠️ DEMO VERSİYON: OpenAI API key eksik/geçersiz olduğu için demo reçete gösteriliyor.
Bu reçetedeki malzemeler sizin seçtikleriniz DEĞİL - test amaçlı demo verilerdir.
OpenAI API key'ini Vercel Environment Variables'a ekleyiniz.`;
}

export async function POST(request: NextRequest) {
  console.log('🍃 Generate Recipe API çağrıldı');
  let ingredients: Ingredient[] = [];
  let gender: 'kadın' | 'erkek' | 'unisex' = 'unisex';
  let season: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış' = 'ilkbahar';
  let dominantScent = '';
  let perfumeVolume: 50 | 100 = 50;
  
  try {
    const body: RequestBody = await request.json();
    console.log('📝 Request body:', JSON.stringify(body, null, 2));
    ({ ingredients, gender, season, dominantScent, perfumeVolume } = body);

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
    console.log('🔑 OpenAI API Key starts with sk-:', apiKey?.startsWith('sk-') || false);
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your-openai-api-key-here') {
      console.log('❌ OpenAI API Key invalid, returning demo recipe');
      console.log('❌ Reason: Key is', !apiKey ? 'missing' : apiKey === 'your-openai-api-key-here' ? 'default placeholder' : 'empty');
      return NextResponse.json({ recipe: generateDemoRecipe(ingredients, gender, season, dominantScent, perfumeVolume) });
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
📏 HEDEF HACİM: ${perfumeVolume}ml

MEVCUT MALZEME ENVANTERİ:
${hammadeler.length > 0 ? `🌿 DESTEKLEYICI HAMMADELER: ${hammadeler.join(', ')}` : '🌿 HAMMADELER: Yok'}
${esanslar.length > 0 ? `🌸 MARKA PARFÜM ESANSLARI: ${esanslar.join(', ')}` : '💧 ESANSLAR: Yok'}

MARKA PARFÜM KLONLAMA GEREKSİNİMLERİ:
- Konsantrasyon: EXTRAIT DE PARFUM (25% esans, 10% hammade, 65% alkol)
- Toplam Hacim: ${perfumeVolume}ml (kesin)
- SU KULLANMA! Sadece alkol çözücü
- Matematik %100 doğru olmalı
- Kalıcılık: Minimum 8-12 saat (marka parfüm seviyesi)
- Sillaj (Yayılım): Yüksek seviye

MATEMATİK KURALLARI (${perfumeVolume}ml için):
1. Marka Esanslar Toplamı: ${Math.round(perfumeVolume * 0.25)}ml (%25)
2. Hammadeler Toplamı: ${Math.round(perfumeVolume * 0.10)}ml (%10)
3. Etil Alkol: ${perfumeVolume - Math.round(perfumeVolume * 0.25) - Math.round(perfumeVolume * 0.10)}ml (%65)
4. Su: 0ml (HİÇ KULLANMA!)
5. TOPLAM: Tam ${perfumeVolume}ml olmalı

MARKA PARFÜM REVERSİNG KURALLARI:
1. Seçilen marka parfüm esanslarının orijinal kompozisyonunu analiz et
2. Bu parfümlerin karakteristik özelliklerini koruyacak formülasyon yap
3. Destekleyici hammadelerle orijinal nota piramidini destekle
4. Matematiği kesinlikle doğru yap - toplam ${perfumeVolume}ml

Lütfen aşağıdaki profesyonel formatta MARKA PARFÜM KLONLAMA reçetesi hazırla:

🏆 MARKA PARFÜM KLONU REÇETESİ (${perfumeVolume}ml) 🏆

📊 KONSANTRASYON ANALİZİ:
• Marka Esans Oranı: %25 (${Math.round(perfumeVolume * 0.25)}ml)
• Hammade Destek Oranı: %10 (${Math.round(perfumeVolume * 0.10)}ml)
• Alkol Oranı: %65 (${perfumeVolume - Math.round(perfumeVolume * 0.25) - Math.round(perfumeVolume * 0.10)}ml)
• Su Oranı: %0 (Su kullanılmıyor)

📋 DETAYLI MALZEME LİSTESİ (${perfumeVolume}ml için):

🌸 MARKA PARFÜM ESANSLARI (${Math.round(perfumeVolume * 0.25)}ml toplam):
[Her marka esansını ml cinsinden, toplamı ${Math.round(perfumeVolume * 0.25)}ml olacak şekilde]

🌿 DESTEKLEYICI HAMMADELER (${Math.round(perfumeVolume * 0.10)}ml toplam):
[Her hammadeyi ml cinsinden, toplamı ${Math.round(perfumeVolume * 0.10)}ml olacak şekilde]

🧪 ÇÖZÜCÜ:
• Etil Alkol (96%): ${perfumeVolume - Math.round(perfumeVolume * 0.25) - Math.round(perfumeVolume * 0.10)}ml

🔬 PROFESYONEL MANYETIK KARIŞTIRIC TEKNİĞİ:

HAZIRLIK AŞAMASI:
📐 Cam beher (${perfumeVolume + 20}ml kapasiteli)
🧲 Manyetik çubuk (2-3cm boyunda)  
⚡ Manyetik karıştırıcı cihazı
🌡️ Oda sıcaklığı (18-22°C)

ADIM 1 - BEHER HAZIRLIĞI (2 dakika):
• Cam beheri ve manyetik çubuğu %96 etil alkol ile sterilize edin
• Manyetik çubuğu beherin tam merkezine yerleştirin
• Beheri manyetik karıştırıcının üzerine dengeli koyun

ADIM 2 - MARKA ESANS KARIŞIMI (3-5 dakika):
• Manyetik karıştırıcıyı düşük hızda başlatın (200-300 RPM)
• Marka parfüm esanslarını belirtilen sırada ve miktarlarda ekleyin
• Her esans ekleme arasında 30-45 saniye bekleyin
• Homojen karışım oluşana kadar karıştırın

ADIM 3 - HAMMADE ENTEGRASYONU (5-7 dakika):
• Hızı 150-250 RPM'e düşürün (köpük oluşumunu önlemek için)
• Destekleyici hammadeleri yavaş ve dikkatli ekleyin
• 4-5 dakika karıştırın, karışım berrak olmalı
• Hiçbir partikül veya tortu kalmamasına özen gösterin

ADIM 4 - ALKOL ENTEGRASYONU (8-10 dakika):
• Hızı 100-200 RPM'e düşürün (kritik aşama)
• Etil alkolü çok yavaş, damla damla ekleyin
• Toplam alkol miktarını 3 aşamada ekleyin
• 6-7 dakika karıştırın, emülsiyon oluşumunu önleyin

ADIM 5 - FİNAL KARIŞIM (5 dakika):
• Hızı 300-400 RPM'e çıkarın
• 3-4 dakika yüksek hızda karıştırın
• Son 1 dakika çok düşük hızda (100 RPM) tamamlayın

⏱️ TOPLAM KARIŞIM SÜRESİ: 23-29 dakika
🔄 RPM ARALIKLARI: 100-400 RPM (aşamaya göre)

AKTARMA VE SAKLAMA:
• Manyetik karıştırıcıyı durdurun, manyetik çubuğu steril penset ile çıkarın
• Parfümü huni kullanarak koyu amber cam şişeye aktarın
• Şişeyi hava almayacak şekilde sıkıca kapatın
• Üretim tarihini ve formülü etiketleyin

MASERASYON TAKVİMİ:
• 1-3 GÜN: İlk dengeleme periyodu
• 1 HAFTA: Nota birleşimi başlar, hafifçe çalkalayın
• 2 HAFTA: %50 olgunluk seviyesi
• 4-6 HAFTA: Tam olgunluk (test için ideal)

💡 MANYETIK KARIŞTIRIC TAVSİYELERİ:
• 🚫 YÜKSEK HIZ KULLANMAYIN: Köpük ve oksidasyon yaratır
• ⏰ ACELİ OLMAYIN: Yavaş karıştırma daha iyi sonuç verir
• 🌡️ SICAKLIK KONTROLÜ: Soğuk ortamda çalışın
• 🧲 MANYETİK ÇUBUK: Temiz ve pürüzsüz olmalı

💎 MASTER PARFÜMÖR MARKA KLONLAMA TAVSİYELERİ:
[Seçilen marka parfümlerin karakteristiğini korumak için özel teknikler]

📈 BEKLENEN MARKA PARFÜM PERFORMANSİ:
🕐 Kalıcılık: 8-12 saat
📏 Sillaj: Yüksek seviye
👃 Karakter Benzerliği: %85-95 oranında
📏 Toplam hacim: ${perfumeVolume}ml

🎯 MARKA PARFÜM KARAKTER ANALİZİ:
[Seçilen esansların hangi marka parfüm karakteristiklerini yansıttığı]

UYARI: Matematik kesinlikle doğru olmalı! Toplam ${perfumeVolume}ml, su yok!

Türkçe yanıtla. Her ölçümü ML olarak net ver. Matematik %100 doğru olsun.
`;

    console.log('🚀 OpenAI API çağrısı yapılıyor...');
    console.log('📊 Prompt hazırlandı, character count:', prompt.length);
    console.log('🎯 Model: gpt-3.5-turbo');
    
    try {
      console.log('⏳ OpenAI API request başlatılıyor...');
      
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

      console.log('✅ OpenAI API BAŞARILI yanıt aldı!');
      console.log('🔍 Response choice count:', completion.choices?.length || 0);
      console.log('⚡ Usage tokens:', completion.usage?.total_tokens || 'unknown');
      
      const recipe = completion.choices[0]?.message?.content || 'Reçete üretilemedi, lütfen tekrar deneyin.';
      console.log('📏 Recipe length:', recipe.length);
      console.log('🎉 GERÇEK OPENAI REÇETESİ döndürülüyor!');

      console.log('📤 OpenAI response gönderiliyor...');
      return NextResponse.json({ recipe });
      
    } catch (openaiApiError: unknown) {
      console.error('💥 OpenAI API Internal Error:', openaiApiError);
      console.error('🔍 Error details:', {
        message: openaiApiError instanceof Error ? openaiApiError.message : 'Unknown error',
        name: openaiApiError instanceof Error ? openaiApiError.name : 'Unknown'
      });
      
      // OpenAI API hatası durumunda demo reçete döndür
      console.log('❌ OpenAI API failed, returning demo recipe as fallback');
      return NextResponse.json({ 
        recipe: generateDemoRecipe(ingredients, gender, season, dominantScent, perfumeVolume) + '\n\n🚨 OpenAI API ERROR: Yukarıdaki reçete demo versiyon - gerçek AI yanıtı alınamadı!'
      });
    }

  } catch (error: unknown) {
    console.error('💥 API Error:', error);
    
    // Quota hatası veya diğer API hataları için demo reçete döndür
    const apiError = error as { status?: number; code?: string };
    if (apiError?.status === 429 || apiError?.code === 'insufficient_quota') {
      console.log('❌ OpenAI quota exceeded, returning demo recipe');
      return NextResponse.json({ 
        recipe: generateDemoRecipe(ingredients, gender, season, dominantScent, perfumeVolume)
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