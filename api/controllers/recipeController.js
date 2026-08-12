const supabase = require('../database/supabase')

// Create a new recipe with ingredients and steps
const createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      prepTime,
      imageUrl,
      ingredients,
      steps,
    } = req.body

    const userId = req.user.id

    console.log('Create recipe request:', {
      title,
      ingredients,
      steps,
    })

    // Create the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        user_id: userId,
        title,
        description,
        prep_time: prepTime,
        image_url: imageUrl,
      })
      .select()
      .single()

    if (recipeError) {
      console.error('Create recipe error:', recipeError)

      return res.status(500).json({
        message: 'Failed to create recipe',
        error: recipeError.message,
      })
    }

    // Create ingredients
    if (ingredients && ingredients.length > 0) {
      const ingredientRows = ingredients.map((ingredient, index) => ({
        recipe_id: recipe.id,
        display_order: index + 1,
        ingredient,
      }))

      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(ingredientRows)

      if (ingredientsError) {
        console.error('Create ingredients error:', ingredientsError)

        await supabase
          .from('recipes')
          .delete()
          .eq('id', recipe.id)

        return res.status(500).json({
          message: 'Failed to create ingredients',
          error: ingredientsError.message,
        })
      }
    }

    // Create recipe steps
    if (steps && steps.length > 0) {
      const stepRows = steps.map((instruction, index) => ({
        recipe_id: recipe.id,
        display_order: index + 1,
        instruction,
      }))

      // console.log('Recipe step rows:', stepRows)

      const { data: insertedSteps, error: stepsError } = await supabase
        .from('recipe_steps')
        .insert(stepRows)
        .select()

      // console.log('Inserted recipe steps:', insertedSteps)

      if (stepsError) {
        console.error('Create recipe steps error:', stepsError)

        await supabase
          .from('ingredients')
          .delete()
          .eq('recipe_id', recipe.id)

        await supabase
          .from('recipes')
          .delete()
          .eq('id', recipe.id)

        return res.status(500).json({
          message: 'Failed to create recipe steps',
          error: stepsError.message,
        })
      }
    }

        res.status(201).json({
          message: 'Recipe created successfully',
          recipe,
        })
      } catch (error) {
        console.error('Unexpected create recipe error:', error)

        res.status(500).json({
          message: 'Server error',
        })
      }
    }

