/mon-projet
│── /index.html
│── /styles
│   │── main.css               # Style principal
│   │── config.css             # Styles spécifiques au mode configuration
│   │── execution.css          # Styles spécifiques au mode exécution
│── /scripts
│   │── main.js                # Point d'entrée principal
│   │── modeManager.js         # Gestion des modes (configuration, exécution...)
│   │── map.js                 # Initialisation de la carte Leaflet
│   │── storage.js             # Sauvegarde et chargement des fichiers GeoJSON
│   │── /config                # Scripts spécifiques au mode configuration
│   │   │── polygon.js         # Gestion du polygone éditable
│   │   │── bufferDemi.js      # Calcul des buffers demi
│   │   │── bufferPente.js     # Calcul des buffers en pente
│   │   │── intersections.js   # Calcul des intersections
│   │── /execution             # Scripts spécifiques au mode exécution
│   │   │── droneTracker.js    # Suivi en temps réel du drone
│   │   │── gpsReader.js       # Lecture des données GPS via le port série
│   │── /utils                 # Fonctions utilitaires réutilisables
│   │   │── point.js           # Classe ou fonctions pour la gestion des points géographiques
│   │   │── geoUtils.js        # Fonctions de manipulation des coordonnées GPS
│   │   |── sliders.js         # Gestion des sliders personnalisés
│── /assets
│   │── /icons                 # Icônes pour l'interface utilisateur
│── /data                      # Stockage des fichiers de mission
│   │── example.geojson        # Exemple de fichier de mission
|── /.vscode
|   |── settings.json
|── package.json
|── README.txt