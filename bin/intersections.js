import * as PointUtils from '../utils/point.js';

export let intersectionLayer = null;  // Les points d'intersections
export let gridLayer = null;          // La grille de lignes
export let lines = [];                // Stocke toutes les lignes du quadrillage
export let addedPoints = [];          // Stocke touts les points ajoutées
export let demiPentePoints = [];      // Stocke les points à demi-pente
export let finPentePoints = [];       // Socke les points au bout de la pente
export let intersectionCount = 0;     // Nombre de point de mesure

document.addEventListener("DOMContentLoaded", () => {

});
// const cellSizeSlider = document.getElementById("cellSizeSlider");
// const cellSizeValue = document.getElementById("cellSizeValue");
// let cellSizeMeters = parseFloat(cellSizeSlider.value);
// cellSizeSlider.addEventListener("input", () => {
//   cellSizeMeters = parseFloat(cellSizeSlider.value);
//   cellSizeValue.textContent = cellSizeMeters;
//   console.log("📏 Nouvelle distance entre les sommets :", cellSizeMeters, "m");
//   generateIntersections();
// });

// const rotationSlider = document.getElementById("rotationSlider");
// const rotationValue = document.getElementById("rotationValue");
// let manualRotation = parseFloat(rotationSlider.value);
// rotationSlider.addEventListener("input", () => {
//   manualRotation = parseFloat(rotationSlider.value);
//   rotationValue.textContent = manualRotation + "°";
//   generateIntersections();
// });



//** Fonctions utilitaires pour gerer les rotations */

function getMainOrientation(polygon) {
  const coords = polygon.getLatLngs()[0]; // Tableau de L.LatLng
  let longestEdge = { length: 0, angle: 0 };

  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i], p2 = coords[i + 1];

    // Calcul de la latitude moyenne du segment pour correction
    const avgLat = (p1.lat + p2.lat) / 2;
    const cosLat = Math.cos(avgLat * Math.PI / 180); // Correction Mercator

    // Ajustement des distances
    const dx = (p2.lng - p1.lng) * cosLat; // Ajustement longitude
    const dy = p2.lat - p1.lat; // Latitude inchangée

    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx); // Angle corrigé

    if (length > longestEdge.length) {
      longestEdge = { length, angle };
    }
  }
  return longestEdge.angle;
}


function transformToGlobal(latlng, center, angle) {
  const oneDegreeLatMeters = 111320;
  const oneDegreeLngMeters = 111320 * Math.cos(center.lat * Math.PI / 180);
  // Convertir en mètres par rapport au centre
  const dx = (latlng.lng - center.lng) * oneDegreeLngMeters;
  const dy = (latlng.lat - center.lat) * oneDegreeLatMeters;
  // Rotation
  const newDx = dx * Math.cos(angle) - dy * Math.sin(angle);
  const newDy = dx * Math.sin(angle) + dy * Math.cos(angle);
  // Reconvertir en degrés
  const newLng = center.lng + newDx / oneDegreeLngMeters;
  const newLat = center.lat + newDy / oneDegreeLatMeters;

  return L.latLng(newLat, newLng);
}


function rotatePolygon(polygonCoords, center, angle) {
  const factor = Math.cos(center.lat * Math.PI / 180);

  return polygonCoords.map(p => {
    const dx = (p.lng - center.lng) * factor;
    const dy = p.lat - center.lat;

    const newDx = dx * Math.cos(-angle) - dy * Math.sin(-angle);
    const newDy = dx * Math.sin(-angle) + dy * Math.cos(-angle);

    const newLng = (newDx / factor) + center.lng;
    const newLat = newDy + center.lat;
    return L.latLng(newLat, newLng);
  });
}


function rotateLine(line, angle, center) {
  const latlngs = line.getLatLngs();
  const rotatedLatLngs = latlngs.map(ll => transformToGlobal(ll, center, angle));
  return L.polyline(rotatedLatLngs, { color: 'black', weight: 1 });
}



//** filtrage des points de mesure */

function isTooClose(newPoint, existingPoints, minDistanceMeters) {
  for (let existingPoint of existingPoints) {
    const dist = turf.distance(
      turf.point([newPoint.lng, newPoint.lat]),
      turf.point([existingPoint.lng, existingPoint.lat]),
      { units: 'meters' }
    );
    if (dist < minDistanceMeters) return true;
  }
  return false;
}



