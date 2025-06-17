import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

interface Ingredient {
  id: string;
  name: string;
  type: 'hammade' | 'esans';
  category: string;
}

export async function POST(request: NextRequest) {
  console.log('🍃 Generate Recipe API çağrıldı');
  
  try {
    const body = await request.json();
    console.log('📝 Request body:', JSON.stringify(body, null, 2));
    
    const { ingredients, gender, season, dominantScent } = body;

    if (!ingredients || ingredients.length === 0) {
      console.log('❌ Malzeme listesi boş!');
      return NextResponse.json(
        { error: 'En az bir malzeme seçmelisiniz' },
        { status: 400 }
      );
    }

    console.log('🔑 GROQ API Key check:', process.env.GROQ_API_KEY ? 'Var' : 'YOK!');
    
    if (!process.env.GROQ_API_KEY) {
      console.log('❌ GROQ_API_KEY environment variable yok!');
      return NextResponse.json(
        { error: 'API anahtarı bulunamadı' },
        { status: 500 }
      );
    }

    console.log('🤖 GROQ client oluşturuluyor...');
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    console.log('📋 Prompt hazırlanıyor...');
    const ingredientList = ingredients.map((ing: Ingredient) => 
      `${ing.name} (${ing.type === 'hammade' ? 'Hammade' : 'Esans'})`
    ).join(', ');

    const prompt = `Sen bir parfüm uzmanısın. Aşağıdaki bilgilere göre detaylı bir parfüm reçetesi oluştur:

Malzemeler: ${ingredientList}
Cinsiyet: ${gender}
Mevsim: ${season}
Baskın Koku: ${dominantScent}

Lütfen aşağıdaki formatta bir reçete oluştur:
1. Üst Notalar (ilk 15 dakika): Hangi malzemeler ve oranları
2. Kalp Notaları (15 dakika - 4 saat): Hangi malzemeler ve oranları  
3. Dip Notalar (4+ saat): Hangi malzemeler ve oranları
4. Karıştırma Talimatları: Adım adım nasıl hazırlanacağı
5. Olgunlaşma Süresi: Ne kadar bekletilmesi gerektiği
6. Kullanım Önerileri: Hangi durumlarda kullanılacağı

Reçeteyi Türkçe ve anlaşılır bir dilde yaz.`;

    console.log('🚀 GROQ API çağrısı yapılıyor...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    console.log('✅ GROQ API yanıt aldı');
    const recipe = chatCompletion.choices[0]?.message?.content || 'Reçete oluşturulamadı';

    console.log('📤 Response gönderiliyor...');
    return NextResponse.json({ recipe });

  } catch (error) {
    console.error('💥 Generate Recipe API Hatası:', error);
    console.error('💥 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { error: 'Reçete oluşturulurken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') },
      { status: 500 }
    );
  }
} 