// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// ADD THIS LINE for detail page
router.get("/detail/:invId", invController.buildByInventoryId);

module.exports = router;