//validates the recipe data before it is sent to the controller
const { body } = require("express-validator");

const validateRecipe = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Recipe title is required")
        .escape(),

    body("prepTime")
        .isInt({ min: 1 })
        .withMessage("Prep time must be a positive number")
];

module.exports = validateRecipe;