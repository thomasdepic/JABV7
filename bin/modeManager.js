// modeManager.js

let appState = {
  mode: "config",           // Mode par défaut
  cleanupFn: null           // Fonction de nettoyage du mode actif
};

export function getMode() {
  return localStorage.getItem("appMode") || "config";
}

export function setMode(mode) {
  // Nettoyer le mode précédent s'il y a une fonction de nettoyage
  if (appState.cleanupFn) {
    console.log("🧽 Nettoyage du mode précédent");
    appState.cleanupFn();
    appState.cleanupFn = null;
  }

  appState.mode = mode;
  localStorage.setItem("appMode", mode);
  console.log(`🔄 Passage en mode : ${mode}`);

  clearPreviousMode();

  if (mode === "config") {
    import("../src/config/polygon.js").then(m => {
      if (!window.polygon) {
        console.log(`[${new Date().toISOString()}] 🧭 modeManager → initPolygon() appelé`);
        m.initPolygon();
      } else {
        console.log(`[${new Date().toISOString()}] 🔁 modeManager → Polygone déjà présent`);
        m.makePolygonEditable(window.polygon, true);
      }
  
      appState.cleanupFn = () => {
        import("../src/config/configModeCleanup.js").then(c => c.cleanupConfigMode());
      };
    });
  
    import("../src/config/bufferFond.js").then(m => m.initBufferFond());
    import("../src/config/bufferDemi.js").then(m => m.initBufferDemi());
    import("../src/config/intersections.js").then(m => m.initIntersections());
    import("../src/storage.js").then(m => m.initStorage());
  
    // try {
    //   import("./storage.js").then(m => {
    //     if (m.initStorage) m.initStorage();
    //   });
    // } catch (e) {
    //   console.warn("⚠️ Storage ignoré :", e);
    // }
  }
  
  

  else if (mode === "execution") {
    // Charger GPS reader
    import("../src/execution/gpsReader.js").then(gps => {
      console.log("🔌 Connexion série demandée (mode exécution)");
      gps.connectSerial();
    });
  
    // Charger le tracker temps réel
    import("../src/execution/droneTracker.js").then(tracker => {
      tracker.initExecutionModeLive();
      appState.cleanupFn = tracker.cleanupExecutionModeLive;
    });
  }
  

  updateUIForMode(mode);
  console.log(`✅ Mode ${mode} chargé !`);
}

export function toggleMode() {
  console.log("🔀 Basculement de mode demandé");
  const newMode = appState.mode === "config" ? "execution" : "config";
  setMode(newMode);
}

/**
 * Nettoyage des éléments visuels du mode précédent (hors Leaflet)
 */
function clearPreviousMode() {
  console.log("🧹 Nettoyage visuel du mode précédent...");

  // Masquer les panneaux spécifiques
  const configPanel = document.getElementById("configPanel");
  const executionPanel = document.getElementById("executionPanel");
  if (configPanel) configPanel.style.display = "none";
  if (executionPanel) executionPanel.style.display = "none";
}

/**
 * Met à jour l'affichage de l'interface selon le mode actif
 */
function updateUIForMode(mode) {
  const configPanel = document.getElementById("configPanel");
  const executionPanel = document.getElementById("executionPanel");
  const modeDisplay = document.getElementById("modeDisplay");

  if (modeDisplay) {
    modeDisplay.textContent = `Mode : ${mode === "config" ? "Configuration" : "Exécution"}`;
  }

  if (mode === "config") {
    if (configPanel) configPanel.style.display = "block";
    if (executionPanel) executionPanel.style.display = "none";
  } else if (mode === "execution") {
    if (configPanel) configPanel.style.display = "none";
    if (executionPanel) executionPanel.style.display = "block";
    // Forcer le redimensionnement de la carte si elle change de conteneur
    if (window.map) window.map.invalidateSize();
  }
}

/**
 * Initialisation automatique au chargement
 */
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleMode");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      toggleMode();
    });
    console.log("🎛️ Écouteur ajouté sur #toggleMode");
  } else {
    console.warn("⚠️ Bouton #toggleMode non trouvé !");
  }

  // Chargement du mode actuel au démarrage
  setMode(getMode());
});
