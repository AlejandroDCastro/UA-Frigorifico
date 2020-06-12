var frigo;


// Constantes globales
const tempFade           = 0.7;   // Tiempo de transición entre vistas
const tempActualizacion  = 1000;   // 1 segundo
const comprobacionesRep  = 100;
const tempInteraccion    = 65000; // 1 minuto
const neveraAbierta      = 11000;
const tempNuevoProducto  = 500;
const tempConsumo        = 7000;
const limiteRefrigerador = 15.0;
const limiteCongelador   = 1.0;



// Funciones JQuery
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}



document.addEventListener('DOMContentLoaded', conectaFrigo, false);


// Conectamos con el frigorífico...
function conectaFrigo() {
    frigo = new Electro();

    frigo.on("connect", function () {
        console.log("Ya estoy conectado con el frigorifico!!!")
        console.log("Con este hay " + frigo.clientes + " clientes conectados");
        
        // Carga todos los valores
        load();
    });
}






// Función que se ejecuta al cargarse todos los elementos de la página y el frigorífico
function load() {
    let grados, grados2;

    if (sessionStorage.getItem('tempRefrigerador')) {
        grados  = sessionStorage.getItem('tempRefrigerador');
        grados2 = sessionStorage.getItem('tempCongelador');
    } else {
        grados = 6;  grados2 = -5;
        sessionStorage.setItem('tempRefrigerador', grados);
        sessionStorage.setItem('tempCongelador', grados2);
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

                // Pasar producto por el lector de barras
                lectorCodigos();

                // Malfuncionamiento y alarma
                notificacionAlarma();

                // Pantalla atenuada
                frigo.frigorificoPantalla = 1;

                // Cambiamos a la vista de inicio
                desbloquearInicio();
            }
        });
        clearTimeout(idTemp);
    }, tempActualizacion);
}





// Función para introducir un código de producto en el lector de códigos
function lectorCodigos() {
    frigo.on('frigorificoCodigo', function(producto) {
        agregarProducto(producto);

        // Hacemos sonar la alarma para mejorar usabilidad
        frigo.frigorificoAlarma = true;
        setTimeout(function() {
            frigo.frigorificoAlarma = false;
        }, tempNuevoProducto);
    });
}





// Función para activar las funcionalidades de la luz automática al abrir la puerta
function funcionalidadLuzAutomatica() {
    
    frigo.on("refrigeradorPuerta", function (abierta) {
        let luzRefrigerador = sessionStorage.getItem('luzAutomaticaRefri');

        if (luzRefrigerador == 'si'  &&  sessionStorage.getItem('modo') != 'eco')
            frigo.refrigeradorLuz = abierta;
    });

    frigo.on("congeladorPuerta", function (abierta) {
        let luzCongelador = sessionStorage.getItem('luzAutomaticaConge');

        if (luzCongelador == 'si'  &&  sessionStorage.getItem('modo') != 'eco')
            frigo.congeladorLuz = abierta;
    });
}






// Función para desbloquear la pantalla de bloqueo mediante diferentes eventos
function desbloquearInicio() {
    let bloqueo = $('#bloqueo');

    frigo.on('frigorificoPresencia', function(presencia) {
        if (presencia) {

            // Pantalla encendida
            if (sessionStorage.getItem('modo') != undefined  &&  sessionStorage.getItem('modo') == 'eco')
                frigo.frigorificoPantalla = 1;
            else
                frigo.frigorificoPantalla = 2;

            bloqueoYDesbloqueo('bloqueo', 'inicio');
        }
    });

    bloqueo.onclick = function() {
        if (sessionStorage.getItem('modo') != undefined  &&  sessionStorage.getItem('modo') == 'eco')
            frigo.frigorificoPantalla = 1;
        else
            frigo.frigorificoPantalla = 2;
        bloqueoYDesbloqueo('bloqueo', 'inicio');
    };

    bloqueo.ontouchmove = function() {
        if (sessionStorage.getItem('modo') != undefined  &&  sessionStorage.getItem('modo') == 'eco')
            frigo.frigorificoPantalla = 1;
        else
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
        loadInicio();
    };

    // Activamos las funcionalidades del frigorífico
    funcionalidadesMenuFrigo();

}





