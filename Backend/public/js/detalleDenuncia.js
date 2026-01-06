document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 detalleDenuncia.js cargado (con mapa Leaflet)');

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const codigoDenuncia = urlParams.get('codigo');

    if (codigoDenuncia) {
        cargarDetalleDenuncia(codigoDenuncia);
    } else {
        alert('No se especificó un código de denuncia');
        window.location.href = 'gestion_denuncias.html';
    }
});

// ==========================================
// CONFIGURACIÓN
// ==========================================
const API_URL = 'http://localhost:3000/api';
const UPLOADS_URL = 'http://localhost:3000/uploads/';

// Variables globales del mapa
let mapaDetalle;
let marcadorDetalle;

// ==========================================
// UTILIDADES
// ==========================================
function formatearFecha(fechaString) {
    if (!fechaString) return 'N/A';
    return new Date(fechaString).toLocaleString('es-ES');
}

function formatearEstado(estado) {
    const estados = { 'recibido': 'Recibido', 'en_proceso': 'En Proceso', 'resuelta': 'Resuelta', 'archivada': 'Archivada' };
    return estados[estado] || estado || 'Recibido';
}

function formatearPrioridad(prioridad) {
    const prioridades = { 'alta': 'Alta', 'media': 'Media', 'baja': 'Baja' };
    return prioridades[prioridad] || 'Media';
}

function procesarArchivosSeguros(archivos) {
    if (!archivos) return [];
    if (Array.isArray(archivos)) return archivos;
    if (typeof archivos === 'string') {
        try {
            const parsed = JSON.parse(archivos);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.warn('⚠️ Error parseando archivos:', e);
            return [];
        }
    }
    return [];
}

// ==========================================
// ARCHIVOS GLOBALES
// ==========================================
window.abrirArchivo = function (nombreArchivo) {
    if (!nombreArchivo || nombreArchivo === 'undefined') {
        alert('Error: Nombre de archivo no válido');
        return;
    }
    const urlCompleta = UPLOADS_URL + nombreArchivo;
    window.open(urlCompleta, '_blank');
};

window.bajarArchivo = function (nombreArchivo) {
    if (!nombreArchivo || nombreArchivo === 'undefined') return;
    const urlCompleta = UPLOADS_URL + nombreArchivo;
    const link = document.createElement('a');
    link.href = urlCompleta;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ==========================================
// INICIALIZAR MAPA EN DETALLE
// ==========================================
function inicializarMapa(lat, lng) {
    console.log('🗺️ Inicializando mapa con:', lat, lng);

    const mapaContainer = document.getElementById('mapa-detalle');
    if (!mapaContainer) {
        console.error('Contenedor #mapa-detalle no encontrado');
        return;
    }

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        mapaContainer.innerHTML = '<p style="text-align:center; padding:100px; color:#999;">📍 Ubicación no disponible</p>';
        return;
    }

    // Limpiar mapa anterior
    if (mapaDetalle) {
        mapaDetalle.remove();
        mapaDetalle = null;
    }

    // Crear el mapa
    mapaDetalle = L.map('mapa-detalle').setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapaDetalle);

    // Marcador centrado
    L.marker([lat, lng]).addTo(mapaDetalle)
        .bindPopup('<b>Ubicación del incidente</b>')
        .openPopup();

    // Esperar a que el mapa esté completamente listo (soluciona áreas grises)
    mapaDetalle.whenReady(function() {
        mapaDetalle.invalidateSize();
        mapaDetalle.setView([lat, lng], 16); // Recentra

        // Invalidar de nuevo después de 500ms (soluciona cargas lentas)
        setTimeout(() => {
            mapaDetalle.invalidateSize();
            mapaDetalle.setView([lat, lng], 16);
            console.log('✅ Mapa completamente cargado y centrado');
        }, 500);
    });

    // Ajustar al redimensionar ventana
    window.addEventListener('resize', function () {
        setTimeout(function () {
            mapaDetalle.invalidateSize();
        }, 200);
    });
}

