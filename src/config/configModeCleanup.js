// configModeCleanup.js
import { makePolygonEditable } from "../utils/geoUtils.js";

export function cleanupConfigMode() {
  console.log(`[${new Date().toISOString()}] 🔒 cleanupConfigMode() appelé`);

  // Attendre un peu que le polygone soit créé
  setTimeout(() => {
    if (window.polygon) {
      console.log(`[${new Date().toISOString()}] 🔒 makePolygonEditable(false) exécuté`);
      makePolygonEditable(window.polygon, false);
    } else {
      console.warn(`[${new Date().toISOString()}] ⚠️ Aucun polygone à verrouiller`);
    }
  }, 200); // <- 200ms pour laisser le DOM / carte s’installer
}
