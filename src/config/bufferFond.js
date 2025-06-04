export let bufferFondLayer = null;

export function initBufferFond() {
  updateBufferFond();
}

export function updateBufferFond() {
  if (!window.map || !window.polygon) return;

  if (bufferFondLayer) window.map.removeLayer(bufferFondLayer);

  const coords = window.polygon.getLatLngs()[0].map(latlng => [latlng.lng, latlng.lat]);
  coords.push(coords[0]);

  const polygonGeoJSON = turf.polygon([coords]);
  const pente = parseFloat(document.getElementById('penteInput').value) || 33;
  const profondeur = parseFloat(document.getElementById('profondeurInput').value) || 2;
  const penteCorrigee = pente > 0 ? pente : 1;

  const bufferSize = -profondeur / (penteCorrigee / 100) / 1000;

  const shrunkPolygon = turf.buffer(polygonGeoJSON, bufferSize, { units: 'kilometers' });

  if (!shrunkPolygon || shrunkPolygon.geometry.coordinates.length === 0) return;

  const newCoords = shrunkPolygon.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
  bufferFondLayer = L.polygon(newCoords, { color: "green", weight: 2, fillOpacity: 0});

  // 🔁 Affichage selon la case à cocher
  const visible = document.getElementById("chk-buffer-fond")?.checked;
  if (visible) bufferFondLayer.addTo(window.map);

  // Pour accès global
  window.bufferFondLayer = bufferFondLayer;
}
