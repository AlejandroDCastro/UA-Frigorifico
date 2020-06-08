
// Constantes globales
const tempFade          = 0.7;   // Tiempo de transición entre vistas
const tempActualizacion = 800;  // 0.8 milisegundo
const comprobacionesRep = 100;
const tempInteraccion   = 500000; // 1 minuto




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
 /*   frigo.on("refrigeradorPuerta", function (abierta) {
        console.log("Puerta:", abierta);
        frigo.refrigeradorLuz = abierta;
    });*/
});






// Función que se ejecuta al cargarse todos los elementos de la página y el frigorífico
function load() {
    let grados = Math.round(frigo.refrigeradorTemperatura);
        
    // Mostramos los datos de inicio
    //setInterval(mostrarDatosTiempo, tempActualizacion);
    let idTemp = setTimeout(function() {
        frigo.on('frigorificoHora', function(fecha) {
            mostrarDatosTiempo(fecha);
            if ($('#bloqueo output').textContent == '') {

                // Mostramos la temperatura
                temperatura = (grados >= 0) ? ('+' + grados) : (grados);
                $('#bloqueo output').innerHTML = `${temperatura}`;
                if (grados > 9  ||  grados < -9)
                    $('#bloqueo output').classList.add('ajustaTemp');
                $('#inicio output').innerHTML  = `${temperatura} <span>º</span>`;

                // Cambiamos a la vista de inicio
                desbloquearInicio();
                console.log("solo 1 vez...");
            }
        });
        clearTimeout(idTemp);
    }, tempActualizacion);
    /*
    let idTemp2 = setTimeout(function() {

        // Mostramos la temperatura
        temperatura = (grados >= 0) ? ('+' + grados) : ('-' + grados);
        $('#bloqueo output').innerHTML = `${temperatura}`;
        if (grados > 9  ||  grados < -9)
            $('#bloqueo output').classList.add('ajustaTemp');
        $('#inicio output').innerHTML  = `${temperatura} <span>º</span>`;

        // Cambiamos a la vista de inicio
        desbloquearInicio();

        clearTimeout(idTemp2);
    }, tempActualizacion);*/
}





// Función para desbloquear la pantalla de bloqueo mediante diferentes eventos
function desbloquearInicio() {
    let bloqueo = $('#bloqueo');

    /*
    let idTemp = setInterval(function() {
        if (frigo.frigorificoPresencia) {
            bloqueoYDesbloqueo('bloqueo', 'inicio');
            clearInterval(idTemp);
        }
    }, comprobacionesRep);

    bloqueo.onclick = function() {
        clearInterval(idTemp);
        bloqueoYDesbloqueo('bloqueo', 'inicio');
    };

    bloqueo.ontouchmove = function() {
        clearInterval(idTemp);
        bloqueoYDesbloqueo('bloqueo', 'inicio');
    };*/

    frigo.on('frigorificoPresencia', function(presencia) {
        if (presencia)
            bloqueoYDesbloqueo('bloqueo', 'inicio');
    });

    bloqueo.onclick = function() {
        bloqueoYDesbloqueo('bloqueo', 'inicio');
    };

    bloqueo.ontouchmove = function() {
        bloqueoYDesbloqueo('bloqueo', 'inicio');
    };
    
}






// Función para organizar y empezar el cambio de vista
function bloqueoYDesbloqueo(ocultar, mostrar) {
    let objOcultar = $('#' + ocultar),
        objMostrar  = $('#' + mostrar);

    $('body').setAttribute('data-vista', mostrar);
    mostrarDatosTiempo(frigo.frigorificoHora);
    desbloquearVista(objOcultar, objMostrar);
}






// Función para mostrar los datos del frigorífico en las interfaces de bloqueo e inicio
function mostrarDatosTiempo(tiempo) {
    let fecha  = getFormatoFecha(tiempo),
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
}