// ==========================================
// GENERACIÓN DE HTML
// ==========================================
function crearHTMLArchivos(denuncia) {
    const fotos = procesarArchivosSeguros(denuncia.archivos_fotos);
    const videos = procesarArchivosSeguros(denuncia.archivos_videos);
    const docs = procesarArchivosSeguros(denuncia.archivos_documentos);

    if (fotos.length === 0 && videos.length === 0 && docs.length === 0) {
        return '<div class="no-archivos">No hay archivos adjuntos para esta denuncia</div>';
    }

    let html = '';
    const generarBloque = (lista, icono, etiqueta) => {
        return lista.map(archivo => {
            const nombreArchivo = typeof archivo === 'string' ? archivo : archivo.nombre || archivo;
            return `
                <div class="archivo-item">
                    <div class="archivo-icon">${icono}</div>
                    <div class="archivo-info">
                        <span class="archivo-nombre">${nombreArchivo}</span>
                        <span class="archivo-tipo">${etiqueta}</span>
                    </div>
                    <button class="archivo-btn" onclick="window.abrirArchivo('${nombreArchivo}')">Ver</button>
                    <button class="archivo-btn secondary" onclick="window.bajarArchivo('${nombreArchivo}')">Descargar</button>
                </div>`;
        }).join('');
    };

    if (fotos.length > 0) html += generarBloque(fotos, '🖼️', 'Foto');
    if (videos.length > 0) html += generarBloque(videos, '🎥', 'Video');
    if (docs.length > 0) html += generarBloque(docs, '📄', 'Documento');
    return html;
}

function crearHTMLDenuncia(denuncia) {
    const lat = parseFloat(denuncia.latitud);
    const lng = parseFloat(denuncia.longitud);

    return `
        <div class="info-grid">
            <div class="info-column">
                <div class="info-section">
                    <h3 class="section-title">Información de la Denuncia</h3>
                    <div class="info-item"><label>Código:</label><span>${denuncia.codigo_denuncia || 'N/A'}</span></div>
                    <div class="info-item"><label>Fecha de Registro:</label><span>${formatearFecha(denuncia.fecha_creacion)}</span></div>
                    <div class="info-item"><label>Tipo:</label><span>${denuncia.tipo_denuncia || 'No especificado'}</span></div>
                    <div class="info-item"><label>Prioridad:</label><span class="badge ${denuncia.prioridad || 'media'}">${formatearPrioridad(denuncia.prioridad)}</span></div>
                    <div class="info-item"><label>Estado:</label><span class="estado ${denuncia.estado}">${formatearEstado(denuncia.estado)}</span></div>
                </div>

                <div class="info-section">
                    <h3 class="section-title">Ciudadano</h3>
                    <div class="info-item"><label>Nombre:</label><span>${denuncia.nombres || ''} ${denuncia.apellidos || ''}</span></div>
                    <div class="info-item"><label>DNI:</label><span>${denuncia.dni || 'N/A'}</span></div>
                    <div class="info-item"><label>Celular:</label><span>${denuncia.celular || 'N/A'}</span></div>
                    <div class="info-item"><label>Email:</label><span>${denuncia.correo || 'N/A'}</span></div>
                </div>
            </div>

            <div class="info-column">
                <div class="info-section">
                    <h3 class="section-title">Ubicación del Incidente</h3>
                    <div class="info-item">
                        <label>Dirección:</label>
                        <span class="info-value">${denuncia.direccion || 'No especificada'}</span>
                    </div>
                    <div class="info-item">
                        <label>Coordenadas:</label>
                        <span class="info-value">
                            ${denuncia.latitud && denuncia.longitud 
                                ? `${parseFloat(denuncia.latitud).toFixed(6)}, ${parseFloat(denuncia.longitud).toFixed(6)}` 
                                : 'No disponibles'}
                        </span>
                    </div>
                    <!-- ESTE DIV ES EL QUE NECESITA LEAFLET -->
                    <div id="mapa-detalle"></div>
                </div>

                <div class="info-section">
                    <h3 class="section-title">Gestión Rápida</h3>
                    <div class="action-buttons">
                        <button class="action-btn primary" data-estado="en_proceso">📋 Poner en Proceso</button>
                        <button class="action-btn success" data-estado="resuelta">✅ Marcar como Resuelta</button>
                        <button class="action-btn warning" data-estado="archivada">📁 Archivar</button>
                        <button class="action-btn secondary" onclick="alert('Reporte en desarrollo')">📄 Descargar Reporte</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="info-section full-width">
            <h3 class="section-title">Descripción del Incidente</h3>
            <p>${denuncia.descripcion || 'Sin descripción.'}</p>
            ${denuncia.fecha_actualizacion ? `<p><strong>Última actualización:</strong> ${formatearFecha(denuncia.fecha_actualizacion)}</p>` : ''}
        </div>

        <div class="info-section full-width">
            <h3 class="section-title">Archivos Adjuntos</h3>
            <div class="archivos-grid">${crearHTMLArchivos(denuncia)}</div>
        </div>

        <div class="info-section full-width">
            <h3 class="section-title">Historial de Seguimiento</h3>
            <div class="timeline">${crearHTMLHistorial(denuncia.historial || [])}</div>
        </div>
    `;
}

