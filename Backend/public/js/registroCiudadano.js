document.addEventListener('DOMContentLoaded', function() {
    console.log('Cargando script de registro...');
    
    const registroForm = document.getElementById('formRegistroCiudadano');
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    if (!registroForm) {
        console.error('No se encontró el formulario de registro');
        return;
    }

    // Configurar modo funcionario si es necesario
    if (mode === 'funcionario') {
        setupFuncionarioMode();
    }

    // Validación de DNI en tiempo real
    document.getElementById('dni').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
        actualizarIndicadorDNI(e.target.value);
    });
    
    // Validación de celular en tiempo real
    document.getElementById('celular').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
    });
    
    // Verificar coincidencia de contraseñas
    document.getElementById('confirmPassword').addEventListener('input', verificarCoincidenciaPassword);
    document.getElementById('password').addEventListener('input', function() {
        verificarCoincidenciaPassword();
        validarFortalezaPassword(this.value);
    });
    
    // Manejar envío del formulario
    registroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Formulario enviado');
        
        if (validarFormulario(mode)) {
            if (mode === 'funcionario') {
                await registrarFuncionario();
            } else {
                await registrarCiudadano();
            }
        }
    });
});

function setupFuncionarioMode() {
    // Cambiar título
    document.querySelector('.text-center').textContent = 'REGISTRO DE FUNCIONARIO';
    
    // Crear e insertar campo "Cargo"
    const cargoFormRow = document.createElement('div');
    cargoFormRow.className = 'form-row';
    cargoFormRow.innerHTML = `
        <div class="form-group" style="width: 100%;">
            <label for="cargo">Cargo:</label>
            <input type="text" id="cargo" name="cargo" placeholder="Ingrese el cargo del funcionario" required>
        </div>
    `;
    const apellidosRow = document.getElementById('apellidos').closest('.form-row');
    apellidosRow.parentNode.insertBefore(cargoFormRow, apellidosRow.nextSibling);

    // Cambiar texto del botón
    document.querySelector('.btn-call-action').textContent = 'REGISTRAR FUNCIONARIO';

    // Ocultar enlace de "¿Ya tienes cuenta?"
    const loginLink = document.querySelector('.login-link');
    if (loginLink) {
        loginLink.style.display = 'none';
    }
}

function actualizarIndicadorDNI(dni) {
    const indicador = document.querySelector('.dni-strength');
    if (indicador) {
        if (dni.length === 8) {
            indicador.style.backgroundColor = '#2ecc71';
        } else {
            indicador.style.backgroundColor = '#e74c3c';
        }
        indicador.style.width = (dni.length * 12.5) + '%';
    }
}

function validarFortalezaPassword(password) {
    const strengthElement = document.querySelector('.password-strength');
    if (!strengthElement) return;
    
    let strength = 0;
    let color = '#e74c3c';
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    if (strength >= 75) {
        color = '#2ecc71';
    } else if (strength >= 50) {
        color = '#f39c12';
    } else if (strength >= 25) {
        color = '#e67e22';
    }
    
    strengthElement.style.width = strength + '%';
    strengthElement.style.backgroundColor = color;
}

function verificarCoincidenciaPassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageElement = document.getElementById('passwordMatchMessage');
    
    if (!messageElement) return;
    
    if (confirmPassword === '') {
        messageElement.textContent = '';
        messageElement.className = 'password-match';
        return;
    }
    
    if (password === confirmPassword) {
        messageElement.textContent = '✓ Las contraseñas coinciden';
        messageElement.className = 'password-match success';
    } else {
        messageElement.textContent = '✗ Las contraseñas no coinciden';
        messageElement.className = 'password-match error';
    }
}

