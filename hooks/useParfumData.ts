'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import * as SupabaseAPI from '../lib/supabase-api'

// Local types (mevcut interface'ler)
export interface Ingredient {
  id: string
  name: string
  type: 'hammade' | 'esans'
  category: string
  isCustom?: boolean
  description?: string
  purpose?: string
}

export interface Recipe {
  id: string
  name: string
  ingredients: Ingredient[]
  gender: 'kadın' | 'erkek' | 'unisex'
  season: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış'
  dominantScent: string
  recipe: string
  createdAt: Date
}

export const useParfumData = () => {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([])
  const [hiddenIngredients, setHiddenIngredients] = useState<string[]>([])

  // Check hardcoded authentication
  const checkAuthentication = () => {
    const authStatus = sessionStorage.getItem('parfum-auth')
    return authStatus === 'authenticated'
  }

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      
      const authenticated = checkAuthentication()
      setIsAuthenticated(authenticated)
      
      if (authenticated) {
        // Simulate user for Supabase operations
        setUser({ id: 'admin-user', email: 'admin@parfum.ai' })
        await loadFromSupabase()
      }
      
      setIsLoading(false)
    }

    initializeData()
  }, [])

  // Supabase'den veri yükle
  const loadFromSupabase = async () => {
    try {
      const [recipes, ingredients, hidden] = await Promise.all([
        SupabaseAPI.getRecipes(),
        SupabaseAPI.getCustomIngredients(),
        SupabaseAPI.getHiddenIngredients()
      ])
      
      setSavedRecipes(recipes)
      setCustomIngredients(ingredients)
      setHiddenIngredients(hidden)
    } catch (error) {
      console.error('Error loading from Supabase:', error)
    }
  }

  // Reçete kaydetme
  const saveRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      
      const savedRecipe = await SupabaseAPI.saveRecipe(recipe)
      setSavedRecipes(prev => [savedRecipe, ...prev])
    } catch (error) {
      console.error('Error saving recipe:', error)
      throw error
    }
  }

  // Reçete silme
  const deleteRecipe = async (recipeId: string) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      
      await SupabaseAPI.deleteRecipe(recipeId)
      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId))
    } catch (error) {
      console.error('Error deleting recipe:', error)
      throw error
    }
  }

  // Özel malzeme ekleme
  const addCustomIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      
      const savedIngredient = await SupabaseAPI.saveCustomIngredient(ingredient)
      setCustomIngredients(prev => [...prev, savedIngredient])
    } catch (error) {
      console.error('Error saving custom ingredient:', error)
      throw error
    }
  }

  // Özel malzeme silme
  const deleteCustomIngredient = async (ingredientId: string) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      
      await SupabaseAPI.deleteCustomIngredient(ingredientId)
      setCustomIngredients(prev => prev.filter(ing => ing.id !== ingredientId))
    } catch (error) {
      console.error('Error deleting custom ingredient:', error)
      throw error
    }
  }

  // Default malzeme gizleme
  const hideDefaultIngredient = async (ingredientId: string) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      
      await SupabaseAPI.hideDefaultIngredient(ingredientId)
      setHiddenIngredients(prev => [...prev, ingredientId])
    } catch (error) {
      console.error('Error hiding ingredient:', error)
      throw error
    }
  }

  // Authentication fonksiyonları
  const signIn = async (username: string, password: string) => {
    console.log('🔑 useParfumData signIn çağrıldı')
    console.log('👤 Username check:', username, '===', 'adminufuk', '?', username === 'adminufuk')
    console.log('🔒 Password check:', password, '===', 'Ufuk12345K', '?', password === 'Ufuk12345K')
    
    try {
      // Hardcoded authentication
      if (username === 'adminufuk' && password === 'Ufuk12345K') {
        console.log('✅ Hardcoded credentials doğru!')
        
        // Önce mevcut kullanıcı ile giriş yapmayı dene
        console.log('🌐 Supabase auth deneniyor: admin@parfum.ai')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@parfum.ai',
          password: 'Ufuk12345K'
        });
        
        if (signInError) {
          console.log('⚠️ Kullanıcı bulunamadı, oluşturuluyor...', signInError.message);
          
          // Kullanıcı yoksa oluştur (Email confirmation'sız)
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'admin@parfum.ai',
            password: 'Ufuk12345K',
            options: {
              emailRedirectTo: undefined,
              data: {
                email_confirmed: true // Email'i doğrulanmış olarak işaretle
              }
            }
          });
          
          if (signUpError) {
            console.error('❌ Kullanıcı oluşturulamadı:', signUpError);
            
            // Supabase başarısız olursa manuel session ile devam et
            console.log('🔄 Manuel session ile devam ediliyor...')
            sessionStorage.setItem('parfum-auth', 'authenticated');
            setIsAuthenticated(true);
            setUser({ id: 'admin-user-manual', email: 'admin@parfum.ai' });
            await loadFromSupabase();
            return { success: true };
          }
          
          console.log('✅ Kullanıcı başarıyla oluşturuldu:', signUpData);
          
          // Yeni oluşturulan kullanıcı ile session başlat
          sessionStorage.setItem('parfum-auth', 'authenticated');
          setIsAuthenticated(true);
          setUser(signUpData.user || { id: 'admin-user-manual', email: 'admin@parfum.ai' });
          await loadFromSupabase();
          return { success: true };
          
        } else {
          console.log('✅ Kullanıcı bulundu, giriş başarılı:', signInData);
          
          // Mevcut kullanıcı ile giriş başarılı
          sessionStorage.setItem('parfum-auth', 'authenticated');
          setIsAuthenticated(true);
          setUser(signInData.user);
          await loadFromSupabase();
          return { success: true };
        }
        
      } else {
        console.log('❌ Hardcoded credentials yanlış!')
        console.log('Expected: adminufuk / Ufuk12345K')
        console.log('Received:', username, '/', password)
        return { success: false, error: 'Kullanıcı adı veya şifre hatalı!' };
      }
    } catch (error) {
      console.error('💥 Authentication error:', error);
      
      // Hata durumunda da manuel session ile devam et
      console.log('🔄 Hata durumunda manuel session...')
      sessionStorage.setItem('parfum-auth', 'authenticated');
      setIsAuthenticated(true);
      setUser({ id: 'admin-user-manual', email: 'admin@parfum.ai' });
      await loadFromSupabase();
      return { success: true };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem('parfum-auth');
      setIsAuthenticated(false);
      setUser(null);
      setSavedRecipes([]);
      setCustomIngredients([]);
      setHiddenIngredients([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    savedRecipes,
    customIngredients,
    hiddenIngredients,
    
    // Actions
    saveRecipe,
    deleteRecipe,
    addCustomIngredient,
    deleteCustomIngredient,
    hideDefaultIngredient,
    signIn,
    signOut,
    
    // Utils
    loadFromSupabase,
    checkAuthentication
  }
} 