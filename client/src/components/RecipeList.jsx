import { useEffect, useState } from 'react'
import { Box, Heading, Spinner, Text, Stack, Input} from '@chakra-ui/react'
import { getRecipes } from '../lib/api'
import RecipeCard from './RecipeCard'

export default function RecipeList({ 
    refreshRecipes, 
    onEdit,
    onDelete, 
  }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const recipeCount = filteredRecipes.length

  return (
    <Box>
      <Heading size="lg" mb={4}>
        My Recipes
      </Heading>

      <Input
        mb={4}
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      <Text mb={4}>
        {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
      </Text>

      {recipes.length === 0 ? (
        <Text>
          You don't have any recipes yet.
        </Text>
      ) : filteredRecipes.length === 0 ? (
        <Text>
          No recipes found.
        </Text>
      ) : (
        <Stack gap={6}>
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}