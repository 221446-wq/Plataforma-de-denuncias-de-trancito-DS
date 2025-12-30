document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const usuario = document.getElementById('usuario').value;
            const password = document.getElementById('password').value;
            const tipoUsuario = document.getElementById('tipo-usuario').value;
            
            try {
                const response = await apiRequest(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
                    method: 'POST',
                    body: JSON.stringify({ usuario, password, tipo_usuario: tipoUsuario })
                });
                
                // Guardar token y datos del usuario
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // Redirigir según el tipo de usuario
                redirigirSegunTipoUsuario(response.user.tipo_usuario);
                
            } catch (error) {
                alert('Error al iniciar sesión: ' + error.message);
            }
        });
    }
});

function redirigirSegunTipoUsuario(tipoUsuario) {
    switch(tipoUsuario) {
        case 'ciudadano':
            window.location.href = 'registro_denuncia.html';
            break;
        case 'funcionario':
            window.location.href = 'gestion_denuncias.html';
            break;
        case 'administrador':
            window.location.href = 'gestion_denuncias.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}