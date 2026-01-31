const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}



/* ***************************
 *  Build inventory item detail view - ADD THIS FUNCTION
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId
    console.log("DEBUG: Loading vehicle detail for ID:", inv_id)
    
    const data = await invModel.getInventoryById(inv_id)
    
    if (!data) {
      console.log("DEBUG: No vehicle found for ID:", inv_id)
      const nav = await utilities.getNav(req)
      return res.render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, this vehicle could not be found.",
        nav
      })
    }
    
    console.log("DEBUG: Vehicle found:", data.inv_make, data.inv_model)
    const nav = await utilities.getNav(req)
    res.render("./inventory/detail", {
      title: data.inv_make + " " + data.inv_model,
      nav,
      vehicle: data
    })
  } catch (error) {
    console.error("Error in buildByInventoryId:", error)
    next(error)
  }
}


 module.exports = invCont