// Get all recipes with their ingredients and steps
const getRecipes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select(`
        id,
        user_id,
        title,
        description,
        prep_time,
        image_url,
        created_at,
        updated_at,
        ingredients (
          id,
          display_order,
          ingredient,
          created_at,
          updated_at
        ),
        recipe_steps (
          id,
          display_order,
          instruction,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get recipes error:", error);

      return res.status(500).json({
        message: "Failed to retrieve recipes",
        error: error.message,
      });
    }

    res.status(200).json({
      recipes: data,
    });
  } catch (error) {
    console.error("Unexpected get recipes error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get a single recipe by ID with its ingredients and steps
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from("recipes")
      .select(`
        id,
        user_id,
        title,
        description,
        prep_time,
        image_url,
        created_at,
        updated_at,
        ingredients (
          id,
          display_order,
          ingredient,
          created_at,
          updated_at
        ),
        recipe_steps (
          id,
          display_order,
          instruction,
          created_at,
          updated_at
        )
      `)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single()

    if (error) {
      console.error("Get recipe by ID error:", error)

      if (error.code === "PGRST116") {
        return res.status(404).json({
          message: "Recipe not found",
        })
      }

      return res.status(500).json({
        message: "Failed to retrieve recipe",
        error: error.message,
      })
    }

    res.status(200).json({
      recipe: data,
    })
  } catch (error) {
    console.error("Unexpected get recipe by ID error:", error)

    res.status(500).json({
      message: "Server error",
    })
  }
}

// Update a recipe by ID with its ingredients and steps
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params

    const {
      title,
      description,
      prepTime,
      imageUrl,
      ingredients,
      steps,
    } = req.body

    // Update the main recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .update({
        title,
        description,
        prep_time: prepTime,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single()

    if (recipeError) {
      console.error("Update recipe error:", recipeError)

      if (recipeError.code === "PGRST116") {
        return res.status(404).json({
          message: "Recipe not found",
        })
      }

      return res.status(500).json({
        message: "Failed to update recipe",
        error: recipeError.message,
      })
    }

    // Delete existing ingredients
    const { error: deleteIngredientsError } = await supabase
      .from("ingredients")
      .delete()
      .eq("recipe_id", id)

    if (deleteIngredientsError) {
      console.error(
        "Delete existing ingredients error:",
        deleteIngredientsError
      )

      return res.status(500).json({
        message: "Failed to update ingredients",
        error: deleteIngredientsError.message,
      })
    }

    // Insert updated ingredients
    if (ingredients && ingredients.length > 0) {
      const ingredientRows = ingredients.map((ingredient, index) => ({
        recipe_id: id,
        display_order: index + 1,
        ingredient,
      }))

      const { error: ingredientsError } = await supabase
        .from("ingredients")
        .insert(ingredientRows)

      if (ingredientsError) {
        console.error("Update ingredients error:", ingredientsError)

        return res.status(500).json({
          message: "Failed to update ingredients",
          error: ingredientsError.message,
        })
      }
    }

    // Delete existing recipe steps
    const { error: deleteStepsError } = await supabase
      .from("recipe_steps")
      .delete()
      .eq("recipe_id", id)

    if (deleteStepsError) {
      console.error(
        "Delete existing recipe steps error:",
        deleteStepsError
      )

      return res.status(500).json({
        message: "Failed to update recipe steps",
        error: deleteStepsError.message,
      })
    }

    // Insert updated recipe steps
    if (steps && steps.length > 0) {
      const stepRows = steps.map((instruction, index) => ({
        recipe_id: id,
        display_order: index + 1,
        instruction,
      }))

      const { error: stepsError } = await supabase
        .from("recipe_steps")
        .insert(stepRows)

      if (stepsError) {
        console.error("Update recipe steps error:", stepsError)

        return res.status(500).json({
          message: "Failed to update recipe steps",
          error: stepsError.message,
        })
      }
    }

    // Retrieve the complete updated recipe
    const { data: updatedRecipe, error: fetchError } = await supabase
      .from("recipes")
      .select(`
        id,
        user_id,
        title,
        description,
        prep_time,
        image_url,
        created_at,
        updated_at,
        ingredients (
          id,
          display_order,
          ingredient,
          created_at,
          updated_at
        ),
        recipe_steps (
          id,
          display_order,
          instruction,
          created_at,
          updated_at
        )
      `)
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Fetch updated recipe error:", fetchError)

      return res.status(500).json({
        message: "Recipe updated but failed to retrieve updated data",
        error: fetchError.message,
      })
    }

    res.status(200).json({
      message: "Recipe updated successfully",
      recipe: updatedRecipe,
    })
  } catch (error) {
    console.error("Unexpected update recipe error:", error)

    res.status(500).json({
      message: "Server error",
    })
  }
}

// Delete the recipe by ID along with its ingredients and steps
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params

    const {data, error: recipeError } = await supabase
    //Delete the recipe whose ID matches the URL, and return the ID of the row that was deleted.
      .from("recipes")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select("id")

    if (recipeError) {
      console.error("Delete recipe error:", recipeError)

      return res.status(500).json({
        message: "Failed to delete recipe",
        error: recipeError.message,
      })
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "Recipe not found",
      })
    }

    res.status(200).json({
      message: "Recipe deleted successfully",
      id: data[0].id,
    })
  } catch (error) {
    console.error("Unexpected delete recipe error:", error)

    res.status(500).json({
      message: "Server error",
    })
  }
}

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById, 
  updateRecipe,
  deleteRecipe,
}