// Función para obtener dentro de un array las cadenas con los formatos de fecha y hora a mostrar
function getFormatoFecha(tiempo) {
    let fecha   = tiempo,
        datos   = fecha.toString().split(' '),
        hora    = datos[4].split(':');
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
function desbloquearVista(objOcultar, objMostrar) {
    
    // Actualizamos visibilidad de las vistas
    setTimeout(function() {
        objMostrar.classList.remove('ocultar');
        objOcultar.classList.add('ocultar');
        
        // Si hemos pasado a la vista de inicio...
        if ($('body').getAttribute('data-vista') == 'inicio') {

            // Para localizarnos en la vista actual...
            sessionStorage.setItem('vista', 'vistaTemperatura');
            loadInicio();
        }
    }, tempFade);

    // Realizamos las animaciones
    objOcultar.classList.add('fade-out');
    objMostrar.classList.add('fade-in');
}






// Función para cargar las funcionalidades de la interfaz de inicio
function loadInicio() {

    // Una vez desbloqueamos tenemos 1 minuto de inactividad para volver a la pantalla de bloqueo
    let idTemp = setTimeout(function() {
        bloqueoYDesbloqueo('inicio', 'bloqueo');

        // Si no hay nadie delante se puede volver a desbloquear con presencia...
        if (!frigo.frigorificoPresencia)
            desbloquearInicio();
        clearTimeout(idTemp);
        sessionStorage.removeItem('vista');
    }, tempInteraccion);

    // Reseteamos el periodo de interacción con la interfaz
    $('#inicio').onclick = function() {
        clearTimeout(idTemp);
        console.log('Limpiate...');
        loadInicio();
    };

    // Activamos las funcionalidades del frigorífico
    funcionalidadesMenuFrigo();

}





// Función para activar las funcionalidades de las opciones de los menús de la interfaz
function funcionalidadesMenuFrigo() {
    let opciones    = $$('li'),
        vistaActual = sessionStorage.getItem('vista');

    for (let i=0; i<opciones.length; i++) {
        let elemento = opciones[i];

        // Aplicar estilos de usabilidad y accesibilidad
        if ('ontouchstart' in document.documentElement) {
            elemento.ontouchstart = function() {
                elemento.classList.add('recibeFoco');
            };
    
            elemento.ontouchend = function() {
                elemento.classList.remove('recibeFoco');
            };
        } else {
            elemento.onmousemove = function() {
                elemento.classList.add('recibeFoco');
            };
    
            elemento.onmouseout = function() {
                elemento.classList.remove('recibeFoco');
            };
        }

        if (i == 0) {
            let transicion = $('ul>li>a>p>span:nth-child(2)');

            elemento.onmousedown = function() {
                transicion.classList.remove('desactivado');
            };
            elemento.onmouseup = function() {
                transicion.classList.add('desactivado');
            };
        }

        elemento.onclick = function() {

            
            // Cambiamos de vista y establecemos funcionalidades
            if (i == 0) {
                cambiarVistaCompartimento();
                if (vistaActual == 'vistaRefrigerador'  ||  vistaActual == 'vistaCongelador') {
                    console.log("congelate");
                    if ($('ul>li>a>p').getAttribute('data-activado') == 'refrigerador')
                        cambiarVista('vistaRefrigerador');
                    else
                        cambiarVista('vistaCongelador');
                    funcionalidadesCompartimento();
                }
            } else if (i == 1) {
                if ($('ul>li>a>p').getAttribute('data-activado') == 'refrigerador')
                    cambiarVista('vistaRefrigerador');
                else
                    cambiarVista('vistaCongelador');
                funcionalidadesCompartimento();
            } else if (i == 2) {
                //cambiarVista();
            } else if (i == 3) {
                //cambiarVista();
            } else if (i == 4) {
                //cambiarVista();
            } else if (i == 5) {
                //cambiarVista();
            }
        }
    }
    
}






// Función para cambiar la vista del compartimento entre el frigorífico y congelador
function cambiarVistaCompartimento() {
    let parrafo    = $('ul>li>a>p'),
        elemento   = $('ul>li:nth-child(2)>a>p>span'),
        compActual = parrafo.getAttribute('data-activado'),
        iconoFrigo = $('ul>li>a>p>span:first-child'),
        iconoConge = $('ul>li>a>p>span:nth-child(3)');

    if (compActual == 'refrigerador') {
        parrafo.setAttribute('data-activado', 'congelador');
        iconoFrigo.classList.add('desactivado');
        iconoConge.classList.remove('desactivado');

        // Cambiamos la vista al congelador
        elemento.classList.remove('icon-fridge');
        elemento.classList.add('icon-snowflake');
    } else {
        parrafo.setAttribute('data-activado', 'refrigerador');
        iconoConge.classList.add('desactivado');
        iconoFrigo.classList.remove('desactivado');

        // Cambiamos la vista al refrigerador
        elemento.classList.remove('icon-snowflake');
        elemento.classList.add('icon-fridge');
    }
}







// Función cambiar de vista
function cambiarVista(vista) {
    let vistaAnterior = $('#' + sessionStorage.getItem('vista')),
        vistaNueva    = $('#' + vista);

    if (vista != sessionStorage.getItem('vista')) {

        sessionStorage.setItem('vista', vista);
        vistaAnterior.classList.add('ocultar');
        vistaNueva.classList.remove('ocultar');
    }
}






// Función para cambiar los parámetros del frigorífico y el congelador
function funcionalidadesCompartimento() {
    let vista     = '#' + sessionStorage.getItem('vista'),
        encendido = $(vista + '>div>article:first-child>input[name="encendido"]'),
        boton     = $(vista + '>div:last-child>button'),
        valor     = encendido.value,
        compart   = (vista == '#vistaRefrigerador') ? 'Refrigerador' : 'Congelador',
        marcar    = false;

    if (!marcar)
        if (valor == 'si')
            encendido.checked = true;
/*Atencioooon hacer funcion para recoger los valores del servidor */
    encendido.onclick = function() {
        if (valor == 'no') {
            encendido.checked = true;
            encendido.value   = 'si';
        } else {
            encendido.checked = false;
            encendido.value   = 'no';
        }
        valor = encendido.value;
    };

    boton.onclick = function() {
        let luz = $(vista + '>div>article:last-child>div>input[name="luces' + compart + '"]:checked');

        // Realizamos los cambios en el frigorífico...
        if (vista == '#vistaRefrigerador') {

            // Motor...
            if (valor == 'no')
                frigo.refrigeradorMotor = 0;
            else
                frigo.refrigeradorMotor = 1;

            // Luz...
            if (luz.value == 0)
                frigo.refrigeradorLuz = false;
            else if (luz.value == 2)
                frigo.refrigeradorLuz = true;
        } else {

            // Motor...
            if (valor == 'no')
                frigo.congeladorMotor = 0;
            else
                frigo.congeladorMotor = 1;

            // Luz
            if (luz.value == 0)
                frigo.congeladorLuz = false;
            else if (luz.value == 2)
                frigo.congeladorLuz = true;
        }

        // Volvemos a inicio...
        cambiarVista('vistaTemperatura');
    };
}