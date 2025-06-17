import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  console.log('🔍 Match Ingredients API çağrıldı');
  
  try {
    const { selectedEssences, availableIngredients, gender, season, dominantScent } = await req.json();
    
    console.log('📋 Request data:', {
      selectedEssences: selectedEssences?.map((e: any) => e.name),
      availableIngredients: availableIngredients?.length,
      gender,
      season,
      dominantScent
    });

    if (!selectedEssences || selectedEssences.length === 0) {
      console.log('❌ Esans seçimi yok');
      return NextResponse.json({ error: 'Esans seçimi gerekli' }, { status: 400 });
    }

    // Akıllı fallback - seçilen esansa göre hammade öner
    const createSmartFallback = (essences: any[]) => {
      const essenceNames = essences.map(e => e.name.toLowerCase());
      const availableHammades = availableIngredients.map((ing: any) => ing.name);
      
      // Esans tipine göre uygun hammadeler
      const recommendations: string[] = [];
      
      // Çiçeksi esanslar için
      if (essenceNames.some(name => name.includes('gül') || name.includes('jasmine') || name.includes('lavanta'))) {
        if (availableHammades.includes('Gül Yaprakları')) recommendations.push('Gül Yaprakları');
        if (availableHammades.includes('Jasmine Petalleri')) recommendations.push('Jasmine Petalleri');
        if (availableHammades.includes('Lavanta Çiçekleri')) recommendations.push('Lavanta Çiçekleri');
      }
      
      // Odunsu esanslar için
      if (essenceNames.some(name => name.includes('sandal') || name.includes('misk'))) {
        if (availableHammades.includes('Sandal Ağacı')) recommendations.push('Sandal Ağacı');
        if (availableHammades.includes('Patchouli Yaprakları')) recommendations.push('Patchouli Yaprakları');
      }
      
      // Narenciye esanslar için
      if (essenceNames.some(name => name.includes('bergamot') || name.includes('limon'))) {
        if (availableHammades.includes('Bergamot Kabuğu')) recommendations.push('Bergamot Kabuğu');
      }
      
      // Baharat esanslar için
      if (essenceNames.some(name => name.includes('vanilya'))) {
        if (availableHammades.includes('Vanilya Çubuğu')) recommendations.push('Vanilya Çubuğu');
      }
      
      // Minimum 3 hammade garantisi
      while (recommendations.length < 3) {
        const remaining = availableHammades.filter((h: string) => !recommendations.includes(h));
        if (remaining.length > 0) {
          recommendations.push(remaining[0]);
        } else {
          break;
        }
      }
      
      return recommendations.slice(0, 4); // Max 4 öneri
    };

    // GROQ API anahtarı kontrolü
    const apiKey = process.env.GROQ_API_KEY;
    console.log('🔑 GROQ API Key exists:', !!apiKey);
    console.log('🔑 GROQ API Key length:', apiKey?.length || 0);
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your-groq-api-key-here') {
      console.log('❌ GROQ API anahtarı geçersiz, akıllı fallback kullanılıyor');
      const smartRecommendations = createSmartFallback(selectedEssences);
      return NextResponse.json({
        recommendedIngredients: smartRecommendations,
        explanation: `Seçilen esanslarla uyumlu ${smartRecommendations.length} hammade önerisi (Demo mod)`
      });
    }

    try {
      console.log('🤖 GROQ client oluşturuluyor...');
      const openai = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });

      const essenceNames = selectedEssences.map((e: { name: string }) => e.name).join(', ');
      const availableNames = availableIngredients.map((i: { name: string }) => i.name).join(', ');

      console.log('📝 Essences:', essenceNames);
      console.log('🌿 Available hammades:', availableNames);

      const prompt = `Sen 20+ yıl deneyimli bir parfümör master'ısın. Seçilen esanslarla mükemmel uyum sağlayacak hammadeleri seçmen gerekiyor.

SEÇILEN ESANSLAR: ${essenceNames}

MEVCUT HAMMADELER: ${availableNames}

TERCIHLER:
- Cinsiyet: ${gender}
- Mevsim: ${season}
- Baskın Koku: ${dominantScent}

PARFÜM KIMYA KURALLARI:
1. Esanslar ile hammadeler arasında kimyasal uyum olmalı
2. Seçilen esansların karakterini destekleyen hammadeler seç
3. Top-Heart-Base nota piramidini destekle
4. Cinsiyet karakteristiğini güçlendir
5. Mevsim özelliklerini vurgula

ÖRNEK: Gül Esansı seçildiyse → Gül Yaprakları, Jasmine Petalleri gibi çiçeksi hammadeler seç
ÖRNEK: Sandal Esansı seçildiyse → Sandal Ağacı, Patchouli Yaprakları gibi odunsu hammadeler seç

ZORUNLU FORMAT:
ÖNERILEN_HAMMADELER: [Hammade1, Hammade2, Hammade3, Hammade4]
AÇIKLAMA: Neden bu hammadeleri seçtim?

SADECE MEVCUT HAMMADELER LİSTESİNDEKİ İSİMLERİ KULLAN!`;

      console.log('🚀 GROQ API çağrısı yapılıyor...');
      const completion = await openai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Sen 20+ yıl deneyimli master parfümörsün. Esans ve hammade eşleştirmelerinde uzmansın. Kimyasal uyum ve nota piramidi konusunda ekspersin."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.6,
      });

      console.log('✅ GROQ API yanıt aldı');
      const response = completion.choices[0]?.message?.content || '';
      console.log('📝 GROQ response:', response);
      
      // Response'dan hammade listesini çıkar
      const ingredientMatch = response.match(/ÖNERILEN_HAMMADELER:\s*\[(.*?)\]/);
      const explanationMatch = response.match(/AÇIKLAMA:\s*([\s\S]*?)$/m);
      
      let recommendedIngredients: string[] = [];
      
      if (ingredientMatch) {
        recommendedIngredients = ingredientMatch[1]
          .split(',')
          .map((item: string) => item.trim().replace(/['"]/g, ''))
          .filter((item: string) => item.length > 0);
      }

      console.log('🎯 Parsed recommendations:', recommendedIngredients);

      // Eğer format doğru değilse, akıllı fallback kullan
      if (recommendedIngredients.length === 0) {
        console.log('❌ GROQ response formatı hatalı, akıllı fallback kullanılıyor');
        const smartRecommendations = createSmartFallback(selectedEssences);
        return NextResponse.json({
          recommendedIngredients: smartRecommendations,
          explanation: `Seçilen esanslarla uyumlu ${smartRecommendations.length} hammade önerisi (Akıllı fallback)`
        });
      }

      console.log('✅ Başarılı response döndürülüyor');
      return NextResponse.json({
        recommendedIngredients,
        explanation: explanationMatch ? explanationMatch[1].trim() : 'Hammade önerileri AI tarafından hazırlandı'
      });

    } catch (groqError: unknown) {
      console.error('💥 GROQ API hatası:', groqError);
      
      // Quota veya başka API hatası durumunda akıllı fallback döndür
      const apiError = groqError as { status?: number; code?: string };
      if (apiError.status === 429 || apiError.code === 'insufficient_quota') {
        console.log('❌ GROQ quota aşıldı, akıllı fallback kullanılıyor');
        const smartRecommendations = createSmartFallback(selectedEssences);
        return NextResponse.json({
          recommendedIngredients: smartRecommendations,
          explanation: `Seçilen esanslarla uyumlu ${smartRecommendations.length} hammade önerisi (Quota aşıldı)`
        });
      }
      
      throw groqError;
    }

  } catch (error) {
    console.error('💥 Hammade eşleştirme hatası:', error);
    return NextResponse.json(
      { error: 'Hammade eşleştirmesi başarısız oldu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') },
      { status: 500 }
    );
  }
} 