import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Ingredient type for consistency
export interface Ingredient {
  id: string
  name: string
  type: 'hammade' | 'esans'
  category: string
  isCustom?: boolean
  description?: string
  purpose?: string
}

// Database types
export type Database = {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          name: string
          ingredients: Ingredient[]
          gender: 'kadın' | 'erkek' | 'unisex'
          season: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış'
          dominant_scent: string
          recipe: string
          created_at: string
          user_id?: string
        }
        Insert: {
          id?: string
          name: string
          ingredients: Ingredient[]
          gender: 'kadın' | 'erkek' | 'unisex'
          season: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış'
          dominant_scent: string
          recipe: string
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          ingredients?: Ingredient[]
          gender?: 'kadın' | 'erkek' | 'unisex'
          season?: 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış'
          dominant_scent?: string
          recipe?: string
          created_at?: string
          user_id?: string
        }
      }
      ingredients: {
        Row: {
          id: string
          name: string
          type: 'hammade' | 'esans'
          category: string
          description?: string
          purpose?: string
          is_custom: boolean
          user_id?: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'hammade' | 'esans'
          category: string
          description?: string
          purpose?: string
          is_custom?: boolean
          user_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'hammade' | 'esans'
          category?: string
          description?: string
          purpose?: string
          is_custom?: boolean
          user_id?: string
          created_at?: string
        }
      }
    }
  }
} 