//** Fonctions d'intersection */

// --- intersections entre une ligne et un polygon ---
function findIntersections(line, bufferLayer, localPoints, minDist, color) {
  const latlngs = line.getLatLngs();
  const lineGeoJSON = turf.lineString(latlngs.map(latlng => [latlng.lng, latlng.lat]));
  if (!bufferLayer) {
    console.error("Buffer layer non trouvé.");
    return;
  }
  const bufferGeoJSON = bufferLayer.toGeoJSON();
  const intersections = turf.lineIntersect(lineGeoJSON, bufferGeoJSON);
  intersections.features.forEach(point => {
    const latlng = L.latLng(point.geometry.coordinates[1], point.geometry.coordinates[0]);
    if (!isTooClose(latlng, localPoints, minDist)) {
      const mesureLocation = new PointUtils.Point(latlng, color);
      //L.circleMarker(L.latLng(mesureLocation.lat, mesureLocation.lng), { color: color, radius: 5 }).addTo(window.intersectionLayer);
      window.addedPoints.push(mesureLocation);
      localPoints.push(mesureLocation);
      window.intersectionCount++;
    }
  });
}



// --- Intersections entre les lignes de la grille qui sont à l'interieur du polygon ---
function calculateLineIntersections(localPoints, minDist, color) {
  if (!window.bufferFondLayer) {
    console.error("BufferFond non trouvé.");
    return;
  }
  const bufferGeoJSON = window.bufferFondLayer.toGeoJSON();
  for (let i = 0; i < window.lines.length; i++) {
    for (let j = i + 1; j < window.lines.length; j++) {
      const intersection = getLineIntersection(window.lines[i], window.lines[j]);
      if (intersection && turf.booleanPointInPolygon(turf.point([intersection.lng, intersection.lat]), bufferGeoJSON)) {
        if (!isTooClose(intersection, localPoints, minDist)) {
          const mesureLocation = new PointUtils.Point(intersection, color);
          //L.circleMarker(L.latLng(mesureLocation.lat, mesureLocation.lng), { color: color, radius: 5 }).addTo(window.intersectionLayer);
          window.addedPoints.push(mesureLocation);
          window.intersectionCount++;
        }
      }
    }
  }
}
function getLineIntersection(line1, line2) {
  const latlngs1 = line1.getLatLngs();
  const latlngs2 = line2.getLatLngs();
  const line1GeoJSON = turf.lineString(latlngs1.map(latlng => [latlng.lng, latlng.lat]));
  const line2GeoJSON = turf.lineString(latlngs2.map(latlng => [latlng.lng, latlng.lat]));
  const intersection = turf.lineIntersect(line1GeoJSON, line2GeoJSON);
  if (intersection.features.length > 0) {
    const point = intersection.features[0].geometry.coordinates;
    return L.latLng(point[1], point[0]);
  }
  return null;
}



//** Fonction principale */

