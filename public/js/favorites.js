// Toggle save/remove on click + initialize saved state on load
document.addEventListener('click', function (e) {
  if (e.target && e.target.classList.contains('fav-toggle')) {
    const btn = e.target
    const invId = btn.dataset.invId
    if (!invId) return

    // Decide action by current state
    const action = btn.classList.contains('saved') ? 'remove' : 'add'
    fetch('/favorites/' + action, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inv_id: invId })
    })
      .then(response => {
        if (response.redirected) {
          window.location = response.url
          return
        }
        return response.json().catch(() => ({ success: false, message: 'Bad JSON response' }))
      })
      .then(data => {
        if (!data) return
        if (data.success) {
          // If removing from the "My Saved Vehicles" page, remove the list item and stay on the page
          if (action === 'remove' && btn.closest('#saved-vehicles')) {
            const li = btn.closest('li')
            if (li) li.remove()
            return
          }

          // Toggle saved state and update accessible attribute + label
          btn.classList.toggle('saved')
          btn.setAttribute('aria-pressed', btn.classList.contains('saved') ? 'true' : 'false')

          if (btn.closest('#saved-vehicles') || btn.classList.contains('remove-fav')) {
            btn.textContent = btn.classList.contains('saved') ? 'Remove' : 'Save'
          } else {
            btn.textContent = btn.classList.contains('saved') ? 'Saved' : 'Save'
          }
        } else {
          console.warn('Favorite action failed:', data.message)
          if (data.redirect) window.location = data.redirect
        }
      })
      .catch(err => console.error('Favorite error:', err))
  }
})

// On load, ask server for saved IDs and mark buttons
document.addEventListener('DOMContentLoaded', function () {
  fetch('/favorites/ids', { credentials: 'same-origin' })
    .then(r => r.json().catch(() => null))
    .then(data => {
      if (!data || !data.ids) return
      data.ids.forEach(id => {
        const btn = document.querySelector('.fav-toggle[data-inv-id="' + id + '"]')
        if (btn) {
          btn.classList.add('saved')
          btn.setAttribute('aria-pressed', 'true')
          if (btn.closest('#saved-vehicles') || btn.classList.contains('remove-fav')) {
            btn.textContent = 'Remove'
          } else {
            btn.textContent = 'Saved'
          }
        }
      })
    })
    .catch(err => {
      // likely not logged in or endpoint missing — silently ignore
    })
})
