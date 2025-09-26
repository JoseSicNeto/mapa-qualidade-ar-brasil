import { EstadoAplicacao } from "./config.js";
import { fetchJSON, getCityCoords, getAirQuality } from "./api.js";
import { setStatus, debounce } from "./utils.js";
import { renderAirQualityInfo } from "./air.js"; // exporte essa função no air.js


// Clique em um estado
export async function handleStateClick(estado) {
  EstadoAplicacao.estadoSelecionado = estado;

  // Limpa camadas anteriores
  if (EstadoAplicacao.camadaMunicipios) {
    EstadoAplicacao.mapa.removeLayer(EstadoAplicacao.camadaMunicipios);
    EstadoAplicacao.camadaMunicipios = null;
  }

  document.getElementById("estado-selecionado").textContent = `${estado.nome} (${estado.sigla})`;
  document.getElementById("lista-cidades").replaceChildren();
  document.getElementById("air-info").textContent = "Selecione uma cidade.";

  // Carrega lista de cidades e divisões municipais
  await loadCitiesForState(estado.sigla);
  await loadMunicipiosGeoJSON(estado.sigla);

  // Ajusta mapa para o estado
  EstadoAplicacao.mapa.fitBounds(estado.layer.getBounds());
}


// Carregar lista de cidades do IBGE
async function loadCitiesForState(siglaUF) {
  setStatus(`Carregando municípios de ${siglaUF}...`);
  const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${siglaUF}/municipios`;

  let cidades;
  try {
    cidades = await fetchJSON(url);
  } catch (erro) {
    console.error("Erro ao buscar municípios:", erro);
    setStatus("Falha ao carregar municípios. Tente novamente.");
    return;
  }

  EstadoAplicacao.cache.cidadesPorUF.set(siglaUF, cidades);

  // Renderiza lista inicial
  renderCityList(cidades, siglaUF);

  // Ativa filtro de busca
  const inputBusca = document.getElementById("city-search");
  inputBusca.value = "";
  inputBusca.oninput = debounce(() => {
    const termo = inputBusca.value.trim().toLowerCase();
    const filtradas = cidades.filter(c =>
      c.nome.toLowerCase().includes(termo)
    );
    renderCityList(filtradas, siglaUF);
  }, 300);

  setStatus(`${cidades.length} municípios carregados.`);
}


// Renderizar lista lateral de cidades
function renderCityList(lista, siglaUF) {
  const listaElementos = document.getElementById("lista-cidades");
  listaElementos.replaceChildren();

  lista.forEach((cidadeItem) => {
    const li = document.createElement("li");
    li.textContent = cidadeItem.nome;

    li.onclick = async () => {
      // Remove seleção anterior
      listaElementos.querySelectorAll("li").forEach(el => el.classList.remove("selected"));
      li.classList.add("selected");

      setStatus(`Carregando AQI de ${cidadeItem.nome}/${siglaUF}...`);

      // Busca coordenadas e AQI
      const coords = await getCityCoords(cidadeItem.nome, siglaUF);
      if (!coords) return;

      const qualidadeAr = await getAirQuality(coords.lat, coords.lon);
      if (!qualidadeAr) return;

      // Encontra e pinta polígono do município
      const municipioLayer = Array.from(EstadoAplicacao.municipiosLayers.values())
        .find(l => l.feature.properties.NM_MUN.toLowerCase() === cidadeItem.nome.toLowerCase());

      if (municipioLayer) {
        // Resetar estilos anteriores
        EstadoAplicacao.municipiosLayers.forEach(l => l.setStyle({
          color: "#6b7280",
          weight: 0.7,
          fillColor: "#d1d5db",
          fillOpacity: 0.2,
        }));

        // Aplica cor conforme AQI
        municipioLayer.setStyle({
          color: "#000",
          weight: 1,
          fillColor: getColorByAQI(qualidadeAr.aqi),
          fillOpacity: 0.6,
        });

        EstadoAplicacao.mapa.fitBounds(municipioLayer.getBounds(), {maxZoom: 6});
      }

      // Atualiza painel lateral
      const cidade = {
        nome: cidadeItem.nome,
        ufSigla: siglaUF,
        lat: coords.lat,
        lon: coords.lon,
      };
      renderAirQualityInfo(cidade, qualidadeAr);
    };

    listaElementos.appendChild(li);
  });
}


// Carregar GeoJSON de municípios do estado (arquivo local para separação dos estados) 
async function loadMunicipiosGeoJSON(siglaUF) {
  try {
    const geoMunicipios = await fetchJSON(`/public/data/${siglaUF}.json`);

    if (EstadoAplicacao.camadaMunicipios) {
      EstadoAplicacao.mapa.removeLayer(EstadoAplicacao.camadaMunicipios);
      EstadoAplicacao.municipiosLayers = null;
    }

    EstadoAplicacao.municipiosLayers = new Map();

    EstadoAplicacao.camadaMunicipios = L.geoJSON(geoMunicipios, {
      style: {
        color: "#6b7280",
        weight: 0.7,
        fillColor: "#d1d5db",
        fillOpacity: 0.2,
      },
      onEachFeature: (feature, layer) => {
        const nome = feature.properties?.NM_MUN;
        const codigo = feature.properties?.CD_MUN;
        layer.bindTooltip(nome, { sticky: true });

        // Guarda referência para poder pintar depois
        if (codigo) {
          EstadoAplicacao.municipiosLayers.set(codigo, layer);
        }
      },
    }).addTo(EstadoAplicacao.mapa);

    setStatus(`Divisões municipais de ${siglaUF} carregadas.`);
  } catch (erro) {
    console.error("Erro ao carregar municípios:", erro);
    setStatus("Não foi possível carregar divisões municipais.");
  }
}


// Utilitário: cor por AQI
function getColorByAQI(aqi) {
  switch (aqi) {
    case 1: return "#2ecc71"; // verde
    case 2: return "#f1c40f"; // amarelo
    case 3: return "#e67e22"; // laranja
    case 4: return "#e74c3c"; // vermelho
    case 5: return "#8e44ad"; // roxo
    default: return "#7f8c8d"; // cinza
  }
}
