import { EstadoAplicacao, ESTILOS_MAPA } from "./config.js";
import { fetchJSON } from "./api.js";
import { setStatus } from "./utils.js";
import { handleStateClick } from "./cities.js";


// Carregar estados (malha + metadados do IBGE)
export async function loadStates() {
  setStatus("Carregando estados...");

  // Primeiro: buscar lista de estados no IBGE (nomes e siglas)
  try {
    const listaUF = await fetchJSON("https://servicodados.ibge.gov.br/api/v1/localidades/estados");

    listaUF.forEach((uf) => {
      EstadoAplicacao.cache.ufPorSigla.set(uf.sigla, {
        id: uf.id,
        sigla: uf.sigla,
        nome: uf.nome,
      });
    });
  } catch (erro) {
    console.error("Falha ao buscar lista de estados:", erro);
    throw erro;
  }

  // Depois: carregar GeoJSON com os polígonos dos estados
  try {
    const geoEstados = await fetchJSON("/public/data/br_states.json");

    function onEachFeature(feature, layer) {
      const sigla = String(feature.id);
      const metaUF = EstadoAplicacao.cache.ufPorSigla.get(sigla);
      const nomeUF = metaUF?.nome || "Estado";

      // Tooltip com nome e sigla
      layer.bindTooltip(`${nomeUF} (${sigla})`, { sticky: true });

      // Hover highlight
      layer.on("mouseover", () => {
        if (EstadoAplicacao.estadoSelecionado?.layer !== layer) {
          layer.setStyle(ESTILOS_MAPA.estadoHighlight);
        }
      });

      layer.on("mouseout", () => {
        if (EstadoAplicacao.estadoSelecionado?.layer !== layer) {
          EstadoAplicacao.camadaEstados.resetStyle(layer);
        }
      });

      // Clique em estado
      layer.on("click", () => {
        // Resetar estilo do estado anterior
        if (EstadoAplicacao.estadoSelecionado?.layer) {
          EstadoAplicacao.camadaEstados.resetStyle(EstadoAplicacao.estadoSelecionado.layer);
        }

        // Destacar estado atual
        layer.setStyle(ESTILOS_MAPA.estadoSelecionado);

        // Atualizar estado selecionado
        const estado = { id: metaUF?.id, sigla, nome: nomeUF, layer };
        EstadoAplicacao.estadoSelecionado = estado;

        // Carregar cidades e municípios
        handleStateClick(estado);
      });
    }

    // Criar camada de estados
    EstadoAplicacao.camadaEstados = L.geoJSON(geoEstados, {
      style: ESTILOS_MAPA.estadoDefault,
      onEachFeature,
    }).addTo(EstadoAplicacao.mapa);

    setStatus("Estados carregados. Clique em um estado para ver as cidades.");
  } catch (erro) {
    console.error("Falha ao carregar br_states.json:", erro);
    throw erro;
  }
}
