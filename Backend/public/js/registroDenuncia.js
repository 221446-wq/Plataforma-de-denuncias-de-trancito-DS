// Variables globales para el mapa
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