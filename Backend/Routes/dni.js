const express = require('express');
const router = express.Router();
const axios = require('axios');

// TU TOKEN DE APIPERUDEV
const API_TOKEN = '006f9bdee7d481eeb09aff2280faa0ad663249d12d02e8e4acdf856d99424188';

router.get('/:dni', async (req, res) => {
    const dni = req.params.dni.trim();

    if (!/^\d{8}$/.test(dni)) {
        return res.status(400).json({ error: 'DNI inválido (debe tener 8 dígitos)' });
    }

    try {
        const url = `https://apiperu.dev/api/dni/${dni}?api_token=${API_TOKEN}`;

        const response = await axios.get(url);

        const data = response.data;

        // Verificar si hay error o no success
        if (!data.success || data.error) {
            return res.status(404).json({ error: 'DNI no encontrado' });
        }

        // Acceder a los datos dentro de data.data
        res.json({
            nombres: data.data.nombres || '',
            apellido_paterno: data.data.apellido_paterno || '',
            apellido_materno: data.data.apellido_materno || ''
        });

    } catch (error) {
        console.error('Error ApiPeruDev:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al consultar el DNI' });
    }
});

module.exports = router;