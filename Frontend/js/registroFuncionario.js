document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de registro de funcionario cargada');
    
    // Verificar que el usuario sea administrador
    verificarPermisosAdministrador();
    
    // Cargar nombre del administrador
    cargarNombreAdministrador();
    
    // Configurar el formulario
    const registroForm = document.getElementById('registroForm');
    
    if (registroForm) {
        registroForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Formulario enviado');
            
            if (validarFormularioFuncionario()) {
                await registrarFuncionario();
            }
        });
    }
    
    // Configurar validaciones en tiempo real
    configurarValidaciones();
    
    // Auto-generar correo cuando se escribe el usuario
    document.getElementById('usuario').addEventListener('input', function(e) {
        const usuario = e.target.value.trim();
        if (usuario) {
            document.getElementById('correo').value = `${usuario}@municusco.gob.pe`;
        }
    });
});

function verificarPermisosAdministrador() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    console.log('Usuario en localStorage:', user);
    console.log('Token en localStorage:', token ? 'Presente' : 'Ausente');
    
    if (user.tipo_usuario !== 'administrador' || !token) {
        alert('No tienes permisos para acceder a esta página. Solo los administradores pueden registrar funcionarios.');
        window.location.href = 'login.html';
        return;
    }
}

function cargarNombreAdministrador() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminNameElement = document.querySelector('.admin-panel p');
    
    if (adminNameElement && user.nombres) {
        adminNameElement.innerHTML = `Bienvenido <strong>${user.nombres} ${user.apellidos || ''}</strong>. Desde aquí puedes agregar funcionarios.`;
    }
}

function configurarValidaciones() {
    // Validación de DNI en tiempo real
    document.getElementById('dni').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
    });
    
    // Validación de celular en tiempo real
    document.getElementById('celular').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
    });
    
    // Validación de contraseña en tiempo real
    document.getElementById('password').addEventListener('input', function(e) {
        validarFortalezaPassword(e.target.value);
        validarRequisitosPassword(e.target.value);
    });
    
    // Configurar botón de edición
    document.getElementById('btnEdit').addEventListener('click', function() {
        alert('Funcionalidad de edición en desarrollo. Por ahora, use el formulario para registrar nuevos funcionarios.');
    });
}

function validarFortalezaPassword(password) {
    const strengthElement = document.querySelector('.password-strength');
    if (!strengthElement) return;
    
    let strength = 0;
    let color = '#e74c3c';
    let text = 'Débil';
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    if (strength >= 75) {
        color = '#2ecc71';
        text = 'Fuerte';
    } else if (strength >= 50) {
        color = '#f39c12';
        text = 'Media';
    } else if (strength >= 25) {
        color = '#e67e22';
        text = 'Débil';
    }
    
    strengthElement.style.width = strength + '%';
    strengthElement.style.backgroundColor = color;
    
    const textElement = document.querySelector('.password-strength-text');
    if (textElement) {
        textElement.textContent = `Fortaleza de la contraseña: ${text}`;
    }
}

