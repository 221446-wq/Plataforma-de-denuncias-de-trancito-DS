// ========== FUNCIONES DE UTILIDAD ==========

function formatearFecha(fechaString) {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-ES');
}

function formatearEstado(estado) {
    const estados = {
        'recibido': 'Recibido',
        'en_proceso': 'En Proceso',
        'resuelta': 'Resuelta',
        'archivada': 'Archivada'
    };
    return estados[estado] || estado;
}

function formatearPrioridad(prioridad) {
    const prioridades = {
        'alta': 'Alta',
        'media': 'Media', 
        'baja': 'Baja'
    };
    return prioridades[prioridad] || prioridad;
}

function formatearAccion(accion) {
    const acciones = {
        'recibido': 'Denuncia Recibida',
        'en_proceso': 'Puesta en Proceso',
        'resuelta': 'Marcada como Resuelta',
        'archivada': 'Archivada',
        'comentario': 'Comentario Agregado'
    };
    return acciones[accion] || accion;
}

// ========== FUNCIONES PARA ARCHIVOS ==========

function procesarArchivosSeguros(archivos) {
    if (!archivos) return [];
    if (Array.isArray(archivos)) return archivos;
    if (typeof archivos === 'string') {
        try {
            const parsed = JSON.parse(archivos);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.warn('⚠️ Error parseando archivos string:', e);
            return [];
        }
    }
    return [];
}

function crearHTMLArchivos(denuncia) {
    console.log('📁 Procesando archivos de denuncia:', denuncia.id);
    
    // Usar la función segura para procesar archivos
    const archivosFotos = procesarArchivosSeguros(denuncia.archivos_fotos);
    const archivosVideos = procesarArchivosSeguros(denuncia.archivos_videos);
    const archivosDocumentos = procesarArchivosSeguros(denuncia.archivos_documentos);
    
    console.log('📁 Fotos procesadas:', archivosFotos);
    console.log('📁 Videos procesados:', archivosVideos);
    console.log('📁 Documentos procesados:', archivosDocumentos);

    // Si no hay archivos, mostrar mensaje
    if (archivosFotos.length === 0 && archivosVideos.length === 0 && archivosDocumentos.length === 0) {
        return '<div class="no-archivos">No hay archivos adjuntos para esta denuncia</div>';
    }

    let html = '';

    // Fotos - Renderizadas como imágenes
    if (archivosFotos.length > 0) {
        html += '<div class="evidence-gallery">';
        html += archivosFotos.map(foto => `
            <a href="/uploads/${foto}" target="_blank" rel="noopener noreferrer" title="Ver imagen completa">
                <img src="/uploads/${foto}" alt="Evidencia fotográfica" class="denuncia-imagen-thumb">
            </a>
        `).join('');
        html += '</div>';
    }

    // Videos y Documentos - Renderizados como lista
    const otrosArchivos = [...archivosVideos, ...archivosDocumentos];
    if (otrosArchivos.length > 0) {
        html += otrosArchivos.map((archivo, index) => `
            <div class="archivo-item">
                <div class="archivo-icon">${archivo.url.includes('.mp4') ? '🎥' : '📄'}</div>
                <div class="archivo-info">
                    <span class="archivo-nombre">${archivo.nombre || `archivo_${index + 1}`}</span>
                    <span class="archivo-tipo">${archivo.url.includes('.mp4') ? 'Video' : 'Documento'}</span>
                </div>
                <a href="/uploads/${archivo.url}" target="_blank" rel="noopener noreferrer" class="archivo-btn">Ver</a>
                <a href="/uploads/${archivo.url}" download="${archivo.nombre || `archivo_${index + 1}`}" class="archivo-btn secondary">Descargar</a>
            </div>
        `).join('');
    }

    return html;
}

function crearHTMLHistorial(historial) {
    if (historial.length === 0) {
        return `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${formatearFecha(new Date())}</div>
                    <div class="timeline-title">Sin historial</div>
                    <div class="timeline-desc">No hay registros en el historial de esta denuncia</div>
                </div>
            </div>
        `;
    }

    return historial.map(item => `
        <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-date">${formatearFecha(item.fecha)}</div>
                <div class="timeline-title">${formatearAccion(item.accion)}</div>
                <div class="timeline-desc">${item.descripcion || 'Sin descripción'}</div>
            </div>
        </div>
    `).join('');
}

// ========== FUNCIÓN PRINCIPAL PARA CREAR HTML ==========

