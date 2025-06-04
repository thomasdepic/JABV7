export class Point {
  constructor(latlng, color = "black", type = "inconnu") {
    this.lat = latlng.lat;
    this.lng = latlng.lng;
    this.color = color;
    this.type = type;
    this.marker = null; // sera défini plus tard dans showPoints
    this.visited = false; // optionnel : pour ne changer la couleur qu'une fois
  }
}

export function showPoints(layer, points, radius = 2) {
  for (let point of points) {
    const marker = L.circleMarker(L.latLng(point.lat, point.lng), {
      color: point.color,
      fillColor: point.color,
      fillOpacity: 1,
      radius: radius,
    }).addTo(layer);
    point.marker = marker;
  }
}