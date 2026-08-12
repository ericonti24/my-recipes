import { useState } from 'react'
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Heading,
  Image,
  Stack,
  Text,
  Checkbox,
} from '@chakra-ui/react'

export default function RecipeCard({ 
    recipe, 
    onEdit,
    onDelete
  }) {
  const [showRecipe, setShowRecipe] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState(() => {
    const saved = localStorage.getItem(`${recipe.id}`)
    return saved ? JSON.parse(saved) : []
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleClose() {
    setShowRecipe(false)
  }

  // Toggle ingredient checked state and save to localStorage
  function toggleIngredient(index) {
    setCheckedIngredients((current) => {
      const updated = current.includes(index)
        ? current.filter(
            (ingredientIndex) => ingredientIndex !== index
          )
        : [...current, index]

      localStorage.setItem(
        `${recipe.id}`,
        JSON.stringify(updated)
      )

      return updated
    })
  }

  async function handleDelete() {
    setDeleting(true)

    const deleted = await onDelete(recipe.id)

    if (deleted !== false) {
      setShowDeleteConfirm(false)
      setShowRecipe(false)
    }

    setDeleting(false)
  }

  return (
    <>
      {/* Recipe Card */}
      <Box
        width="100%"
        maxW="400px"
        mx="auto"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        cursor="pointer"
        bg="white"
        _hover={{
          shadow: 'md',
        }}
        _active={{
          transform: 'scale(0.99)',
        }}
        transition="all 0.15s"
        onClick={() => setShowRecipe(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            setShowRecipe(true)
          }
        }}
      >
        {/* Recipe Image */}
        {recipe.image_url && (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            width="100%"
            height={{ base: '220px', md: '240px' }}
            objectFit="cover"
          />
        )}

        {/* Recipe Information */}
        <Box p={4}>
          <Heading
            size="md"
            mb={2}
          >
            {recipe.title}
          </Heading>

          {recipe.description && (
            <Text
              color="gray.600"
              mb={2}
              lineClamp={2}
            >
              {recipe.description}
            </Text>
          )}

          {recipe.prep_time && (
            <Text
              fontSize="sm"
              color="gray.500"
            >
              Prep time: {recipe.prep_time} minutes
            </Text>
          )}
        </Box>
      </Box>

      {/* Full Recipe Dialog */}
      <Dialog.Root
        open={showRecipe}
        onOpenChange={(event) => {
          if (!event.open) {
            handleClose()
          }
        }}
        size="full"
      >
        <Dialog.Backdrop />

        <Dialog.Positioner>
          <Dialog.Content
            maxW={{ base: '100%', md: '700px' }}
            maxH={{ base: '100vh', md: '90vh' }}
            overflowY="auto"
            borderRadius={{ base: '0', md: 'lg' }}
          >
            <Dialog.Header>
              <Dialog.Title>
                {recipe.title}
              </Dialog.Title>

              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap={6}>
                {/* Full Recipe Image */}
                {recipe.image_url && (
                  <Image
                    src={recipe.image_url}
                    alt={recipe.title}
                    width="100%"
                    maxH={{ base: '300px', md: '400px' }}
                    objectFit="cover"
                    borderRadius="md"
                  />
                )}

                {/* Description */}
                {recipe.description && (
                  <Box>
                    <Heading size="sm" mb={2}>
                      Description
                    </Heading>

                    <Text>
                      {recipe.description}
                    </Text>
                  </Box>
                )}

                {/* Prep Time */}
                {recipe.prep_time && (
                  <Text>
                    <strong>Prep time:</strong>{' '}
                    {recipe.prep_time} minutes
                  </Text>
                )}

                {/* Ingredients */}
                <Box>
                  <Heading size="sm" mb={3}>
                    Ingredients
                  </Heading>

                  {recipe.ingredients?.length > 0 ? (
                    <Stack gap={3}>
                      {recipe.ingredients.map(
                        (ingredient, index) => (
                          <Checkbox.Root
                            key={index}
                            size="lg"
                            checked={checkedIngredients.includes(index)}
                            onCheckedChange={() => toggleIngredient(index)}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>
                              {typeof ingredient === 'string'
                                ? ingredient
                                : ingredient.ingredient}
                            </Checkbox.Label>
                          </Checkbox.Root>
                        )
                      )}
                    </Stack>
                  ) : (
                    <Text color="gray.500">
                      No ingredients listed.
                    </Text>
                  )}
                </Box>

                {/* Instructions */}
                <Box>
                  <Heading size="sm" mb={3}>
                    Instructions
                  </Heading>

                  {recipe.recipe_steps?.length > 0 ? (
                    <Stack gap={4}>
                      {recipe.recipe_steps.map((step, index) => (
                        <Box key={step.id || index}>
                          <Text fontWeight="bold">
                            Step {index + 1}
                          </Text>

                          <Text>
                            {step.instruction}
                          </Text>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Text color="gray.500">
                      No instructions listed.
                    </Text>
                  )}
                </Box>
              </Stack>
            </Dialog.Body>

            <Dialog.Root
              open={showDeleteConfirm}
              onOpenChange={(event) => {
                if (!event.open && !deleting) {
                  setShowDeleteConfirm(false)
                }
              }}
            >
              <Dialog.Backdrop />

              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>
                      Delete Recipe?
                    </Dialog.Title>

                    <Dialog.CloseTrigger asChild>
                      <CloseButton disabled={deleting} />
                    </Dialog.CloseTrigger>
                  </Dialog.Header>

                  <Dialog.Body>
                    <Text>
                      Are you sure you want to delete{' '}
                      <strong>{recipe.title}</strong>?
                    </Text>

                    <Text mt={3} color="gray.600">
                      This will permanently delete the recipe,
                      its ingredients, and its instructions.
                    </Text>
                  </Dialog.Body>

                  <Dialog.Footer>
                    <Stack
                      direction={{ base: 'column', md: 'row' }}
                      width="100%"
                      gap={3}
                    >
                      <Button
                        variant="outline"
                        width={{ base: '100%', md: 'auto' }}
                        onClick={() =>
                          setShowDeleteConfirm(false)
                        }
                        disabled={deleting}
                      >
                        Cancel
                      </Button>

                      <Button
                        width={{ base: '100%', md: 'auto' }}
                        onClick={handleDelete}
                        loading={deleting}
                      >
                        Delete Recipe
                      </Button>
                    </Stack>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Dialog.Root>

            <Dialog.Footer>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                width="100%"
                gap={3}
              >
                <Button
                  width={{ base: '100%', md: 'auto' }}
                  onClick={() => onEdit(recipe)}
                >
                  Edit Recipe
                </Button>

                <Button
                  width={{ base: '100%', md: 'auto' }}
                  variant="outline"
                  onClick={() =>
                    setShowDeleteConfirm(true)
                  }
                >
                  Delete Recipe
                </Button>

                <Button
                  width={{ base: '100%', md: 'auto' }}
                  variant="outline"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </Stack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}