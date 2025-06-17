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

🔬 MARKA PARFÜM HAZIRLAMA ADIMLARİ:

1. 📊 ÖLÇÜM AŞAMASI:
   - Tüm malzemeleri hassas terazide ölçün
   - Cam malzemeler kullanın

2. 💫 MARKA ESANS KARIŞIMI:
   - Önce marka parfüm esanslarını karıştırın
   - Destekleyici hammadeleri yavaşça ilave edin
   - Etil alkolü damla damla ekleyin
   - 5 dakika karıştırın

3. 🕐 OLGUNLAŞTIRMA:
   - Kapalı cam şişede 2-4 hafta bekletin
   - Hafifçe çalkalayın

💡 MARKA PARFÜM TAVSİYELERİ:

• 🌡️ SICAKLIK: Oda sıcaklığında (18-22°C) çalışın
• 🧼 HİJYEN: Tüm araçları önce alkolla temizleyin  
• 🌞 IŞIK: Direkt güneş ışığından uzak tutun
• 📦 SAKLAMA: Koyu renkli cam şişe kullanın

🎯 BEKLENİLEN SONUÇ:

Bu reçete ${genderChars[gender]} karakterde, ${season} mevsimi için ${seasonChars[season]} bir parfüm üretecektir.

${dominantScent ? `🌟 Baskın koku profili: ${dominantScent}` : ''}
🔢 Toplam malzeme sayısı: ${ingredients.length}
⏱️ Kalıcılık: 8-12 saat  
🌊 Sillaj: Yüksek seviye
📏 Toplam hacim: ${totalVolume}ml

📝 NOT: Matematik %100 doğru - Su kullanılmıyor, sadece alkol çözücü!
OpenAI API sorunu nedeniyle demo versiyon gösterilmektedir.`;
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
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your-openai-api-key-here') {
      console.log('❌ OpenAI API Key invalid, returning demo recipe');
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

🔬 MARKA PARFÜM KLONLAMA TEKNİĞİ:

ADIM 1 - Marka Esans Hazırlığı:
[Marka parfüm esanslarının doğru oranlarla karıştırılması]

ADIM 2 - Hammade Desteği:
[Destekleyici hammadelerin eklenmesi]

ADIM 3 - Alkol Entegrasyonu:
[Etil alkolün dikkatli eklenmesi]

ADIM 4 - Olgunlaştırma:
[2-4 hafta olgunlaştırma süreci]

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
        recipe: generateDemoRecipe(ingredients, gender, season, dominantScent, perfumeVolume)
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