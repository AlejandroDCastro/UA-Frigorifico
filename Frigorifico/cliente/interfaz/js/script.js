
// Constantes globales
const tempFade          = 0.7;   // Tiempo de transición entre vistas
const tempActualizacion = 800;   // 0.8 milisegundo
const comprobacionesRep = 100;
const tempInteraccion   = 65000; // 1 minuto




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
    };
});






// Función que se ejecuta al cargarse todos los elementos de la página y el frigorífico
function load() {
    let grados, grados2;

    if (sessionStorage.getItem('tempRefrigerador')) {
        grados  = sessionStorage.getItem('tempRefrigerador');
        grados2 = sessionStorage.getItem('tempCongelador');
    } else {
        grados  = Math.round(frigo.refrigeradorTemperatura);
        grados2 = Math.round(frigo.congeladorTemperatura);
    }
        
    // Mostramos los datos de inicio
    let idTemp = setTimeout(function() {
        frigo.on('frigorificoHora', function(fecha) {
            mostrarDatosTiempo(fecha);
            reloj();
            if ($('#bloqueo output').textContent == '') {

                // Mostramos la temperatura
                temperatura = (grados >= 0) ? ('+' + grados) : (grados);
                $('#bloqueo output').innerHTML = `${temperatura}`;
                if (grados > 9  ||  grados < -9)
                    $('#bloqueo output').classList.add('ajustaTemp');
                $('#inicio output').innerHTML  = `${temperatura} <span>º</span>`;
                sessionStorage.setItem('tempRefrigerador', grados);
                sessionStorage.setItem('tempCongelador', grados2);

                // Activar la luz del refrigerador cuando se abre la puerta
                sessionStorage.setItem('luzAutomaticaRefri', 'no');
                sessionStorage.setItem('luzAutomaticaConge', 'no');
                funcionalidadLuzAutomatica();

                // Pantalla atenuada
                frigo.frigorificoPantalla = 1;

                // Cambiamos a la vista de inicio
                desbloquearInicio();
                console.log("solo 1 vez...");
            }
        });
        clearTimeout(idTemp);
    }, tempActualizacion);
}





// Función para activar las funcionalidades de la luz automática al abrir la puerta
function funcionalidadLuzAutomatica() {
    
    frigo.on("refrigeradorPuerta", function (abierta) {
        let luzRefrigerador = sessionStorage.getItem('luzAutomaticaRefri');

        if (luzRefrigerador == 'si')
            frigo.refrigeradorLuz = abierta;
    });

    frigo.on("congeladorPuerta", function (abierta) {
        let luzCongelador = sessionStorage.getItem('luzAutomaticaConge');

        if (luzCongelador == 'si')
            frigo.congeladorLuz = abierta;
    });

    // Comprobamos si la puerta del refrigerador esta mucho tiempo abierta
  //  alarmaPuertaAbierta();
}






// Función para desbloquear la pantalla de bloqueo mediante diferentes eventos
function desbloquearInicio() {
    let bloqueo = $('#bloqueo');

    frigo.on('frigorificoPresencia', function(presencia) {
        if (presencia) {

            // Pantalla encendida
            frigo.frigorificoPantalla = 2;

            bloqueoYDesbloqueo('bloqueo', 'inicio');
        }
    });

    bloqueo.onclick = function() {
        frigo.frigorificoPantalla = 2;
        bloqueoYDesbloqueo('bloqueo', 'inicio');
    };

    bloqueo.ontouchmove = function() {
        frigo.frigorificoPantalla = 2;
        bloqueoYDesbloqueo('bloqueo', 'inicio');
    };
    
}






