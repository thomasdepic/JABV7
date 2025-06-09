import * as PointUtils from '../utils/point.js';

export let gridLayer = null;
export let fondPointsLayer = null;
export let pentePointsLayer = null;
export let bordPointsLayer = null;

export let inFondPoints = [];
export let bordFondPoints = [];
export let fondPoints = [];
export let pentePoints = [];
export let bordPoints = [];

export let lines = [];
//export let addedPoints = [];
export let intersectionCount = 0;

document.addEventListener("DOMContentLoaded", () => {

});

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
function findIntersections(line, bufferLayer, localPoints, minDist, type, color, count=true) {
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
      const mesureLocation = new PointUtils.Point(latlng, color, type);
      localPoints.push(mesureLocation);
      if(count){
        window.intersectionCount++;
      }
    }
  });
}


// --- Intersections entre les lignes de la grille qui sont à l'interieur du polygon ---
function calculateLineIntersections(minDist, type, color) {
  if (!window.bufferFondLayer) {
    console.error("BufferFond non trouvé.");
    return;
  }
  const bufferGeoJSON = window.bufferFondLayer.toGeoJSON();
  for (let i = 0; i < window.lines.length; i++) {
    for (let j = i + 1; j < window.lines.length; j++) {
      const pt = getLineIntersection(window.lines[i], window.lines[j]);
      if (pt && turf.booleanPointInPolygon(turf.point([pt.lng, pt.lat]), bufferGeoJSON)) {
        if (!isTooClose(pt, window.bordFondPoints, minDist)) {
          const point = new PointUtils.Point(pt, color, type);
          window.inFondPoints.push(point);
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
  if (window.fondPointsLayer && window.map.hasLayer(window.fondPointsLayer)) {
    console.log("♻️ Suppression de l’ancienne fondPointsLayer");
    window.map.removeLayer(window.fondPointsLayer);
  }
  if (window.pentePointsLayer && window.map.hasLayer(window.pentePointsLayer)) {
    console.log("♻️ Suppression de l’ancienne pentePointsLayer");
    window.map.removeLayer(window.pentePointsLayer);
  }
  if (window.bordPointsLayer && window.map.hasLayer(window.bordPointsLayer)) {
    console.log("♻️ Suppression de l’ancienne bordPointsLayer");
    window.map.removeLayer(window.bordPointsLayer);
  }
  


  // 🧱 Réinitialisation des groupes Leaflet (sans les ajouter tout de suite)
  window.gridLayer = L.layerGroup();
  window.fondPointsLayer = L.layerGroup();
  window.pentePointsLayer = L.layerGroup();
  window.bordPointsLayer = L.layerGroup(); // On ne l’ajoute que si elle est cochée

  // Affichage conditionnel des couches
  if (!window.gridHidden) window.map.addLayer(window.gridLayer);
  if (document.getElementById("chk-points-fond")?.checked) window.map.addLayer(window.fondPointsLayer);
  if (document.getElementById("chk-points-pente")?.checked) window.map.addLayer(window.pentePointsLayer);
  if (document.getElementById("chk-points-bord")?.checked) window.map.addLayer(window.bordPointsLayer);


  // 📦 Initialisation des structures
  window.inFondPoints = [];
  window.bordFondPoints = [];
  window.pentePoints = [];
  window.bordPoints = [];
  window.lines = [];
  window.intersectionCount = 0;
  console.log("📦 Structures internes réinitialisées");

  const cellSizeMeters = parseFloat(document.getElementById("cellSizeInput").value) || 10;
  const manualRotation = parseFloat(document.getElementById("rotationInput").value) || 0;

  // Rotation du polygone pour aligner la grille
  const polygonCoords = window.polygon.getLatLngs()[0];
  const angle = (manualRotation+0.1) * Math.PI / 180 + getMainOrientation(window.polygon);
  const center = window.polygon.getBounds().getCenter();
  const rotatedPolygon = rotatePolygon(polygonCoords, center, angle);

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
  for (let lat = southWest.lat; lat <= northEast.lat; lat += cellSizeLatDeg) latValues.push(lat);
  for (let lng = southWest.lng; lng <= northEast.lng; lng += cellSizeLngDeg) lngValues.push(lng);

  latValues.forEach(lat => {
    const start = L.latLng(lat, southWest.lng);
    const end = L.latLng(lat, northEast.lng);
    const rotatedLine = rotateLine(L.polyline([start, end], { color: 'red', weight: 3 }), angle, center);
    rotatedLine.addTo(window.gridLayer);
    window.lines.push(rotatedLine);
    findIntersections(rotatedLine, window.bufferDemiLayer, window.pentePoints, cellSizeMeters * 0.8, "pente", "red");
    findIntersections(rotatedLine, window.bufferFondLayer, window.bordFondPoints, cellSizeMeters * 0.8, "fond", "green");
    findIntersections(rotatedLine, window.polygon, window.bordPoints, cellSizeMeters * 0.8, "bord", "blue", false);
  });

  lngValues.forEach(lng => {
    const start = L.latLng(southWest.lat, lng);
    const end = L.latLng(northEast.lat, lng);
    const rotatedLine = rotateLine(L.polyline([start, end], { color: 'blue', weight: 3 }), angle, center);
    rotatedLine.addTo(window.gridLayer);
    window.lines.push(rotatedLine);
    findIntersections(rotatedLine, window.bufferDemiLayer, window.pentePoints, cellSizeMeters * 0.8, "pente", "red");
    findIntersections(rotatedLine, window.bufferFondLayer, window.bordFondPoints, cellSizeMeters * 0.8, "fond", "green");
    findIntersections(rotatedLine, window.polygon, window.bordPoints, cellSizeMeters * 0.8, "bord", "blue", false);
  });

  calculateLineIntersections(cellSizeMeters / 3, "fond", "green");
  window.fondPoints = window.inFondPoints.concat(window.bordFondPoints);

  PointUtils.showPoints(window.fondPointsLayer, window.fondPoints, 5);
  PointUtils.showPoints(window.pentePointsLayer, window.pentePoints, 5);
  PointUtils.showPoints(window.bordPointsLayer, window.bordPoints, 5);

  // ➕ Création des cercles de validation
  if (window.detectionCircles && Array.isArray(window.detectionCircles)) {
    window.detectionCircles.forEach(c => window.map.removeLayer(c));
  }
  window.detectionCircles = [];

  const radius = parseFloat(document.getElementById("circleRadiusInput")?.value || "1.0");

  [...window.fondPoints, ...window.pentePoints].forEach(point => {
    const circle = L.circle([point.lat, point.lng], {
      radius,
      color: "red",
      fillColor: "red",
      weight: 1,
      fillOpacity: 1
    });    
    window.detectionCircles.push(circle);
    point.detectionCircle = circle;


    // Affichage si coché
    if (document.getElementById("chk-validation-circles")?.checked) {
      circle.addTo(window.map);
    }
  });
}


export function initIntersections() {
  console.log("📌 Initialisation du module Intersections...");
}