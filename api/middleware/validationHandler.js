// This middleware function is used to validate the request body for any validation errors. 
// If there are any errors, it will return a 400 status code with the error messages. 
// If there are no errors, it will call the next middleware function in the stack.
const { validationResult } = require("express-validator");

const validationHandler = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    next();
};


module.exports = validationHandler;