// Función para activar las funcionalidades de las opciones de los menús de la interfaz
function funcionalidadesMenuFrigo() {
    let opciones    = $$('li'),
        vistaActual = sessionStorage.getItem('vista');

    // Alarma
    $('#inicio>header>p>a:nth-child(1)').onclick = function() {
        if (sessionStorage.getItem('vista') == 'vistaAlarma') {
            cambiarVista('vistaTemperatura');
        } else {
            cambiarVista('vistaAlarma');
            aceptarAlarma();
        }
    }

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
                    if ($('ul>li>a>p').getAttribute('data-activado') == 'refrigerador')
                        cambiarVista('vistaRefrigerador');
                    else
                        cambiarVista('vistaCongelador');
                    funcionalidadesCompartimento();
                }
            } else if (i == 1) {
                if ($('ul>li>a>p').getAttribute('data-activado') == 'refrigerador') {
                    if (sessionStorage.getItem('vista') == 'vistaRefrigerador') {
                        cambiarVista('vistaTemperatura');
                    } else {
                        cambiarVista('vistaRefrigerador');
                        funcionalidadesCompartimento();
                    }
                }
                else {
                    if (sessionStorage.getItem('vista') == 'vistaCongelador') {
                        cambiarVista('vistaTemperatura');
                    } else {
                        cambiarVista('vistaCongelador');
                        funcionalidadesCompartimento();
                    }
                }
            } else if (i == 2) {
                if (sessionStorage.getItem('vista') == 'vistaCompra')
                    cambiarVista('vistaTemperatura');
                else
                    cambiarVista('vistaCompra');
            } else if (i == 3) {
                modificarTemperatura(1);
            } else if (i == 4) {
                modificarTemperatura(-1);
            } else if (i == 5) {
                if (sessionStorage.getItem('vista') == 'vistaAjustes') {
                    cambiarVista('vistaTemperatura');
                } else {
                    cambiarVista('vistaAjustes');
                    cambiarAjustesFrigorifico();
                }
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
        $('ul>li:nth-child(2)>a>p:last-child').textContent = 'Congelador';

        ponerTemperatura(sessionStorage.getItem('tempCongelador'));
    } else {
        parrafo.setAttribute('data-activado', 'refrigerador');
        iconoConge.classList.add('desactivado');
        iconoFrigo.classList.remove('desactivado');

        // Cambiamos la vista al refrigerador
        elemento.classList.remove('icon-snowflake');
        elemento.classList.add('icon-fridge');
        $('ul>li:nth-child(2)>a>p:last-child').textContent = 'Refrigerador';
    
        ponerTemperatura(sessionStorage.getItem('tempRefrigerador'));
    }
}





// Función para poner la temperatura en la interfaz que se esté visualizando
function ponerTemperatura(temp) {
    let grados = parseInt(temp);
 //   console.log(temp);
  //  console.log(grados);

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
                if (!frigo.refrigeradorLuz  &&  frigo.refrigeradorPuerta)
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
                if (!frigo.congeladorLuz  &&  frigo.congeladorPuerta)
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
                if (modo != undefined  &&  modo == 'speed')
                    frigo.refrigeradorMotor = 2;
                else
                    frigo.refrigeradorMotor = 1;
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
                if (modo != undefined  &&  modo == 'speed')
                    frigo.congeladorMotor = 2;
                else
                    frigo.congeladorMotor = 1;
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
            ($$('#inicio>main>nav>ul>li>a>p:last-child')).forEach(function(elemento) {
                elemento.classList.remove('ocultar');
            });
        } else {

            estilo.checked = false;
            estilo.value   = 'no';
            $('html').style.setProperty('--border-color', "#0f0f0f");
            $('html').style.setProperty('--activated-color', "#fff");
            $('html').style.setProperty('--activated-opacity', ".3");
            ($$('#inicio>main>nav>ul>li>a>p:last-child')).forEach(function(elemento) {
                elemento.classList.add('ocultar');
            });
        }
    };


    aceptar.onclick = function() {
        let modo = $('#vistaAjustes>div:nth-child(2)>article>div>input:checked').value;

        // Cambiamos el modo del motor
        if (modo != undefined) {
        //    console.log(modo);
            sessionStorage.setItem('modo', modo);
            if (modo == 'eco') {
                $('body').classList.add('bajoConsumo');
                $('body').classList.remove('altoConsumo');
                frigo.frigorificoPantalla = 1;
            } else {
                $('body').classList.add('altoConsumo');
                $('body').classList.remove('bajoConsumo');
                frigo.frigorificoPantalla = 2;
            }
        }

        cambiarVista('vistaTemperatura');
    };
}

// FUNCIONES PARA LOS HISTORIALES
//array para almacenar los consumos /hora
var consumoHora = [200, 170, 198, 213, 176, 241];
//array para almacenar la media de consumo /dia
var consumoDia = [192.25, 202, 203.5, 187.78, 196.7];
//array para almacenar la temperatura /hora
var temperaturaHora = [20, 17, 19, 21, 17, 24];
//array para almacenar la media de temperatura /dia
var temperaturaDia = [19.25, 20, 20.5, 18.78, 19.7];
var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

//funcion para guardar el consumo/hora
    //en el onclick habrá que pasarle por parametro a la funcion frigorificoConsumo
function guardarConsumoHora(c) {
    consumoHora.push(c);
}

