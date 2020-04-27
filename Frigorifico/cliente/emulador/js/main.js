$().ready(() => {
	var frigo = new Electro({ emulator: true });
	frigo.on("connect", function () {
		$("#simulador").removeClass("desconectado");
		$("#estado").text("Conectado");

		// Sensores
		frigo._sensors.forEach(sensor => {
			var $x = $("<td />").appendTo($("<tr><td><strong>" + sensor + "</strong></td></tr>").appendTo("#sensors tbody"));
			function time(date) {
				function dd(n) { return (n < 10 ? "0" : "") + n; }
				return dd(date.getHours()) + ":" + dd(date.getMinutes()) + ":" + dd(date.getSeconds());
			}
			frigo.on(sensor, (val) => {
				$x.html(val instanceof Date ? time(val) : JSON.stringify(val));
			});
		});

		// Parámetros
		frigo._parameters.forEach(param => {
			var $row = $("<tr><td><strong>" + param + "</strong></td></tr>").appendTo("#parameters tbody");
			var $c = $("<td />").appendTo($row);

			var options = [];

			switch (param) {
				case "refrigeradorMotor":
				case "congeladorMotor":
					options = [{ v: 0, l: "Apagado" }, { v: 1, l: "Normal" }, { v: 2, l: "Super" }];
					break;

				case "frigorificoPantalla":
					options = [{ v: 0, l: "Apagada" }, { v: 1, l: "Atenuada" }, { v: 2, l: "Encendida" }];
					break;

				case "refrigeradorLuz":
				case "congeladorLuz":
				case "frigorificoAlarma":
					options = [{ v: false, l: "Apagada" }, { v: true, l: "Encendida" }];
					break;
			}
			options.forEach(opt => {
				var $input = $("<input type='radio' value='" + opt.v + "' name='" + param + "' /> ").prependTo($("<label>" + opt.l + " (" + opt.v + ")</label>").appendTo($c));
				$input.on("change", function () {
					frigo[param] = opt.v;
				});
			});

			frigo.on(param, (val) => {
				$c.find("input[value='" + val + "']").prop("checked", true);
			});
		});

		$("#refrigerador .puerta").click(function () { frigo.refrigeradorPuerta = !frigo.refrigeradorPuerta; });
		frigo.on("refrigeradorPuerta", value => { $("#refrigerador .puerta").toggleClass("abierta", value); });
		$("#congelador .puerta").click(function () { frigo.congeladorPuerta = !frigo.congeladorPuerta; });
		frigo.on("congeladorPuerta", value => { $("#congelador .puerta").toggleClass("abierta", value); });

		frigo.on("refrigeradorLuz", value => { $("#refrigerador .luz").toggleClass("encendida", value) });
		frigo.on("congeladorLuz", value => { $("#congelador .luz").toggleClass("encendida", value) });

		frigo.on("frigorificoPantalla", value => { $("#pantalla").removeClass("apagada bn color").addClass(["apagada", "bn", "color"][value]); });

		frigo.on("exteriorTemperatura", value => { $("#temp-exterior .valor").text(value); });

		$("#productos > *:not(#codigo-barras)").click(function () { frigo.frigorificoCodigo = $(this).text(); });
		$("#codigo-barras").click(() => {
			var codigo = prompt("Introduzca un código de barras:")
			if (codigo === null) return;
			frigo.frigorificoCodigo = codigo;
		});

		$("#temp-exterior .mas").click(() => { frigo.exteriorTemperatura++; });
		$("#temp-exterior .menos").click(() => { frigo.exteriorTemperatura--; });

		$("#usuario").click(() => { frigo.frigorificoPresencia = !frigo.frigorificoPresencia; });
		frigo.on("frigorificoPresencia", (val) => { $("#usuario").toggleClass("presencia", val); });

		$("#alarma").click(() => { frigo.frigorificoAlarma = !frigo.frigorificoAlarma; });
		var siBeep = null;
		frigo.on("frigorificoAlarma", (val) => {
			$("#alarma").toggleClass("encendida", val);
			if (val && !siBeep) { beep(); siBeep = setInterval(beep, 1000); }
			if (!val && siBeep) { clearInterval(siBeep); siBeep = null; }
		});

		// Error o desconexión
		function stop() {
			$("#simulador").addClass("desconectado");
			$("#estado").text("Desconectado");
			if (siBeep) clearInterval(siBeep);
		}
		frigo.on("error", stop);
		frigo.on("disconnect", stop);
	});

});

// Sonido de un pitido
var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");

// Reproduce un pitido
function beep() {
	snd.play();
}