function crearHTMLDenuncia(denuncia) {
    
    // Generar el mapa o el placeholder
    let mapaHTML = '';
    if (denuncia.latitud && denuncia.longitud) {
        mapaHTML = `
            <div class="map-container">
                <iframe
                    width="100%"
                    height="100%"
                    frameborder="0"
                    style="border:0"
                    src="https://maps.google.com/maps?q=${denuncia.latitud},${denuncia.longitud}&hl=es&z=15&output=embed"
                    allowfullscreen>
                </iframe>
            </div>`;
    } else {
        mapaHTML = `
            <div class="map-placeholder">
                <p>🗺️ Mapa de ubicación</p>
                <small>Coordenadas no disponibles para esta denuncia.</small>
            </div>`;
    }

    return `
        <!-- Información principal -->
        <div class="info-grid">
            <!-- Columna izquierda - Información básica -->
            <div class="info-column">
                <div class="info-section">
                    <h3 class="section-title">Información de la Denuncia</h3>
                    <div class="info-item">
                        <label>Número de Denuncia:</label>
                        <span class="info-value">${denuncia.codigo_denuncia || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <label>Fecha de Registro:</label>
                        <span class="info-value">${formatearFecha(denuncia.fecha_creacion)}</span>
                    </div>
                    <div class="info-item">
                        <label>Tipo de Denuncia:</label>
                        <span class="info-value">${denuncia.tipo_denuncia || 'No especificado'}</span>
                    </div>
                    <div class="info-item">
                        <label>Prioridad:</label>
                        <span class="badge ${denuncia.prioridad || 'media'}">${formatearPrioridad(denuncia.prioridad)}</span>
                    </div>
                    <div class="info-item">
                        <label>Estado Actual:</label>
                        <span class="estado ${denuncia.estado || 'recibido'}">${formatearEstado(denuncia.estado)}</span>
                    </div>
                </div>

                <!-- Información del ciudadano -->
                <div class="info-section">
                    <h3 class="section-title">Información del Ciudadano</h3>
                    <div class="info-item">
                        <label>Nombre:</label>
                        <span class="info-value">${denuncia.nombres || ''} ${denuncia.apellidos || ''}</span>
                    </div>
                    <div class="info-item">
                        <label>DNI:</label>
                        <span class="info-value">${denuncia.dni || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <label>Teléfono:</label>
                        <span class="info-value">${denuncia.celular || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <label>Email:</label>
                        <span class="info-value">${denuncia.correo || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <!-- Columna derecha - Ubicación y acciones -->
            <div class="info-column">
                <!-- Ubicación -->
                <div class="info-section">
                    <h3 class="section-title">Ubicación del Incidente</h3>
                    <div class="info-item">
                        <label>Dirección:</label>
                        <span class="info-value">${denuncia.direccion || 'No especificada'}</span>
                    </div>
                    ${mapaHTML}
                </div>

                <!-- Gestión de la denuncia -->
                <div class="info-section">
                    <h3 class="section-title">Gestión de la Denuncia</h3>
                    <div class="action-buttons">
                        <button class="action-btn primary" data-estado="en_proceso">
                            📋 Poner en Proceso
                        </button>
                        <button class="action-btn success" data-estado="resuelta">
                            ✅ Marcar como Resuelta
                        </button>
                        <button class="action-btn warning" data-estado="archivada">
                            📁 Archivar Denuncia
                        </button>
                        <button class="action-btn secondary" onclick="descargarReporte('${denuncia.codigo_denuncia}')">
                            📄 Descargar Reporte
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Descripción detallada -->
        <div class="info-section full-width">
            <h3 class="section-title">Descripción del Incidente</h3>
            <div class="descripcion-content">
                <p>${denuncia.descripcion || 'No hay descripción disponible.'}</p>
                <p><strong>Fecha del incidente:</strong> ${formatearFecha(denuncia.fecha_creacion)}</p>
                ${denuncia.fecha_actualizacion ? `<p><strong>Última actualización:</strong> ${formatearFecha(denuncia.fecha_actualizacion)}</p>` : ''}
            </div>
        </div>

        <!-- Archivos adjuntos -->
        <div class="info-section full-width">
            <h3 class="section-title">Archivos Adjuntos</h3>
            <div class="archivos-grid">
                ${crearHTMLArchivos(denuncia)}
            </div>
        </div>

        <!-- Historial de seguimiento -->
        <div class="info-section full-width">
            <h3 class="section-title">Historial de Seguimiento</h3>
            <div class="timeline">
                ${crearHTMLHistorial(denuncia.historial || [])}
            </div>
        </div>

        <!-- Comentarios y actualizaciones -->
        <div class="info-section full-width">
            <h3 class="section-title">Comentarios y Actualizaciones</h3>
            <div class="comentarios-section">
                <div class="nuevo-comentario">
                    <textarea class="comentario-input" placeholder="Agregar comentario o actualización sobre el estado de la denuncia..."></textarea>
                    <div class="comentario-actions">
                        <button class="comentario-btn" onclick="agregarComentario(${denuncia.id})">
                            💬 Agregar Comentario
                        </button>
                    </div>
                </div>
                <div class="comentarios-list">
                    <div class="comentario-item">
                        <div class="comentario-header">
                            <span class="comentario-autor">Sistema</span>
                            <span class="comentario-fecha">${formatearFecha(denuncia.fecha_creacion)}</span>
                        </div>
                        <div class="comentario-texto">Denuncia registrada en el sistema</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== FUNCIONES DE INTERACCIÓN ==========

function configurarBotonesAccion(denunciaId) {
    const botones = document.querySelectorAll('.action-btn[data-estado]');
    botones.forEach(boton => {
        boton.addEventListener('click', function() {
            const nuevoEstado = this.getAttribute('data-estado');
            cambiarEstadoDenuncia(denunciaId, nuevoEstado);
        });
    });
}

async function cambiarEstadoDenuncia(denunciaId, nuevoEstado) {
    try {
        const comentario = prompt(`Ingrese un comentario para el cambio a "${formatearEstado(nuevoEstado)}":`);
        
        if (comentario === null) return;

        await apiRequest(`${API_CONFIG.ENDPOINTS.DENUNCIAS.UPDATE_STATUS}/${denunciaId}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ 
                estado: nuevoEstado, 
                comentario: comentario || `Cambio de estado a ${formatearEstado(nuevoEstado)}` 
            })
        });

        alert(`✅ Estado cambiado a: ${formatearEstado(nuevoEstado)}`);
        location.reload();
        
    } catch (error) {
        alert('❌ Error al cambiar estado: ' + error.message);
    }
}

