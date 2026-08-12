import { useEffect, useState } from 'react'
import { Box, Heading, Spinner, Text } from '@chakra-ui/react'
import { getRecipes } from '../lib/api'
import RecipeCard from './RecipeCard'

export default function RecipeList({ 
    refreshRecipes, 
    onEdit,
    onDelete, 
    actionLoading,
    loadingAction
  }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRecipes = async () => {
    try {
      setLoading(true)
      setError('')

      const result = await getRecipes()

      setRecipes(result.recipes)
    } catch (error) {
      console.error('Failed to load recipes:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecipes()
  }, [refreshRecipes])

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner />
      </Box>
    )
  }

  if (error) {
    return (
      <Box py={4}>
        <Text color="red.500">
          {error}
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>
        My Recipes
      </Heading>

      {recipes.length === 0 ? (
        <Text>
          You don't have any recipes yet.
        </Text>
      ) : (
        recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onEdit={onEdit}
            onDelete={onDelete}
            actionLoading={actionLoading}
            loadingAction={loadingAction}
          />
        ))
      )}
    </Box>
  )
}