/** La version avec du modeManager */

import { setMode, getMode, toggleMode } from "./modeManager.js";
import { initMap } from "./map.js";
import { initSliderWithButtons } from "./utils/sliders.js";
import { saveToFile, loadFromFile } from "./storage.js";
import { centerOnDrone } from "./execution/droneTracker.js";
import("./config/polygon.js")
  .then(m => {
    console.log("✅ Chargement manuel de polygon.js depuis main.js réussi !");
    if (m.initPolygon) {
      console.log("🧪 Appel test de initPolygon()");
      m.initPolygon();
    }
  })
  .catch(err => {
    console.error("❌ Erreur lors du chargement de polygon.js :", err);
  });


document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Application Leaflet chargée");

  // Initialise la carte
  initMap();

  // Initialise les sliders (avec boutons +/-)
  initSliderWithButtons("profondeurInput", "profondeurValue", "profondeurMinus", "profondeurPlus");
  initSliderWithButtons("penteInput", "penteValue", "penteMinus", "pentePlus");
  initSliderWithButtons("cellSizeInput", "cellSizeValue", "cellSizeMinus", "cellSizePlus");
  initSliderWithButtons("rotationInput", "rotationValue", "rotationMinus", "rotationPlus");

  // Gestion des boutons de la toolbar
  document.getElementById('btn-mode').addEventListener('click', () => {
    toggleMode();
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    saveToFile();
  });

  document.getElementById('btn-load').addEventListener('click', () => {
    document.getElementById('fileInput').click(); // ✅ Déclenche la sélection de fichier
  });  

  document.getElementById('btn-center').addEventListener('click', () => {
    centerOnDrone();
  });

  // Gestion de l'ouverture/fermeture du panneau sliders
  const settingsBtn = document.getElementById('btn-settings');
  const slidersContainer = document.getElementById('slidersContainer');

  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Empêche de le fermer immédiatement
    const isVisible = slidersContainer.style.display === 'flex';
    slidersContainer.style.display = isVisible ? 'none' : 'flex';
  });

  // Cacher le panneau si clic en dehors
  document.addEventListener('click', (e) => {
    if (!slidersContainer.contains(e.target) && !settingsBtn.contains(e.target)) {
      slidersContainer.style.display = 'none';
    }
  });

  // Appliquer le mode actuel au démarrage
  setMode(getMode());

  console.log("✅ Tous les modules sont chargés !");
});


// import { initSliderWithButtons } from "./utils/sliders.js";
// import { initMap } from './map.js';
// import { connectSerial } from "./execution/droneTraker.js";
// import { initPolygon } from './config/polygon.js';
// import { initBufferFond } from './config/bufferFond.js';
// import { initBufferDemi } from './config/bufferDemi.js';
// import { initStorage } from './storage.js';
// import { initIntersections } from './config/intersections.js';

// document.addEventListener("DOMContentLoaded", () => {
//   console.log("🚀 Application Leaflet chargée");
//   // Initialise les sliders
//   initSliderWithButtons("profondeurInput", "profondeurValue", "profondeurMinus", "profondeurPlus");
//   initSliderWithButtons("penteInput", "penteValue", "penteMinus", "pentePlus");
//   initSliderWithButtons("cellSizeInput", "cellSizeValue", "cellSizeMinus", "cellSizePlus");
//   initSliderWithButtons("rotationInput", "rotationValue", "rotationMinus", "rotationPlus");

//   initMap();              // Initialise la carte
//   initPolygon();          // Initialise le polygone
//   initBufferFond();       // Initialise le buffer de fond
//   initBufferDemi();       // Initialise le buffer demi
//   initStorage();          // Initialise la gestion de sauvegarde
//   initIntersections();    // Initialise les intersections

//   window.connectSerial = connectSerial; // Permet d'appeler la fonction depuis le bouton HTML

//   console.log("✅ Tous les modules sont chargés !");
  
// });