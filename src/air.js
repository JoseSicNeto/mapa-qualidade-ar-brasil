import { EstadoAplicacao, TZ_BRAZIL, ESTILOS_MAPA } from "./config.js";
import { setStatus } from "./utils.js";
import { getAirQuality } from "./api.js";


// Função principal: clique em cidade 
export async function handleCityClick(cidade) {
  // Remove destaque anterior
  if (EstadoAplicacao.cidadeSelecionada?.marcador) {
    try {
      EstadoAplicacao.cidadeSelecionada.marcador.setStyle(ESTILOS_MAPA.cidadeDefault);
    } catch (_) {
    }
  }

  // Define seleção atual e destaca
  EstadoAplicacao.cidadeSelecionada = cidade;
  cidade.marcador.setStyle(ESTILOS_MAPA.cidadeSelecionada);

  setStatus(`Buscando qualidade do ar em ${cidade.nome}/${cidade.ufSigla}...`);

  // Busca dados de qualidade do ar
  const qualidadeAr = await getAirQuality(cidade.lat, cidade.lon);
  if (!qualidadeAr) {
    setStatus("Não foi possível obter os dados de qualidade do ar. Tente novamente.");
    return;
  }

  // Renderiza informações no painel lateral
  renderAirQualityInfo(cidade, qualidadeAr);
  setStatus(`Exibindo AQI para ${cidade.nome}/${cidade.ufSigla}.`);
}


// Renderização de informações de qualidade do ar 
export function renderAirQualityInfo(cidade, qualidadeAr) {
  const elemento = document.getElementById("air-info");
  const interpretacao = interpretAirQualityIndex(qualidadeAr.aqi);
  const poluentes = formatPollutantValues(qualidadeAr.components);

  EstadoAplicacao.poluentes = poluentes;
  
  // Data/hora local formatada
  const dataLocal = new Date(qualidadeAr.dt * 1000);
  const formatador = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ_BRAZIL,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  elemento.innerHTML = `
    <div class="air-header">
      <strong>${cidade.nome} (${cidade.ufSigla})</strong>
    </div>
    <div class="air-aqi">
      <div>
        <strong>AQI:</strong> 
        <span class="legend-color aqi-${qualidadeAr.aqi}" aria-hidden="true"></span> 
        ${qualidadeAr.aqi} — ${interpretacao.label}
      </div>
      <div><strong>Saúde:</strong> ${interpretacao.advice}</div>
      <div><strong>Medição:<br></strong> ${formatador.format(dataLocal)} (Horário de Brasília)</div>
    </div>
    <div class="air-pollutants">
      <div><strong>Poluentes:</strong></div>
      <ul>
        <li>PM2.5: ${poluentes.pm2_5} µg/m³</li>
        <li>PM10: ${poluentes.pm10} µg/m³</li>
        <li>O₃: ${poluentes.o3} µg/m³</li>
        <li>NO₂: ${poluentes.no2} µg/m³</li>
        <li>SO₂: ${poluentes.so2} µg/m³</li>
        <li>CO: ${poluentes.co} µg/m³</li>
      </ul>
    </div>
  `;
}


// Interpretação do índice de qualidade do ar 
function interpretAirQualityIndex(aqi) {
  switch (aqi) {
    case 1:
      return { label: "Bom", advice: "Qualidade satisfatória. Atividades ao ar livre recomendadas." };
    case 2:
      return { label: "Moderado", advice: "Aceitável; pessoas muito sensíveis devem limitar esforço prolongado." };
    case 3:
      return { label: "Ruim para sensíveis", advice: "Grupos sensíveis devem reduzir atividades ao ar livre." };
    case 4:
      return { label: "Ruim", advice: "Todos devem limitar atividades intensas ao ar livre." };
    case 5:
      return { label: "Muito ruim", advice: "Evite atividades ao ar livre; considere permanecer em ambientes fechados." };
    default:
      return { label: "Desconhecido", advice: "Sem interpretação disponível." };
  }
}


// Formatação dos valores de poluentes
function formatPollutantValues(componentes) {
  const f = (x) => (x == null ? "-" : Number(x).toFixed(1));
  return {
    pm2_5: f(componentes?.pm2_5),
    pm10: f(componentes?.pm10),
    o3: f(componentes?.o3),
    no2: f(componentes?.no2),
    so2: f(componentes?.so2),
    co: f(componentes?.co),
  };
}

