const FAVORITES_KEY = "pawhome-favorites";
const REQUEST_KEY = "pawhome-request";
const LISTING_KEY = "pawhome-listing";

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
}

function saveFavorites(ids) { localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)); }
function getPet(id) { return window.PETS.find((pet) => pet.id === Number(id)) || window.PETS[0]; }
function money(value) { return value === 0 ? "No fee" : `$${value} adoption fee`; }

function syncFavoriteCount() {
  const count = document.getElementById("favorite-count");
  if (count) count.textContent = getFavorites().length;
}

function toast(message) {
  document.querySelector(".toast")?.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.appendChild(node);
  window.setTimeout(() => node.remove(), 1800);
}

function petCard(pet) {
  const saved = getFavorites().includes(pet.id);
  return `
    <article class="pet-card">
      <img src="${pet.image}" alt="${pet.name}, ${pet.breed}" />
      <div class="pet-body">
        <div class="pet-topline"><span>${pet.species}</span><span>${pet.status}</span></div>
        <div class="pet-bottom"><h3>${pet.name}</h3><button class="heart ${saved ? "saved" : ""}" data-favorite="${pet.id}" aria-label="Save ${pet.name}">${saved ? "♥" : "♡"}</button></div>
        <p class="pet-breed">${pet.breed} · ${pet.age}</p>
        <p class="pet-location">⌖ ${pet.location}</p>
        <div class="pet-bottom"><span class="fee">${money(pet.fee)}</span><a class="button button-light" href="pet.php?id=${pet.id}">Meet ${pet.name}</a></div>
      </div>
    </article>
  `;
}

function bindFavoriteButtons() {
  document.querySelectorAll("[data-favorite]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.favorite);
      const favorites = getFavorites();
      const updated = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
      saveFavorites(updated);
      button.classList.toggle("saved", updated.includes(id));
      button.textContent = updated.includes(id) ? "♥" : "♡";
      const count = document.getElementById("favorite-count");
      if (count) count.textContent = updated.length;
      toast(updated.includes(id) ? "Saved to your favorites" : "Removed from favorites");
    });
  });
}

function renderHome() {
  const grid = document.getElementById("featured-pets");
  if (!grid) return;
  grid.innerHTML = window.PETS.slice(0, 3).map(petCard).join("");
  bindFavoriteButtons();
}

function renderPets() {
  const grid = document.getElementById("pets-grid");
  if (!grid) return;
  const filters = document.querySelectorAll("[data-species]");
  const search = document.getElementById("pet-search");
  const location = document.getElementById("location-filter");
  const sort = document.getElementById("sort-pets");
  const params = new URLSearchParams(window.location.search);
  let activeSpecies = params.get("species") || "All";
  const favoritesOnly = params.get("favorites") === "true";

  function update() {
    const query = (search?.value || "").toLowerCase().trim();
    let pets = window.PETS.filter((pet) => {
      const speciesMatch = activeSpecies === "All" || pet.species === activeSpecies;
      const locationMatch = !location?.value || pet.location.includes(location.value);
      const searchMatch = !query || `${pet.name} ${pet.breed} ${pet.species}`.toLowerCase().includes(query);
      const favoriteMatch = !favoritesOnly || getFavorites().includes(pet.id);
      return speciesMatch && locationMatch && searchMatch && favoriteMatch;
    });

    if (sort?.value === "fee-low") pets.sort((a, b) => a.fee - b.fee);
    if (sort?.value === "age") pets.sort((a, b) => parseInt(a.age, 10) - parseInt(b.age, 10));
    grid.innerHTML = pets.length ? pets.map(petCard).join("") : `<div class="empty">No pets match those filters. Try opening the search a little.</div>`;
    bindFavoriteButtons();
  }

  filters.forEach((filter) => filter.addEventListener("click", () => {
    activeSpecies = filter.dataset.species;
    filters.forEach((item) => item.classList.toggle("active", item === filter));
    update();
  }));
  search?.addEventListener("input", update);
  location?.addEventListener("change", update);
  sort?.addEventListener("change", update);
  filters.forEach((filter) => filter.classList.toggle("active", filter.dataset.species === activeSpecies));
  update();
}

function renderPetDetail() {
  const root = document.getElementById("pet-detail");
  if (!root) return;
  const id = new URLSearchParams(window.location.search).get("id") || 1;
  const pet = getPet(id);
  root.innerHTML = `
    <div class="detail-layout">
      <img class="detail-image" src="${pet.image}" alt="${pet.name}, ${pet.breed}" />
      <section class="detail-panel">
        <span class="kicker">${pet.status} · ${pet.location}</span>
        <h1>${pet.name}</h1>
        <div class="detail-meta"><span>${pet.breed}</span><span>${pet.age}</span><span>${money(pet.fee)}</span></div>
        <p class="detail-description">${pet.description}</p>
        <div class="traits">${pet.traits.map((trait) => `<span class="trait">${trait}</span>`).join("")}</div>
        <div class="form-actions"><button class="button button-coral" id="detail-favorite">${getFavorites().includes(pet.id) ? "♥ Saved" : "♡ Save pet"}</button><a class="button button-dark" href="adopt.php?pet=${pet.id}">Ask about ${pet.name}</a></div>
        <p class="detail-description" style="margin-top:22px;">Every Paw &amp; Home profile is a starting point for a thoughtful conversation with the current caregiver.</p>
      </section>
    </div>
  `;
  document.getElementById("detail-favorite").addEventListener("click", () => {
    const favorites = getFavorites();
    saveFavorites(favorites.includes(pet.id) ? favorites.filter((item) => item !== pet.id) : [...favorites, pet.id]);
    document.getElementById("detail-favorite").textContent = getFavorites().includes(pet.id) ? "♥ Saved" : "♡ Save pet";
    toast(getFavorites().includes(pet.id) ? "Saved to your favorites" : "Removed from favorites");
  });
}

function initAdoptionForm() {
  const form = document.getElementById("adoption-form");
  if (!form) return;
  const petSelect = document.getElementById("pet-select");
  const petParam = new URLSearchParams(window.location.search).get("pet");
  petSelect.innerHTML = window.PETS.map((pet) => `<option value="${pet.id}" ${String(pet.id) === petParam ? "selected" : ""}>${pet.name} · ${pet.breed}</option>`).join("");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    localStorage.setItem(REQUEST_KEY, JSON.stringify(data));
    document.getElementById("adoption-confirmation").classList.add("show");
    form.reset();
  });
}

function initRehomeForm() {
  const form = document.getElementById("rehome-form");
  if (!form) return;
  const preview = document.getElementById("listing-preview");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const listing = Object.fromEntries(new FormData(form));
    localStorage.setItem(LISTING_KEY, JSON.stringify(listing));
    preview.innerHTML = `<img src="${listing.image || window.PETS[0].image}" alt="${listing.name}" /><div><span class="kicker">Preview listing</span><h3>${listing.name}</h3><p class="pet-breed">${listing.species} · ${listing.breed}</p><p class="pet-location">${listing.location}</p></div>`;
    document.getElementById("rehome-confirmation").classList.add("show");
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  syncFavoriteCount();
  bindFavoriteButtons();
  renderHome();
  renderPets();
  renderPetDetail();
  initAdoptionForm();
  initRehomeForm();
});
