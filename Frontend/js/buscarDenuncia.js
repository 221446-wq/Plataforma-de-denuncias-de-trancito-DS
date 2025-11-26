document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-form');
    
    if (searchForm) {
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const codigo = document.getElementById('codigo').value.trim();
            
            try {
                const denuncia = await apiRequest(`${API_CONFIG.ENDPOINTS.DENUNCIAS.GET_BY_CODE}/${codigo}`);
                mostrarResultados(denuncia);
            } catch (error) {
                mostrarSinResultados();
            }
        });
    }
});

function mostrarResultados(denuncia) {
    const resultsContainer = document.querySelector('.results-container');
    const noResults = document.querySelector('.no-results');
    
    // Actualizar la tabla con los datos reales
    const tbody = document.querySelector('.denuncias-table tbody');
    tbody.innerHTML = `
        <tr>
            <td>${denuncia.codigo_denuncia}</td>
            <td>${denuncia.descripcion}</td>
            <td>${new Date(denuncia.fecha_creacion).toLocaleDateString()}</td>
            <td><span class="status status-${denuncia.estado}">${denuncia.estado}</span></td>
        </tr>
    `;
    
    resultsContainer.style.display = 'block';
    noResults.style.display = 'none';
}

function mostrarSinResultados() {
    const resultsContainer = document.querySelector('.results-container');
    const noResults = document.querySelector('.no-results');
    
    resultsContainer.style.display = 'none';
    noResults.style.display = 'block';
}