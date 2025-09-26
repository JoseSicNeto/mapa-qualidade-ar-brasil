export const OPENWEATHER_API_KEY = "db384295256ca564697700a1aa15f90a";

export const REQUEST_TIMEOUT_MS = 12000;

// Limites aproximados do Brasil (para restringir navegação no mapa)
export const BRAZIL_BOUNDS = L.latLngBounds(
  L.latLng(-33.8689, -73.9828), 
  L.latLng(5.2718, -28.6505)    
);

// Timezone padrão
export const TZ_BRAZIL = "America/Sao_Paulo";



// Estado global da aplicação
export const EstadoAplicacao = {
  mapa: null,
  camadaEstados: null,
  camadaMunicipios: null,
  municipiosLayers: null,
  estadoSelecionado: null,
  cidadeSelecionada: null,

  // Cache de dados para evitar requisições repetidas
  cache: {
    coordenadasPorCidade: new Map(),
    qualidadeArPorCoord: new Map(), 
    ufPorSigla: new Map(),
    cidadesPorUF: new Map(),
  },

  // Controladores de requisições (para abortar se necessário)
  controladores: {
    carregamentoCidades: null,
    geocodificacao: null,
    qualidadeAr: null,
  },
};


// Estilos do mapa
export const ESTILOS_MAPA = {
  estadoDefault: {
    color: "#374151",
    weight: 1,
    fillColor: "#93c5fd",
    fillOpacity: 0.25,
  },
  estadoHighlight: {
    weight: 2,
    fillOpacity: 0.35,
  },
  estadoSelecionado: {
    color: "#166534",
    weight: 2,
    fillColor: "#4ade80",
    fillOpacity: 0.4,
  },
};
