export let bufferDemiLayer = null;

export function initBufferDemi() {
  updateBufferDemi();
}

export function updateBufferDemi() {
  if (!window.map || !window.polygon) return;

  if (bufferDemiLayer) window.map.removeLayer(bufferDemiLayer);

  const coords = window.polygon.getLatLngs()[0].map(latlng => [latlng.lng, latlng.lat]);
  coords.push(coords[0]);

  const polygonGeoJSON = turf.polygon([coords]);
  const pente = parseFloat(document.getElementById('penteInput').value) || 33;
  const profondeur = parseFloat(document.getElementById('profondeurInput').value) || 2;
  const penteCorrigee = pente > 0 ? pente : 1;

  const bufferSize = -profondeur / (penteCorrigee / 100 * 2) / 1000;

  const shrunkPolygon = turf.buffer(polygonGeoJSON, bufferSize, { units: 'kilometers' });

  if (!shrunkPolygon || shrunkPolygon.geometry.coordinates.length === 0) return;

  const newCoords = shrunkPolygon.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
  bufferDemiLayer = L.polygon(newCoords, { color: "red", weight: 2, fillOpacity: 0 });

  // 🔁 Affichage selon la case à cocher
  const visible = document.getElementById("chk-buffer-demi")?.checked;
  if (visible) bufferDemiLayer.addTo(window.map);

  // Pour accès global
  window.bufferDemiLayer = bufferDemiLayer;
}
