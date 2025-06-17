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
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([])
  const [hiddenIngredients, setHiddenIngredients] = useState<string[]>([])

  // Authentication durumunu dinle
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await SupabaseAPI.getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          // Kullanıcı varsa Supabase'den yükle
          await loadFromSupabase()
          // LocalStorage'daki veriyi migrate et
          await SupabaseAPI.migrateLocalData()
        } else {
          // Kullanıcı yoksa localStorage'dan yükle
          loadFromLocalStorage()
        }
      } catch (error) {
        console.error('Error checking user:', error)
        loadFromLocalStorage()
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      
      if (currentUser && event === 'SIGNED_IN') {
        await loadFromSupabase()
        await SupabaseAPI.migrateLocalData()
      } else if (event === 'SIGNED_OUT') {
        loadFromLocalStorage()
      }
    })

    return () => subscription.unsubscribe()
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

  // localStorage'dan veri yükle
  const loadFromLocalStorage = () => {
    try {
      const savedRecipesData = localStorage.getItem('parfum-saved-recipes')
      const savedCustomIngredients = localStorage.getItem('parfum-custom-ingredients')  
      const savedHiddenDefaults = localStorage.getItem('parfum-hidden-defaults')

      if (savedRecipesData) {
        const parsedRecipes = JSON.parse(savedRecipesData).map((recipe: any) => ({
          ...recipe,
          createdAt: new Date(recipe.createdAt)
        }))
        setSavedRecipes(parsedRecipes)
      }

      if (savedCustomIngredients) {
        setCustomIngredients(JSON.parse(savedCustomIngredients))
      }

      if (savedHiddenDefaults) {
        setHiddenIngredients(JSON.parse(savedHiddenDefaults))
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }

  // Reçete kaydetme
  const saveRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    try {
      if (user) {
        // Supabase'e kaydet
        const savedRecipe = await SupabaseAPI.saveRecipe(recipe)
        setSavedRecipes(prev => [savedRecipe, ...prev])
      } else {
        // localStorage'a kaydet
        const newRecipe: Recipe = {
          id: Date.now().toString(),
          ...recipe,
          createdAt: new Date()
        }
        const updatedRecipes = [newRecipe, ...savedRecipes]
        setSavedRecipes(updatedRecipes)
        localStorage.setItem('parfum-saved-recipes', JSON.stringify(updatedRecipes))
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
      throw error
    }
  }

  // Reçete silme
  const deleteRecipe = async (recipeId: string) => {
    try {
      if (user) {
        // Supabase'den sil
        await SupabaseAPI.deleteRecipe(recipeId)
      } else {
        // localStorage'dan sil
        const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId)
        setSavedRecipes(updatedRecipes)
        localStorage.setItem('parfum-saved-recipes', JSON.stringify(updatedRecipes))
      }
      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId))
    } catch (error) {
      console.error('Error deleting recipe:', error)
      throw error
    }
  }

  // Özel malzeme ekleme
  const addCustomIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    try {
      if (user) {
        // Supabase'e kaydet
        const savedIngredient = await SupabaseAPI.saveCustomIngredient(ingredient)
        setCustomIngredients(prev => [...prev, savedIngredient])
      } else {
        // localStorage'a kaydet
        const newIngredient: Ingredient = {
          id: `custom-${ingredient.type}-${Date.now()}`,
          ...ingredient,
          isCustom: true
        }
        const updatedIngredients = [...customIngredients, newIngredient]
        setCustomIngredients(updatedIngredients)
        localStorage.setItem('parfum-custom-ingredients', JSON.stringify(updatedIngredients))
      }
    } catch (error) {
      console.error('Error saving custom ingredient:', error)
      throw error
    }
  }

  // Özel malzeme silme
  const deleteCustomIngredient = async (ingredientId: string) => {
    try {
      if (user) {
        // Supabase'den sil
        await SupabaseAPI.deleteCustomIngredient(ingredientId)
      } else {
        // localStorage'dan sil
        const updatedIngredients = customIngredients.filter(ing => ing.id !== ingredientId)
        setCustomIngredients(updatedIngredients)
        localStorage.setItem('parfum-custom-ingredients', JSON.stringify(updatedIngredients))
      }
      setCustomIngredients(prev => prev.filter(ing => ing.id !== ingredientId))
    } catch (error) {
      console.error('Error deleting custom ingredient:', error)
      throw error
    }
  }

  // Default malzeme gizleme
  const hideDefaultIngredient = async (ingredientId: string) => {
    try {
      if (user) {
        // Supabase'e kaydet
        await SupabaseAPI.hideDefaultIngredient(ingredientId)
      } else {
        // localStorage'a kaydet
        const updatedHidden = [...hiddenIngredients, ingredientId]
        setHiddenIngredients(updatedHidden)
        localStorage.setItem('parfum-hidden-defaults', JSON.stringify(updatedHidden))
      }
      setHiddenIngredients(prev => [...prev, ingredientId])
    } catch (error) {
      console.error('Error hiding ingredient:', error)
      throw error
    }
  }

  // Authentication fonksiyonları
  const signOut = async () => {
    try {
      await SupabaseAPI.signOut()
      // localStorage'a geri dön
      loadFromLocalStorage()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    // State
    user,
    isLoading,
    savedRecipes,
    customIngredients,
    hiddenIngredients,
    
    // Actions
    saveRecipe,
    deleteRecipe,
    addCustomIngredient,
    deleteCustomIngredient,
    hideDefaultIngredient,
    signOut,
    
    // Utils
    isAuthenticated: !!user,
    loadFromSupabase,
    loadFromLocalStorage
  }
} 