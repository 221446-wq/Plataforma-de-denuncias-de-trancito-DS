// estadisticas.js - Manejo de gráficos y estadísticas (versión sin filtros)
class EstadisticasManager {
    constructor() {
        this.graficos = {};
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando gestor de estadísticas...');
        
        // Verificar autenticación
        const usuario = verificarAutenticacion();
        if (!usuario) {
            console.warn('Usuario no autenticado, redirigiendo...');
            window.location.href = 'login.html';
            return;
        }

        // Cargar estadísticas directamente
        await this.cargarEstadisticas();
    }

    async cargarEstadisticas() {
        try {
            console.log('📊 Cargando estadísticas...');
            this.mostrarCargando();
            this.ocultarError();

            // Obtener estadísticas generales
            const estadisticasGenerales = await apiRequest(API_CONFIG.ENDPOINTS.ESTADISTICAS.GENERALES);
            console.log('📈 Estadísticas generales:', estadisticasGenerales);
            
            // Obtener datos por tipo
            const datosPorTipo = await apiRequest(API_CONFIG.ENDPOINTS.ESTADISTICAS.POR_TIPO);
            console.log('📊 Datos por tipo:', datosPorTipo);
            
            // Obtener evolución mensual (año actual)
            const anioActual = new Date().getFullYear();
            const evolucionMensual = await apiRequest(`${API_CONFIG.ENDPOINTS.ESTADISTICAS.EVOLUCION}/${anioActual}`);
            console.log('📅 Evolución mensual:', evolucionMensual);
            
            // Obtener datos por prioridad
            const datosPorPrioridad = await apiRequest(API_CONFIG.ENDPOINTS.ESTADISTICAS.PRIORIDAD);
            console.log('🎯 Datos por prioridad:', datosPorPrioridad);
            
            // Crear/actualizar gráficos
            this.crearGraficoResumen(estadisticasGenerales);
            this.crearGraficoTipo(datosPorTipo);
            this.crearGraficoEvolucion(evolucionMensual);
            this.crearGraficoPrioridad(datosPorPrioridad);
            
            this.ocultarCargando();
            
        } catch (error) {
            console.error('❌ Error al cargar estadísticas:', error);
            this.ocultarCargando();
            this.mostrarError(`Error: ${error.message}. Verifique la consola para más detalles.`);
            
            // Mostrar datos de demostración como fallback
            this.mostrarDatosDemostracion();
        }
    }

    // Métodos para manejar la interfaz de usuario
    mostrarCargando() {
        document.getElementById('loading-indicator').style.display = 'flex';
    }

    ocultarCargando() {
        document.getElementById('loading-indicator').style.display = 'none';
    }

