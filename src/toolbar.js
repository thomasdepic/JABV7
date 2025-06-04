import { initPolygon, deletePolygonAndData, updatePolygon } from "./config/polygon.js";
import { saveData as saveToFile } from "./storage.js";
import { centerOnDrone } from "./execution/droneTracker.js";
import { initDisplaySection } from "./display.js";
import { connectSerial } from "./execution/gpsReader.js";
import { initExecutionModeLive } from "./execution/droneTracker.js";



// 👇 Appel principal
export function initToolbar() {
  console.log("🧭 Initialisation de la toolbar...");
  initPolygonSection();
  initFileSection();
  initDroneSection();
  initDisplaySection();
  // Tu pourras ajouter ici : initDroneSection(), initSettingsSection(), etc.
}


function initPolygonSection() {
  console.log("🧩 initPolygonSection() appelée");

  const polygonIcon = document.getElementById("polygon-section-icon");
  const polygonToggle = document.getElementById("polygon-section-toggle");
  const polygonControls = document.getElementById("polygon-controls");
  const lockBtn = document.getElementById("btn-toggle-lock");

  const settingsBtn = document.getElementById("btn-settings");
  const slidersContainer = document.getElementById("slidersContainer");
  const resetBtn = document.getElementById("btn-reset-sliders");

  const gridBtn = document.getElementById("btn-toggle-grid");
  const droneControls = document.getElementById("drone-controls");

  let slidersOpen = false;

  // ▶️ Créer polygone
  document.getElementById("btn-create-polygon")?.addEventListener("click", () => {
    initPolygon();
  });

  // 🗑️ Supprimer polygone
  document.getElementById("btn-delete-polygon")?.addEventListener("click", () => {
    deletePolygonAndData();
  });

  // 🔒 Verrouiller (valider) le polygone
  lockBtn?.addEventListener("click", () => {
    polygonControls.style.display = "none";
    lockBtn.style.display = "none";
    polygonIcon.src = "assets/icons/polygon-validated.svg";
    if (window.polygon) window.polygon.disableEdit();

    // 🟢 Valider la section drone
    window.polygonValidated = true;
    droneControls.style.display = "flex";

    console.log("✅ Polygone validé → section drone activée");
  });

  // ✏️ Rééditer le polygone
  polygonToggle?.addEventListener("click", () => {
    if (window.polygonValidated) {
      polygonControls.style.display = "flex";
      lockBtn.style.display = "block";
      polygonIcon.src = "assets/icons/polygon-section.svg";
      if (window.polygon) window.polygon.enableEdit();

      // ❌ Réinitialise la section drone
      window.polygonValidated = false;
      droneControls.style.display = "none";

      // Réafficher la grille si elle était cachée
      if (window.gridLayer && window.gridHidden) {
        window.map.addLayer(window.gridLayer);
        window.gridHidden = false;
        console.log("🔁 gridLayer réaffichée (réédition polygone)");
      }

      // Supprimer les cercles de validation
      if (window.detectionCircles) {
        window.detectionCircles.forEach(c => window.map.removeLayer(c));
        window.detectionCircles = [];
        console.log("❌ Cercles de validation supprimés");
      }

      console.log("✏️ Réédition du polygone activée");
    }
  });

  // ⚙️ Sliders
  settingsBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    slidersOpen = !slidersOpen;
    slidersContainer.style.display = slidersOpen ? "flex" : "none";
  });

  document.addEventListener("click", (e) => {
    if (!slidersContainer.contains(e.target) && !settingsBtn.contains(e.target)) {
      slidersContainer.style.display = "none";
      slidersOpen = false;
    }
  });

  // 🔄 Reset sliders
  resetBtn?.addEventListener("click", () => {
    const defaults = {
      profondeur: 3,
      pente: 33,
      cellSize: 10,
      rotation: 0
    };

    document.getElementById("profondeurInput").value = defaults.profondeur;
    document.getElementById("profondeurValue").textContent = defaults.profondeur;

    document.getElementById("penteInput").value = defaults.pente;
    document.getElementById("penteValue").textContent = defaults.pente;

    document.getElementById("cellSizeInput").value = defaults.cellSize;
    document.getElementById("cellSizeValue").textContent = defaults.cellSize;

    document.getElementById("rotationInput").value = defaults.rotation;
    document.getElementById("rotationValue").textContent = defaults.rotation + "°";

    if (window.polygon) updatePolygon();

    console.log("🔄 Réglages réinitialisés et polygone mis à jour");
  });

  // ⚪ Init état
  window.polygonValidated = false;
  polygonControls.style.display = "flex";
  lockBtn.style.display = "block";
  droneControls.style.display = "none";
}




export function initDroneSection() {
  console.log("🚁 initDroneSection() appelée");

  const droneToggle = document.getElementById("drone-section-toggle"); // Icône de section
  const droneControls = document.getElementById("drone-controls");     // Panneau boutons internes
  const connectBtn = document.getElementById("btn-connect-drone");     // Bouton plug
  const dronePopup = document.getElementById("drone-popup");           // Popup latéral
  const popupConnectBtn = document.getElementById("popup-connect-btn"); // Bouton "Se connecter"
  const centerBtn = document.getElementById("btn-center");

  // 🔒 Initialement repliée
  droneControls.style.display = "none";
  dronePopup.classList.add("hidden");

  // ▶️ Clic sur l'icône de section → ouvre / ferme la zone de boutons
  droneToggle?.addEventListener("click", () => {
    if (!window.polygonValidated) {
      console.log("🚫 Polygone non validé → section drone désactivée");
      return;
    }

    const isVisible = droneControls.style.display !== "none";
    droneControls.style.display = isVisible ? "none" : "flex";
    console.log(isVisible ? "❌ Drone replié" : "📦 Drone déplié");
  });

  // ⚡ Clic sur le bouton "plug" → toggle le popup drone
  connectBtn?.addEventListener("click", () => {
    const isOpen = !dronePopup.classList.contains("hidden");
    dronePopup.classList.toggle("hidden", isOpen);
    console.log(isOpen ? "❌ Popup drone fermé" : "🪟 Popup drone ouvert");
  });

  // 📡 Connexion série via bouton dans le popup
  popupConnectBtn?.addEventListener("click", async () => {
    await connectSerial();
  });

  popupConnectBtn?.addEventListener("click", async () => {
    await connectSerial();               // connexion série GPS
    initExecutionModeLive();            // activation du suivi live
    console.log("📡 Mode exécution en direct activé");
  });
  

  // 📍 Centrer sur le drone
  centerBtn?.addEventListener("click", () => {
    centerOnDrone();
  });
}





function initFileSection() {
  const fileIcon = document.getElementById("file-section-toggle");
  const fileControls = document.getElementById("file-controls");

  document.getElementById("btn-save")?.addEventListener("click", () => {
    saveToFile();
  });

  document.getElementById("btn-load")?.addEventListener("click", () => {
    document.getElementById("fileInput")?.click();
  });

  fileIcon?.addEventListener("click", () => {
    const isVisible = fileControls.style.display !== "none";
    fileControls.style.display = isVisible ? "none" : "flex";
  });
}