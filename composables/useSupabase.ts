import { useNuxtApp } from '#app'
import type { SupabaseClient } from '@supabase/supabase-js'

export const useSupabase = (): SupabaseClient => {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$supabase as SupabaseClient
}
