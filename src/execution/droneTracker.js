import { distanceInMeters } from "../utils/geoUtils.js";
import { setOnPositionUpdate, lat, lng } from "./gpsReader.js";

let keyDownHandler = null;

export function initExecutionModeLive() {
  console.log("📡 Mode exécution avec GPS activé");

  if (!window.map) {
    console.error("❌ Carte Leaflet non disponible !");
    return;
  }

  updateValidationCount();

  // Écoute automatique des positions reçues
  setOnPositionUpdate(({ lat, lng }) => {
    console.log("📍 Position GPS reçue :", lat, lng);
    window.lastDronePosition = [lat, lng];
    highlightNearbyPoint({ lat, lng });
  });

  // Écoute du bouton pour valider manuellement
  const validateButton = document.getElementById("validateButton");
  if (validateButton) {
    validateButton.addEventListener("click", () => {
      if (lat !== null && lng !== null) {
        console.log("🖱️ Bouton appuyé → validation GPS manuelle");
        validateClosestPoint({ lat, lng });
      } else {
        console.warn("⚠️ Position GPS non disponible !");
      }
    });
  }

  // L'ancien code pour la touche "Entrée"
  keyDownHandler = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (lat !== null && lng !== null) {
        console.log("⌨️ Entrée pressée → validation GPS manuelle");
        validateClosestPoint({ lat, lng });
      }
    }
  };
  window.addEventListener("keydown", keyDownHandler);
}


function getDetectionRadius() {
  const slider = document.getElementById("circleRadiusInput");
  if (!slider) {
    console.warn("⚠️ Slider #circleRadiusInput introuvable, rayon de détection par défaut = 1.0 m");
    return 1.0;
  }
  return parseFloat(slider.value);
}


export function cleanupExecutionModeLive() {
  console.log("🧹 Nettoyage du mode GPS");

  if (window.detectionRadiusLayer) {
    window.map.removeLayer(window.detectionRadiusLayer);
    window.detectionRadiusLayer = null;
  }

  if (keyDownHandler) {
    window.removeEventListener("keydown", keyDownHandler);
    keyDownHandler = null;
  }

  const counter = document.getElementById("validationCounter");
  if (counter) {
    counter.textContent = "✅ Points validés : 0 / 0";
  }
}

function validateClosestPoint(pos) {
  const allPoints = [
    ...(window.fondPoints || []),
    ...(window.pentePoints || []),
    ...(window.bordPoints || [])
  ];

  for (let p of allPoints) {
    if (p.visited || !p.isInRange || !p.detectionCircle) continue;

    p.visited = true;
    p.detectionCircle.setStyle({ color: "green", fillColor: "green" }); // 🟢
    console.log("✅ Point validé :", p);
    updateValidationCount();
    break;
  }
}



function highlightNearbyPoint(pos) {
  const radius = getDetectionRadius();
  const detectionCircles = window.detectionCircles || [];

  for (let circle of detectionCircles) {
    // Cherche le point associé à ce cercle
    const point = [...(window.fondPoints || []), ...(window.pentePoints || []), ...(window.bordPoints || [])]
      .find(p => p.detectionCircle === circle);

    if (!point || point.visited) continue;

    const dist = distanceInMeters(pos.lat, pos.lng, point.lat, point.lng);

    if (dist <= radius) {
      circle.setStyle({ color: "orange", fillColor: "orange" }); // 🟠
      point.isInRange = true;
    } else {
      circle.setStyle({ color: "red", fillColor: "red" }); // 🔴
      point.isInRange = false;
    }
  }
}



export function updateValidationCount() {
  const allPoints = [
    ...(window.fondPoints || []),
    ...(window.pentePoints || []),
  ];

  const total = allPoints.length;
  const visited = allPoints.filter(p => p.visited).length;

  const counter = document.getElementById("validationCounter");
  if (counter) {
    counter.textContent = `Points validés : ${visited} / ${total}`;
  }
}


export function centerOnDrone() {
  // Exemple d'implémentation
  if (window.map && window.lastDronePosition) {
    window.map.setView(window.lastDronePosition, 18);
  } else {
    console.warn("📡 Position du drone non disponible");
  }
}



//
// ==========================
// 💻 MODE TEST SOURIS (commenté)
// ==========================
// 
// let mouseLatLng = null;
// let mouseMoveHandler = null;
// let keyDownHandler = null;
//
// function onMouseMove(e) {
//   mouseLatLng = e.latlng;
//   highlightHoveredPoint();
// }
//
// function onKeyDown(e) {
//   if (e.key === "Enter" && mouseLatLng) {
//     validateHoveredPoint();
//   }
// }
//
// export function initExecutionModeTest() {
//   console.log("🧪 Mode test avec la souris activé");
//   if (!window.map) {
//     console.error("❌ Carte indisponible !");
//     return;
//   }
//
//   mouseMoveHandler = onMouseMove;
//   window.map.on("mousemove", mouseMoveHandler);
//
//   keyDownHandler = onKeyDown;
//   window.addEventListener("keydown", keyDownHandler);
//
//   showDetectionRadiusAroundPoints();
//   updateValidationCount();
// }
//
// export function cleanupExecutionModeTest() {
//   console.log("🧹 Nettoyage mode test souris");
//   if (mouseMoveHandler) window.map.off("mousemove", mouseMoveHandler);
//   if (keyDownHandler) window.removeEventListener("keydown", keyDownHandler);
//
//   if (window.detectionRadiusLayer) {
//     window.map.removeLayer(window.detectionRadiusLayer);
//     window.detectionRadiusLayer = null;
//   }
//
//   const counter = document.getElementById("validationCounter");
//   if (counter) {
//     counter.textContent = "✅ Points validés : 0 / 0";
//   }
// }
//
// function highlightHoveredPoint() {
//   if (!window.addedPoints || !mouseLatLng) return;
//
//   window.addedPoints.forEach(p => {
//     if (p.visited) return;
//
//     const dist = distanceInMeters(mouseLatLng.lat, mouseLatLng.lng, p.lat, p.lng);
//     if (dist <= detectionRadius) {
//       p.marker.setStyle({ color: "orange", fillColor: "orange" });
//     } else {
//       p.marker.setStyle({ color: p.color, fillColor: p.color });
//     }
//   });
// }
//
// function validateHoveredPoint() {
//   if (!window.addedPoints || !mouseLatLng) return;
//
//   for (let p of window.addedPoints) {
//     if (p.visited) continue;
//
//     const dist = distanceInMeters(mouseLatLng.lat, mouseLatLng.lng, p.lat, p.lng);
//     if (dist <= detectionRadius) {
//       p.visited = true;
//       p.marker.setStyle({ color: "green", fillColor: "green" });
//       console.log("✅ Point validé :", p);
//       updateValidationCount();
//       break;
//     }
//   }
// }