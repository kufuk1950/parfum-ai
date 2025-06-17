import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface EssenceInput {
  name: string;
  type: string;
  category?: string;
}

interface IngredientInput {
  name: string;
  type: string;
  category?: string;
}

export async function POST(req: NextRequest) {
  console.log('🔍 Match Ingredients API çağrıldı');
  
  try {
    const { selectedEssences, availableIngredients, gender, season, dominantScent } = await req.json();
    
    console.log('📋 Request data:', {
      selectedEssences: selectedEssences?.map((e: EssenceInput) => e.name),
      availableIngredients: availableIngredients?.length,
      gender,
      season,
      dominantScent
    });

    if (!selectedEssences || selectedEssences.length === 0) {
      console.log('❌ Esans seçimi yok');
      return NextResponse.json({ error: 'Esans seçimi gerekli' }, { status: 400 });
    }

    // Akıllı fallback - marka parfüm esanslarına göre hammade öner
    const createSmartFallback = (essences: Array<{name: string}>) => {
      const essenceNames = essences.map(e => e.name.toLowerCase());
      const availableHammades = availableIngredients.map((ing: {name: string}) => ing.name);
      
      // Marka parfüm esanslarına göre uygun hammadeler
      const recommendations: string[] = [];
      
      // Çiçeksi parfüm esansları için (Miss Dior, Chanel No5, vb.)
      if (essenceNames.some(name => 
        name.includes('dior') || name.includes('chanel') || name.includes('gül') || 
        name.includes('jasmine') || name.includes('lavanta') || name.includes('çiçek')
      )) {
        if (availableHammades.includes('Gül Yaprakları')) recommendations.push('Gül Yaprakları');
        if (availableHammades.includes('Jasmine Petalleri')) recommendations.push('Jasmine Petalleri');
        if (availableHammades.includes('Lavanta Çiçekleri')) recommendations.push('Lavanta Çiçekleri');
      }
      
      // Odunsu/Oriental parfüm esansları için (Tom Ford, Yves Saint Laurent, vb.)
      if (essenceNames.some(name => 
        name.includes('tom ford') || name.includes('ysl') || name.includes('opium') || 
        name.includes('sandal') || name.includes('misk') || name.includes('oud') || name.includes('oriental')
      )) {
        if (availableHammades.includes('Sandal Ağacı')) recommendations.push('Sandal Ağacı');
        if (availableHammades.includes('Patchouli Yaprakları')) recommendations.push('Patchouli Yaprakları');
      }
      
      // Fresh/Sporty parfüm esansları için (Armani, Versace, vb.)
      if (essenceNames.some(name => 
        name.includes('armani') || name.includes('versace') || name.includes('fresh') || 
        name.includes('bergamot') || name.includes('limon') || name.includes('sport')
      )) {
        if (availableHammades.includes('Bergamot Kabuğu')) recommendations.push('Bergamot Kabuğu');
      }
      
      // Gourmand parfüm esansları için (Thierry Mugler, Jean Paul Gaultier, vb.)
      if (essenceNames.some(name => 
        name.includes('mugler') || name.includes('gaultier') || name.includes('euphoria') || 
        name.includes('vanilya') || name.includes('chocolate') || name.includes('caramel')
      )) {
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

    // OpenAI API anahtarı kontrolü
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔑 OpenAI API Key exists:', !!apiKey);
    console.log('🔑 OpenAI API Key length:', apiKey?.length || 0);
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your-openai-api-key-here') {
      console.log('❌ OpenAI API anahtarı geçersiz, akıllı fallback kullanılıyor');
      const smartRecommendations = createSmartFallback(selectedEssences);
      return NextResponse.json({
        recommendedIngredients: smartRecommendations,
        explanation: `Seçilen marka parfüm esanslarıyla uyumlu ${smartRecommendations.length} hammade önerisi (Demo mod)`
      });
    }

    try {
      console.log('🤖 OpenAI client oluşturuluyor...');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const essenceNames = selectedEssences.map((e: { name: string }) => e.name).join(', ');
      const availableNames = availableIngredients.map((i: { name: string }) => i.name).join(', ');

      console.log('📝 Essences:', essenceNames);
      console.log('🌿 Available hammades:', availableNames);

      const prompt = `Sen 20+ yıl deneyimli bir master parfümör ve marka parfüm uzmanısın. Euphoria, Miss Dior, Tom Ford gibi marka parfümlerin kompozisyonlarını biliyorsun.

SEÇILEN MARKA PARFÜM ESANSLARI: ${essenceNames}

MEVCUT HAMMADELER: ${availableNames}

TERCIHLER:
- Cinsiyet: ${gender}
- Mevsim: ${season}
- Baskın Koku: ${dominantScent}

MARKA PARFÜM REVERSİNG KURALLARI:
1. Seçilen marka parfüm esansının orijinal kompozisyonunu analiz et
2. Bu parfümün karakterini oluşturan temel hammadeleri belirle
3. Mevcut hammadeler listesinden en yakın alternatifleri seç
4. Top-Heart-Base nota piramidini koruyarak hammade kombinasyonu öner

ÖRNEK ANALİZ:
- "Euphoria Esansı" → Gourmand, Oriental karakter → Vanilya Çubuğu, Patchouli Yaprakları öner
- "Miss Dior Esansı" → Çiçeksi, Feminen → Gül Yaprakları, Jasmine Petalleri öner
- "Tom Ford Esansı" → Odunsu, Maskülen → Sandal Ağacı, Patchouli Yaprakları öner

ZORUNLU FORMAT:
ÖNERILEN_HAMMADELER: [Hammade1, Hammade2, Hammade3, Hammade4]
AÇIKLAMA: Seçilen marka parfümün karakterini yakalamak için bu hammadeleri seçtim çünkü...

SADECE MEVCUT HAMMADELER LİSTESİNDEKİ İSİMLERİ KULLAN!`;

      console.log('🚀 OpenAI API çağrısı yapılıyor...');
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Sen 20+ yıl deneyimli master parfümörsün. Marka parfümlerin kompozisyonlarını analiz edip, hammade eşleştirmelerinde uzmansın. Parfüm reverse engineering konusunda ekspersin."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.6,
      });

      console.log('✅ OpenAI API yanıt aldı');
      const response = completion.choices[0]?.message?.content || '';
      console.log('📝 OpenAI response:', response);
      
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
        console.log('❌ OpenAI response formatı hatalı, akıllı fallback kullanılıyor');
        const smartRecommendations = createSmartFallback(selectedEssences);
        return NextResponse.json({
          recommendedIngredients: smartRecommendations,
          explanation: `Seçilen marka parfüm esanslarıyla uyumlu ${smartRecommendations.length} hammade önerisi (Akıllı fallback)`
        });
      }

      console.log('✅ Başarılı response döndürülüyor');
      return NextResponse.json({
        recommendedIngredients,
        explanation: explanationMatch ? explanationMatch[1].trim() : 'Marka parfüm esanslarına uygun hammade önerileri AI tarafından hazırlandı'
      });

    } catch (openaiError: unknown) {
      console.error('💥 OpenAI API hatası:', openaiError);
      
      // Quota veya başka API hatası durumunda akıllı fallback döndür
      const apiError = openaiError as { status?: number; code?: string };
      if (apiError.status === 429 || apiError.code === 'insufficient_quota') {
        console.log('❌ OpenAI quota aşıldı, akıllı fallback kullanılıyor');
        const smartRecommendations = createSmartFallback(selectedEssences);
        return NextResponse.json({
          recommendedIngredients: smartRecommendations,
          explanation: `Seçilen marka parfüm esanslarıyla uyumlu ${smartRecommendations.length} hammade önerisi (Quota aşıldı)`
        });
      }
      
      throw openaiError;
    }

  } catch (error) {
    console.error('💥 Hammade eşleştirme hatası:', error);
    return NextResponse.json(
      { error: 'Hammade eşleştirmesi başarısız oldu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') },
      { status: 500 }
    );
  }
} 