function guardarConsumoDia() {
    //funcion para hacer la media del consumo diario y guardar consumo/dia
    var sumaConsumo = consumoHora.reduce((previous, current) => current += previous);
    var media = sumaConsumo/consumoHora.length;
    //console.log(media);
    consumoDia.push(media);
}

function mostrarConsumo() {

    var data = [{
        x: meses,
        y: consumoDia,
        type: "linear",
    }];
    Plotly.newPlot("grafico-consumo", data);
    cambiarVista("h-consumo");
}



//funcion para guardar la temperatura/hora
    //en el onclick habrá que pasarle por parametro a la funcion frigorificoConsumo
function guardarTemperaturaHora(h) {
    temperaturaHora.push(h);
}

function guardarTemperaturaDia() {
    //funcion para hacer la media del consumo diario y guardar consumo/dia
    var sumaTemperatura = temperaturaHora.reduce((previous, current) => current += previous);
    var media = sumaTemperatura/temperaturaHora.length;
   // console.log(media);
    temperaturaDia.push(media);
}

function mostrarTemperatura() {

    var data = [{
        x: meses,
        y: temperaturaDia,
        type: "linear"
    }];
    Plotly.newPlot("grafico-temperatura", data);
    cambiarVista("h-temperatura");
}



// Funciones para hacer pedido
var productos = [], idProducto = 0;
function agregarProducto(p) {

    let pr = "";
    switch(p) {
        case "11111111":
            pr = "Leche";
            break;
        case "22222222":
            pr = "Huevos";
            break;
        case "33333333":
            pr = "Carne";
            break;
        case "44444444":
            pr = "Pescado";
            break;
        default:
            pr = 'Producto';
    }
    pr += ' (' + p + ')';

    let repetido = false;
    for (var i = productos.length - 1; i >= 0 && !repetido; i--) {
        if(productos[i] == p) {
            repetido = true;
          //  console.log("producto repetido");
        }
    }

    if (!repetido) {
        productos.push(p);
        //console.log("Producto agregado");
        let newHTML = `<p><button onclick="subirUnidades(${idProducto});" style="width:40px;" class="botonSubir">+</button> <button onclick="bajarUnidades(${idProducto});" style="width:40px;" class="botonSubir">-</button> ${pr} <span id="producto${idProducto}"></span></p>`;
        let html = document.querySelector('.lista').innerHTML;
        document.querySelector('.lista').innerHTML = newHTML + html;
        idProducto++;
    }
    
}



// Función para subir las unidades de un producto a solicitar en el pedido
function subirUnidades(id) {
    let unidades = $('#producto' + id);

    if (unidades.textContent == '') {
        unidades.textContent = 'x2';
    } else {
        let texto  = unidades.textContent,
            numero = texto.substr(1);
        numero = parseInt(numero);
        numero++;
        unidades.textContent = 'x' + numero;
    }
}



// Función para bajar unidades de un producto
function bajarUnidades(id) {
    let unidades = $('#producto' + id);

    if (unidades.textContent != '') {
        let texto  = unidades.textContent,
            numero = texto.substr(1);

        if (numero == 2) {
            unidades.textContent = '';
        } else {
            numero--;
            unidades.textContent = 'x' + numero;
        }
    }
}



function realizarPedido() {
    let html = "";
    if (productos.length == 0) {
        html = '<h3 style="margin-bottom:15px;">Pedido fallido</h3><p>Por favor, pase el código de un producto por el lector para realizar un pedido.<p>' +
                '<button onclick="finalizarCompra();" class="botonAceptar">Aceptar</button>';
    }
    else {
        html = '<h3>¿Estás seguro de que quieres realizar el pedido?</h3>' +
                '<button onclick="confirmarCompra();" class="botonAceptar">Aceptar</button>' +
                '<button onclick="cancelarCompra();" class="botonCancelar">Cancelar</button>';
    }
    document.querySelector('#vistaPedido').innerHTML = html;
    cambiarVista('vistaPedido');
}

function finalizarCompra() {
    cambiarVista('vistaTemperatura');
    document.querySelector('.lista').outerHTML = '<div class="lista">' +
                        '<button  onclick="realizarPedido();" class="botonAceptar">Hacer Pedido</button>' +
                    '</div>';
    productos = [];
}

function confirmarCompra() {
    let html = '<h3>Pedido Realizado</h3>' +
                '<button onclick="finalizarCompra();" class="botonAceptar">Aceptar</button>';

    document.querySelector('#vistaPedido').innerHTML = html;
    cambiarVista('vistaPedido');
}

function cancelarCompra() {
    cambiarVista('vistaCompra');
}

