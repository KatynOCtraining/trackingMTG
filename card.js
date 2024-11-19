// Types de cartes Magic standard
const CARD_TYPES = [
  "Créature",
  "Terrain",
  "Éphémère",
  "Rituel",
  "Enchantement",
  "Artefact",
  "Planeswalker",
  "Légendaire",
];

// Variable globale pour stocker les cartes
let cards = [];

// Fonction pour récupérer les extensions disponibles
async function fetchSets() {
  try {
    const response = await fetch("https://api.scryfall.com/sets");
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data
      .filter((set) => set.digital === false && set.card_count > 0)
      .sort((a, b) => new Date(b.released_at) - new Date(a.released_at));
  } catch (error) {
    console.error("Erreur lors de la récupération des extensions:", error);
    alert(
      "Impossible de charger les extensions. Vérifiez votre connexion internet."
    );
    return [];
  }
}

// Fonction pour rechercher les cartes avec filtres
async function searchCards(setCode = "", cardType = "") {
  try {
    let query = [];
    if (setCode) query.push(`set:${setCode}`);

    const typeMapping = {
      Créature: "creature",
      Terrain: "land",
      Éphémère: "instant",
      Rituel: "sorcery",
      Enchantement: "enchantment",
      Artefact: "artifact",
      Planeswalker: "planeswalker",
      Légendaire: "legendary",
    };

    if (cardType && typeMapping[cardType]) {
      query.push(`type:${typeMapping[cardType]}`);
    }

    const searchQuery = query.join(" ");
    const response = await fetch(
      `https://api.scryfall.com/cards/search?q=${searchQuery}&order=name`
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP ! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Erreur lors de la recherche des cartes:", error);
    alert(
      "Impossible de rechercher les cartes. Vérifiez votre connexion internet."
    );
    return [];
  }
}

// Initialisation de l'interface de recherche
async function initSearchInterface() {
  // Vérifier que la section de recherche existe
  const searchSection = document.getElementById("recherche");
  if (!searchSection) {
    console.error("Section de recherche non trouvée");
    return;
  }

  // Conteneur pour les cartes sélectionnées - PLACÉ EN PREMIER
  const selectedCardsContainer = document.createElement("div");
  selectedCardsContainer.id = "selected-cards";
  selectedCardsContainer.classList.add("selected-cards-grid");

  // En-tête pour les cartes sélectionnées
  const selectedCardsTitle = document.createElement("h2");
  selectedCardsTitle.textContent = "Cartes sélectionnées";
  selectedCardsTitle.style.display = "none";
  selectedCardsContainer.appendChild(selectedCardsTitle);

  // Bouton pour ajouter toutes les cartes sélectionnées
  const addAllToCollectionBtn = document.createElement("button");
  addAllToCollectionBtn.textContent = "Ajouter tout à la collection";
  addAllToCollectionBtn.classList.add("add-all-btn");
  addAllToCollectionBtn.style.display = "none";
  addAllToCollectionBtn.addEventListener("click", addAllSelectedToCollection);
  selectedCardsContainer.appendChild(addAllToCollectionBtn);

  // Créer un conteneur de filtres
  const filterContainer = document.createElement("div");
  filterContainer.classList.add("filter-container");

  // Créer un menu déroulant pour les extensions
  const setSelect = document.createElement("select");
  setSelect.id = "set-selector";
  setSelect.innerHTML = '<option value="">Toutes les extensions</option>';

  // Créer un menu déroulant pour les types de cartes
  const typeSelect = document.createElement("select");
  typeSelect.id = "type-selector";
  typeSelect.innerHTML = '<option value="">Tous les types</option>';

  // Peupler le menu déroulant des types de cartes
  CARD_TYPES.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
  });

  // Créer un conteneur pour les résultats de recherche
  const resultsContainer = document.createElement("div");
  resultsContainer.id = "search-results";
  resultsContainer.classList.add("card-grid");

  // Récupérer et peupler les extensions
  try {
    const sets = await fetchSets();
    sets.forEach((set) => {
      const option = document.createElement("option");
      option.value = set.code;
      option.textContent = `${set.name} (${set.code}) - ${new Date(
        set.released_at
      ).getFullYear()}`;
      setSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur lors du peuplement des extensions:", error);
  }

  // Fonction pour ajouter une carte aux cartes sélectionnées
  function addToSelectedCards(card) {
    if (document.querySelector(`#selected-card-${card.id}`)) return;

    const selectedCardElement = document.createElement("div");
    selectedCardElement.id = `selected-card-${card.id}`;
    selectedCardElement.classList.add("selected-card");

    // Image de la carte avec gestion des erreurs
    const cardImage = document.createElement("img");
    cardImage.src = card.image_uris?.small || "";
    cardImage.alt = card.name;
    cardImage.onerror = () => {
      cardImage.alt = "Image non disponible";
      cardImage.src = "placeholder-image.jpg";
    };

    // Bouton d'ajout à la collection
    const addToCollectionBtn = document.createElement("button");
    addToCollectionBtn.textContent = "Ajouter";
    addToCollectionBtn.classList.add("add-to-collection-btn");
    addToCollectionBtn.addEventListener("click", () => addToCollection(card));

    // Bouton de suppression
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.classList.add("remove-selected-card");
    removeBtn.addEventListener("click", () => {
      const checkbox = document.querySelector(`#card-checkbox-${card.id}`);
      if (checkbox) checkbox.checked = false;
      selectedCardElement.remove();
      updateSelectedCardsDisplay();
    });

    selectedCardElement.appendChild(cardImage);
    selectedCardElement.appendChild(addToCollectionBtn);
    selectedCardElement.appendChild(removeBtn);

    selectedCardsContainer.appendChild(selectedCardElement);
    updateSelectedCardsDisplay();
  }

  // Fonction pour mettre à jour l'affichage des cartes sélectionnées
  function updateSelectedCardsDisplay() {
    const selectedCards =
      selectedCardsContainer.querySelectorAll(".selected-card");
    selectedCardsTitle.style.display =
      selectedCards.length > 0 ? "block" : "none";
    addAllToCollectionBtn.style.display =
      selectedCards.length > 0 ? "block" : "none";
  }

  // Fonction pour ajouter toutes les cartes sélectionnées à la collection
  function addAllSelectedToCollection() {
    const selectedCards =
      selectedCardsContainer.querySelectorAll(".selected-card");
    selectedCards.forEach((cardElement) => {
      const cardId = cardElement.id.replace("selected-card-", "");
      const card = cards.find((c) => c.id === cardId);
      if (card) addToCollection(card);
    });

    // Réinitialiser la sélection
    selectedCardsContainer.innerHTML = "";
    selectedCardsContainer.appendChild(selectedCardsTitle);
    selectedCardsContainer.appendChild(addAllToCollectionBtn);

    document
      .querySelectorAll(".card-checkbox")
      .forEach((cb) => (cb.checked = false));
    updateSelectedCardsDisplay();
  }

  // Fonction de recherche et affichage
  async function performSearch() {
    const setCode = setSelect.value;
    const cardType = typeSelect.value;
    resultsContainer.innerHTML = "";

    cards = await searchCards(setCode, cardType);

    if (cards.length === 0) {
      resultsContainer.innerHTML =
        "<p>Aucune carte trouvée. Vérifiez vos filtres.</p>";
      return;
    }

    cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");

      // Checkbox pour sélectionner la carte
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `card-checkbox-${card.id}`;
      checkbox.classList.add("card-checkbox");

      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          addToSelectedCards(card);
        } else {
          const selectedCard = document.querySelector(
            `#selected-card-${card.id}`
          );
          if (selectedCard) selectedCard.remove();
          updateSelectedCardsDisplay();
        }
      });

      // Image de la carte
      if (card.image_uris && card.image_uris.small) {
        const cardImage = document.createElement("img");
        cardImage.src = card.image_uris.small;
        cardImage.alt = card.name;
        cardImage.onerror = () => {
          cardImage.alt = "Image non disponible";
          cardImage.src = "placeholder-image.jpg";
        };
        cardElement.appendChild(cardImage);
      }

      // Informations de la carte
      const cardInfo = document.createElement("div");
      cardInfo.classList.add("card-info");
      cardInfo.innerHTML = `
        <h3>${card.name}</h3>
        <p>Type: ${card.type_line}</p>
        <p>Rareté: ${card.rarity}</p>
      `;

      // Conteneur pour la checkbox
      const cardDetailsContainer = document.createElement("div");
      cardDetailsContainer.classList.add("card-details");

      const checkboxLabel = document.createElement("label");
      checkboxLabel.htmlFor = `card-checkbox-${card.id}`;
      checkboxLabel.textContent = "Ajouter";

      cardDetailsContainer.appendChild(checkbox);
      cardDetailsContainer.appendChild(checkboxLabel);

      cardElement.appendChild(cardInfo);
      cardElement.appendChild(cardDetailsContainer);

      resultsContainer.appendChild(cardElement);
    });
  }

  // Ajouter des écouteurs d'événements pour les filtres
  setSelect.addEventListener("change", performSearch);
  typeSelect.addEventListener("change", performSearch);

  // Ajouter les éléments à la section de recherche
  filterContainer.appendChild(setSelect);
  filterContainer.appendChild(typeSelect);

  // Ajouter tous les éléments à la section de recherche
  searchSection.appendChild(selectedCardsContainer);
  searchSection.appendChild(filterContainer);
  searchSection.appendChild(resultsContainer);
}

