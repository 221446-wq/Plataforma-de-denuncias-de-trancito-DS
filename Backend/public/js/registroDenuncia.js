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
    const panelWelcome = document.querySelector('.panel-welcome');
    const userNameElement = document.getElementById('user-name');
    
    if (userNameElement && user.nombres) {
        userNameElement.textContent = user.nombres + ' ' + (user.apellidos || '');
    } else if (panelWelcome) {
        panelWelcome.innerHTML = 'Bienvenido <strong>Ciudadano</strong>.';
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
    let tokenEnviado = false; // Para rastrear si se usó un token
    
    try {
        // Mostrar estado de carga
        botonDenuncia.textContent = 'Registrando...';
        botonDenuncia.disabled = true;
        
        const urlParams = new URLSearchParams(window.location.search);
        const isAnonymous = urlParams.get('anonymous') === 'true';

        const token = localStorage.getItem('token');
        console.log('🔐 Verificando sesión...');
        console.log('Token presente:', token ? 'Sí' : 'No');
        console.log('Es anónimo:', isAnonymous);

        const formData = new FormData();
        formData.append('tipo_denuncia', document.getElementById('tipo-denuncia').value);
        formData.append('descripcion', document.getElementById('descripcion').value.trim());
        formData.append('latitud', parseFloat(document.getElementById('latitud').value));
        formData.append('longitud', parseFloat(document.getElementById('longitud').value));
        formData.append('direccion', document.getElementById('direccion').value);
        formData.append('prioridad', 'media');

        const fotosInput = document.getElementById('fotos');
        for (let i = 0; i < fotosInput.files.length; i++) {
            formData.append('fotos', fotosInput.files[i]);
        }

        console.log('📤 Enviando denuncia con FormData...');

        const headers = {};
        if (token && !isAnonymous) {
            tokenEnviado = true; // Marcamos que estamos intentando usar un token
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
                    headers['Authorization'] = `Bearer ${token}`;
                }
            } catch (tokenError) {
                console.error('Error verificando token:', tokenError);
                throw new Error('Token inválido. Por favor, inicie sesión nuevamente.');
            }
        }
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DENUNCIAS.CREATE}`, {
            method: 'POST',
            headers: headers,
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
        
        document.querySelector('.denuncia-form').reset();
        document.getElementById('latitud').value = '';
        document.getElementById('longitud').value = '';
        document.getElementById('direccion').value = '';
        
        if (marker && map) {
            marker.setLatLng(defaultLocation);
            map.setView(defaultLocation, 14);
            updateCoordinates(defaultLocation);
        }
        
    } catch (error) {
        console.error('💥 Error completo al registrar denuncia:', error);
        
        // SOLO redirigir si el error es de autenticación Y se había enviado un token.
        const isAuthError = error.message.includes('401') || error.message.includes('token') || error.message.includes('expirado') || error.message.includes('autenticación');
        
        if (isAuthError && tokenEnviado) {
            alert('Su sesión ha expirado o es inválida. Por favor, inicie sesión nuevamente.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
            alert('Error de conexión: No se pudo conectar al servidor. Verifique que esté activo.');
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
let map;
let marker;
let defaultLocation = [-13.53195, -71.96746]; // Cusco

function initMap() {
    map = L.map('map').setView(defaultLocation, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Marcador inicial
    marker = L.marker(defaultLocation, {
        draggable: true
    }).addTo(map);

    // Actualizar coordenadas cuando se mueve el marcador
    marker.on('dragend', function() {
        updateCoordinates(marker.getLatLng());
    });

    // Actualizar coordenadas al hacer clic en el mapa
    map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        updateCoordinates(e.latlng);
    });

    // Inicializar coordenadas
    updateCoordinates(defaultLocation);
}

function updateCoordinates(latlng) {
    // ✅ VERIFICAR QUE latlng EXISTA Y TENGA LAS PROPIEDADES
    if (!latlng || latlng.lat === undefined || latlng.lng === undefined) {
        console.error('❌ Coordenadas inválidas:', latlng);
        document.getElementById('latitud').value = '';
        document.getElementById('longitud').value = '';
        document.getElementById('direccion').value = 'Ubicación no disponible';
        return;
    }
    
    // ✅ USAR toFixed SOLO SI LOS VALORES SON VÁLIDOS
    document.getElementById('latitud').value = latlng.lat.toFixed(6);
    document.getElementById('longitud').value = latlng.lng.toFixed(6);
    
    // Obtener dirección usando Nominatim (OpenStreetMap)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                document.getElementById('direccion').value = data.display_name;
            }
        })
        .catch(error => {
            console.error('Error obteniendo dirección:', error);
            document.getElementById('direccion').value = 'Dirección no disponible';
        });
}

// Configurar eventos de los botones del mapa
document.getElementById('obtener-ubicacion').addEventListener('click', function() {
    const button = this;
    
    if (navigator.geolocation) {
        button.textContent = '📍 Obteniendo ubicación...';
        button.disabled = true;
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLocation = [
                    position.coords.latitude,
                    position.coords.longitude
                ];
                
                marker.setLatLng(userLocation);
                map.setView(userLocation, 16);
                updateCoordinates({lat: userLocation[0], lng: userLocation[1]});
                
                button.textContent = '📍 Ubicación obtenida ✓';
                button.style.backgroundColor = '#28a745';
                button.disabled = false;
            },
            function(error) {
                alert('Error al obtener la ubicación: ' + error.message);
                button.textContent = '📍 Obtener mi ubicación actual';
                button.disabled = false;
            }
        );
    } else {
        alert('La geolocalización no es soportada por este navegador.');
    }
});

document.getElementById('buscar-direccion').addEventListener('click', function() {
    const address = prompt('Ingrese la dirección a buscar:');
    if (address) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const location = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                    marker.setLatLng(location);
                    map.setView(location, 16);
                    updateCoordinates({lat: location[0], lng: location[1]});
                } else {
                    alert('No se pudo encontrar la dirección.');
                }
            })
            .catch(error => {
                alert('Error al buscar la dirección.');
            });
    }
});

document.getElementById('buscar-manual').addEventListener('click', function() {
    const address = document.getElementById('input-direccion').value;
    if (address) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const location = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                    marker.setLatLng(location);
                    map.setView(location, 16);
                    updateCoordinates({lat: location[0], lng: location[1]});
                } else {
                    alert('No se pudo encontrar la dirección.');
                }
            })
            .catch(error => {
                alert('Error al buscar la dirección.');
            });
    }
});

// Contador de archivos seleccionados
document.querySelectorAll('.form-file').forEach(input => {
    input.addEventListener('change', function() {
        const fileCount = this.files.length;
        const infoElement = this.nextElementSibling;
        infoElement.textContent = `(${fileCount} archivo${fileCount !== 1 ? 's' : ''} seleccionado${fileCount !== 1 ? 's' : ''})`;
    });
    
});