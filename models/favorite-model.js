const pool = require("../database/")

async function addFavorite(account_id, inv_id) {
  try {
    const sql = "INSERT INTO public.user_favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *"
    return await pool.query(sql, [account_id, inv_id])
  } catch (error) {
    return error.message
  }
}

async function removeFavorite(account_id, inv_id) {
  try {
    const sql = "DELETE FROM public.user_favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *"
    return await pool.query(sql, [account_id, inv_id])
  } catch (error) {
    return error.message
  }
}

async function getFavoritesByAccount(account_id) {
  try {
    const sql = `SELECT i.* FROM public.user_favorites AS uf JOIN public.inventory AS i ON uf.inv_id = i.inv_id WHERE uf.account_id = $1 ORDER BY i.inv_make, i.inv_model`
    return await pool.query(sql, [account_id])
  } catch (error) {
    return error.message
  }
}

async function isFavorited(account_id, inv_id) {
  try {
    const sql = "SELECT * FROM public.user_favorites WHERE account_id = $1 AND inv_id = $2"
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount > 0
  } catch (error) {
    return false
  }
}

module.exports = { addFavorite, removeFavorite, getFavoritesByAccount, isFavorited }