function validarRequisitosPassword(password) {
    const requisitos = {
        'req-length': password.length >= 8,
        'req-uppercase': /[A-Z]/.test(password),
        'req-lowercase': /[a-z]/.test(password),
        'req-number': /[0-9]/.test(password),
        'req-special': /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    for (const [id, cumple] of Object.entries(requisitos)) {
        const element = document.getElementById(id);
        if (element) {
            element.className = cumple ? 'valid' : 'invalid';
        }
    }
}

function validarFormularioFuncionario() {
    const dni = document.getElementById('dni').value;
    const nombres = document.getElementById('nombres').value;
    const apellidos = document.getElementById('apellidos').value;
    const cargo = document.getElementById('cargo').value;
    const celular = document.getElementById('celular').value;
    const usuario = document.getElementById('usuario').value;
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    
    console.log('Validando formulario con datos:', { dni, nombres, usuario, cargo });
    
    // Validar DNI (8 dígitos)
    if (dni.length !== 8) {
        mostrarMensaje('El DNI debe tener exactamente 8 dígitos', 'error');
        document.getElementById('dni').focus();
        return false;
    }
    
    // Validar nombres y apellidos
    if (nombres.trim().length < 2) {
        mostrarMensaje('Los nombres deben tener al menos 2 caracteres', 'error');
        document.getElementById('nombres').focus();
        return false;
    }
    
    if (apellidos.trim().length < 2) {
        mostrarMensaje('Los apellidos deben tener al menos 2 caracteres', 'error');
        document.getElementById('apellidos').focus();
        return false;
    }
    
    // Validar cargo
    if (cargo.trim().length < 3) {
        mostrarMensaje('El cargo debe tener al menos 3 caracteres', 'error');
        document.getElementById('cargo').focus();
        return false;
    }
    
    // Validar celular (9 dígitos)
    if (celular.length !== 9) {
        mostrarMensaje('El celular debe tener exactamente 9 dígitos', 'error');
        document.getElementById('celular').focus();
        return false;
    }
    
    // Validar usuario
    if (usuario.trim().length < 3) {
        mostrarMensaje('El nombre de usuario debe tener al menos 3 caracteres', 'error');
        document.getElementById('usuario').focus();
        return false;
    }
    
    // Validar correo
    if (!correo.includes('@')) {
        mostrarMensaje('El correo electrónico debe ser válido', 'error');
        document.getElementById('correo').focus();
        return false;
    }
    
    // Validar contraseña
    if (password.length < 8) {
        mostrarMensaje('La contraseña debe tener al menos 8 caracteres', 'error');
        document.getElementById('password').focus();
        return false;
    }
    
    return true;
}

async function registrarFuncionario() {
    const botonRegistro = document.querySelector('.btn-register');
    const textoOriginal = botonRegistro.textContent;
    
    try {
        // Mostrar estado de carga
        botonRegistro.textContent = 'Registrando...';
        botonRegistro.disabled = true;
        
        const formData = {
            dni: document.getElementById('dni').value,
            nombres: document.getElementById('nombres').value.trim(),
            apellidos: document.getElementById('apellidos').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            celular: document.getElementById('celular').value,
            usuario: document.getElementById('usuario').value.trim(),
            password: document.getElementById('password').value,
            cargo: document.getElementById('cargo').value.trim()
        };
        
        console.log('📝 Datos a enviar:', { ...formData, password: '***' });
        
        // DEBUG DETALLADO DEL TOKEN
        const token = localStorage.getItem('token');
        console.log('🔐 Token del localStorage:', token);
        
        if (!token) {
            console.error('❌ No hay token en localStorage');
            throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }

        // Verificar formato básico del token JWT
        const tokenParts = token.split('.');
        console.log('🔍 Partes del token:', tokenParts.length);
        
        if (tokenParts.length !== 3) {
            console.error('❌ Token con formato incorrecto. No es un JWT válido.');
            throw new Error('Token inválido. Formato incorrecto.');
        }

        try {
            // Decodificar el payload del token (sin verificar firma)
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('📄 Payload del token:', payload);
            console.log('👤 ID de usuario:', payload.id);
            console.log('🎫 Tipo de usuario:', payload.tipo_usuario);
            console.log('⏰ Token expira:', new Date(payload.exp * 1000));
            
            // Verificar si el token ha expirado
            const now = Date.now() / 1000;
            if (payload.exp && payload.exp < now) {
                console.error('❌ Token expirado');
                throw new Error('Token expirado. Por favor, inicie sesión nuevamente.');
            }
            
        } catch (decodeError) {
            console.error('❌ Error decodificando token:', decodeError);
            throw new Error('Token corrupto o inválido.');
        }

        console.log('🌐 Haciendo petición a:', 'http://localhost:3000/api/auth/register-funcionario');
        console.log('📤 Headers enviados:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.substring(0, 20)}...` // Mostrar solo parte del token por seguridad
        });
        
        // Hacer la petición con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
        
        const response = await fetch('http://localhost:3000/api/auth/register-funcionario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📥 Respuesta HTTP recibida:', response.status, response.statusText);
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        console.log('📄 Content-Type de respuesta:', contentType);
        
        let responseData;
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            const textResponse = await response.text();
            console.log('📝 Respuesta no JSON:', textResponse);
            throw new Error(`Respuesta inesperada del servidor: ${textResponse}`);
        }
        
        console.log('📊 Datos de respuesta:', responseData);
        
        if (!response.ok) {
            console.error('❌ Error en respuesta:', responseData);
            throw new Error(responseData.error || `Error HTTP: ${response.status}`);
        }
        
        console.log('✅ Funcionario registrado exitosamente');
        mostrarMensaje(`¡Funcionario registrado exitosamente!<br>Usuario: ${formData.usuario}<br>Cargo: ${formData.cargo}`, 'success');
        
        // Limpiar formulario después de 3 segundos
        setTimeout(() => {
            document.getElementById('registroForm').reset();
            document.querySelector('.password-strength').style.width = '0%';
            document.querySelector('.password-strength-text').textContent = 'Fortaleza de la contraseña';
            // Resetear requisitos de contraseña
            document.querySelectorAll('.password-requirements li').forEach(li => {
                li.className = '';
            });
            ocultarMensaje();
        }, 3000);
        
    } catch (error) {
        console.error('💥 Error completo al registrar funcionario:', error);
        
        let mensajeError = 'Error al registrar funcionario: ' + error.message;
        
        if (error.name === 'AbortError') {
            mensajeError = 'Timeout: El servidor no respondió en 10 segundos. Verifique que esté funcionando.';
        } else if (error.message.includes('401') || error.message.includes('Token')) {
            mensajeError = 'Error de autenticación. El token es inválido o ha expirado. Por favor, inicie sesión nuevamente.';
            // Limpiar datos de sesión inválidos
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else if (error.message.includes('403')) {
            mensajeError = 'No tiene permisos de administrador para registrar funcionarios.';
        } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
            mensajeError = 'Error de conexión: Verifica que el servidor esté funcionando en http://localhost:3000';
        } else if (error.message.includes('400')) {
            mensajeError = 'Error en los datos: ' + error.message;
        }
        
        mostrarMensaje(mensajeError, 'error');
    } finally {
        // Restaurar botón
        botonRegistro.textContent = textoOriginal;
        botonRegistro.disabled = false;
    }
}
function mostrarMensaje(mensaje, tipo) {
    const mensajeElement = document.getElementById('mensaje');
    if (mensajeElement) {
        mensajeElement.innerHTML = mensaje;
        mensajeElement.className = `mensaje ${tipo}`;
        mensajeElement.style.display = 'block';
        
        // Auto-ocultar después de 5 segundos para mensajes de éxito
        if (tipo === 'success') {
            setTimeout(ocultarMensaje, 5000);
        }
    }
}

function ocultarMensaje() {
    const mensajeElement = document.getElementById('mensaje');
    if (mensajeElement) {
        mensajeElement.style.display = 'none';
    }
}