async function agregarComentario(denunciaId) {
    const input = document.querySelector('.comentario-input');
    const texto = input.value.trim();
    
    if (!texto) {
        alert('Por favor, ingrese un comentario');
        return;
    }

    try {
        await apiRequest(`${API_CONFIG.ENDPOINTS.DENUNCIAS.UPDATE_STATUS}/${denunciaId}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ 
                estado: 'comentario',
                comentario: texto 
            })
        });

        input.value = '';
        alert('Comentario agregado correctamente');
        location.reload();
        
    } catch (error) {
        alert('Error al agregar comentario: ' + error.message);
    }
}

// ========== FUNCIONES PARA ARCHIVOS (globales) ==========

function verArchivo(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    } else {
        alert('Archivo no disponible');
    }
}

function descargarArchivo(url, nombre) {
    if (url && url !== '#') {
        const link = document.createElement('a');
        link.href = url;
        link.download = nombre;
        link.click();
    } else {
        alert('Archivo no disponible para descarga');
    }
}

function descargarReporte(codigoDenuncia) {
    alert(`Generando reporte para denuncia ${codigoDenuncia}...`);
    // Implementar generación de PDF aquí
}

// ========== FUNCIONES DE INTERFAZ ==========

function mostrarCargando() {
    const mainContent = document.querySelector('.panel-card');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando detalles de la denuncia...</p>
            </div>
        `;
    }
}

function ocultarCargando() {
    // Se oculta cuando se actualiza la interfaz
}

function mostrarError(mensaje) {
    const mainContent = document.querySelector('.panel-card');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="error-container">
                <h3>❌ Error</h3>
                <p>${mensaje}</p>
                <button onclick="window.location.href='gestion_denuncias.html'" class="back-btn">← Volver a Gestión</button>
            </div>
        `;
    }
}

function actualizarInterfaz(denuncia) {
    const panelCard = document.querySelector('.panel-card');
    
    // Crear el HTML completo con los datos reales
    panelCard.innerHTML = crearHTMLDenuncia(denuncia);
    
    // Configurar botones de acción (ahora usando el ID para cambiar estado)
    configurarBotonesAccion(denuncia.id);
}

// ========== FUNCIONES PRINCIPALES ==========

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debe iniciar sesión para ver los detalles');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

async function cargarDetalleDenuncia(codigoDenuncia) {
    try {
        console.log('📥 Cargando detalle de denuncia CÓDIGO:', codigoDenuncia);
        mostrarCargando();
        
        // Codificar el código para URLs
        const codigoCodificado = encodeURIComponent(codigoDenuncia);
        
        // Usar el endpoint específico para códigos
        const denuncia = await apiRequest(`${API_CONFIG.ENDPOINTS.DENUNCIAS.GET_BY_CODE}/${codigoCodificado}`);
        console.log('✅ Denuncia cargada:', denuncia);
        
        actualizarInterfaz(denuncia);
        ocultarCargando();
        
    } catch (error) {
        console.error('❌ Error al cargar denuncia:', error);
        ocultarCargando();
        mostrarError('Error al cargar los detalles de la denuncia: ' + error.message);
    }
}
// ========== INICIALIZACIÓN ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 detalleDenuncia.js cargado');
    
    // Verificar autenticación primero
    if (!verificarAutenticacion()) {
        return;
    }
    
    // Obtener CÓDIGO de la denuncia de la URL (no ID)
    const urlParams = new URLSearchParams(window.location.search);
    const codigoDenuncia = urlParams.get('codigo');
    
    if (codigoDenuncia) {
        cargarDetalleDenuncia(codigoDenuncia);
    } else {
        mostrarError('No se proporcionó código de denuncia');
    }
});