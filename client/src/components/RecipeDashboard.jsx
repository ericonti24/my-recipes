import { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react'

import RecipeList from './RecipeList'
import RecipeForm from './RecipeForm'
import { 
  createRecipe, 
  updateRecipe, 
  deleteRecipe, 
  deleteRecipeImage,
  getRecipeById,
} from '../lib/api'

export default function RecipeDashboard({ session, onSignOut }) {
  const [showRecipeForm, setShowRecipeForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshRecipes, setRefreshRecipes] = useState(0)
  const [editingRecipe, setEditingRecipe] = useState(null)

  const displayName =
    session.user.user_metadata?.username ||
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    session.user.email

  // Function to handle creating a new recipe
  async function handleCreateRecipe(recipeData) {
    setLoading(true)

    try {
      await createRecipe({
        title: recipeData.title,
        description: recipeData.description,
        prepTime: recipeData.prepTime,
        imageUrl: recipeData.imageUrl,
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
      })

      // Refresh the recipe list after creation.
      setRefreshRecipes((current) => current + 1)
      setShowRecipeForm(false)
      setEditingRecipe(null)

      return true
    } catch (error) {
      console.error('Error creating recipe:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating an existing recipe
  async function handleUpdateRecipe(id, recipeData) {
    setLoading(true)

    try {
      // Find the currently displayed recipe
      const currentRecipe = editingRecipe

      // Keep track of the existing image
      const oldImageUrl = currentRecipe?.image_url || null

      // Update the recipe first
      await updateRecipe(id, {
        title: recipeData.title,
        description: recipeData.description,
        prepTime: recipeData.prepTime,
        imageUrl: recipeData.imageUrl,
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
      })

      // If the image was replaced, delete the old image
      if (
        oldImageUrl &&
        recipeData.imageUrl &&
        oldImageUrl !== recipeData.imageUrl
      ) {
        try {
          await deleteRecipeImage(oldImageUrl)
        } catch (imageError) {
          console.error(
            'Recipe updated, but old image could not be deleted:',
            imageError
          )
        }
      }

      setRefreshRecipes((current) => current + 1)
      setShowRecipeForm(false)
      setEditingRecipe(null)

      return true
    } catch (error) {
      console.error('Error updating recipe:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Function to handle deleting a recipe
  async function handleDeleteRecipe(id) {
    setLoading(true)

    try {
      // Get the recipe before deleting it
      const result = await getRecipeById(id)

      const imageUrl = result.recipe?.image_url || null

      // Delete the recipe from the database
      await deleteRecipe(id)

      // Delete the associated image from Storage
      if (imageUrl) {
        try {
          await deleteRecipeImage(imageUrl)
        } catch (imageError) {
          console.error(
            'Recipe deleted, but image could not be deleted:',
            imageError
          )
        }
      }

      setRefreshRecipes((current) => current + 1)
      setShowRecipeForm(false)
      setEditingRecipe(null)

      return true
    } catch (error) {
      console.error('Error deleting recipe:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      width="100%"
      maxW="1200px"
      mx="auto"
      px={{ base: 4, md: 6, lg: 8 }}
      py={{ base: 4, md: 6 }}
    >
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        mb={8}
      >
        <Box>
          <Heading size="xl">
            My Recipes
          </Heading>

          <Text mt={1}>
            Welcome, {displayName}
          </Text>
        </Box>

        <Flex gap={3}>
          <Button
            onClick={() => {
              setEditingRecipe(null)
              setShowRecipeForm(true)
            }}
          >
            + Add New Recipe
          </Button>

          <Button
            variant="outline"
            onClick={onSignOut}
          >
            Sign out
          </Button>
        </Flex>
      </Flex>

      <RecipeList
        refreshRecipes={refreshRecipes}
        onEdit={(recipe) => {
          setEditingRecipe(recipe)
          setShowRecipeForm(true)
        }}
        onDelete={handleDeleteRecipe}
      />

      {showRecipeForm && (
        <RecipeForm
          recipe={editingRecipe}
          onClose={() => {
            setShowRecipeForm(false)
            setEditingRecipe(null)
          }}
          onCreate={handleCreateRecipe}
          onUpdate={handleUpdateRecipe}
          loading={loading}
        />
      )}
    </Box>
  )
}