import { LISTA_BLANCA_HIERARCHY } from './src/utils/organizationUtils.js';

const filterType = "ayuntamientos";
const filterSubType = "todos_los_ayuntamientos_(sin_mancomunidades)";
let claseOptions = [];

if (filterType !== "todos" && LISTA_BLANCA_HIERARCHY[filterType]) {
    if (filterSubType !== "todos" && LISTA_BLANCA_HIERARCHY[filterType][filterSubType]) {
        claseOptions = LISTA_BLANCA_HIERARCHY[filterType][filterSubType];
    }
}
console.log("Clase options for todos_los...:", claseOptions);
console.log("Clase options for ayuntamientos tenerife:", LISTA_BLANCA_HIERARCHY["ayuntamientos"]["ayuntamientos tenerife"]);
console.log("Clase options for mancomunidades:", LISTA_BLANCA_HIERARCHY["ayuntamientos"]["mancomunidades"]);
