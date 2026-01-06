const fetch = require('node-fetch');


module.exports = {
    /** Returns a promise that resolves in a dni name */
    async getNameFromDNI(dni = '') {
        dni = ("00000000" + dni).slice(-8);
        let url = 'http://aplicaciones007.jne.gob.pe/srop_publico/Consulta/Afiliado/GetNombresCiudadano?DNI=' + dni;
        // return promise
        try {
            let response = await fetch(url);
            let datos = await response.text();
            if (datos.startsWith("|||")) {

                datos = datos.split('|||');
                error = datos[1].trim();
                message = 'Cant get name from that DNI';

                return {
                    dni,
                    error,
                    message
                }
            } else {
                datos = datos.split('|');

                let lastname = datos[0];
                let secondlastname = datos[1];
                let name = datos[2];

                let fullname = `${name} ${lastname} ${secondlastname}`;

                return {
                    dni,
                    fullname,
                    lastname,
                    secondlastname,
                    name
                }
            }
        } catch (error) {
            throw new Error('Fetch failed');
        }
    }
};