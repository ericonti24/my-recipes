const { body } = require("express-validator");

const validateRecipe = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Recipe title is required")
        .escape(),

    body("prep_time")
        .isInt({ min: 1 })
        .withMessage("Prep time must be a positive number")
];

module.exports = validateRecipe;