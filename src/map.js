import { EstadoAplicacao, BRAZIL_BOUNDS } from "./config.js";
import { setStatus } from "./utils.js";


// Inicialização do mapa
export function initMap() {
  EstadoAplicacao.mapa = L.map("map", { minZoom: 4, maxZoom: 18 }).setView(
    [-14.235, -51.9253], // centro aproximado do Brasil
    4
  );

  // Camada base (Carto Light, sem labels)
  L.tileLayer(
    "https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution: "&copy; OpenStreetMap &copy; Carto",
      subdomains: "abcd",
      maxZoom: 19,
    }
  ).addTo(EstadoAplicacao.mapa);

  // Limita navegação ao Brasil
  EstadoAplicacao.mapa.setMaxBounds(BRAZIL_BOUNDS.pad(0.3));

  // Botão de reset
  document.getElementById("btn-reset").addEventListener("click", resetMapView);
}


// Resetar visão do mapa
export function resetMapView() {
  EstadoAplicacao.estadoSelecionado = null;
  EstadoAplicacao.cidadeSelecionada = null;

  // Remove camada de municípios se existir
  if (EstadoAplicacao.camadaMunicipios) {
    EstadoAplicacao.mapa.removeLayer(EstadoAplicacao.camadaMunicipios);
    EstadoAplicacao.camadaMunicipios = null;
    EstadoAplicacao.municipiosLayers = null;
  }

  const elementoEstado = document.getElementById("estado-selecionado");
  const elementoAirInfo = document.getElementById("air-info");
  const elementoListaCidades = document.getElementById("lista-cidades");

  elementoEstado.textContent = "Nenhum";
  elementoAirInfo.textContent = "Selecione uma cidade para ver detalhes de AQI e poluentes.";
  elementoListaCidades.replaceChildren();

  // Mensagem de status e reset do mapa
  setStatus("Estados carregados. Clique em um estado para ver as cidades.");
  EstadoAplicacao.mapa.fitBounds(BRAZIL_BOUNDS);
}
