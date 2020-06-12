const Electro = require("./electro.js").Electro;

class Frigorifico extends Electro {
	constructor(httpServer, debug) {
		var temp = 22; // temperatura por defecto

		// Inicializar las propiedades del frigorifico
		super({
			refrigeradorPuerta: false,
			refrigeradorTemperatura: temp,
			congeladorPuerta: false,
			congeladorTemperatura: temp,
			frigorificoHora: null,
			frigorificoConsumo: 0,
			frigorificoPresencia: false,
			frigorificoCodigo: null,
			exteriorTemperatura: temp
		}, {
			refrigeradorMotor: 0,
			refrigeradorLuz: false,
			congeladorMotor: 0,
			congeladorLuz: false,
			frigorificoAlarma: false,
			frigorificoPantalla: 0
		}, httpServer, debug);

		this.on("refrigeradorMotor", (val, prev) => { if (val && prev == 0) this.frigorificoConsumo += 2000; });
		this.on("congeladorMotor", (val, prev) => { if (val && prev == 0) this.frigorificoConsumo += 2000; });

		setInterval(() => {
			this.frigorificoHora = new Date(); // actualizar la hora

			// Consumo
			var consumo = 0;
			if (this.frigorificoPantalla == 1) consumo += 50;
			if (this.frigorificoPantalla == 2) consumo += 20;
			if (this.refrigeradorLuz) consumo += 10;
			if (this.congeladorLuz) consumo += 10;
			if (this.refrigeradorMotor == 1) consumo += 200;
			if (this.refrigeradorMotor == 2) consumo += 400;
			if (this.congeladorMotor == 1) consumo += 200;
			if (this.congeladorMotor == 2) consumo += 400;
			this.frigorificoConsumo += consumo;

			// Temperatura
			["refrigerador", "congelador"].forEach(x => {
				var dif = 0;
				if (this[x + "Puerta"]) {
					dif = Math.ceil((this.exteriorTemperatura - this[x + "Temperatura"]) * 10);
				} else {
					switch (this[x + "Motor"]) {
						case 0: dif = this[x + "Temperatura"] < this.exteriorTemperatura ? 1 : 0; break;
						case 1: dif = -10; break;
						case 2: dif = -20; break;
					}
				}
				if (dif) this[x + "Temperatura"] = Math.round(this[x + "Temperatura"] * 100 + dif) / 100;
			});
		}, 1000);
	}
}

exports.Frigorifico = Frigorifico;