// Fonction pour ajouter une carte à la collection
function addToCollection(card) {
  let collection = JSON.parse(localStorage.getItem("magicCollection")) || [];

  const existingCard = collection.find((c) => c.id === card.id);
  if (existingCard) {
    existingCard.quantity = (existingCard.quantity || 1) + 1;
  } else {
    collection.push({
      id: card.id,
      name: card.name,
      set: card.set,
      image: card.image_uris?.small,
      quantity: 1,
    });
  }

  localStorage.setItem("magicCollection", JSON.stringify(collection));
  updateCollectionDisplay();
}

// Fonction pour mettre à jour l'affichage de la collection
function updateCollectionDisplay() {
  const collectionSection = document.getElementById("collection");
  if (!collectionSection) {
    console.error("Section collection non trouvée");
    return;
  }

  let collectionContainer = collectionSection.querySelector(".collection-grid");
  if (!collectionContainer) {
    collectionContainer = document.createElement("div");
    collectionContainer.classList.add("collection-grid");
    collectionSection.appendChild(collectionContainer);
  }

  collectionContainer.innerHTML = "";

  const collection = JSON.parse(localStorage.getItem("magicCollection")) || [];

  if (collection.length === 0) {
    const noCardsMessage = document.createElement("p");
    noCardsMessage.textContent = "Aucune carte dans votre collection";
    collectionContainer.appendChild(noCardsMessage);
    return;
  }

  collection.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("collection-card");
    cardElement.innerHTML = `
      <img src="${card.image || "placeholder-image.jpg"}" alt="${card.name}">
      <h3>${card.name}</h3>
      <p>Quantité: ${card.quantity}</p>
      <button class="remove-card">Retirer</button>
    `;

    cardElement.querySelector(".remove-card").addEventListener("click", () => {
      removeFromCollection(card.id);
    });

    collectionContainer.appendChild(cardElement);
  });
}

// Fonction pour retirer une carte de la collection
function removeFromCollection(cardId) {
  let collection = JSON.parse(localStorage.getItem("magicCollection")) || [];

  const cardIndex = collection.findIndex((c) => c.id === cardId);
  if (cardIndex !== -1) {
    if (collection[cardIndex].quantity > 1) {
      collection[cardIndex].quantity--;
    } else {
      collection.splice(cardIndex, 1);
    }
  }

  localStorage.setItem("magicCollection", JSON.stringify(collection));
  updateCollectionDisplay();
}

// Initialiser l'interface au chargement de la page
document.addEventListener("DOMContentLoaded", initSearchInterface);
document.addEventListener("DOMContentLoaded", updateCollectionDisplay);
