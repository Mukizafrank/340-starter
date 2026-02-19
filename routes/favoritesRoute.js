const express = require("express")
const router = new express.Router()
const favoritesController = require("../controllers/favoriteController")
const utilities = require("../utilities/")

// Show saved vehicles (must be logged in)
router.get("/", utilities.checkLogin, utilities.handleErrors(favoritesController.showFavorites))

// Return array of favorited inv_ids for logged-in user (client use)
router.get("/ids", utilities.checkLogin, utilities.handleErrors(favoritesController.getFavoriteIds))

// Add favorite
router.post("/add", utilities.checkLogin, utilities.handleErrors(favoritesController.addFavorite))

// Remove favorite
router.post("/remove", utilities.checkLogin, utilities.handleErrors(favoritesController.removeFavorite))

module.exports = router
