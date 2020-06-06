
// Constantes globales
const tempFade = 0.7;  // Tiempo de transición entre vistas
const tempActualizacion = 1000; // milisegundos




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
    
    // Si se han cargado las vistas...
    $('body').onload = function() {
        load();
    }

    // Activar la luz del refrigerador cuando se abre la puerta
    frigo.on("refrigeradorPuerta", function (abierta) {
        console.log("Puerta:", abierta);
        frigo.refrigeradorLuz = abierta;
    });
});






// Función que se ejecuta al cargarse todos los elementos de la página y el frigorífico
function load() {
    let bloqueo = $('#bloqueo'),
        inicio  = $('#inicio'),
        grados  = Math.round(frigo.refrigeradorTemperatura);
        
    // Mostramos los datos de inicio
    setInterval(mostrarDatosTiempo, tempActualizacion);
    
    // Mostramos la temperatura
    let idTemp = setTimeout(function() {
        temperatura = (grados >= 0) ? ('+' + grados) : ('-' + grados);
        $('#bloqueo output').innerHTML = `${temperatura}`;
        if (grados > 9  ||  grados < -9)
            $('#bloqueo output').classList.add('ajustaTemp');
        $('#inicio output').innerHTML  = `${temperatura} <span>º</span>`;
    }, tempActualizacion);
    sessionStorage.setItem('idTemp', 999);

    // Cambiamos a la vista de inicio
    bloqueo.onclick = function() {
        $('body').setAttribute('data-vista', 'inicio');
        mostrarDatosTiempo();
        cambiarVista(bloqueo, inicio);
    };

    bloqueo.ontouchmove = function() {
        $('body').setAttribute('data-vista', 'inicio');
        mostrarDatosTiempo();
        cambiarVista(bloqueo, inicio);
    };
}





// Función para mostrar los datos del frigorífico en las interfaces de bloqueo e inicio
function mostrarDatosTiempo() {
    let fecha  = getFormatoFecha(),
        dia    = fecha[0],
        hora   = fecha[1],
        vista  = $('body').getAttribute('data-vista'),
        times  = $$('#' + vista + ' time');
    
    // Actualizamos la hora
    if (times[0].textContent != hora) {
        let tiempo = hora.split(':');
        times[0].innerHTML = `${tiempo[0]}<span>:</span>${tiempo[1]}`;
    }

    // Hacemos aparecer y desaparecer los puntos de la hora
    let puntos = $('#' + vista + ' time>span');
    if (times[0].getAttribute('data-aparece') == 'si') {
        times[0].setAttribute('data-aparece', 'no');
        puntos.classList.remove('invisible');
    } else {
        times[0].setAttribute('data-aparece', 'si');
        puntos.classList.add('invisible');
    }

    // Actualizamos fecha
    if (times[1].textContent != dia) {
        times[1].textContent = dia;
    }

    clearTimeout(sessionStorage.getItem('idTemp'));
    sessionStorage.removeItem('idTemp');
}





// Función para obtener dentro de un array las cadenas con los formatos de fecha y hora a mostrar
function getFormatoFecha() {
    let fecha   = frigo.frigorificoHora,
        datos  = fecha.toString().split(' '),
        hora   = datos[4].split(':');
        formato = new Array(2);
    
    switch (datos[0]) {
        case 'Mon':
            formato[0] = 'Lunes';
            break;
        case 'Tue':
            formato[0] = 'Martes';
            break;
        case 'Wed':
            formato[0] = 'Miércoles';
            break;
        case 'Thu':
            formato[0] = 'Jueves';
            break;
        case 'Fri':
            formato[0] = 'Viernes';
            break;
        case 'Sat':
            formato[0] = 'Sábado';
            break;
        case 'Sun':
            formato[0] = 'Lunes';
            break;
        
    }
    formato[0] += ', ' + datos[2] + ' ';

    switch (datos[1]) {
        case 'Jan':
            formato[0] += 'Enero';
            break;
        case 'Feb':
            formato[0] += 'Febrero';
            break;
        case 'Mar':
            formato[0] += 'Marzo';
            break;
        case 'Apr':
            formato[0] += 'Abril';
            break;
        case 'May':
            formato[0] += 'Mayo';
            break;
        case 'Jun':
            formato[0] += 'Junio';
            break;
        case 'Jul':
            formato[0] += 'Julio';
            break;
        case 'Aug':
            formato[0] += 'Agosto';
            break;
        case 'Sep':
            formato[0] += 'Septiembre';
            break;
        case 'Oct':
            formato[0] += 'Octubre';
            break;
        case 'Nov':
            formato[0] += 'Noviembre';
            break;
        case 'Dec':
            formato[0] += 'Diciembre';
            break;
    }

    formato[1] = hora[0] + ':' + hora[1];

    return formato;
}






// Función para ocultar una vista de la aplicación y restablecer la anterior
function cambiarVista(objOcultar, objMostrar) {
    
    // Actualizamos visibilidad de las vistas
    setTimeout(function() {
        objMostrar.classList.remove('ocultar');
        objOcultar.classList.add('ocultar');
        
        if ($('body').getAttribute('data-vista') == 'inicio')
            loadInicio();
    }, tempFade);

    // Realizamos las animaciones
    objOcultar.classList.add('fade-out');
    objMostrar.classList.add('fade-in');
}






// Función para cargar las funcionalidades de la interfaz de inicio
function loadInicio() {
    console.log("hola");
}