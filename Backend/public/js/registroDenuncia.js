<<<<<<< HEAD
// Variables globales para el mapa
=======
document.addEventListener('DOMContentLoaded', function() {
    // Cargar nombre del usuario
    cargarNombreUsuario();
    
    // Configurar el formulario de denuncia
    const denunciaForm = document.querySelector('.denuncia-form');
    
    if (denunciaForm) {
        denunciaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (await validarFormularioDenuncia()) {
                await registrarDenuncia();
            }
        });
    }
    
    // Inicializar mapa
    initMap();
});

function cargarNombreUsuario() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameElement = document.getElementById('user-name');
    
    if (userNameElement && user.nombres) {
        userNameElement.textContent = user.nombres + ' ' + (user.apellidos || '');
    }
}

async function validarFormularioDenuncia() {
    const tipoDenuncia = document.getElementById('tipo-denuncia').value;
    const descripcion = document.getElementById('descripcion').value;
    const latitud = document.getElementById('latitud').value;
    const longitud = document.getElementById('longitud').value;
    const terminos = document.getElementById('terminos').checked;
    
    // Validar tipo de denuncia
    if (!tipoDenuncia) {
        alert('Por favor seleccione el tipo de denuncia');
        document.getElementById('tipo-denuncia').focus();
        return false;
    }
    
    // Validar descripción
    if (!descripcion.trim()) {
        alert('Por favor ingrese una descripción detallada');
        document.getElementById('descripcion').focus();
        return false;
    }
    
    if (descripcion.trim().length < 10) {
        alert('La descripción debe tener al menos 10 caracteres');
        document.getElementById('descripcion').focus();
        return false;
    }
    
    // Validar ubicación
    if (!latitud || !longitud) {
        alert('Por favor seleccione una ubicación en el mapa');
        return false;
    }
    
    // Validar términos y condiciones
    if (!terminos) {
        alert('Debe aceptar los términos y condiciones');
        document.getElementById('terminos').focus();
        return false;
    }
    
    return true;
}

