import { updatePolygon } from './config/polygon.js';

export function initStorage() {
  console.log("🧠 initStorage() appelé");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachListeners);
  } else {
    attachListeners();
  }
}

function attachListeners() {
  const input = document.getElementById("fileInput");

  if (!input) {
    console.warn("⚠️ Champ fileInput non trouvé dans le DOM !");
    return;
  }

  input.addEventListener("change", loadData);
  console.log("💾 Écouteur sur fileInput attaché avec succès");
}

export function saveData() {
  const data = {
    profondeur: parseFloat(document.getElementById('profondeurInput')?.value),
    pente: parseFloat(document.getElementById('penteInput')?.value),
    cellSizeMeters: parseFloat(document.getElementById('cellSizeInput')?.value),
    manualRotation: parseFloat(document.getElementById('rotationInput')?.value),
    polygonCoords: window.polygon
      ? window.polygon.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng])
      : null,
    fondPoints: (window.fondPoints || []).map(p => {
      // Convertit les points en [lat, lng] ou [x, y]
      if (p.lat && p.lng) return [p.lat, p.lng];
      if (p.x && p.y) return [p.x, p.y];
      return p;
    }),
    pentePoints: (window.pentePoints || []).map(p => {
      // Convertit les points en [lat, lng] ou [x, y]
      if (p.lat && p.lng) return [p.lat, p.lng];
      if (p.x && p.y) return [p.x, p.y];
      return p;
    }),
    bordPoints: (window.bordPoints || []).map(p => {
      // Convertit les points en [lat, lng] ou [x, y]
      if (p.lat && p.lng) return [p.lat, p.lng];
      if (p.x && p.y) return [p.x, p.y];
      return p;
    })
  };

  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "carte.json";
  link.click();
}


export function loadData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = JSON.parse(e.target.result);

    // Nettoyage ancien contenu
    window.polygon?.remove();
    window.bufferFondLayer?.remove();
    window.bufferDemiLayer?.remove();

    // Chargement du polygone
    if (data.polygonCoords) {
      window.polygon = L.polygon(data.polygonCoords).addTo(window.map);
      window.polygon.enableEdit();
      window.map.fitBounds(window.polygon.getBounds());

      // Événements de mise à jour
      const events = [
        'editable:editing',
        'editable:vertex:drag',
        'editable:vertex:new',
        'editable:vertex:deleted',
        'editable:dragend'
      ];
      events.forEach(event => window.polygon.on(event, updatePolygon));

      updatePolygon();
    }

    // Mise à jour des sliders
    updateSlider('profondeur', data.profondeur);
    updateSlider('pente', data.pente);
    updateSlider('cellSize', data.cellSizeMeters);
    updateSlider('rotation', data.manualRotation, "°");

    console.log("📂 Données chargées avec succès !");
  };
  reader.readAsText(file);
}

function updateSlider(name, value, suffix = "") {
  if (value !== undefined) {
    const input = document.getElementById(`${name}Input`);
    const display = document.getElementById(`${name}Value`);
    if (input) input.value = value;
    if (display) display.textContent = value + suffix;
  }
}
