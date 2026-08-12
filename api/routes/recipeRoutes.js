const express = require('express')
const { 
    createRecipe, 
    getRecipes, 
    getRecipeById, 
    updateRecipe, 
    deleteRecipe 
} = require('../controllers/recipeController')
const authenticateUser = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/', authenticateUser, createRecipe)
router.get('/', authenticateUser, getRecipes)
router.get('/:id', authenticateUser, getRecipeById)
router.patch('/:id', authenticateUser, updateRecipe)
router.delete('/:id', authenticateUser, deleteRecipe)

module.exports = router