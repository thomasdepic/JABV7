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


export function initPolygonSection() {
  console.log("🧩 initPolygonSection() appelée");

  const polygonIcon = document.getElementById("polygon-section-icon");
  const polygonToggle = document.getElementById("polygon-section-toggle");
  const polygonControls = document.getElementById("polygon-controls");
  const lockBtn = document.getElementById("btn-toggle-lock");
  const settingsBtn = document.getElementById("btn-settings");
  const slidersContainer = document.getElementById("slidersContainer");
  const resetBtn = document.getElementById("btn-reset-sliders");

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
    if (window.polygon) {
      window.polygon.disableEdit();
      console.log("✅ Polygone verrouillé");
    }
  });

  // ✏️ Rééditer le polygone
  polygonToggle?.addEventListener("click", () => {
    polygonControls.style.display = "flex";
    lockBtn.style.display = "block";
    polygonIcon.src = "assets/icons/polygon-section.svg";
    if (window.polygon) {
      window.polygon.enableEdit();
      console.log("✏️ Polygone éditable");
    }
  });

  // ⚙️ Sliders
  settingsBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    slidersOpen = !slidersOpen;
    slidersContainer.style.display = slidersOpen ? "flex" : "none";
  });

  // Clic en-dehors → refermer sliders
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
    console.log("🔄 Réglages réinitialisés");
  });

  // ⚪ Initialisation affichage des contrôles
  polygonControls.style.display = "flex";
  lockBtn.style.display = "block";
}



export function initDroneSection() {
  console.log("🚁 initDroneSection() appelée");

  const connectBtn = document.getElementById("btn-connect-drone");
  const dronePopup = document.getElementById("drone-popup");
  const popupConnectBtn = document.getElementById("popup-connect-btn");
  const centerBtn = document.getElementById("btn-center");

  // 📡 Connexion série via bouton connecteur (toolbar)
  connectBtn?.addEventListener("click", () => {
    const isOpen = !dronePopup.classList.contains("hidden");
    dronePopup.classList.toggle("hidden", isOpen);
    console.log(isOpen ? "❌ Popup drone fermé" : "🪟 Popup drone ouvert");
  });

  // 📡 Connexion série via bouton dans le popup
  popupConnectBtn?.addEventListener("click", async () => {
    await connectSerial();
    initExecutionModeLive(); // Activer le suivi en direct après la connexion
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