// Configuración de la API
const API_CONFIG = {
    BASE_URL: 'https://plataforma-de-denuncias-de-trancito-ds-csx1.onrender.com/api',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            REGISTER_FUNCIONARIO: '/auth/register-funcionario'
        },
        DENUNCIAS: {
            CREATE: '/denuncias',
            GET_BY_CODE: '/denuncias/codigo', // ← ESTE ES EL CORRECTO
            GET_BY_ID: '/denuncias/id',       // ← Para búsqueda por ID numérico
            LIST: '/denuncias',
            UPDATE_STATUS: '/denuncias'
        },
        ESTADISTICAS: {
            GENERALES: '/estadisticas/generales',
            POR_TIPO: '/estadisticas/por-tipo',
            EVOLUCION: '/estadisticas/evolucion-mensual',
            PRIORIDAD: '/estadisticas/por-prioridad',
            FILTROS: '/estadisticas/filtros'
        }
    }
};

// Función para hacer peticiones a la API
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };

    // Agregar token de autenticación si existe
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        console.log('🌐 Haciendo petición a:', url);
        console.log('📦 Opciones:', { ...defaultOptions, ...options });
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        console.log('📡 Respuesta recibida. Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error en respuesta:', errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        return data;
        
    } catch (error) {
        console.error('💥 Error en la petición API:', error);
        console.error('🔗 URL que falló:', url);
        throw error;
    }
}