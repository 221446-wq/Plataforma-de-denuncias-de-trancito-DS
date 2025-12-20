document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 gestionDenuncias.js cargado correctamente');
    
    // Verificar que los elementos del DOM existan
    const filtroBtn = document.querySelector('.filtro-btn');
    const limpiarBtn = document.querySelector('.filtro-btn.secondary');
    
    if (!filtroBtn || !limpiarBtn) {
        console.error('❌ No se encontraron los botones de filtros');
        return;
    }
    
    console.log('✅ Botones de filtros encontrados');
    
    // Configurar eventos
    filtroBtn.addEventListener('click', aplicarFiltros);
    limpiarBtn.addEventListener('click', limpiarFiltros);
    
    // Cargar datos iniciales
    cargarDenuncias();
    cargarEstadisticas();
});

let filtrosActuales = {};

async function cargarDenuncias(filtros = {}) {
    try {
        console.log('📥 Cargando denuncias con filtros:', filtros);
        mostrarCargando();
        
        const queryParams = new URLSearchParams();
        
        if (filtros.ciudadano && filtros.ciudadano.trim() !== '') {
            queryParams.append('ciudadano', filtros.ciudadano.trim());
        }
        if (filtros.estado && filtros.estado !== 'Todos los estados') {
            queryParams.append('estado', filtros.estado);
        }
        if (filtros.prioridad && filtros.prioridad !== 'Todas las prioridades') {
            queryParams.append('prioridad', filtros.prioridad.toLowerCase());
        }

        const queryString = queryParams.toString();
        const url = queryString 
            ? `${API_CONFIG.ENDPOINTS.DENUNCIAS.LIST}?${queryString}`
            : API_CONFIG.ENDPOINTS.DENUNCIAS.LIST;

        console.log('🔗 URL de la petición:', url);

        const denuncias = await apiRequest(url);
        console.log('📊 Denuncias recibidas:', denuncias);
        console.log(`📊 ${denuncias.length} denuncias cargadas`);
        
        // Verificar que las denuncias tengan ID
        denuncias.forEach((denuncia, index) => {
            console.log(`Denuncia ${index}: ID=${denuncia.id}, Código=${denuncia.codigo_denuncia}`);
        });
        
        actualizarTablaDenuncias(denuncias);
        ocultarCargando();
        
    } catch (error) {
        console.error('❌ Error al cargar denuncias:', error);
        ocultarCargando();
        
        const tbody = document.querySelector('.denuncias-table tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="error-cell">
                    Error al cargar denuncias: ${error.message}
                </td>
            </tr>
        `;
    }
}

function mostrarCargando() {
    const tbody = document.querySelector('.denuncias-table tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">
                    <div class="loading-spinner"></div>
                    Cargando denuncias...
                </td>
            </tr>
        `;
    }
}

function ocultarCargando() {
    // Se oculta cuando se actualiza la tabla
}

function actualizarTablaDenuncias(denuncias) {
    const tbody = document.querySelector('.denuncias-table tbody');
    
    if (!tbody) {
        console.error('❌ No se encontró tbody en la tabla');
        return;
    }
    
    if (denuncias.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-results">
                    No se encontraron denuncias con los filtros aplicados
                </td>
            </tr>
        `;
        console.log('ℹ️ No hay denuncias para mostrar');
        return;
    }
    
    tbody.innerHTML = denuncias.map(denuncia => `
        <tr>
            <td>${denuncia.tipo_denuncia || 'No especificado'}</td>
            <td>${denuncia.nombres || ''} ${denuncia.apellidos || ''}</td>
            <td>${new Date(denuncia.fecha_creacion).toLocaleDateString()}</td>
            <td><span class="badge ${denuncia.prioridad}">${denuncia.prioridad}</span></td>
            <td><span class="estado ${denuncia.estado}">${formatearEstado(denuncia.estado)}</span></td>
            <td>
                <select class="accion-select" onchange="cambiarEstado(this, ${denuncia.id}, '${denuncia.codigo_denuncia}')">
                    <option value="">Acción</option>
                    <option value="recibido">Recibido</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="resuelta">Resuelta</option>
                    <option value="archivada">Archivada</option>
                    <option value="ver">Ver Detalles</option>
                </select>
            </td>
        </tr>
    `).join('');
    
    console.log('✅ Tabla actualizada con', denuncias.length, 'denuncias');
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

async function aplicarFiltros() {
    console.log('🎯 Aplicando filtros...');
    
    const filtros = {
        ciudadano: document.querySelector('.filtro-input').value,
        estado: document.querySelectorAll('.filtro-select')[0].value,
        prioridad: document.querySelectorAll('.filtro-select')[1].value
    };
    
    console.log('🔍 Filtros capturados:', filtros);
    
    // Guardar filtros actuales
    filtrosActuales = filtros;
    
    // Cargar denuncias con filtros
    await cargarDenuncias(filtros);
}

function limpiarFiltros() {
    console.log('🧹 Limpiando filtros...');
    
    // Limpiar inputs
    document.querySelector('.filtro-input').value = '';
    document.querySelectorAll('.filtro-select').forEach(select => {
        select.selectedIndex = 0;
    });
    
    // Limpiar filtros actuales
    filtrosActuales = {};
    
    // Recargar denuncias sin filtros
    cargarDenuncias();
}

// Funciones restantes se mantienen igual...
async function cargarEstadisticas() {
    try {
        // Intentar con el endpoint de estadísticas
        const stats = await apiRequest(API_CONFIG.ENDPOINTS.ESTADISTICAS.GENERALES);
        actualizarEstadisticas(stats);
    } catch (error) {
        console.warn('⚠️ No se pudieron cargar estadísticas, calculando desde denuncias...');
        
        try {
            // Calcular estadísticas desde la lista de denuncias
            const denuncias = await apiRequest(API_CONFIG.ENDPOINTS.DENUNCIAS.LIST);
            
            const stats = {
                total_denuncias: denuncias.length,
                pendientes: denuncias.filter(d => d.estado === 'recibido').length,
                en_proceso: denuncias.filter(d => d.estado === 'en_proceso').length,
                resueltas: denuncias.filter(d => d.estado === 'resuelta').length,
                archivadas: denuncias.filter(d => d.estado === 'archivada').length
            };
            
            console.log('📊 Estadísticas calculadas:', stats);
            actualizarEstadisticas(stats);
            
        } catch (secondError) {
            console.error('❌ Error al calcular estadísticas:', secondError);
            // Mostrar ceros como último recurso
            actualizarEstadisticas({
                total_denuncias: 0,
                en_proceso: 0,
                pendientes: 0,
                resueltas: 0
            });
        }
    }
}

function actualizarEstadisticas(stats) {
    try {
        console.log('📊 Estadísticas recibidas:', stats);
        
        // Mapeo de campos del backend a las tarjetas del frontend
        const mappings = [
            { selector: '.stat-card:nth-child(1) .stat-number', value: stats.total_denuncias },
            { selector: '.stat-card:nth-child(2) .stat-number', value: stats.en_proceso },
            { selector: '.stat-card:nth-child(3) .stat-number', value: stats.recibidas }, // Recibidas = pendientes
            { selector: '.stat-card:nth-child(4) .stat-number', value: stats.resueltas }
        ];
        
        mappings.forEach(mapping => {
            const element = document.querySelector(mapping.selector);
            if (element) {
                element.textContent = mapping.value || 0;
            }
        });
        
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
    }
}

async function cambiarEstado(select, denunciaId, codigoDenuncia) {
    const valor = select.value;
    
    if (valor === 'ver') {
        // Usar el código de denuncia en lugar del ID
        window.location.href = `detalle_denuncia.html?codigo=${codigoDenuncia}`;
    } else if (valor) {
        try {
            // Para cambiar estado, seguimos usando el ID
            await apiRequest(`${API_CONFIG.ENDPOINTS.DENUNCIAS.UPDATE_STATUS}/${denunciaId}/estado`, {
                method: 'PUT',
                body: JSON.stringify({ estado: valor })
            });
            
            const fila = select.closest('tr');
            const estadoCell = fila.querySelector('.estado');
            estadoCell.textContent = formatearEstado(valor);
            estadoCell.className = `estado ${valor}`;
            
            select.value = '';
            alert(`Estado de la denuncia cambiado a: ${formatearEstado(valor)}`);
            
            cargarEstadisticas();
            
        } catch (error) {
            alert('Error al cambiar el estado: ' + error.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 gestionDenuncias.js cargado correctamente');
    
    // Cargar nombre del usuario
    cargarNombreUsuario();
    // Mostrar botón de registro de funcionario si es administrador
    mostrarBotonRegistroFuncionario();

    // Verificar que los elementos del DOM existan
    const filtroBtn = document.querySelector('.filtro-btn');
    const limpiarBtn = document.querySelector('.filtro-btn.secondary');
    
    if (!filtroBtn || !limpiarBtn) {
        console.error('❌ No se encontraron los botones de filtros');
        return;
    }
    
    console.log('✅ Botones de filtros encontrados');
    
    // Configurar eventos
    filtroBtn.addEventListener('click', aplicarFiltros);
    limpiarBtn.addEventListener('click', limpiarFiltros);
    
    // Cargar datos iniciales
    cargarDenuncias();
    cargarEstadisticas();
});

// Función para cargar el nombre del usuario
function cargarNombreUsuario() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userNameElement = document.getElementById('user-name');
        
        console.log('👤 Datos del usuario:', user);
        
        if (userNameElement) {
            if (user.nombres) {
                // Mostrar nombre completo o solo nombres
                const nombreCompleto = `${user.nombres} ${user.apellidos || ''}`.trim();
                userNameElement.textContent = nombreCompleto;
                console.log('✅ Nombre de usuario actualizado:', nombreCompleto);
            } else {
                userNameElement.textContent = 'Funcionario';
                console.warn('⚠️ No se encontró nombre del usuario en localStorage');
            }
        } else {
            console.error('❌ No se encontró el elemento con id "user-name"');
        }
    } catch (error) {
        console.error('❌ Error al cargar nombre del usuario:', error);
    }
}

function mostrarBotonRegistroFuncionario() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const adminActionsDiv = document.getElementById('admin-actions');

        if (user.tipo_usuario === 'administrador' && adminActionsDiv) {
            const registerButtonHTML = `
                <div class="stat-card highlight">
                    <a href="javascript:void(0);" id="btn-register-official" class="stat-link">
                        <div class="stat-number">➕</div>
                        <div class="stat-label">Registrar Funcionario</div>
                    </a>
                </div>
            `;
            adminActionsDiv.innerHTML = registerButtonHTML;
            console.log('✅ Botón "Registrar Funcionario" mostrado para el administrador.');

            // Añadir event listener para la redirección segura
            document.getElementById('btn-register-official').addEventListener('click', function(e) {
                e.preventDefault();
                const token = localStorage.getItem('token');
                if (token) {
                    window.location.href = `/api/auth/admin/register-official-page?token=${token}`;
                } else {
                    alert('Error: No se encontró el token de autenticación. Por favor, inicie sesión de nuevo.');
                }
            });

        } else if (adminActionsDiv) {
            adminActionsDiv.style.display = 'none'; // Ocultar si no es admin
            console.log('❌ Botón "Registrar Funcionario" oculto (no es administrador).');
        }
    } catch (error) {
        console.error('❌ Error al mostrar/ocultar botón de registro de funcionario:', error);
    }
}