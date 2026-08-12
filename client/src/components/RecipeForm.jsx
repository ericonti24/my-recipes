
import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Field,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'

import { uploadRecipeImage } from '../lib/api'

export default function RecipeForm({
  recipe,
  onCreate,
  onUpdate,
  loading,
  onClose,
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [ingredients, setIngredients] = useState([''])
  const [steps, setSteps] = useState([''])

  const [formError, setFormError] = useState('')

  const isEditing = Boolean(recipe)

  // Populate the form when editing an existing recipe
  useEffect(() => {
    if (!recipe) {
      resetForm()
      return
    }

    setTitle(recipe.title || '')
    setDescription(recipe.description || '')
    setPrepTime(
      recipe.prep_time !== null && recipe.prep_time !== undefined
        ? String(recipe.prep_time)
        : ''
    )
    setImageUrl(recipe.image_url || '')
    setImageFile(null)
    setImagePreview(recipe.image_url || '')

    setIngredients(
      recipe.ingredients?.length > 0
        ? recipe.ingredients.map(
            (ingredient) => ingredient.ingredient
          )
        : ['']
    )

    setSteps(
      recipe.recipe_steps?.length > 0
        ? recipe.recipe_steps.map(
            (step) => step.instruction
          )
        : ['']
    )

    setFormError('')
  }, [recipe])

  function updateIngredient(index, value) {
    setIngredients((current) =>
      current.map((ingredient, currentIndex) =>
        currentIndex === index
          ? value
          : ingredient
      )
    )
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      '',
    ])
  }

  function removeIngredient(index) {
    setIngredients((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    )
  }

  function updateStep(index, value) {
    setSteps((current) =>
      current.map((step, currentIndex) =>
        currentIndex === index
          ? value
          : step
      )
    )
  }

  function addStep() {
    setSteps((current) => [
      ...current,
      '',
    ])
  }

  function removeStep(index) {
    setSteps((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    )
  }

  // Handle image file selection and validation
  function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      setImageFile(null)
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setFormError(
        'Please select a JPG, PNG, or WebP image.'
      )

      event.target.value = ''
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setFormError(
        'Image must be smaller than 5 MB.'
      )

      event.target.value = ''
      return
    }

    setFormError('')
    setImageFile(file)

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  // Handle form submission
  async function handleSubmit(event) {
    event.preventDefault()

    setFormError('')

    const cleanedTitle = title.trim()
    const cleanedDescription = description.trim()
    const cleanedImageUrl = imageUrl.trim()

    const cleanedIngredients = ingredients
      .map((item) => item.trim())
      .filter(Boolean)

    const cleanedSteps = steps
      .map((step) => step.trim())
      .filter(Boolean)

    if (!cleanedTitle) {
      setFormError('Recipe name is required.')
      return
    }

    if (cleanedIngredients.length === 0) {
      setFormError('Add at least one ingredient.')
      return
    }

    if (cleanedSteps.length === 0) {
      setFormError('Add at least one instruction step.')
      return
    }

    let finalImageUrl = cleanedImageUrl || null

    if (imageFile) {
      try {
        finalImageUrl = await uploadRecipeImage(imageFile)
      } catch (error) {
        console.error('Image upload error:', error)

        setFormError(
          error.message || 'Failed to upload image.'
        )

        return
      }
    }

    const recipeData = {
      title: cleanedTitle,
      description: cleanedDescription || null,
      prepTime: prepTime
        ? Number(prepTime)
        : null,
      imageUrl: finalImageUrl || null,
      ingredients: cleanedIngredients,
      steps: cleanedSteps,
    }

    let successful

    if (isEditing) {
      successful = await onUpdate(
        recipe.id,
        recipeData
      )
    } else {
      successful = await onCreate(recipeData)
    }

    if (successful) {
      resetForm()
    }
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setPrepTime('')
    setImageUrl('')
    setImageFile(null)
    setImagePreview('')
    setIngredients([''])
    setSteps([''])
    setFormError('')
  }

  function handleClose() {
    if (loading) return

    resetForm()
    onClose()
  }

  return (
    <Dialog.Root
      open={true}
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
              {isEditing
                ? 'Edit Recipe'
                : 'Add New Recipe'}
            </Dialog.Title>

            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
          </Dialog.Header>

          <Dialog.Body>
            <Box
              as="form"
              id="recipe-form"
              onSubmit={handleSubmit}
            >
              <Stack gap={6}>

                {/* Recipe Information */}

                <Box>
                  <Heading
                    size="sm"
                    mb={4}
                  >
                    Recipe Information
                  </Heading>

                  <Stack gap={4}>

                    <Field.Root required>
                      <Field.Label>
                        Recipe name
                        <Field.RequiredIndicator />
                      </Field.Label>

                      <Input
                        value={title}
                        onChange={(event) =>
                          setTitle(event.target.value)
                        }
                        maxLength={120}
                        placeholder="Enter recipe name"
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>
                        Description
                      </Field.Label>

                      <Textarea
                        value={description}
                        onChange={(event) =>
                          setDescription(
                            event.target.value
                          )
                        }
                        maxLength={1000}
                        placeholder="Describe your recipe"
                        rows={4}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>
                        Prep time (minutes)
                      </Field.Label>

                      <Input
                        type="number"
                        value={prepTime}
                        onChange={(event) =>
                          setPrepTime(
                            event.target.value
                          )
                        }
                        min={1}
                        placeholder="15"
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>
                        Recipe Image
                      </Field.Label>

                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                      />

                      <Text
                        fontSize="sm"
                        color="gray.500"
                      >
                        JPG, PNG, or WebP. Maximum size: 5 MB.
                      </Text>

                      {imagePreview && (
                        <Box mt={3}>
                          <Text
                            fontSize="sm"
                            mb={2}
                            fontWeight="medium"
                          >
                            Image Preview
                          </Text>

                          <img
                            src={imagePreview}
                            alt="Recipe preview"
                            style={{
                              width: '100%',
                              maxHeight: '300px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                          />
                        </Box>
                      )}
                    </Field.Root>

                  </Stack>
                </Box>

                {/* Ingredients */}

                <Box>
                  <Heading
                    size="sm"
                    mb={4}
                  >
                    Ingredients
                  </Heading>

                  <Stack gap={4}>
                    {ingredients.map(
                      (ingredient, index) => (
                        <Box
                          key={`ingredient-${index}`}
                        >
                          <Field.Root>
                            <Field.Label>
                              Ingredient {index + 1}
                            </Field.Label>

                            <Input
                              value={ingredient}
                              onChange={(event) =>
                                updateIngredient(
                                  index,
                                  event.target.value
                                )
                              }
                              maxLength={300}
                              placeholder="Example: 2 cups flour"
                            />
                          </Field.Root>

                          {ingredients.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              mt={2}
                              onClick={() =>
                                removeIngredient(index)
                              }
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                      )
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addIngredient}
                    >
                      + Add Ingredient
                    </Button>
                  </Stack>
                </Box>

                {/* Instructions */}

                <Box>
                  <Heading
                    size="sm"
                    mb={4}
                  >
                    Instructions
                  </Heading>

                  <Stack gap={4}>
                    {steps.map(
                      (step, index) => (
                        <Box
                          key={`step-${index}`}
                        >
                          <Field.Root>
                            <Field.Label>
                              Step {index + 1}
                            </Field.Label>

                            <Textarea
                              value={step}
                              onChange={(event) =>
                                updateStep(
                                  index,
                                  event.target.value
                                )
                              }
                              maxLength={2000}
                              placeholder={`Describe step ${index + 1}`}
                              rows={4}
                            />
                          </Field.Root>

                          {steps.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              mt={2}
                              onClick={() =>
                                removeStep(index)
                              }
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                      )
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addStep}
                    >
                      + Add Step
                    </Button>
                  </Stack>
                </Box>

                {/* Error */}

                {formError && (
                  <Box
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                  >
                    <Text>
                      {formError}
                    </Text>
                  </Box>
                )}

              </Stack>
            </Box>
          </Dialog.Body>

          <Dialog.Footer>
            <Stack
              direction={{
                base: 'column',
                md: 'row',
              }}
              width="100%"
              gap={3}
            >
              <Button
                type="submit"
                form="recipe-form"
                width={{
                  base: '100%',
                  md: 'auto',
                }}
                loading={loading}
              >
                {isEditing
                  ? 'Update Recipe'
                  : 'Add Recipe'}
              </Button>

              <Button
                type="button"
                variant="outline"
                width={{
                  base: '100%',
                  md: 'auto',
                }}
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