// Función para encender la puerta si la alarma está demasiado tiempo abierta
function notificacionAlarma() {
    let idTemp, inicioRefri = true, inicioConge = true,
        comprobarRefri = false, comprobarConge = false,
        consumoElevado = 0, // Contabiliza las veces que nos pasamos
        comprobar = true, consumoAnterior = -100;
    

    // Cuando la puerta pasa demasiado tiempo abierta
    frigo.on('refrigeradorPuerta', function (abierta) {
        let mensaje = 'Puerta abierta durante mucho tiempo. Por favor, cierre la puerta del refrigerador.';

        if (abierta) {
            idTemp = setTimeout(function() {
                cambiarEstadoAlarma(mensaje);
            }, neveraAbierta);
        } else {
            if (frigo.frigorificoAlarma)
                cambiarEstadoAlarma('');
            else
                clearTimeout(idTemp);
            idTemp = undefined;
        }
    });

    frigo.on('congeladorPuerta', function (abierta) {
        let mensaje = 'Puerta abierta durante mucho tiempo. Por favor, cierre la puerta del congelador.';

        if (abierta) {
            idTemp = setTimeout(function() {
                cambiarEstadoAlarma(mensaje);
            }, neveraAbierta);
        } else {
            if (frigo.frigorificoAlarma)
                cambiarEstadoAlarma('');
            else
                clearTimeout(idTemp);
            idTemp = undefined;
        }
    });


    // Cuando deseamos subir manualmente la temperatura hasta el límite
    frigo.on('refrigeradorTemperatura', function(temperatura) {
        let tempRefrigerador = sessionStorage.getItem('tempRefrigerador'),
            mensaje = 'Temperaturas muy altas. Por favor, baje la temperatura del refrigerador.';

        if (inicioRefri) {
            if (temperatura < tempRefrigerador) {
                inicioRefri = false;
            }
        } else {
            if (!comprobarRefri  &&  temperatura > limiteRefrigerador) {
                cambiarEstadoAlarma(mensaje);
                comprobarRefri = true;
            }
        }

        if (comprobarRefri) {
            if (tempRefrigerador < limiteRefrigerador-2) {
                comprobarRefri = false;
                cambiarEstadoAlarma('');
            }
        }
    });

    frigo.on('congeladorTemperatura', function(temperatura) {
        let tempCongelador = sessionStorage.getItem('tempCongelador'),
            mensaje = 'Temperaturas muy altas. Por favor, baje la temperatura del congelador.';

        if (inicioConge) {
            if (temperatura < tempCongelador) {
                inicioConge = false;
            }
        } else {
            if (!comprobarConge  &&  temperatura > limiteCongelador) {
                cambiarEstadoAlarma(mensaje);
                comprobarConge = true;
            }
        }

        if (comprobarConge) {
            if (tempCongelador < limiteCongelador-2) {
                comprobarConge = false;
                cambiarEstadoAlarma('');
            }
        }
    });


    // Cuando enchufamos demasiadas opciones y se eleva el consumo
    frigo.on('frigorificoConsumo', function(consumo) {
        
        if (comprobar) {
            if (consumoAnterior == -100  &&  consumo > 0) {
                consumoAnterior = consumo;
            } else {
             //   console.log(consumo-consumoAnterior);
                if (consumo-consumoAnterior > 800) {
                    consumoElevado++;
                    if (consumoElevado >= 25) { // 20 segundos con consumo elevado
                        comprobar = false;
                        cambiarEstadoAlarma('Consumo elevado. Por favor, desactive el modo SPEED mientras hace uso del frigorífico.');
                    }
                } else {
                    consumoElevado = 0;
                }
                consumoAnterior = consumo;
            }
        } else {
            if (sessionStorage.getItem('modo') != 'speed') {
                consumoElevado = 0;
                consumoAnterior = consumo;
                comprobar = true;
                cambiarEstadoAlarma('');
            }
        }

    });

}






// Función para y activar la alarma y cambiar a la vista de alarma en función de su estado
function cambiarEstadoAlarma(mensaje) {
    let titulo = $('#vistaAlarma>h2'),
        texto  = $('#vistaAlarma>p');

    if (mensaje == '') {
        frigo.frigorificoAlarma = false;
        $('header>p>a:first-child>span').classList.remove('alarma');
        $('header>p>a:first-child').classList.remove('alarmaVibracion');

        titulo.textContent = 'Alarma desactivada';
        texto.textContent  = 'Frigorífico funcionando correctamente.';
    } else {
        frigo.frigorificoAlarma = true;
        $('header>p>a:first-child>span').classList.add('alarma');
        $('header>p>a:first-child').classList.add('alarmaVibracion');

        titulo.textContent = 'Alarma activada';
        texto.textContent  = mensaje;
    }
}






// Función para interactuar con la vista de alarma
function aceptarAlarma() {
    
    $('#vistaAlarma>div>button').onclick = function() {
        if (frigo.frigorificoAlarma) {
            $('header>p>a:first-child').classList.remove('alarmaVibracion');
        }
        cambiarVista('vistaTemperatura');
    };
}
