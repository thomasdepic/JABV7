import { map, marker } from "../map.js";

const timeDisplay = document.getElementById("timeDisplay");

export let lat = null;
export let lng = null;

let onPositionUpdate = null;

export function setOnPositionUpdate(callback) {
  console.log(`[gpsReader] 🛰️ Callback de position GPS enregistré`);
  onPositionUpdate = callback;
}

export async function connectSerial() {
    try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        const decoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(decoder.writable);
        const reader = decoder.readable.getReader();

        let buffer = "";
        let gpsReady = false;

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += value;

            let lines = buffer.split("\n");

            for (let i = 0; i < lines.length - 1; i++) {
                let line = lines[i].trim();
                if (line.length === 0) continue;
                console.log(`[gpsReader] 🔎 Traitement : [${line}]`);

                const commaIndex = line.indexOf(',');
                if (commaIndex === -1) {
                    console.log(`[gpsReader] ❌ Ligne ignorée (pas de virgule)`);
                    continue;
                }

                const timePart = line.substring(0, commaIndex).trim();
                const jsonPart = line.substring(commaIndex + 1).trim();

                if (timeDisplay) {
                    timeDisplay.textContent = `Heure: ${timePart}`;
                }

                if (jsonPart.startsWith("{") && jsonPart.endsWith("}")) {
                    try {
                        let data = JSON.parse(jsonPart);
                        if (data.lat && data.lon) {
                            lat = parseFloat(data.lat);
                            lng = parseFloat(data.lon);

                            if (!gpsReady) {
                            gpsReady = true;
                            const gpsStatus = document.getElementById("gpsStatus");
                            if (gpsStatus) {
                                gpsStatus.textContent = "✅ Signal GPS détecté";
                                gpsStatus.classList.add("ok");
                            }
                            console.log("✅ Premier signal GPS reçu");
                            }

                            marker.setLatLng([lat, lng]);

                            if (onPositionUpdate) {
                                onPositionUpdate({ lat, lng });
                            }
                        }
                    } catch (error) {
                        console.log(`[gpsReader] ❌ Erreur parsing JSON : ${jsonPart}`, error);
                    }
                } else {
                    console.log(`[gpsReader] ⚠️ JSON non valide : ${jsonPart}`);
                }
            }

            buffer = lines[lines.length - 1];
        }
    } catch (error) {
        console.log("Erreur connexion série : ", error);
    }
}
