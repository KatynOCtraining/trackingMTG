document.addEventListener("DOMContentLoaded", () => {
  const tabCollection = document.getElementById("tab-collection");
  const tabStatistics = document.getElementById("tab-statistics");
  const sectionCollection = document.getElementById("section-collection");
  const sectionStatistics = document.getElementById("section-statistics");

  const viewBySet = document.getElementById("view-by-set");
  const viewMyCollection = document.getElementById("view-my-collection");
  const collectionContent = document.getElementById("collection-content");

  // Fonction pour afficher/masquer les sections principales
  function toggleMainTab(activeTab) {
    if (activeTab === "collection") {
      sectionCollection.classList.add("visible");
      sectionCollection.classList.remove("hidden");
      sectionStatistics.classList.add("hidden");
      sectionStatistics.classList.remove("visible");

      tabCollection.classList.add("active");
      tabStatistics.classList.remove("active");
    } else {
      sectionStatistics.classList.add("visible");
      sectionStatistics.classList.remove("hidden");
      sectionCollection.classList.add("hidden");
      sectionCollection.classList.remove("visible");

      tabStatistics.classList.add("active");
      tabCollection.classList.remove("active");
    }
  }

  // Fonction pour gérer les sous-menus de la collection
  function toggleCollectionView(activeView) {
    if (activeView === "by-set") {
      collectionContent.innerHTML = "<p>Recherche par extension active.</p>";
      viewBySet.classList.add("active");
      viewMyCollection.classList.remove("active");
    } else {
      collectionContent.innerHTML = "<p>Ma collection active.</p>";
      viewMyCollection.classList.add("active");
      viewBySet.classList.remove("active");
    }
  }

  // Écouteurs pour les onglets principaux
  tabCollection.addEventListener("click", () => toggleMainTab("collection"));
  tabStatistics.addEventListener("click", () => toggleMainTab("statistics"));

  // Écouteurs pour les sous-menus de la collection
  viewBySet.addEventListener("click", () => toggleCollectionView("by-set"));
  viewMyCollection.addEventListener("click", () =>
    toggleCollectionView("my-collection")
  );

  // Chargement par défaut
  toggleMainTab("collection");
  toggleCollectionView("by-set");
});