// Función para organizar y empezar el cambio de vista
function bloqueoYDesbloqueo(ocultar, mostrar) {
    let objOcultar = $('#' + ocultar),
        objMostrar  = $('#' + mostrar);

    $('body').setAttribute('data-vista', mostrar);
   // ponerTemperatura(sessionStorage.getItem('tempRefrigerador'));
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
            cambiarVista('vistaTemperatura');
            ponerTemperatura(sessionStorage.getItem('tempRefrigerador'));
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
        frigo.frigorificoPantalla = 1;

        // Si no hay nadie delante se puede volver a desbloquear con presencia...
        if (!frigo.frigorificoPresencia)
            desbloquearInicio();

        // Ajustes de la interfaz de nuevo...
//        sessionStorage.removeItem('vista');
        ponerTemperatura(sessionStorage.getItem('tempRefrigerador'));
        if ($('main>nav>ul:first-child>li:first-child>a>p').getAttribute('data-activado') == 'congelador')
            cambiarVistaCompartimento();

        clearTimeout(idTemp);
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

    // Reloj analógico
    $('#inicio>header>p>a:nth-child(2)').onclick = function() {
        if (sessionStorage.getItem('vista') != 'vistaReloj')
            cambiarVista('vistaReloj');
        else if (sessionStorage.getItem('vista') == 'vistaReloj')
            cambiarVista('vistaTemperatura');
    };

    // Opciones del menú
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
                modificarTemperatura(1);
            } else if (i == 4) {
                modificarTemperatura(-1);
            } else if (i == 5) {
                cambiarVista('vistaAjustes');
                cambiarAjustesFrigorifico();
            }
        }
    }

    // Hacemos los cambios necesarios en el frigo...
    cambiosInternosFrigorifico();
    
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
     //   sessionStorage.setItem('vista', 'vistaCongelador');
        ponerTemperatura(sessionStorage.getItem('tempCongelador'));
    } else {
        parrafo.setAttribute('data-activado', 'refrigerador');
        iconoConge.classList.add('desactivado');
        iconoFrigo.classList.remove('desactivado');

        // Cambiamos la vista al refrigerador
        elemento.classList.remove('icon-snowflake');
        elemento.classList.add('icon-fridge');
    //    sessionStorage.setItem('vista', 'vistaRefrigerador');
        ponerTemperatura(sessionStorage.getItem('tempRefrigerador'));
    }
}





// Función para poner la temperatura en la interfaz que se esté visualizando
function ponerTemperatura(temp) {
    let grados = parseInt(temp);
    console.log(temp);
    console.log(grados);

    temperatura = (grados >= 0) ? ('+' + grados) : (grados);
    if ($('body').getAttribute('data-vista') == 'inicio') {
        $('#inicio output').innerHTML = `${temperatura} <span>º</span>`;
    } else {
        $('#bloqueo output').innerHTML = `${temperatura}`;
        if (grados > 9  ||  grados < -9)
            $('#bloqueo output').classList.add('ajustaTemp');
    }
    
}






// Función cambiar de vista
function cambiarVista(vista) {

    if (vista != sessionStorage.getItem('vista')) {
        let vistaAnterior = $('#' + sessionStorage.getItem('vista')),
            vistaNueva    = $('#' + vista);

        if (sessionStorage.getItem('vista')) {
            vistaAnterior.classList.add('ocultar');
        } else {

            // Cuando arranca por primera vez la interfaz de inicio
            // Arrancamos motores con ganas
            frigo.refrigeradorMotor = 2;
            frigo.congeladorMotor   = 2;
        }
        sessionStorage.setItem('vista', vista);
        vistaNueva.classList.remove('ocultar');
    }
}






