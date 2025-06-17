import { supabase } from './supabase'
import type { Database } from './supabase'

// Types
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type CustomIngredient = Database['public']['Tables']['custom_ingredients']['Row']
export type CustomIngredientInsert = Database['public']['Tables']['custom_ingredients']['Insert']

export interface LocalIngredient {
  id: string
  name: string
  type: 'hammade' | 'esans'
  category: string
  isCustom?: boolean
  description?: string
  purpose?: string
}

export interface LocalRecipe {
  id: string
  name: string
  ingredients: LocalIngredient[]
  gender: 'kadın' | 'erkek' | 'unisex'
  season: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış'
  dominantScent: string
  recipe: string
  createdAt: Date
}

// 🔐 Authentication Functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return null // Supabase yapılandırılmamış
    }
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// 📝 Recipe Functions
export const getRecipes = async (): Promise<LocalRecipe[]> => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching recipes:', error)
    return []
  }

  return data.map(recipe => ({
    id: recipe.id,
    name: recipe.name,
    ingredients: recipe.ingredients as LocalIngredient[],
    gender: recipe.gender as 'kadın' | 'erkek' | 'unisex',
    season: recipe.season as 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış',
    dominantScent: recipe.dominant_scent,
    recipe: recipe.recipe,
    createdAt: new Date(recipe.created_at)
  }))
}

export const saveRecipe = async (recipe: Omit<LocalRecipe, 'id' | 'createdAt'>) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      name: recipe.name,
      ingredients: recipe.ingredients,
      gender: recipe.gender,
      season: recipe.season,
      dominant_scent: recipe.dominantScent,
      recipe: recipe.recipe,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving recipe:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    ingredients: data.ingredients as LocalIngredient[],
    gender: data.gender as 'kadın' | 'erkek' | 'unisex',
    season: data.season as 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış',
    dominantScent: data.dominant_scent,
    recipe: data.recipe,
    createdAt: new Date(data.created_at)
  }
}

export const deleteRecipe = async (recipeId: string) => {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)

  if (error) {
    console.error('Error deleting recipe:', error)
    throw error
  }
}

// 🧪 Custom Ingredients Functions
export const getCustomIngredients = async (): Promise<LocalIngredient[]> => {
  const { data, error } = await supabase
    .from('custom_ingredients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching custom ingredients:', error)
    return []
  }

  return data.map(ingredient => ({
    id: ingredient.id,
    name: ingredient.name,
    type: ingredient.type as 'hammade' | 'esans',
    category: ingredient.category,
    isCustom: ingredient.is_custom,
    description: ingredient.description || undefined,
    purpose: ingredient.purpose || undefined
  }))
}

export const saveCustomIngredient = async (ingredient: Omit<LocalIngredient, 'id'>) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('custom_ingredients')
    .insert({
      name: ingredient.name,
      type: ingredient.type,
      category: ingredient.category,
      description: ingredient.description,
      purpose: ingredient.purpose,
      is_custom: ingredient.isCustom ?? true,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving custom ingredient:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type as 'hammade' | 'esans',
    category: data.category,
    isCustom: data.is_custom,
    description: data.description || undefined,
    purpose: data.purpose || undefined
  }
}

export const deleteCustomIngredient = async (ingredientId: string) => {
  const { error } = await supabase
    .from('custom_ingredients')
    .delete()
    .eq('id', ingredientId)

  if (error) {
    console.error('Error deleting custom ingredient:', error)
    throw error
  }
}

// 🙈 Hidden Default Ingredients Functions
export const getHiddenIngredients = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('hidden_default_ingredients')
    .select('ingredient_id')

  if (error) {
    console.error('Error fetching hidden ingredients:', error)
    return []
  }

  return data.map(item => item.ingredient_id)
}

export const hideDefaultIngredient = async (ingredientId: string) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('hidden_default_ingredients')
    .insert({
      ingredient_id: ingredientId,
      user_id: user.id
    })

  if (error && error.code !== '23505') { // 23505 = unique constraint violation
    console.error('Error hiding ingredient:', error)
    throw error
  }
}

export const unhideDefaultIngredient = async (ingredientId: string) => {
  const { error } = await supabase
    .from('hidden_default_ingredients')
    .delete()
    .eq('ingredient_id', ingredientId)

  if (error) {
    console.error('Error unhiding ingredient:', error)
    throw error
  }
}

// 🔄 Data Migration Functions (localStorage → Supabase)
export const migrateLocalData = async () => {
  const user = await getCurrentUser()
  if (!user) return

  try {
    // Migrate recipes
    const localRecipes = localStorage.getItem('parfum-saved-recipes')
    if (localRecipes) {
      const recipes = JSON.parse(localRecipes)
      for (const recipe of recipes) {
        await saveRecipe({
          name: recipe.name,
          ingredients: recipe.ingredients,
          gender: recipe.gender,
          season: recipe.season,
          dominantScent: recipe.dominantScent,
          recipe: recipe.recipe
        })
      }
      localStorage.removeItem('parfum-saved-recipes')
    }

    // Migrate custom ingredients
    const localIngredients = localStorage.getItem('parfum-custom-ingredients')
    if (localIngredients) {
      const ingredients = JSON.parse(localIngredients)
      for (const ingredient of ingredients) {
        await saveCustomIngredient(ingredient)
      }
      localStorage.removeItem('parfum-custom-ingredients')
    }

    // Migrate hidden ingredients
    const hiddenIngredients = localStorage.getItem('parfum-hidden-defaults')
    if (hiddenIngredients) {
      const hidden = JSON.parse(hiddenIngredients)
      for (const ingredientId of hidden) {
        await hideDefaultIngredient(ingredientId)
      }
      localStorage.removeItem('parfum-hidden-defaults')
    }

    console.log('Data migration completed successfully')
  } catch (error) {
    console.error('Error during data migration:', error)
  }
} 