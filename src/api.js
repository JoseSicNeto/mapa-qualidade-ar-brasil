import { REQUEST_TIMEOUT_MS, OPENWEATHER_API_KEY, EstadoAplicacao } from "./config.js";
import { cacheGet, cacheSet, waitMs } from "./utils.js";


export async function fetchJSON(url, { signal, timeout = REQUEST_TIMEOUT_MS } = {}) {
  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), timeout);

  if (signal) {
    signal.addEventListener("abort", () => controlador.abort(), { once: true });
  }

  try {
    const resposta = await fetch(url, { signal: controlador.signal });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status} em ${url}`);
    return await resposta.json();
  } finally {
    clearTimeout(timer);
  }
}


// Geocodificação: obter coordenadas de uma cidade
export async function getCityCoords(nomeCidade, siglaUF) {
  const chave = `${nomeCidade}|${siglaUF}`;

  // Verifica cache
  const emCache = cacheGet(EstadoAplicacao.cache.coordenadasPorCidade, chave);
  if (emCache) return emCache;

  // Monta query para API do OpenWeather
  const q = `${encodeURIComponent(nomeCidade)},${encodeURIComponent(siglaUF)},BR`;
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${OPENWEATHER_API_KEY}`;

  try {
    const dados = await fetchJSON(url);
    if (Array.isArray(dados) && dados.length > 0) {
      const { lat, lon } = dados[0];
      return cacheSet(EstadoAplicacao.cache.coordenadasPorCidade, chave, { lat, lon });
    }
  } catch (erro) {
    console.warn("Falha em geocodificação:", erro);
    await waitMs(300);
    return null;
  }

  return null;
}


// Obter AQI e poluentes por coordenada
export async function getAirQuality(lat, lon) {
  const chave = `${lat}|${lon}`;

  // Verifica cache
  const emCache = cacheGet(EstadoAplicacao.cache.qualidadeArPorCoord, chave);
  if (emCache) return emCache;

  // Monta URL da API de poluição do ar
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;

  try {
    const dados = await fetchJSON(url);
    const item = dados?.list?.[0];

    if (item) {
      const resultado = {
        aqi: item.main.aqi,
        components: item.components,
        dt: item.dt,
      };

      return cacheSet(EstadoAplicacao.cache.qualidadeArPorCoord, chave, resultado);
    }
  } catch (erro) {
    console.warn("Falha ao obter qualidade do ar:", erro);
    await waitMs(300);
    return null;
  }

  return null;
}
