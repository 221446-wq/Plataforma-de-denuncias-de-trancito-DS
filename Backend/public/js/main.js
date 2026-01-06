document.addEventListener('DOMContentLoaded', function() {
    const realizarDenunciaBtn = document.getElementById('realizar-denuncia-btn');

    if (realizarDenunciaBtn) {
        realizarDenunciaBtn.addEventListener('click', function(e) {
            // Prevenir el comportamiento por defecto del enlace
            e.preventDefault();
            
            // Obtener la URL del atributo href
            const targetUrl = this.getAttribute('href');
            
            // Redirigir a la URL
            window.location.href = targetUrl;
        });
    }
});
