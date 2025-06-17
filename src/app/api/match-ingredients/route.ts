import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { selectedEssences, availableIngredients, gender, season, dominantScent } = await req.json();

    if (!selectedEssences || selectedEssences.length === 0) {
      return NextResponse.json({ error: 'Esans seçimi gerekli' }, { status: 400 });
    }

    // Fallback response for quota issues
    const fallbackResponse = {
      recommendedIngredients: [
        "Sandal Ağacı", "Vetiver", "Bergamot Kabuğu", "Vanilya Çubuğu"
      ],
      explanation: "Demo hammade önerileri"
    };

    // API anahtarı kontrolü
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API anahtarı bulunamadı, fallback response döndürülüyor');
      return NextResponse.json(fallbackResponse);
    }

    try {
      const essenceNames = selectedEssences.map((e: any) => e.name).join(', ');
      const availableNames = availableIngredients.map((i: any) => i.name).join(', ');

      const prompt = `Sen profesyonel bir parfümörsün. Aşağıdaki bilgilere göre uygun hammade önerileri yap:

SEÇILEN ESANSLAR: ${essenceNames}

MEVCUT HAMMADELER: ${availableNames}

TERCIHLER:
- Cinsiyet: ${gender}
- Mevsim: ${season}
- Baskın Koku: ${dominantScent}

GÖREV:
1. Seçilen esanslarla uyumlu 3-5 hammade öner
2. Sadece mevcut hammadeler listesinden seç
3. Parfüm notası piramidini (üst-kalp-dip notalar) göz önüne al
4. Cinsiyet, mevsim ve baskın koku tercihlerini dikkate al

CEVAP FORMATINI KESINLIKLE BU ŞEKİLDE VER:
ÖNERILEN_HAMMADELER: [hammade1, hammade2, hammade3, vb.]
AÇIKLAMA: Neden bu hammadeleri önerdim

Sadece mevcut hammadeler listesindeki isimleri kullan!`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Sen 20+ yıl deneyimli master parfümörsün. Esans ve hammade eşleştirmelerinde uzmansın."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Response'dan hammade listesini çıkar
      const ingredientMatch = response.match(/ÖNERILEN_HAMMADELER:\s*\[(.*?)\]/);
      const explanationMatch = response.match(/AÇIKLAMA:\s*([\s\S]*?)$/m);
      
      let recommendedIngredients: string[] = [];
      
      if (ingredientMatch) {
        recommendedIngredients = ingredientMatch[1]
          .split(',')
          .map(item => item.trim().replace(/['"]/g, ''))
          .filter(item => item.length > 0);
      }

      // Eğer format doğru değilse, fallback kullan
      if (recommendedIngredients.length === 0) {
        console.log('OpenAI response formatı hatalı, fallback kullanılıyor');
        return NextResponse.json(fallbackResponse);
      }

      return NextResponse.json({
        recommendedIngredients,
        explanation: explanationMatch ? explanationMatch[1].trim() : 'Hammade önerileri hazırlandı'
      });

    } catch (openaiError: any) {
      console.error('OpenAI API hatası:', openaiError);
      
      // Quota veya başka API hatası durumunda fallback döndür
      if (openaiError.status === 429 || openaiError.status === 401) {
        console.log('OpenAI quota aşıldı veya auth hatası, fallback response döndürülüyor');
        return NextResponse.json(fallbackResponse);
      }
      
      throw openaiError;
    }

  } catch (error) {
    console.error('Hammade eşleştirme hatası:', error);
    return NextResponse.json(
      { error: 'Hammade eşleştirmesi başarısız oldu' },
      { status: 500 }
    );
  }
} 