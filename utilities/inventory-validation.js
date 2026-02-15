const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */
validate.classificationRules = () => {
    return [
        // classification_name is required and must be alphanumeric
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isAlphanumeric()
            .withMessage("Please provide a valid classification name (no spaces or special characters)."),
    ]
}

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

/*  **********************************
 *  Inventory Item Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
    return [
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Please provide a valid make."),

        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Please provide a valid model."),

        body("inv_year")
            .trim()
            .notEmpty()
            .isInt({ min: 1900, max: 2099 })
            .withMessage("Please provide a valid year."),

        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a description."),

        body("inv_image")
            .trim()
            .notEmpty()
            .withMessage("Please provide an image path."),

        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .withMessage("Please provide a thumbnail path."),

        body("inv_price")
            .trim()
            .notEmpty()
            .isDecimal()
            .withMessage("Please provide a valid price."),

        body("inv_miles")
            .trim()
            .notEmpty()
            .isInt()
            .withMessage("Please provide a valid mile value."),

        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a color."),

        body("classification_id")
            .trim()
            .notEmpty()
            .isInt()
            .withMessage("Please select a classification."),
    ]
}

/* ******************************
 * Check data and return errors or continue to add inventory
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Vehicle",
            nav,
            classificationList,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        })
        return
    }
    next()
}

module.exports = validate