function crearHTMLHistorial(historial = []) {
    if (historial.length === 0) {
        return `<div class="timeline-item"><div class="timeline-marker"></div><div class="timeline-content"><div class="timeline-title">Sin historial</div></div></div>`;
    }
    return historial.map(item => `
        <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-date">${formatearFecha(item.fecha)}</div>
                <div class="timeline-title">${item.accion || 'Actualización'}</div>
                <div class="timeline-desc">${item.descripcion || 'Sin descripción'}</div>
            </div>
        </div>
    `).join('');
}

function configurarBotonesEstado(denunciaId) {
    document.querySelectorAll('.action-btn[data-estado]').forEach(btn => {
        btn.addEventListener('click', function () {
            const nuevoEstado = this.getAttribute('data-estado');
            const comentario = prompt(`Comentario para cambiar a "${formatearEstado(nuevoEstado)}":`);
            if (comentario === null) return;
            cambiarEstado(denunciaId, nuevoEstado, comentario || `Estado cambiado a ${formatearEstado(nuevoEstado)}`);
        });
    });
}

async function cambiarEstado(denunciaId, nuevoEstado, comentario) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/denuncias/${denunciaId}/estado`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado, comentario })
        });
        if (!response.ok) throw new Error('Error al actualizar');
        alert('✅ Estado actualizado');
        location.reload();
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}


// ... todo tu código anterior igual hasta cargarDetalleDenuncia ...

async function cargarDetalleDenuncia(codigo) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/denuncias/codigo/${encodeURIComponent(codigo)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('No se pudo cargar la denuncia');

        const denuncia = await response.json();
        console.log('✅ Denuncia cargada:', denuncia);

        const panel = document.querySelector('.panel-card');
        if (panel) {
            panel.innerHTML = crearHTMLDenuncia(denuncia);
            configurarBotonesEstado(denuncia.id);

            // Delay mayor para asegurar que el DOM esté listo
            setTimeout(() => {
                inicializarMapa(parseFloat(denuncia.latitud), parseFloat(denuncia.longitud));
            }, 800); // Más tiempo para que el layout se estabilice
        }

    } catch (error) {
        console.error('Error cargando denuncia:', error);
        const panel = document.querySelector('.panel-card');
        if (panel) {
            panel.innerHTML = `<div class="error">Error: ${error.message}. Intenta recargar la página.</div>`;
        }
    }
}