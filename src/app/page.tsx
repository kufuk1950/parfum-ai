'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Plus, Trash2, Sparkles, Save, FlaskConical, Eye, Info, Image, LogOut, User } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Transition } from '@headlessui/react';
import { useParfumData } from '../../hooks/useParfumData';
import AuthModal from '../../components/AuthModal';

interface Ingredient {
  id: string;
  name: string;
  type: 'hammade' | 'esans';
  category: string;
  isCustom?: boolean;
  description?: string;
  purpose?: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  gender: 'kadın' | 'erkek' | 'unisex';
  season: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış';
  dominantScent: string;
  recipe: string;
  perfumeVolume?: 50 | 100;
  createdAt: Date;
}

// Default ingredients
const DEFAULT_INGREDIENTS = {
  hammadeler: [
    { id: 'h1', name: 'Gül Yaprakları', type: 'hammade' as const, category: 'çiçek', isCustom: false, description: 'Doğal gül yaprakları, romantik ve feminen koku', purpose: 'Temel çiçeksi nota, kalp notası' },
    { id: 'h2', name: 'Lavanta Çiçekleri', type: 'hammade' as const, category: 'çiçek', isCustom: false, description: 'Sakinleştirici lavanta çiçekleri', purpose: 'Rahatlatıcı etki, üst nota' },
    { id: 'h3', name: 'Bergamot Kabuğu', type: 'hammade' as const, category: 'narenciye', isCustom: false, description: 'Taze ve canlandırıcı bergamot kabuğu', purpose: 'Üst nota, serinletici etki' },
    { id: 'h4', name: 'Vanilya Çubuğu', type: 'hammade' as const, category: 'baharat', isCustom: false, description: 'Sıcak ve tatlı vanilya çubuğu', purpose: 'Dip nota, sıcaklık ve derinlik' },
    { id: 'h5', name: 'Sandal Ağacı', type: 'hammade' as const, category: 'odunsu', isCustom: false, description: 'Kremal ve yumuşak sandal ağacı', purpose: 'Dip nota, odunsu karakter' },
    { id: 'h6', name: 'Jasmine Petalleri', type: 'hammade' as const, category: 'çiçek', isCustom: false, description: 'Yoğun ve intoksikan jasmine petalleri', purpose: 'Kalp notası, feminen karakter' },
    { id: 'h7', name: 'Patchouli Yaprakları', type: 'hammade' as const, category: 'odunsu', isCustom: false, description: 'Toprak kokusu veren patchouli yaprakları', purpose: 'Dip nota, doğal karakter' }
  ],
  esanslar: [
    { id: 'e1', name: 'Gül Esansı', type: 'esans' as const, category: 'çiçek', isCustom: false, description: 'Damıtılmış gül esansı, yoğun çiçeksi koku', purpose: 'Ana kalp notası, romantik etki' },
    { id: 'e2', name: 'Lavanta Esansı', type: 'esans' as const, category: 'çiçek', isCustom: false, description: 'Saf lavanta esansı, rahatlatıcı', purpose: 'Üst nota, temizlik hissi' },
    { id: 'e3', name: 'Bergamot Esansı', type: 'esans' as const, category: 'narenciye', isCustom: false, description: 'Earl Grey çayında kullanılan bergamot esansı', purpose: 'Üst nota, fresh başlangıç' },
    { id: 'e4', name: 'Vanilya Esansı', type: 'esans' as const, category: 'baharat', isCustom: false, description: 'Konsantre vanilya esansı, tatlı ve sıcak', purpose: 'Dip nota, kalıcı tatlılık' },
    { id: 'e5', name: 'Sandal Esansı', type: 'esans' as const, category: 'odunsu', isCustom: false, description: 'Mistik sandal ağacı esansı', purpose: 'Dip nota, meditasyon hissi' },
    { id: 'e6', name: 'Jasmine Esansı', type: 'esans' as const, category: 'çiçek', isCustom: false, description: 'Gece blooming jasmine esansı', purpose: 'Kalp notası, gece parfümü' },
    { id: 'e7', name: 'Misk Esansı', type: 'esans' as const, category: 'animal', isCustom: false, description: 'Sentetik misk esansı, hayvansal nota', purpose: 'Dip nota, sensüel etki' }
  ]
};