function validarFormulario(mode) {
    const dni = document.getElementById('dni').value;
    const nombres = document.getElementById('nombres').value;
    const apellidos = document.getElementById('apellidos').value;
    const correo = document.getElementById('correo').value;
    const celular = document.getElementById('celular').value;
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validar DNI (8 dígitos)
    if (dni.length !== 8) {
        alert('El DNI debe tener exactamente 8 dígitos');
        document.getElementById('dni').focus();
        return false;
    }
    
    // Validar nombres y apellidos
    if (nombres.trim().length < 2) {
        alert('Los nombres deben tener al menos 2 caracteres');
        document.getElementById('nombres').focus();
        return false;
    }
    
    if (apellidos.trim().length < 2) {
        alert('Los apellidos deben tener al menos 2 caracteres');
        document.getElementById('apellidos').focus();
        return false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        alert('Por favor ingrese un correo electrónico válido');
        document.getElementById('correo').focus();
        return false;
    }
    
    // Validar celular (9 dígitos)
    if (celular.length !== 9) {
        alert('El celular debe tener exactamente 9 dígitos');
        document.getElementById('celular').focus();
        return false;
    }
    
    // Validar usuario
    if (usuario.trim().length < 3) {
        alert('El nombre de usuario debe tener al menos 3 caracteres');
        document.getElementById('usuario').focus();
        return false;
    }
    
    // Validar contraseña
    if (password.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres');
        document.getElementById('password').focus();
        return false;
    }
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        document.getElementById('confirmPassword').focus();
        return false;
    }

    if (mode === 'funcionario') {
        const cargo = document.getElementById('cargo').value;
        if (cargo.trim().length < 3) {
            alert('El cargo debe tener al menos 3 caracteres');
            document.getElementById('cargo').focus();
            return false;
        }
    }
    
    return true;
}

async function registrarCiudadano() {
    const botonRegistro = document.querySelector('.btn-call-action');
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
            password: document.getElementById('password').value
        };
        
        console.log('Enviando datos de registro:', { ...formData, password: '***' });
        
        const response = await apiRequest(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        console.log('Respuesta del servidor:', response);
        
        alert(`¡Registro de ciudadano exitoso! Tu usuario es: ${response.usuario}\nAhora puedes iniciar sesión.`);
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error completo en el registro:', error);
        handleRegistroError(error);
    } finally {
        // Restaurar botón
        botonRegistro.textContent = textoOriginal;
        botonRegistro.disabled = false;
    }
}

async function registrarFuncionario() {
    const botonRegistro = document.querySelector('.btn-call-action');
    const textoOriginal = botonRegistro.textContent;

    try {
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

        console.log('Enviando datos de registro de funcionario:', { ...formData, password: '***' });

        // La función apiRequest debería incluir el token del admin automáticamente
        const response = await apiRequest(API_CONFIG.ENDPOINTS.AUTH.REGISTER_FUNCIONARIO, {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        console.log('Respuesta del servidor:', response);

        alert(`¡Registro de funcionario exitoso!\nUsuario: ${response.usuario}\nCargo: ${response.cargo}`);

        // Limpiar formulario y volver al panel de admin
        setTimeout(() => {
            registroForm.reset();
            window.location.href = 'gestion_denuncias.html';
        }, 2000);

    } catch (error) {
        console.error('Error completo en el registro de funcionario:', error);
        
        if (error.message.includes('403')) {
            alert('Error: No tienes permisos de administrador para realizar esta acción.');
            window.location.href = 'login.html';
        } else {
            handleRegistroError(error);
        }

    } finally {
        botonRegistro.textContent = textoOriginal;
        botonRegistro.disabled = false;
    }
}

function handleRegistroError(error) {
    if (error.message.includes('400') || error.message.includes('ya está registrado') || error.message.includes('ya existe')) {
        if (error.message.includes('DNI')) {
            alert('Error: El DNI ya está registrado en el sistema');
            document.getElementById('dni').focus();
        } else if (error.message.includes('correo')) {
            alert('Error: El correo electrónico ya está registrado');
            document.getElementById('correo').focus();
        } else if (error.message.includes('usuario')) {
            alert('Error: El nombre de usuario ya existe, elige otro');
            document.getElementById('usuario').focus();
        } else {
            alert('Error: ' + error.message);
        }
    } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        alert('Error de conexión con el servidor. Por favor, intente más tarde.');
    } else {
        alert('Error al registrar: ' + error.message);
    }
}