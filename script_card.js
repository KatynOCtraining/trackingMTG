const SCRYFALL_API_BASE = "https://api.scryfall.com";

class CollectionManager {
  constructor() {
    this.collection = [];
    this.userCollection = new Set();
    this.sets = [];
  }

  async fetchAllSets() {
    try {
      const response = await fetch(`${SCRYFALL_API_BASE}/sets`);
      const data = await response.json();
      this.sets = data.data
        .filter((set) => set.card_count > 0)
        .map((set) => ({
          code: set.code,
          name: set.name,
          type: set.set_type,
        }));

      this.populateSetDropdown();
    } catch (error) {
      console.error("Erreur lors de la récupération des sets :", error);
    }
  }

  populateSetDropdown() {
    const selectElement = document.getElementById("filtre-extension");
    console.log(selectElement); // Ajoutez ceci pour vérifier si l'élément est trouvé
    if (!selectElement) {
      console.error("L'élément avec l'ID 'filtre-extension' est introuvable.");
      return;
    }

    selectElement.innerHTML =
      '<option value="">Sélectionner une extension</option>';

    this.sets.forEach((set) => {
      const option = document.createElement("option");
      option.value = set.code;
      option.textContent = set.name;
      selectElement.appendChild(option);
    });

    selectElement.addEventListener("change", (event) => {
      this.fetchCardsFromSet(event.target.value);
    });
  }

  async fetchCardsFromSet(setCode) {
    if (!setCode) return;

    try {
      const response = await fetch(
        `${SCRYFALL_API_BASE}/cards/search?q=set:${setCode}&order=collector_number`
      );
      const data = await response.json();

      this.collection = data.data.map((card) => ({
        id: card.id,
        name: card.name,
        set: card.set,
        rarity: card.rarity,
        imageUrl: card.image_uris?.normal,
        collectorNumber: card.collector_number,
        type: card.type_line,
      }));

      this.renderCards();
    } catch (error) {
      console.error("Erreur lors de la récupération des cartes :", error);
    }
  }

  renderCards() {
    const carteContainer = document.getElementById("liste-cartes");
    if (!carteContainer) {
      console.error("L'élément avec l'ID 'liste-cartes' est introuvable.");
      return;
    }

    carteContainer.innerHTML = ""; // Vider le conteneur

    if (this.collection.length === 0) {
      carteContainer.innerHTML =
        "<p>Aucune carte trouvée pour cette extension.</p>";
      return;
    }

    this.collection.forEach((carte) => {
      const carteElement = document.createElement("div");
      carteElement.classList.add("carte");
      carteElement.innerHTML = `
        <img src="${carte.imageUrl}" alt="${
        carte.name
      }" style="width: 80px; height: auto;"/>
        <div>
          <span>${carte.collectorNumber} - ${carte.name}</span>
          <span>${carte.type}</span>
          <span>${carte.rarity}</span>
        </div>
        <input type="checkbox" 
               data-card-id="${carte.id}"
               ${this.userCollection.has(carte.id) ? "checked" : ""}
               onchange="collectionManager.toggleCardOwnership(this)">
      `;
      carteContainer.appendChild(carteElement);
    });

    this.updateCollectionStatistics();
  }

  toggleCardOwnership(checkbox) {
    const cardId = checkbox.dataset.cardId;
    if (checkbox.checked) {
      this.userCollection.add(cardId);
    } else {
      this.userCollection.delete(cardId);
    }
    this.updateCollectionStatistics();
  }

  updateCollectionStatistics() {
    const totalCards = this.collection.length;
    const ownedCards = Array.from(this.userCollection).filter((cardId) =>
      this.collection.some((card) => card.id === cardId)
    ).length;

    const possessionRate =
      totalCards > 0 ? ((ownedCards / totalCards) * 100).toFixed(2) : 0;

    const tauxGlobalElement = document.getElementById("taux-global");
    const totalCartesElement = document.getElementById("total-cartes");

    if (!tauxGlobalElement || !totalCartesElement) {
      console.error(
        "Les éléments pour les statistiques globales sont introuvables."
      );
      return;
    }

    tauxGlobalElement.textContent = `${possessionRate}%`;
    totalCartesElement.textContent = totalCards;
  }

  init() {
    console.log("Initialisation de la collection...");
    this.fetchAllSets();
  }
}

// Initialisation globale
const collectionManager = new CollectionManager();

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM chargé, démarrage de l'application...");
  collectionManager.init();
});
