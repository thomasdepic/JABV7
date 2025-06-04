export let map;
export let marker;

export function initMap() {
  map = L.map('map', { editable: true }).setView([48.8566, 2.3522], 13);
  map.doubleClickZoom.disable();

  // 📦 Définition des fonds de carte
  window.baseLayerGoogle = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 30,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps'
  });

  window.baseLayerSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 30,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Satellite'
  });

  window.baseLayerOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 30,
    attribution: '&copy; OSM contributors'
  });

  // 💡 Par défaut : OpenStreetMap
  window.baseLayerOSM.addTo(map);

  // 🔖 Marqueur GPS
  marker = L.marker([0, 0]).addTo(map);

  // 🌍 Rendre map accessible globalement
  window.map = map;

  // 📍 Géolocalisation
  map.locate({ setView: true, maxZoom: 16 });
  map.on('locationfound', e => {
    L.marker(e.latlng).addTo(map).bindPopup("Vous êtes ici").openPopup();
    L.circle(e.latlng, { radius: e.accuracy }).addTo(map);
  });
  map.on('locationerror', e => {
    alert("Géolocalisation impossible : " + e.message);
  });
}