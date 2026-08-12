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

export async function uploadRecipeImage(file) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('User is not authenticated')
  }

  const userId = session.user.id

  const fileExtension = file.name.split('.').pop()

  const fileName = `${crypto.randomUUID()}.${fileExtension}`

  const filePath = `${userId}/${fileName}`

  const { error } = await supabase.storage
    .from('recipe-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(
      `Failed to upload image: ${error.message}`
    )
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from('recipe-images')
    .getPublicUrl(filePath)

  return publicUrl
}

export async function deleteRecipeImage(imageUrl) {
  if (!imageUrl) {
    return
  }

  const marker = '/recipe-images/'

  if (!imageUrl.includes(marker)) {
    return
  }

  const filePath = imageUrl
    .split(marker)[1]
    .split('?')[0]

  if (!filePath) {
    return
  }

  const { error } = await supabase.storage
    .from('recipe-images')
    .remove([filePath])

  if (error) {
    throw new Error(
      `Failed to delete image: ${error.message}`
    )
  }
}