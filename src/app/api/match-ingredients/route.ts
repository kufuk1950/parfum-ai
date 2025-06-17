import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    // GROQ API anahtarı kontrolü
    if (!process.env.GROQ_API_KEY) {
      console.log('GROQ API anahtarı bulunamadı, fallback response döndürülüyor');
      return NextResponse.json(fallbackResponse);
    }

    try {
      // GROQ client'ı burada initialize et
      const openai = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });

      const essenceNames = selectedEssences.map((e: { name: string }) => e.name).join(', ');
      const availableNames = availableIngredients.map((i: { name: string }) => i.name).join(', ');

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
        model: "llama-3.1-8b-instant",
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
          .map((item: string) => item.trim().replace(/['"]/g, ''))
          .filter((item: string) => item.length > 0);
      }

      // Eğer format doğru değilse, fallback kullan
      if (recommendedIngredients.length === 0) {
        console.log('GROQ response formatı hatalı, fallback kullanılıyor');
        return NextResponse.json(fallbackResponse);
      }

      return NextResponse.json({
        recommendedIngredients,
        explanation: explanationMatch ? explanationMatch[1].trim() : 'Hammade önerileri hazırlandı'
      });

    } catch (groqError: unknown) {
      console.error('GROQ API hatası:', groqError);
      
      // Quota veya başka API hatası durumunda fallback döndür
      const apiError = groqError as { status?: number };
      if (apiError.status === 429 || apiError.status === 401) {
        console.log('GROQ quota aşıldı veya auth hatası, fallback response döndürülüyor');
        return NextResponse.json(fallbackResponse);
      }
      
      throw groqError;
    }

  } catch (error) {
    console.error('Hammade eşleştirme hatası:', error);
    return NextResponse.json(
      { error: 'Hammade eşleştirmesi başarısız oldu' },
      { status: 500 }
    );
  }
} 