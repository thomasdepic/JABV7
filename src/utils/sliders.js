import { updatePolygon } from "../config/polygon.js";


export function initSliderWithButtons(sliderId, valueId, minusId, plusId) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    const minusButton = document.getElementById(minusId);
    const plusButton = document.getElementById(plusId);

    if (!slider || !valueDisplay || !minusButton || !plusButton) {
        console.error(`Erreur: Élément(s) manquant(s) pour ${sliderId}`);
        return;
    }

    const step = parseFloat(slider.step) || 1;

    function updateValue(newValue) {
        // Arrondir en fonction du step pour éviter les erreurs de virgule flottante
        const stepFactor = 1 / step;
        newValue = Math.round(newValue * stepFactor) / stepFactor;
    
        slider.value = newValue;
        valueDisplay.textContent = newValue;
        console.log(`Nouvelle valeur pour ${sliderId}: ${newValue}`);
        updatePolygon();
    }

    slider.addEventListener("input", () => {
        updateValue(parseFloat(slider.value));
    });

    minusButton.addEventListener("click", () => {
        let newValue = Math.max(parseFloat(slider.min), parseFloat(slider.value) - step);
        updateValue(newValue);
    });

    plusButton.addEventListener("click", () => {
        let newValue = Math.min(parseFloat(slider.max), parseFloat(slider.value) + step);
        updateValue(newValue);
    });
}

// export function initSliders(){
//     const profondeurSlider = document.getElementById("profondeurSlider");
//     const profondeurValue = document.getElementById("profondeurValue");

//     if (!profondeurSlider || !profondeurValue) {
//         console.error("Slider de profondeur introuvable !");
//         return;
//     }    
// }

// export function initProfondeurSlider() {
//     $(document).ready(() => {
//         const profondeurInput = $("#profondeurInput");

//         if (profondeurInput.length === 0) {
//             console.error("Profondeur Input introuvable !");
//             return;
//         }

//         profondeurInput.TouchSpin({
//             min: 0.5,
//             max: 10,
//             step: 0.5,
//             decimals: 1,
//             postfix: "m"
//         });

//         profondeurInput.on("change", function () {
//             let profondeur = parseFloat($(this).val());
//             console.log("Nouvelle profondeur : " + profondeur + " m");
//             updatePolygon();
//         });

//         console.log("Slider de profondeur initialisé avec TouchSpin.");
//     });
// }

// export function initPenteSlider() {
//     $(document).ready(() => {
//         const penteInput = $("#penteInput");

//         if (penteInput.length === 0) {
//             console.error("Pente Input introuvable !");
//             return;
//         }

//         penteInput.TouchSpin({
//             min: 5,
//             max: 100,
//             step: 1,
//             postfix: "%"
//         });

//         penteInput.on("change", function () {
//             let pente = parseFloat($(this).val());
//             console.log("Nouvelle pente : " + pente + " %");
//             updatePolygon();
//         });

//         console.log("Slider de pente initialisé avec TouchSpin.");
//     });
// }