// Dominant scents
const DOMINANT_SCENTS = [
  'Çiçeksi', 'Odunsu', 'Narenciye', 'Oryantal', 'Taze', 'Baharatlı', 'Meyve', 'Yeşil'
];

export default function ParfumAI() {
  // Supabase authentication hook
  const {
    user,
    isLoading,
    isAuthenticated,
    savedRecipes,
    customIngredients,
    hiddenIngredients,
    saveRecipe: saveRecipeToStore,
    deleteRecipe: deleteRecipeFromStore,
    addCustomIngredient: addCustomIngredientToStore,
    deleteCustomIngredient: deleteCustomIngredientFromStore,
    hideDefaultIngredient: hideDefaultIngredientInStore,
    signOut
  } = useParfumData();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipeForView, setSelectedRecipeForView] = useState<Recipe | null>(null);
  
  // Form states
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [gender, setGender] = useState<'kadın' | 'erkek' | 'unisex'>('kadın');
  const [season, setSeason] = useState<'ilkbahar' | 'yaz' | 'sonbahar' | 'kış'>('ilkbahar');
  const [dominantScent, setDominantScent] = useState('');
  const [perfumeVolume, setPerfumeVolume] = useState<50 | 100>(50);
  const [generatedRecipe, setGeneratedRecipe] = useState('');
  const [newRecipeName, setNewRecipeName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  // Custom ingredient states
  const [showHammadeInput, setShowHammadeInput] = useState(false);
  const [showEsansInput, setShowEsansInput] = useState(false);
  const [newHammadeName, setNewHammadeName] = useState('');
  const [newHammadeDescription, setNewHammadeDescription] = useState('');
  const [newHammadePurpose, setNewHammadePurpose] = useState('');
  const [newEsansName, setNewEsansName] = useState('');
  const [newEsansDescription, setNewEsansDescription] = useState('');
  const [newEsansPurpose, setNewEsansPurpose] = useState('');

  // Client-side hydration
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Authentication state değişimlerini izle
  useEffect(() => {
    console.log('🔄 Auth state değişti:', { isAuthenticated, user: user?.email, isLoading, isClient });
    
    if (isAuthenticated && user && isClient && !isLoading) {
      console.log('🎯 TÜM KOŞULLAR SAĞLANDI! Ana sayfaya geçmeliydik...')
      console.log('   ✅ isAuthenticated:', isAuthenticated)
      console.log('   ✅ user:', user.email)
      console.log('   ✅ isClient:', isClient)
      console.log('   ✅ !isLoading:', !isLoading)
    }
  }, [isAuthenticated, user, isLoading, isClient]);

  // Loading state
  if (isLoading || !isClient) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-purple-50 to-pink-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Parfüm AI Yükleniyor...</h2>
          <p className="text-gray-600 mt-2">Güvenli bağlantı kuruluyor...</p>
        </div>
      </div>
    );
  }

  // Authentication required - show login modal
  if (!isAuthenticated) {
  return (
      <div className="flex h-screen bg-gradient-to-br from-purple-50 to-pink-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Parfüm AI</h1>
          <p className="text-gray-600 mb-8">Yapay zeka ile parfüm reçetesi oluşturun</p>
        </div>
        
        {/* Login Modal - Always visible when not authenticated */}
        <AuthModal
          isOpen={true}
          onClose={() => {
            console.log('🚪 AuthModal onClose çağrıldı - bu çalışmamalı')
          }} // No close option - login required
        />
      </div>
    );
  }

  // Tüm malzemeleri birleştir (hidden olanları filtrele)
  const allIngredients = {
    hammadeler: [
      ...DEFAULT_INGREDIENTS.hammadeler.filter(ing => !hiddenIngredients.includes(ing.id)), 
      ...customIngredients.filter(ing => ing.type === 'hammade')
    ],
    esanslar: [
      ...DEFAULT_INGREDIENTS.esanslar.filter(ing => !hiddenIngredients.includes(ing.id)), 
      ...customIngredients.filter(ing => ing.type === 'esans')
    ]
  };

  const addIngredient = (ingredient: Ingredient) => {
    if (!selectedIngredients.find(item => item.id === ingredient.id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(selectedIngredients.filter(item => item.id !== ingredientId));
  };

  const addCustomHammade = async () => {
    if (newHammadeName.trim()) {
      const newIngredient = {
        name: newHammadeName.trim(),
        type: 'hammade' as const,
        category: 'özel',
        isCustom: true,
        description: newHammadeDescription.trim() || 'Özel hammade malzemesi',
        purpose: newHammadePurpose.trim() || 'Özel amaç'
      };
      
      try {
        await addCustomIngredientToStore(newIngredient);
        setNewHammadeName('');
        setNewHammadeDescription('');
        setNewHammadePurpose('');
        setShowHammadeInput(false);
      } catch (error) {
        console.error('Error adding custom ingredient:', error);
        alert('Malzeme eklenirken bir hata oluştu.');
      }
    }
  };

  const addCustomEsans = async () => {
    if (newEsansName.trim()) {
      const newIngredient = {
        name: newEsansName.trim(),
        type: 'esans' as const,
        category: 'özel',
        isCustom: true,
        description: newEsansDescription.trim() || 'Özel esans malzemesi',
        purpose: newEsansPurpose.trim() || 'Özel amaç'
      };

      try {
        await addCustomIngredientToStore(newIngredient);
        setNewEsansName('');
        setNewEsansDescription('');
        setNewEsansPurpose('');
        setShowEsansInput(false);
      } catch (error) {
        console.error('Error adding custom ingredient:', error);
        alert('Malzeme eklenirken bir hata oluştu.');
      }
    }
  };

  const deleteCustomIngredient = async (ingredientId: string) => {
    try {
      await deleteCustomIngredientFromStore(ingredientId);
      setSelectedIngredients(selectedIngredients.filter(ing => ing.id !== ingredientId));
    } catch (error) {
      console.error('Error deleting custom ingredient:', error);
      alert('Malzeme silinirken bir hata oluştu.');
    }
  };

  const deleteDefaultIngredient = async (ingredientId: string) => {
    try {
      await hideDefaultIngredientInStore(ingredientId);
      setSelectedIngredients(selectedIngredients.filter(ing => ing.id !== ingredientId));
    } catch (error) {
      console.error('Error hiding ingredient:', error);
      alert('Malzeme gizlenirken bir hata oluştu.');
    }
  };

  const matchIngredientsWithEssence = async () => {
    const selectedEssences = selectedIngredients.filter(ing => ing.type === 'esans');
    
    console.log('🔍 Match Ingredients başlatıldı');
    console.log('🌸 Seçilen esanslar:', selectedEssences.map(e => e.name));
    
    if (selectedEssences.length === 0) {
      alert('Lütfen önce en az bir esans seçin!');
      return;
    }

    setIsMatching(true);
    try {
      console.log('📤 API çağrısı gönderiliyor...');
      const response = await fetch('/api/match-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedEssences: selectedEssences,
          availableIngredients: allIngredients.hammadeler,
          gender,
          season,
          dominantScent
        }),
      });

      if (!response.ok) {
        console.error('❌ API response not ok:', response.status, response.statusText);
        throw new Error('API çağrısında hata oluştu');
      }

      const data = await response.json();
      console.log('✅ API response:', data);
      
      // AI'nın önerdiği hammadeleri seçili malzemelere ekle
      const recommendedIngredients = data.recommendedIngredients || [];
      console.log('🎯 Önerilen hammadeler:', recommendedIngredients);
      
      const newSelectedIngredients = [...selectedIngredients];
      let addedCount = 0;
      
      recommendedIngredients.forEach((ingredientName: string) => {
        console.log('🔍 Aranan hammade:', ingredientName);
        
        const foundIngredient = allIngredients.hammadeler.find(
          ing => {
            const match = ing.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
                         ingredientName.toLowerCase().includes(ing.name.toLowerCase());
            if (match) console.log('✅ Eşleşme bulundu:', ing.name, '←→', ingredientName);
            return match;
          }
        );
        
        if (foundIngredient) {
          const alreadySelected = newSelectedIngredients.find(item => item.id === foundIngredient.id);
          if (!alreadySelected) {
            console.log('➕ Ekleniyor:', foundIngredient.name);
            newSelectedIngredients.push(foundIngredient);
            addedCount++;
          } else {
            console.log('⚠️ Zaten seçili:', foundIngredient.name);
          }
        } else {
          console.log('❌ Bulunamadı:', ingredientName);
        }
      });
      
      console.log('📊 Ekleme özeti:', {
        önerilen: recommendedIngredients.length,
        eklenen: addedCount,
        toplamSeçili: newSelectedIngredients.length
      });
      
      setSelectedIngredients(newSelectedIngredients);
      
      if (addedCount > 0) {
        alert(`✅ ${addedCount} hammade başarıyla eklendi!\n\n${data.explanation}\n\nArtık reçete oluşturabilirsiniz.`);
      } else {
        alert(`ℹ️ Önerilen hammadeler zaten seçili veya bulunamadı.\n\n${data.explanation}`);
      }
      
    } catch (error) {
      console.error('💥 Hammade eşleştirme hatası:', error);
      alert('Hammade eşleştirmesi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsMatching(false);
    }
  };

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      alert('Lütfen en az bir hammade veya esans seçin!');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          gender,
          season,
          dominantScent,
          perfumeVolume,
        }),
      });

      if (!response.ok) {
        throw new Error('API çağrısında hata oluştu');
      }

      const data = await response.json();
      setGeneratedRecipe(data.recipe);
      
      // Form alanlarını temizle (yeni reçete için hazırla)
      setTimeout(() => {
        setSelectedIngredients([]);
        setGender('kadın');
        setSeason('ilkbahar');
        setDominantScent('');
        setPerfumeVolume(50);
      }, 1000); // 1 saniye sonra temizle ki kullanıcı sonucu görebilsin
      
    } catch (error) {
      console.error('💥 Reçete üretilirken hata:', error);
      alert('Reçete üretilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRecipe = async () => {
    if (!generatedRecipe || !newRecipeName.trim()) {
      alert('Lütfen reçete adı girin ve bir reçete üretip!');
      return;
    }

    try {
      await saveRecipeToStore({
        name: newRecipeName.trim(),
        ingredients: selectedIngredients,
        gender,
        season,
        dominantScent,
        recipe: generatedRecipe,
        perfumeVolume
      });
      
      setNewRecipeName('');
      alert('Reçete başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Reçete kaydedilirken bir hata oluştu.');
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    try {
      await deleteRecipeFromStore(recipeId);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Reçete silinirken bir hata oluştu.');
    }
  };

  const viewRecipe = (recipe: Recipe) => {
    setSelectedRecipeForView(recipe);
    setShowRecipeModal(true);
  };

  const downloadRecipeAsImage = async (recipe: Recipe) => {
    // HTML içeriği oluştur
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: white; line-height: 1.6;">
        <h1 style="color: #1a202c; font-size: 32px; font-weight: 700; margin-bottom: 40px; text-align: center;">Parfüm Reçetesi</h1>
        
        <div style="margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #2d3748; font-size: 20px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Reçete Bilgileri</h2>
          <p style="margin: 8px 0; font-size: 16px; color: #2d3748;"><strong>Reçete Adı:</strong> ${recipe.name}</p>
          <p style="margin: 8px 0; font-size: 16px; color: #2d3748;"><strong>Cinsiyet:</strong> ${recipe.gender}</p>
          <p style="margin: 8px 0; font-size: 16px; color: #2d3748;"><strong>Mevsim:</strong> ${recipe.season}</p>
          <p style="margin: 8px 0; font-size: 16px; color: #2d3748;"><strong>Baskın Koku:</strong> ${recipe.dominantScent}</p>
        </div>

        <div style="margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #2d3748; font-size: 20px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Malzemeler</h2>
          ${recipe.ingredients.map(ingredient => 
            `<p style="margin: 6px 0; font-size: 16px; color: #2d3748;">• <strong>${ingredient.name}</strong> <span style="color: #718096;">(${ingredient.type === 'hammade' ? 'Hammade' : 'Esans'})</span></p>`
          ).join('')}
        </div>

        <div style="margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #2d3748; font-size: 20px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Reçete Detayı</h2>
          <div style="line-height: 1.8;">
            ${recipe.recipe.split('\n').map(line => 
              line.trim() ? `<p style="margin: 10px 0; font-size: 16px; color: #2d3748;">${line}</p>` : '<div style="height: 10px;"></div>'
            ).join('')}
          </div>
        </div>

        <div style="margin-top: 40px; text-align: center; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="margin: 0;">Oluşturulma Tarihi: ${recipe.createdAt.toLocaleDateString('tr-TR')}</p>
          <p style="margin: 5px 0 0 0; font-style: italic;">Parfüm AI ile oluşturulmuştur</p>
        </div>
      </div>
    `;

    // Geçici div oluştur
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    document.body.appendChild(tempDiv);

    try {
      // HTML'i canvas'a çevir
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempDiv.scrollHeight,
        logging: false
      });

      // Canvas'ı resim olarak indir
      const link = document.createElement('a');
      link.download = `${recipe.name.replace(/[<>:"/\\|?*]/g, '')}-parfum-recetesi.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (error) {
      console.error('Resim oluşturulurken hata:', error);
      alert('Resim oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      // Geçici div'i temizle
      document.body.removeChild(tempDiv);
    }
  };

  // Seçilen malzemeleri kategoriye göre ayır
  const selectedHammadeler = selectedIngredients.filter(ing => ing.type === 'hammade');
  const selectedEsanslar = selectedIngredients.filter(ing => ing.type === 'esans');

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Sidebar */}
      <Transition
        show={sidebarOpen}
        enter="transition-transform duration-300"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform duration-300"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl lg:relative lg:translate-x-0 lg:inset-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-pink-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-6 h-6" />
              Kayıtlı Reçeteler
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-purple-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {savedRecipes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz kayıtlı reçete yok</p>
            ) : (
              <div className="space-y-4">
                {savedRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {recipe.gender} • {recipe.season} • {recipe.dominantScent}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {recipe.ingredients.length} malzeme
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => viewRecipe(recipe)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Reçeteyi Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadRecipeAsImage(recipe)}
                          className="text-green-500 hover:text-green-700 p-1"
                          title="Resim İndir (PNG)"
                        >
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <Image className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRecipe(recipe.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </Transition>

      {/* Ana İçerik */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Parfüm AI</h1>
                  <p className="text-sm text-gray-600">Yapay zeka ile parfüm reçetesi oluşturun</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <User className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  Admin
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Çıkış</span>
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Menu className="w-4 h-4" />
                Reçeteler
              </button>
            </div>
          </div>
        </header>

        {/* Ana Alan */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Malzeme Seçimi */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Malzemeler</h2>
              
              {/* Hammadeler */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-700">Hammadeler</h3>
                  <button
                    onClick={() => setShowHammadeInput(!showHammadeInput)}
                    className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Ekle
                  </button>
                </div>
                
                {showHammadeInput && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newHammadeName}
                        onChange={(e) => setNewHammadeName(e.target.value)}
                        placeholder="Hammade adı girin..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                      />
                      <input
                        type="text"
                        value={newHammadeDescription}
                        onChange={(e) => setNewHammadeDescription(e.target.value)}
                        placeholder="Açıklama (örn: Doğal lavanta çiçekleri, rahatlatıcı etki)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                      />
                      <input
                        type="text"
                        value={newHammadePurpose}
                        onChange={(e) => setNewHammadePurpose(e.target.value)}
                        placeholder="Amacı (örn: Sakinleştirici, temiz ve taze hissiyat)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                        onKeyPress={(e) => e.key === 'Enter' && addCustomHammade()}
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={addCustomHammade}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Ekle
                      </button>
                      <button
                        onClick={() => {
                          setShowHammadeInput(false);
                          setNewHammadeName('');
                          setNewHammadeDescription('');
                          setNewHammadePurpose('');
                        }}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
                
                                 <div className="flex flex-wrap gap-3">
                   {allIngredients.hammadeler.map((ingredient) => (
                     <div key={ingredient.id} className="relative group">
                       <div className="flex items-center gap-1 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                         <button
                           onClick={() => addIngredient(ingredient)}
                           className="flex items-center gap-1 text-green-800 hover:text-green-900"
                         >
                           <Plus className="w-3 h-3" />
                           {ingredient.name}
                         </button>
                         
                         {/* Info tooltip */}
                         {ingredient.description && (
                           <div className="relative">
                             <Info className="w-3 h-3 text-green-600 cursor-help" />
                             <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 z-50 pointer-events-none">
                               <div className="font-semibold mb-1">{ingredient.description}</div>
                               <div className="text-gray-300">{ingredient.purpose}</div>
                               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                             </div>
                           </div>
                         )}
                         
                         {/* Silme butonu */}
                         <button
                           onClick={() => ingredient.isCustom ? deleteCustomIngredient(ingredient.id) : deleteDefaultIngredient(ingredient.id)}
                           className="w-4 h-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                           title="Sil"
                         >
                           <X className="w-3 h-3" />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Esanslar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-700">Esanslar</h3>
                  <button
                    onClick={() => setShowEsansInput(!showEsansInput)}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Ekle
                  </button>
                </div>
                
                {showEsansInput && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newEsansName}
                        onChange={(e) => setNewEsansName(e.target.value)}
                        placeholder="Esans adı girin..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      />
                      <input
                        type="text"
                        value={newEsansDescription}
                        onChange={(e) => setNewEsansDescription(e.target.value)}
                        placeholder="Açıklama (örn: Buhar distilasyonu ile elde edilen gül esansı)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      />
                      <input
                        type="text"
                        value={newEsansPurpose}
                        onChange={(e) => setNewEsansPurpose(e.target.value)}
                        placeholder="Amacı (örn: Yoğun çiçeksi kalp notası, kadınsı karakter)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        onKeyPress={(e) => e.key === 'Enter' && addCustomEsans()}
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={addCustomEsans}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Ekle
                      </button>
                      <button
                        onClick={() => {
                          setShowEsansInput(false);
                          setNewEsansName('');
                          setNewEsansDescription('');
                          setNewEsansPurpose('');
                        }}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
                
                                 <div className="flex flex-wrap gap-3">
                   {allIngredients.esanslar.map((ingredient) => (
                     <div key={ingredient.id} className="relative group">
                       <div className="flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                         <button
                           onClick={() => addIngredient(ingredient)}
                           className="flex items-center gap-1 text-blue-800 hover:text-blue-900"
                         >
                           <Plus className="w-3 h-3" />
                           {ingredient.name}
                         </button>
                         
                         {/* Info tooltip */}
                         {ingredient.description && (
                           <div className="relative">
                             <Info className="w-3 h-3 text-blue-600 cursor-help" />
                             <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 z-50 pointer-events-none">
                               <div className="font-semibold mb-1">{ingredient.description}</div>
                               <div className="text-gray-300">{ingredient.purpose}</div>
                               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                             </div>
                           </div>
                         )}
                         
                         {/* Silme butonu */}
                         <button
                           onClick={() => ingredient.isCustom ? deleteCustomIngredient(ingredient.id) : deleteDefaultIngredient(ingredient.id)}
                           className="w-4 h-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                           title="Sil"
                         >
                           <X className="w-3 h-3" />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
                
                {/* Esansa Göre Hammade Eşleştir Butonu */}
                {selectedEsanslar.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">Akıllı Hammade Eşleştirme</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Seçtiğiniz {selectedEsanslar.length} esansa uygun hammadeleri AI ile bulun
                        </p>
                      </div>
                      <button
                        onClick={matchIngredientsWithEssence}
                        disabled={isMatching}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold"
                      >
                        {isMatching ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Eşleştiriliyor...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Hammade Eşleştir
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Seçilen Malzemeler - Kategorilere Ayrılmış */}
              {selectedIngredients.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Seçilen Malzemeler</h3>
                  
                  {/* Seçilen Hammadeler */}
                  {selectedHammadeler.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-600 mb-2">Hammadeler ({selectedHammadeler.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedHammadeler.map((ingredient) => (
                          <span
                            key={ingredient.id}
                            className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm flex items-center gap-1"
                          >
                            {ingredient.name}
                            <button
                              onClick={() => removeIngredient(ingredient.id)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seçilen Esanslar */}
                  {selectedEsanslar.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-600 mb-2">Esanslar ({selectedEsanslar.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEsanslar.map((ingredient) => (
                          <span
                            key={ingredient.id}
                            className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm flex items-center gap-1"
                          >
                            {ingredient.name}
                            <button
                              onClick={() => removeIngredient(ingredient.id)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tercihler */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Tercihler</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Cinsiyet</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'kadın' | 'erkek' | 'unisex')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium"
                  >
                    <option value="kadın">Kadın</option>
                    <option value="erkek">Erkek</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Mevsim</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value as 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium"
                  >
                    <option value="ilkbahar">İlkbahar</option>
                    <option value="yaz">Yaz</option>
                    <option value="sonbahar">Sonbahar</option>
                    <option value="kış">Kış</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Baskın Koku</label>
                  <select
                    value={dominantScent}
                    onChange={(e) => setDominantScent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium"
                  >
                    <option value="" className="text-gray-500">Seçiniz</option>
                    {DOMINANT_SCENTS.map((scent) => (
                      <option key={scent} value={scent} className="text-gray-900">{scent}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parfüm Hacmi Seçimi */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-800 mb-3">Parfüm Hacmi</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setPerfumeVolume(50)}
                    className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all flex items-center gap-2 ${
                      perfumeVolume === 50
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-purple-600 border-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-lg">💧</span>
                    50ml
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerfumeVolume(100)}
                    className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all flex items-center gap-2 ${
                      perfumeVolume === 100
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-purple-600 border-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-lg">🧪</span>
                    100ml
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Seçilen hacme göre malzeme miktarları otomatik hesaplanacak
                </p>
              </div>

              <button
                onClick={generateRecipe}
                disabled={isGenerating || selectedIngredients.length === 0}
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Reçete Üretiliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {perfumeVolume}ml Reçete Üret
                  </>
                )}
              </button>
            </div>

                        {/* Üretilen Reçete */}
            {generatedRecipe && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">AI Parfüm Reçetesi</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">{generatedRecipe}</pre>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Bu reçeteyi kaydetmek ister misiniz?</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                       type="text"
                       value={newRecipeName}
                       onChange={(e) => setNewRecipeName(e.target.value)}
                       placeholder="Reçete için bir isim girin (örn: Bahar Esintisi)"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 font-medium"
                     />
                     <button
                       onClick={saveRecipe}
                       className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-md sm:w-auto w-full"
                     >
                       <Save className="w-5 h-5" />
                       Kaydet
                     </button>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Reçete Görüntüleme Modalı */}
      {showRecipeModal && selectedRecipeForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedRecipeForView.name}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedRecipeForView.gender} • {selectedRecipeForView.season} • {selectedRecipeForView.dominantScent}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadRecipeAsImage(selectedRecipeForView)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image className="w-4 h-4" />
                  Resim İndir
                </button>
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Reçete Bilgileri */}
              <div className="mb-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-600">Cinsiyet:</span>
                  <span className="font-semibold text-gray-800 ml-2">{selectedRecipeForView.gender}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-600">Mevsim:</span>
                  <span className="font-semibold text-gray-800 ml-2">{selectedRecipeForView.season}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-600">Baskın Koku:</span>
                  <span className="font-semibold text-gray-800 ml-2">{selectedRecipeForView.dominantScent || 'Belirtilmemiş'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-600">Hacim:</span>
                  <span className="font-semibold text-gray-800 ml-2">{selectedRecipeForView.perfumeVolume || 50}ml</span>
                </div>
              </div>

              {/* Malzemeler */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Kullanılan Malzemeler</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Hammadeler */}
                  {selectedRecipeForView.ingredients.filter(ing => ing.type === 'hammade').length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Hammadeler</h4>
                      <div className="space-y-1">
                        {selectedRecipeForView.ingredients
                          .filter(ing => ing.type === 'hammade')
                          .map((ingredient) => (
                            <span
                              key={ingredient.id}
                              className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm mr-2 mb-1"
                            >
                              {ingredient.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Esanslar */}
                  {selectedRecipeForView.ingredients.filter(ing => ing.type === 'esans').length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Esanslar</h4>
                      <div className="space-y-1">
                        {selectedRecipeForView.ingredients
                          .filter(ing => ing.type === 'esans')
                          .map((ingredient) => (
                            <span
                              key={ingredient.id}
                              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-2 mb-1"
                            >
                              {ingredient.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reçete Detayı */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Reçete Detayı</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                    {selectedRecipeForView.recipe}
                  </pre>
                </div>
              </div>

              {/* Reçete Bilgileri */}
              <div className="mt-6 text-sm text-gray-500">
                <p>Oluşturulma Tarihi: {selectedRecipeForView.createdAt.toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
