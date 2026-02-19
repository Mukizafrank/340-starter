const favoriteModel = require("../models/favorite-model")
const utilities = require("../utilities/")

async function showFavorites(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const data = await favoriteModel.getFavoritesByAccount(account_id)
    const nav = await utilities.getNav(req)
    return res.render("favorites/saved", { title: "My Saved Vehicles", nav, favorites: data.rows })
  } catch (error) {
    next(error)
  }
}

async function addFavorite(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const { inv_id } = req.body
    if (!inv_id || isNaN(inv_id)) {
      return res.status(400).json({ success: false, message: "Invalid vehicle id" })
    }
    const result = await favoriteModel.addFavorite(account_id, inv_id)
    // handle DB errors returned as strings from model
    if (typeof result === 'string') {
      return res.status(500).json({ success: false, message: result })
    }
    if (result && result.rowCount) {
      return res.json({ success: true })
    }
    return res.status(500).json({ success: false, message: 'Unable to add favorite' })
  } catch (error) {
    // If unique constraint violated (already favorited), treat as success
    if (error && error.code === "23505") {
      return res.json({ success: true })
    }
    return res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

async function removeFavorite(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const { inv_id } = req.body
    if (!inv_id || isNaN(inv_id)) {
      return res.status(400).json({ success: false, message: "Invalid vehicle id" })
    }
    const result = await favoriteModel.removeFavorite(account_id, inv_id)
    if (typeof result === 'string') {
      return res.status(500).json({ success: false, message: result })
    }
    if (result && result.rowCount) {
      return res.json({ success: true })
    }
    return res.status(200).json({ success: false, message: 'Favorite not found' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

async function getFavoriteIds(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const data = await favoriteModel.getFavoritesByAccount(account_id)
    // return an array of inv_id values
    const ids = data.rows.map(r => r.inv_id)
    return res.json({ success: true, ids })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

module.exports = { showFavorites, addFavorite, removeFavorite, getFavoriteIds }