// Función para cambiar los parámetros del frigorífico y el congelador
function funcionalidadesCompartimento() {
    let vista     = '#' + sessionStorage.getItem('vista'),
        encendido = $(vista + '>div>article:first-child>input[name="encendido"]'),
        boton     = $(vista + '>div:last-child>button'),
        valor     = encendido.value,
        compart   = (vista == '#vistaRefrigerador') ? 'Refrigerador' : 'Congelador';

    restablecerInfoCompartimento(vista, compart);

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
            if (luz.value == 0) {
                frigo.refrigeradorLuz = false;
                sessionStorage.setItem('luzAutomaticaRefri', 'no');
            } else if (luz.value == 2) {
                frigo.refrigeradorLuz = true;
                sessionStorage.setItem('luzAutomaticaRefri', 'no');
            } else {
                sessionStorage.setItem('luzAutomaticaRefri', 'si');
                if (!frigo.refrigeradorLuz)
                    frigo.refrigeradorLuz = true;
            }
        } else {

            // Motor...
            if (valor == 'no')
                frigo.congeladorMotor = 0;
            else
                frigo.congeladorMotor = 1;

            // Luz
            if (luz.value == 0) {
                frigo.congeladorLuz = false;
                sessionStorage.setItem('luzAutomaticaConge', 'no');
            } else if (luz.value == 2) {
                frigo.congeladorLuz = true;
                sessionStorage.setItem('luzAutomaticaConge', 'no');
            } else {
                sessionStorage.setItem('luzAutomaticaConge', 'si');
                if (!frigo.congeladorLuz)
                    frigo.congeladorLuz = true;
            }
        }

        // Volvemos a inicio...
        cambiarVista('vistaTemperatura');
    };
}






// Función para restablecer los datos del compartimento en la vista con la información del servidor
function restablecerInfoCompartimento(vista, compartimento) {
    let encendido = $(vista + '>div>article:first-child>input[name="encendido"]');

    if (compartimento == 'Refrigerador') {
        if (frigo.refrigeradorMotor > 0) {
            encendido.value   = 'si';
            encendido.checked = true;
        } else {
            encendido.value   = 'no';
            encendido.checked = false;
        }

        if (sessionStorage.getItem('luzAutomaticaRefri') == 'si') {
            $(vista + '>div>article:last-child>div:nth-child(3)>input').checked = true;
        } else {
            if (frigo.refrigeradorLuz) {
                $(vista + '>div>article:last-child>div:nth-child(4)>input').checked = true;
            } else {
                $(vista + '>div>article:last-child>div:nth-child(2)>input').checked = true;
            }
        }
    } else {
        if (frigo.congeladorMotor > 0) {
            encendido.value   = 'si';
            encendido.checked = true;
        } else {
            encendido.value   = 'no';
            encendido.checked = false;
        }

        if (sessionStorage.getItem('luzAutomaticaConge') == 'si') {
            $(vista + '>div>article:last-child>div:nth-child(3)>input').checked = true;
        } else {
            if (frigo.congeladorLuz) {
                $(vista + '>div>article:last-child>div:nth-child(4)>input').checked = true;
            } else {
                $(vista + '>div>article:last-child>div:nth-child(2)>input').checked = true;
            }
        }
    }

}






// Función para añadir el reloj en la vista a modo de reloj de cocina
function reloj() {
	time = frigo.frigorificoHora;
	horas = time.getHours();
	minutos = time.getMinutes();
	segundos = time.getSeconds();
    
    if (horas >= 12) {
     	porcentajeHoras = horas / 12 * 360;
    }  else {
    	porcentajeHoras = horas / 24 * 360;
    }

    porcentajeHoras += minutos / 60 * 30;
    porcentajeMinutos = minutos / 60 * 360;
    porcentajeSegundos = segundos / 60 * 360;

    document.getElementById("horas").style.transform = "rotate("+ porcentajeHoras +"deg) scale(1.1)";
    document.getElementById("minutos").style.transform = "rotate("+ porcentajeMinutos +"deg) scale(1.2)";
    document.getElementById("segundos").style.transform = "rotate("+ porcentajeSegundos +"deg) scale(1.2)";
}






// Función para subir y bajar la temperatura de los distintos compartimentos
function modificarTemperatura(temp) {
    let vistaActual   = sessionStorage.getItem('vista');
        compartimento = $('main>nav>ul:first-child>li:first-child>a>p').getAttribute('data-activado');

    // Nos aseguramos que estamos en la vista de temperatura
    if (vistaActual != 'vistaTemperatura') {
        cambiarVista('vistaTemperatura');
    } else {
        let temperatura;

        if (compartimento == 'refrigerador') {
            temperatura = parseInt(sessionStorage.getItem('tempRefrigerador'));
            temperatura += parseInt(temp);
            sessionStorage.setItem('tempRefrigerador', temperatura);
        } else {
            temperatura = parseInt(sessionStorage.getItem('tempCongelador'));
            temperatura += parseInt(temp);
            sessionStorage.setItem('tempCongelador', temperatura);
        }

        ponerTemperatura(temperatura);
    }
}