export function generateIntersections() {
  console.log("⚙️ Appel à generateIntersections()");

  if (!window.polygon) {
    alert("Veuillez d'abord dessiner un polygone.");
    return;
  }

  if (!window.map) {
    console.error("❌ La carte n'est pas disponible !");
    return;
  }

  // 🔄 Initialisation de l’état de visibilité de la grille
  if (window.gridHidden === undefined) {
    window.gridHidden = false;
    console.log("🔧 gridHidden initialisé à false");
  } else {
    console.log(`🔁 gridHidden existant : ${window.gridHidden}`);
  }

  // ♻️ Nettoyage de la grille précédente
  if (window.gridLayer && window.map.hasLayer(window.gridLayer)) {
    console.log("♻️ Suppression de l’ancienne gridLayer");
    window.map.removeLayer(window.gridLayer);
  }

  // 🧱 Nouvelle instance de gridLayer
  window.gridLayer = L.layerGroup();

  if (!window.gridHidden) {
    window.gridLayer.addTo(window.map);
    console.log("✅ Nouvelle gridLayer ajoutée à la carte");
  } else {
    console.log("🚫 gridLayer masquée (non ajoutée)");
  }

  // ♻️ Suppression de l'ancienne intersectionLayer
  if (window.intersectionLayer) {
    window.map.removeLayer(window.intersectionLayer);
    console.log("♻️ intersectionLayer précédente supprimée");
  }

  window.intersectionLayer = L.layerGroup().addTo(window.map);
  console.log("✅ Nouvelle intersectionLayer ajoutée");

  // 📦 Initialisation des structures
  window.lines = [];
  window.addedPoints = [];
  window.demiPentePoints = [];
  window.finPentePoints = [];
  window.intersectionCount = 0;
  console.log("📦 Structures internes réinitialisées");

  const cellSizeInput = document.getElementById("cellSizeInput");
  const rotationInput = document.getElementById("rotationInput");
    
  const cellSizeMeters = parseFloat(cellSizeInput.value) || 10;
  const manualRotation = parseFloat(rotationInput.value) || 0;

  // Rotation du polygone pour aligner la grille
  const polygonCoords = window.polygon.getLatLngs()[0];
  const angle = manualRotation * Math.PI / 180 + getMainOrientation(window.polygon);
  const center = window.polygon.getBounds().getCenter();
  const rotatedPolygon = rotatePolygon(polygonCoords, center, angle);

  // Affichage du polygone tourné (facultatif)
  // if (window.polygonOriginalLayer) window.map.removeLayer(window.polygonOriginalLayer);
  // window.polygonOriginalLayer = L.polygon(rotatedPolygon, { color: 'blue', weight: 2, dashArray: '5,5' }).addTo(window.map);

  // Définir la bounding box de la grille
  const boundsLocal = L.latLngBounds(rotatedPolygon);
  const southWest = boundsLocal.getSouthWest();
  const northEast = boundsLocal.getNorthEast();
  const oneDegreeLatMeters = 111320;
  const oneDegreeLngMeters = 111320 * Math.cos(center.lat * Math.PI / 180);
  const cellSizeLatDeg = cellSizeMeters / oneDegreeLatMeters;
  const cellSizeLngDeg = cellSizeMeters / oneDegreeLngMeters;

  let latValues = [];
  let lngValues = [];
  for (let lat = southWest.lat; lat <= northEast.lat; lat += cellSizeLatDeg) {
    latValues.push(lat);
  }
  for (let lng = southWest.lng; lng <= northEast.lng; lng += cellSizeLngDeg) {
    lngValues.push(lng);
  }
  // Création des lignes horizontales
  latValues.forEach(lat => {
    let start = L.latLng(lat, southWest.lng);
    let end = L.latLng(lat, northEast.lng);
    let line = L.polyline([start, end], { color: 'red', weight: 3 });
    let rotatedLine = rotateLine(line, angle, center);
    rotatedLine.addTo(window.gridLayer);
  //console.log(`Ligne horizontale: ${start} -> ${end}`);
    window.lines.push(rotatedLine);
    findIntersections(rotatedLine, window.bufferDemiLayer, window.demiPentePoints, cellSizeMeters * 4 / 5, "red");
    findIntersections(rotatedLine, window.bufferFondLayer, window.finPentePoints, cellSizeMeters * 4 / 5, "green");
    findIntersections(rotatedLine, window.polygon, window.finPentePoints, cellSizeMeters * 4 / 5, "blue");
  });
  // Création des lignes verticales
  lngValues.forEach(lng => {
    let start = L.latLng(southWest.lat, lng);
    let end = L.latLng(northEast.lat, lng);
    let line = L.polyline([start, end], { color: 'blue', weight: 3 });
    let rotatedLine = rotateLine(line, angle, center);
    rotatedLine.addTo(window.gridLayer);
  //console.log(`Ligne verticale: ${start} -> ${end}`);
    window.lines.push(rotatedLine);
    findIntersections(rotatedLine, window.bufferDemiLayer, window.demiPentePoints, cellSizeMeters * 4 / 5, "red");
    findIntersections(rotatedLine, window.bufferFondLayer, window.finPentePoints, cellSizeMeters * 4 / 5, "green");
    findIntersections(rotatedLine, window.polygon, window.finPentePoints, cellSizeMeters * 4 / 5, "blue");
  });

  calculateLineIntersections(window.finPentePoints.concat(window.demiPentePoints), cellSizeMeters/3, "green");
  PointUtils.showPoints(window.addedPoints, window.intersectionLayer, 5);
  document.getElementById("infoBubble").innerHTML = "Nombre de point de mesure : " + window.intersectionCount;
  window.map.addLayer(window.gridLayer);
  window.map.addLayer(window.intersectionLayer);
}

export function initIntersections() {
  console.log("📌 Initialisation du module Intersections...");
}