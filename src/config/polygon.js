import { updateBufferFond } from './bufferFond.js';
import { updateBufferDemi } from './bufferDemi.js';
import { generateIntersections } from './intersections.js';

window.distanceLabels = [];

function log(msg) {
  console.log(`[${new Date().toISOString()}] 🧩 polygon.js → ${msg}`);
}

function calculateDistance(latlng1, latlng2) {
  return window.map.distance(latlng1, latlng2).toFixed(2);
}

export function updateDistanceLabels() {
  window.distanceLabels.forEach(label => window.map.removeLayer(label));
  window.distanceLabels = [];

  if (window.polygon && document.getElementById("chk-distances")?.checked) {
    const latlngs = window.polygon.getLatLngs()[0];
    for (let i = 0; i < latlngs.length; i++) {
      const start = latlngs[i];
      const end = latlngs[(i + 1) % latlngs.length];
      const distance = calculateDistance(start, end);
      const middle = L.latLng((start.lat + end.lat) / 2, (start.lng + end.lng) / 2);
      const label = L.tooltip({
        permanent: true,
        direction: "center",
        className: "distance-label"
      })
        .setLatLng(middle)
        .setContent(distance + " m");

      window.map.addLayer(label);
      window.distanceLabels.push(label);
    }
  }
}

export function updatePolygon() {
  log("🔄 updatePolygon appelé");

  // 🔁 Affichage conditionnel du polygone
  if (window.polygon) {
    const visible = document.getElementById("chk-polygon")?.checked;
    if (visible) window.map.addLayer(window.polygon);
    else window.map.removeLayer(window.polygon);
  }

  updateDistanceLabels();
  updateBufferFond();
  updateBufferDemi();
  generateIntersections();
}

export function initPolygon() {
  if (!window.map) {
    console.error("❌ La carte n'est pas initialisée !");
    return;
  }

  if (window.polygon) {
    log("♻️ Polygone déjà existant, suppression avant recréation");
    window.map.removeLayer(window.polygon);
    window.polygon = null;
  }

  log("➕ Création d’un nouveau polygone vide");

  const polygon = window.map.editTools.startPolygon();
  // polygon.setStyle({
  //   color: "blue",
  //   weight: 2,
  // });
  
  polygon.enableEdit();

  polygon.on('editable:editing', updatePolygon);
  polygon.on('editable:vertex:drag', updatePolygon);
  polygon.on('editable:vertex:new', updatePolygon);
  polygon.on('editable:vertex:deleted', updatePolygon);
  polygon.on('editable:dragend', updatePolygon);

  window.polygon = polygon;

  updatePolygon();
}

export function makePolygonEditable(polygon, editable) {
  if (!polygon) return;
  editable ? polygon.enableEdit() : polygon.disableEdit();
}

export function deletePolygonAndData() {
  if (window.polygon) {
    window.map.removeLayer(window.polygon);
    window.polygon = null;
  }

  if (window.bufferFondLayer) {
    window.map.removeLayer(window.bufferFondLayer);
    window.bufferFondLayer = null;
  }

  if (window.bufferDemiLayer) {
    window.map.removeLayer(window.bufferDemiLayer);
    window.bufferDemiLayer = null;
  }

  if (window.gridLayer) {
    window.map.removeLayer(window.gridLayer);
    window.gridLayer = null;
  }

  const allPoints = []
    .concat(window.fondPoints || [])
    .concat(window.pentePoints || [])
    .concat(window.bordPoints || []);

  allPoints.forEach(point => {
    if (point.marker && typeof point.marker.remove === "function") {
      point.marker.remove();
    }
    if (point.circle && typeof point.circle.remove === "function") {
      point.circle.remove();
    }
  });

  window.fondPoints = [];
  window.pentePoints = [];
  window.bordPoints = [];


  if (window.distanceLabels && Array.isArray(window.distanceLabels)) {
    window.distanceLabels.forEach(label => window.map.removeLayer(label));
    window.distanceLabels = [];
  }

  if (window.detectionCircles && Array.isArray(window.detectionCircles)) {
    window.detectionCircles.forEach(c => window.map.removeLayer(c));
    window.detectionCircles = [];
  }
  

  console.log("🧹 Polygone et dépendances supprimés");
}