    mostrarError(mensaje) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
    }

    ocultarError() {
        document.getElementById('error-message').style.display = 'none';
    }

    // Métodos para crear gráficos (se mantienen igual)
    crearGraficoResumen(estadisticas) {
        const ctx = document.getElementById('grafico-resumen').getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (this.graficos.resumen) {
            this.graficos.resumen.destroy();
        }
        
        this.graficos.resumen = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Total', 'Recibidas', 'En Proceso', 'Resueltas', 'Archivadas'],
                datasets: [{
                    label: 'Cantidad de Denuncias',
                    data: [
                        estadisticas.total_denuncias || 0,
                        estadisticas.recibidas || 0,
                        estadisticas.en_proceso || 0,
                        estadisticas.resueltas || 0,
                        estadisticas.archivadas || 0
                    ],
                    backgroundColor: [
                        'rgba(0, 112, 40, 0.8)',
                        'rgba(0, 112, 40, 0.7)',
                        'rgba(0, 112, 40, 0.6)',
                        'rgba(0, 112, 40, 0.5)',
                        'rgba(0, 112, 40, 0.4)'
                    ],
                    borderColor: [
                        'rgba(0, 112, 40, 1)',
                        'rgba(0, 112, 40, 1)',
                        'rgba(0, 112, 40, 1)',
                        'rgba(0, 112, 40, 1)',
                        'rgba(0, 112, 40, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad'
                        }
                    }
                }
            }
        });
    }

    crearGraficoTipo(datos) {
        const ctx = document.getElementById('grafico-tipo').getContext('2d');
        
        if (this.graficos.tipo) {
            this.graficos.tipo.destroy();
        }
        
        // Preparar datos para el gráfico
        const labels = datos.map(item => item.tipo_denuncia);
        const valores = datos.map(item => item.cantidad);
        
        this.graficos.tipo = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Denuncias por Tipo',
                    data: valores,
                    backgroundColor: this.generarColores(labels.length),
                    borderColor: 'rgba(0, 112, 40, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }

    crearGraficoEvolucion(datos) {
        const ctx = document.getElementById('grafico-evolucion').getContext('2d');
        
        if (this.graficos.evolucion) {
            this.graficos.evolucion.destroy();
        }
        
        // Preparar datos para el gráfico
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const valores = new Array(12).fill(0);
        
        datos.forEach(item => {
            if (item.mes >= 1 && item.mes <= 12) {
                valores[item.mes - 1] = item.cantidad;
            }
        });
        
        this.graficos.evolucion = new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Denuncias por Mes',
                    data: valores,
                    borderColor: 'rgba(0, 112, 40, 1)',
                    backgroundColor: 'rgba(0, 112, 40, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad'
                        }
                    }
                }
            }
        });
    }

    crearGraficoPrioridad(datos) {
        const ctx = document.getElementById('grafico-prioridad').getContext('2d');
        
        if (this.graficos.prioridad) {
            this.graficos.prioridad.destroy();
        }
        
        // Preparar datos para el gráfico
        const labels = datos.map(item => this.formatearPrioridad(item.prioridad));
        const valores = datos.map(item => item.cantidad);
        
        this.graficos.prioridad = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Denuncias por Prioridad',
                    data: valores,
                    backgroundColor: [
                        'rgba(220, 53, 69, 0.8)',  // Alta - Rojo
                        'rgba(255, 193, 7, 0.8)',  // Media - Amarillo
                        'rgba(40, 167, 69, 0.8)'   // Baja - Verde
                    ],
                    borderColor: [
                        'rgba(220, 53, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(40, 167, 69, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Métodos utilitarios (se mantienen igual)
    generarColores(cantidad) {
        const colores = [];
        const baseColor = [0, 112, 40]; // Verde municipal
        
        for (let i = 0; i < cantidad; i++) {
            const opacidad = 0.8 - (i * 0.6 / cantidad);
            colores.push(`rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${opacidad})`);
        }
        
        return colores;
    }

    formatearPrioridad(prioridad) {
        const prioridades = {
            'alta': 'Alta',
            'media': 'Media',
            'baja': 'Baja'
        };
        return prioridades[prioridad] || prioridad;
    }

    // Método para mostrar datos de demostración
    mostrarDatosDemostracion() {
        console.log('📊 Mostrando datos de demostración');
        const datosGenerales = {
            total_denuncias: 150,
            recibidas: 45,
            en_proceso: 60,
            resueltas: 40,
            archivadas: 5
        };
        
        const datosPorTipo = [
            { tipo_denuncia: 'Vehículo mal estacionado', cantidad: 35 },
            { tipo_denuncia: 'Exceso de velocidad', cantidad: 28 },
            { tipo_denuncia: 'Semáforo dañado', cantidad: 22 },
            { tipo_denuncia: 'Accidente de tránsito', cantidad: 18 },
            { tipo_denuncia: 'Conducción peligrosa', cantidad: 15 },
            { tipo_denuncia: 'Falta de señalización', cantidad: 12 },
            { tipo_denuncia: 'Transporte público irregular', cantidad: 10 },
            { tipo_denuncia: 'Otros', cantidad: 10 }
        ];
        
        const datosEvolucion = [
            { mes: 1, cantidad: 12 }, { mes: 2, cantidad: 15 }, { mes: 3, cantidad: 18 },
            { mes: 4, cantidad: 14 }, { mes: 5, cantidad: 16 }, { mes: 6, cantidad: 20 },
            { mes: 7, cantidad: 22 }, { mes: 8, cantidad: 19 }, { mes: 9, cantidad: 17 },
            { mes: 10, cantidad: 21 }, { mes: 11, cantidad: 23 }, { mes: 12, cantidad: 25 }
        ];
        
        const datosPrioridad = [
            { prioridad: 'alta', cantidad: 25 },
            { prioridad: 'media', cantidad: 85 },
            { prioridad: 'baja', cantidad: 40 }
        ];
        
        this.crearGraficoResumen(datosGenerales);
        this.crearGraficoTipo(datosPorTipo);
        this.crearGraficoEvolucion(datosEvolucion);
        this.crearGraficoPrioridad(datosPrioridad);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.estadisticasManager = new EstadisticasManager();
});