async function registrarDenuncia() {
    const botonDenuncia = document.querySelector('.denuncia-btn');
    const textoOriginal = botonDenuncia.textContent;
    
    try {
        // Mostrar estado de carga
        botonDenuncia.textContent = 'Registrando...';
        botonDenuncia.disabled = true;
        
        // VERIFICAR TOKEN ANTES DE CONTINUAR
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        console.log('🔐 Verificando sesión...');
        console.log('Token presente:', token ? 'Sí' : 'No');
        console.log('Usuario:', user);
        
        if (!token) {
            throw new Error('No hay token de autenticación. Por favor, inicie sesión nuevamente.');
        }

        // Verificar si el token ha expirado
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const now = Date.now() / 1000;
                
                if (payload.exp && payload.exp < now) {
                    console.log('❌ Token expirado');
                    throw new Error('Token expirado');
                }
                
                console.log('✅ Token válido. Usuario:', payload.usuario);
            }
        } catch (tokenError) {
            console.error('Error verificando token:', tokenError);
            throw new Error('Token inválido. Por favor, inicie sesión nuevamente.');
        }

        const formData = new FormData();
        formData.append('tipo_denuncia', document.getElementById('tipo-denuncia').value);
        formData.append('descripcion', document.getElementById('descripcion').value.trim());
        formData.append('latitud', parseFloat(document.getElementById('latitud').value));
        formData.append('longitud', parseFloat(document.getElementById('longitud').value));
        formData.append('direccion', document.getElementById('direccion').value);
        formData.append('prioridad', 'media');

        // Adjuntar archivos de fotos
        const fotosInput = document.getElementById('fotos');
        for (let i = 0; i < fotosInput.files.length; i++) {
            formData.append('fotos', fotosInput.files[i]);
        }

        console.log('📤 Enviando denuncia con FormData...');
        
        // Usar fetch con FormData
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DENUNCIAS.CREATE}`, {
            method: 'POST',
            headers: {
                // No establecer 'Content-Type', el navegador lo hará por nosotros con el boundary correcto
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        console.log('📥 Respuesta HTTP:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('✅ Denuncia registrada:', responseData);
        
        alert(`¡Denuncia registrada exitosamente!\nCódigo de seguimiento: ${responseData.codigo_denuncia}\nGuarde este código para hacer seguimiento.`);
        
        // Limpiar formulario
        document.querySelector('.denuncia-form').reset();
        document.getElementById('latitud').value = '';
        document.getElementById('longitud').value = '';
        document.getElementById('direccion').value = '';
        
        // Restablecer mapa a posición inicial
        if (marker && map) {
            marker.setLatLng(defaultLocation);
            map.setView(defaultLocation, 14);
            updateCoordinates(defaultLocation);
        }
        
    } catch (error) {
        console.error('💥 Error completo al registrar denuncia:', error);
        
        if (error.message.includes('401') || error.message.includes('token') || error.message.includes('expirado') || error.message.includes('autenticación')) {
            alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
            // Limpiar datos de sesión expirados
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
            alert('Error de conexión: Verifica que el servidor esté funcionando en http://localhost:3000');
        } else {
            alert('Error al registrar denuncia: ' + error.message);
        }
    } finally {
        // Restaurar botón
        botonDenuncia.textContent = textoOriginal;
        botonDenuncia.disabled = false;
    }
}
// Variables y funciones del mapa (mover aquí desde el HTML)
>>>>>>> origin/rick
let map;
let marker;
const defaultLocation = [-13.53195, -71.96746]; // Coordenadas de Cusco

document.addEventListener('DOMContentLoaded', function() {
    // 1. Cargar datos del usuario
    cargarNombreUsuario();
    
    // 2. Inicializar el mapa
    initMap();
    
    // 3. Configurar el formulario
    const denunciaForm = document.querySelector('.denuncia-form');
    if (denunciaForm) {
        denunciaForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Evita recarga de página
            await registrarDenuncia(); // Llama a la función nueva
        });
    }

    // 4. Configurar botones del mapa (Geolocalización)
    configurarBotonesMapa();

    // 5. Configurar contadores de archivos
    document.querySelectorAll('.form-file').forEach(input => {
        input.addEventListener('change', function() {
            const fileCount = this.files.length;
            const infoElement = this.nextElementSibling;
            if(infoElement) {
                infoElement.textContent = `(${fileCount} archivo${fileCount !== 1 ? 's' : ''} seleccionado${fileCount !== 1 ? 's' : ''})`;
            }
        });
    });
});

// ==========================================
// FUNCIONES DEL MAPA
// ==========================================
function initMap() {
    // Verificar si existe el div del mapa
    if (!document.getElementById('map')) return;

    map = L.map('map').setView(defaultLocation, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Marcador inicial
    marker = L.marker(defaultLocation, {
        draggable: true
    }).addTo(map);

    // Eventos del marcador
    marker.on('dragend', function() {
        updateCoordinates(marker.getLatLng());
    });

    map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        updateCoordinates(e.latlng);
    });

    // Inicializar coordenadas en los inputs
    updateCoordinates({ lat: defaultLocation[0], lng: defaultLocation[1] });
}

function updateCoordinates(latlng) {
    if (!latlng || latlng.lat === undefined || latlng.lng === undefined) return;
    
    const latInput = document.getElementById('latitud');
    const lngInput = document.getElementById('longitud');
    const dirInput = document.getElementById('direccion');

    if(latInput) latInput.value = latlng.lat.toFixed(6);
    if(lngInput) lngInput.value = latlng.lng.toFixed(6);
    
    // Obtener dirección con Nominatim
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
        .then(response => response.json())
        .then(data => {
            if (dirInput && data.display_name) {
                dirInput.value = data.display_name;
            }
        })
        .catch(console.error);
}

function configurarBotonesMapa() {
    // Botón: Obtener ubicación actual
    const btnUbicacion = document.getElementById('obtener-ubicacion');
    if (btnUbicacion) {
        btnUbicacion.addEventListener('click', function() {
            if (navigator.geolocation) {
                btnUbicacion.textContent = '📍 Obteniendo...';
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                        marker.setLatLng(loc);
                        map.setView(loc, 16);
                        updateCoordinates(loc);
                        btnUbicacion.textContent = '📍 Ubicación obtenida ✓';
                    },
                    (error) => {
                        alert('Error de ubicación: ' + error.message);
                        btnUbicacion.textContent = '📍 Obtener mi ubicación';
                    }
                );
            } else {
                alert('Tu navegador no soporta geolocalización');
            }
        });
    }

    // Botón: Buscar dirección manual
    const btnBuscar = document.getElementById('buscar-manual');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', function() {
            const address = document.getElementById('input-direccion').value;
            if (address) {
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
                    .then(r => r.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const loc = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                            marker.setLatLng(loc);
                            map.setView(loc, 16);
                            updateCoordinates(loc);
                        } else {
                            alert('Dirección no encontrada');
                        }
                    });
            }
        });
    }
}

// ==========================================
// FUNCIONES DE USUARIO
// ==========================================
function cargarNombreUsuario() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && user.nombres) {
            userNameElement.textContent = user.nombres + ' ' + (user.apellidos || '');
        }
    } catch (e) {
        console.error("Error cargando usuario", e);
    }
}

// ==========================================
// FUNCIÓN PRINCIPAL: REGISTRAR DENUNCIA
// ==========================================
async function registrarDenuncia() {
    const botonDenuncia = document.querySelector('.denuncia-btn');
    const textoOriginal = botonDenuncia.textContent;
    
    try {
        // 1. Validaciones básicas
        const tipo = document.getElementById('tipo-denuncia').value;
        const desc = document.getElementById('descripcion').value;
        const lat = document.getElementById('latitud').value;
        
        if (!tipo) return alert('Seleccione un tipo de denuncia');
        if (!desc || desc.length < 10) return alert('La descripción debe tener al menos 10 caracteres');
        if (!lat) return alert('Seleccione una ubicación en el mapa');
        if (!document.getElementById('terminos').checked) return alert('Debe aceptar los términos');

        // 2. Preparar envío
        botonDenuncia.textContent = 'Subiendo archivos...';
        botonDenuncia.disabled = true;
        
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Sesión expirada. Inicie sesión nuevamente.');

        // 3. Crear FormData (IMPORTANTE PARA ARCHIVOS)
        const formData = new FormData();
        formData.append('tipo_denuncia', tipo);
        formData.append('descripcion', desc);
        formData.append('latitud', lat);
        formData.append('longitud', document.getElementById('longitud').value);
        formData.append('direccion', document.getElementById('direccion').value);
        formData.append('prioridad', 'media'); // Valor por defecto

        // Agregar archivos (Fotos)
        const fotosInput = document.getElementById('fotos');
        if (fotosInput.files.length > 0) {
            for (let i = 0; i < fotosInput.files.length; i++) {
                formData.append('fotos', fotosInput.files[i]);
            }
        }

        // Agregar archivos (Videos)
        const videosInput = document.getElementById('videos');
        if (videosInput.files.length > 0) {
            for (let i = 0; i < videosInput.files.length; i++) {
                formData.append('videos', videosInput.files[i]);
            }
        }
        
        // Agregar archivos (Documentos)
        const docsInput = document.getElementById('documentos');
        if (docsInput.files.length > 0) {
            for (let i = 0; i < docsInput.files.length; i++) {
                formData.append('documentos', docsInput.files[i]);
            }
        }

        console.log("📤 Enviando datos...");

        // 4. Petición Fetch
        const response = await fetch('http://localhost:3000/api/denuncias', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // NO AGREGAR Content-Type: application/json AQUÍ
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en el servidor');
        }

        // 5. Éxito
        alert(`¡Denuncia registrada!\nCódigo: ${data.codigo_denuncia}`);
        window.location.href = 'index.html'; // Redirigir al inicio

    } catch (error) {
        console.error(error);
        alert('Error: ' + error.message);
        if (error.message.includes('Sesión expirada')) {
            window.location.href = 'login.html';
        }
    } finally {
        botonDenuncia.textContent = textoOriginal;
        botonDenuncia.disabled = false;
    }
}