// Función para realizar los cambios internos del frigorífico
function cambiosInternosFrigorifico() {

    frigo.on('refrigeradorTemperatura', function(temp1) {
        let tempRefrigerador = parseInt(sessionStorage.getItem('tempRefrigerador')),
            modo = sessionStorage.getItem('modo');

        if (diferenciaTemperaturas(tempRefrigerador, temp1) >= 1.0) {
            if (tempRefrigerador > temp1) {
                if (frigo.refrigeradorMotor > 0)
                    frigo.refrigeradorMotor = 0;
            } else {
                if (frigo.refrigeradorMotor == 0) {
                    if (modo != undefined  &&  modo == 'speed')
                        frigo.refrigeradorMotor = 2;
                    else
                        frigo.refrigeradorMotor = 1;
                }
            }
        }
        
    });

    frigo.on('congeladorTemperatura', function(temp2) {
        let tempCongelador = parseInt(sessionStorage.getItem('tempCongelador')),
            modo = sessionStorage.getItem('modo');
        
        if (diferenciaTemperaturas(tempCongelador, temp2) >= 1.0) {
            if (tempCongelador > temp2) {
                if (frigo.congeladorMotor > 0)
                    frigo.congeladorMotor = 0;
            } else {
                if (frigo.congeladorMotor == 0) {
                    if (modo != undefined  &&  modo == 'speed')
                        frigo.congeladorMotor = 2;
                    else
                        frigo.congeladorMotor = 1;
                }
            }
        }
    });
}






// Función para comprobar la diferencia entre dos temperaturas
function diferenciaTemperaturas(t1, t2) {
    let diferencia = 0.0;

    if (t1 >= 0  &&  t2 >= 0) {
        diferencia = Math.abs(t1 - t2);
    } else if (t1 >= 0  &&  t2 < 0) {
        t2         = Math.abs(t2);
        diferencia = Math.abs(t1 + t2);
    } else if (t1 < 0  &&  t2 >= 0) {
        t1         = Math.abs(t1);
        diferencia = Math.abs(t1 + t2);
    } else {
        diferencia = Math.abs(t1 - t2);
    }

    return diferencia;
}





// Función para abrir los ajustes del frigorífico
function cambiarAjustesFrigorifico() {
    let estilo  = $('#vistaAjustes>div>article:first-child>input'),
        aceptar = $('#vistaAjustes>div:last-child');

    estilo.onclick = function() {
        let valor = estilo.value;
    
        if (valor == 'no') {
            estilo.checked = true;
            estilo.value   = 'si';

            // Lo hacemos un poco más accesible
            $('html').style.setProperty('--border-color', "#ff0");
            $('html').style.setProperty('--activated-color', "#ff0");
            $('html').style.setProperty('--activated-opacity', "1.0");
        } else {

            estilo.checked = false;
            estilo.value   = 'no';
            $('html').style.setProperty('--border-color', "#0f0f0f");
            $('html').style.setProperty('--activated-color', "#fff");
            $('html').style.setProperty('--activated-opacity', ".3");
        }
    };


    aceptar.onclick = function() {
        let modo = $('#vistaAjustes>div:nth-child(2)>article>div>input:checked');

        if (modo != undefined) {
            console.log(modo.value);
            sessionStorage.setItem('modo', modo.value);
        }

        cambiarVista('vistaTemperatura');
    };
}



/*

// Función para encender la puerta si la alarma está demasiado tiempo abierta
function alarmaPuertaAbierta() {
    let tempRefrigerador = sessionStorage.getItem('tempRefrigerador'),
        tempCongelador   = sessionStorage.getItem('tempCongelador');
    
    if (tempRefrigerador !=)
}*/