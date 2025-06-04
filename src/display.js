export function initDisplaySection() {
    console.log("🗂️ initDisplaySection() appelée");
  
    const layersPopup = document.getElementById("layers-popup");
    const basemapPopup = document.getElementById("basemap-popup");
  
    const btnLayers = document.getElementById("btn-layers-popup");
    const btnBasemap = document.getElementById("btn-basemap-popup");
  
    const basemapSelect = document.getElementById("basemap-select");
  
    // État de visibilité des popups
    let layersVisible = false;
    let basemapVisible = false;
  
    // Toggle popup couches
    btnLayers?.addEventListener("click", (e) => {
      e.stopPropagation();
      layersVisible = !layersVisible;
      layersPopup.classList.toggle("hidden", !layersVisible);
      basemapPopup.classList.add("hidden"); // ferme l’autre
      basemapVisible = false;
    });
  
    // Toggle popup fond de carte
    btnBasemap?.addEventListener("click", (e) => {
      e.stopPropagation();
      basemapVisible = !basemapVisible;
      basemapPopup.classList.toggle("hidden", !basemapVisible);
      layersPopup.classList.add("hidden");
      layersVisible = false;
    });
  
    // Fermer si clic ailleurs
    document.addEventListener("click", (e) => {
      if (!layersPopup.contains(e.target) && !btnLayers.contains(e.target)) {
        layersPopup.classList.add("hidden");
        layersVisible = false;
      }
      if (!basemapPopup.contains(e.target) && !btnBasemap.contains(e.target)) {
        basemapPopup.classList.add("hidden");
        basemapVisible = false;
      }
    });
  
    // Gestion des cases à cocher pour chaque couche
    const layerMap = {
        "chk-polygon": () => window.polygon,
        "chk-buffer-fond": () => window.bufferFondLayer,
        "chk-buffer-demi": () => window.bufferDemiLayer,
        "chk-grille": () => window.gridLayer,
        "chk-points-fond": () => window.fondPointsLayer,
        "chk-points-pente": () => window.pentePointsLayer,
        "chk-points-bord": () => window.bordPointsLayer,
        "chk-validation-circles": () => window.detectionCircles, // Tableau
        "chk-distances": () => window.distanceLabels,
      };
    
    // S'assurer que window.detectionCircles est toujours défini
    if (!window.detectionCircles) {
        window.detectionCircles = [];
    }
  
    Object.keys(layerMap).forEach(id => {
    const checkbox = document.getElementById(id);
    checkbox?.addEventListener("change", () => {
        const layer = layerMap[id]();
        const visible = checkbox.checked;
      
        if (!layer) {
            console.warn(`⚠️ Couche ${id} non encore initialisée`);
            return;
        }
      
        if (Array.isArray(layer)) {
            layer.forEach(c => {
                if (visible) window.map.addLayer(c);
                else window.map.removeLayer(c);
            });
        } else {
            if (visible) window.map.addLayer(layer);
            else window.map.removeLayer(layer);
        }
      
        console.log(`👁️ Couche "${id}" ${visible ? "affichée" : "masquée"}`);
        });
    });
      
  
    // Sélection du fond de carte
    basemapSelect?.addEventListener("change", () => {
      const selected = basemapSelect.value;
      console.log(`🗺️ Fond de carte sélectionné : ${selected}`);
  
      switch (selected) {
        case "googlemaps":
          if (window.baseLayerSatellite) window.map.removeLayer(window.baseLayerSatellite);
          if (window.baseLayerGoogle) window.map.addLayer(window.baseLayerGoogle);
          break;
        case "satellite":
          if (window.baseLayerGoogle) window.map.removeLayer(window.baseLayerGoogle);
          if (window.baseLayerSatellite) window.map.addLayer(window.baseLayerSatellite);
          break;
        default:
          console.warn("Fond de carte inconnu :", selected);
      }
    });
  }
  