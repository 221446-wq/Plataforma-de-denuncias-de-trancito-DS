// Verificar autenticación al cargar la página
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        // Redirigir al login si no está autenticado
        if (!window.location.href.includes('login.html') && 
            !window.location.href.includes('index.html') &&
            !window.location.href.includes('buscar_denuncia.html')) {
            window.location.href = 'login.html';
        }
        return null;
    }
    
    return user;
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Verificar permisos de usuario
function tienePermiso(tipoRequerido) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.tipo_usuario === tipoRequerido;
}

// Cargar información del usuario en el header
function cargarInfoUsuario() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Actualizar elementos que muestran el nombre del usuario
    document.querySelectorAll('.user-name').forEach(element => {
        element.textContent = user.nombres || 'Usuario';
    });
    
    // Mostrar/ocultar elementos según el tipo de usuario
    if (user.tipo_usuario === 'ciudadano') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
}