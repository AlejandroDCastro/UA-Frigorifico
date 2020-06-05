
// Constantes globales
const tFade = 0.7;  // Tiempo de transición entre vistas




// Funciones JQuery
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}




// Conectamos con el frigorífico...
var frigo = new Electro();

frigo.on("connect", function () {
    console.log("Ya estoy conectado con el frigorifico!!!")
    console.log("Con este hay " + frigo.clientes + " clientes conectados");

   /* frigo.frigorificoHora.onchange = function() {
        console.log(frigo.frigorificoHora);
    }*/
    

    // Activar la luz del refrigerador cuando se abre la puerta
    frigo.on("refrigeradorPuerta", function (abierta) {
        console.log("Puerta:", abierta);
        frigo.refrigeradorLuz = abierta;
    });
});






// Función que se ejecuta al cargarse todos los elementos de la página
document.addEventListener('DOMContentLoaded', load, false);

function load() {
    let bloqueo = $('#bloqueo'),
        inicio  = $('#inicio'),
        vista   = $('body').getAttribute('data-vista');

    bloqueo.onclick = function() {

        // Cambiamos a la vista de inicio
        cambiarVista(bloqueo, inicio);
    };
}



// Función para ocultar una vista de la aplicación y restablecer la anterior
function cambiarVista(objOcultar, objMostrar) {

    // Actualizamos visibilidad de las vistas
    let idTemp = setTimeout(function() {
        objMostrar.classList.remove('ocultar');
        objOcultar.classList.add('ocultar');
        clearTimeout(idTemp);
    }, tFade);

    // Realizamos las animaciones
    objOcultar.classList.add('fade-out');
    objMostrar.classList.add('fade-in');
}