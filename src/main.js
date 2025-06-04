import { initMap } from "./map.js";
import { initSliderWithButtons } from "./utils/sliders.js";
import { saveData as saveToFile, loadData as loadFromFile, initStorage } from "./storage.js";
import { centerOnDrone } from "./execution/droneTracker.js";
import { initToolbar } from "./toolbar.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Application démarrée");

  // 1. Initialiser la carte
  initMap();

  // 2. Initialiser les sliders
  initSliderWithButtons("profondeurInput", "profondeurValue", "profondeurMinus", "profondeurPlus");
  initSliderWithButtons("penteInput", "penteValue", "penteMinus", "pentePlus");
  initSliderWithButtons("cellSizeInput", "cellSizeValue", "cellSizeMinus", "cellSizePlus");
  initSliderWithButtons("rotationInput", "rotationValue", "rotationMinus", "rotationPlus");
  initSliderWithButtons("circleRadiusInput", "circleRadiusValue", "circleRadiusMinus", "circleRadiusPlus");

  // 3. Ouvrir/fermer le panneau sliders
  const settingsBtn = document.getElementById('btn-settings');
  const slidersContainer = document.getElementById('slidersContainer');

  settingsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = slidersContainer.style.display === 'flex';
    slidersContainer.style.display = isVisible ? 'none' : 'flex';
  });

  document.addEventListener('click', (e) => {
    if (!slidersContainer.contains(e.target) && !settingsBtn.contains(e.target)) {
      slidersContainer.style.display = 'none';
    }
  });

  // 4. Initialiser la tool bar
  initToolbar();
  console.log("🧭 initToolbar() appelée");

  // 5. Initialiser le chargement de fichiers
  initStorage();

  // 6. Initialiser les modules de configuration
  import("./config/polygon.js"); // ✅ Charge les fonctions sans les exécuter
  import("./config/bufferFond.js").then(m => m.initBufferFond());
  import("./config/bufferDemi.js").then(m => m.initBufferDemi());
  import("./config/intersections.js").then(m => m.initIntersections());

  // 7. Initialiser les modules d'exécution
  import("./execution/gpsReader.js").then(m => m.connectSerial());
  import("./execution/droneTracker.js").then(m => {
    m.initExecutionModeLive();
    window.cleanupExecution = m.cleanupExecutionModeLive; // Si besoin plus tard
  });

  console.log("✅ Tous les modules sont chargés");
});
