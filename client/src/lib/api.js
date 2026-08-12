import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('User is not authenticated')
  }

  return session.access_token
}

async function apiRequest(endpoint, options = {}) {
  const token = await getAccessToken()

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }

  return data
}

export async function getRecipes() {
  return apiRequest('/recipes')
}

export async function getRecipeById(id) {
  return apiRequest(`/recipes/${id}`)
}

export async function createRecipe(recipe) {
  return apiRequest('/recipes', {
    method: 'POST',
    body: JSON.stringify(recipe),
  })
}

export async function updateRecipe(id, recipe) {
  return apiRequest(`/recipes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(recipe),
  })
}

export async function deleteRecipe(id) {
  return apiRequest(`/recipes/${id}`, {
    method: 'DELETE',
  })
}