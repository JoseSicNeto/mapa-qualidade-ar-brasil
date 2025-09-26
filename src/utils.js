export function setStatus(mensagem) {
  const el = document.getElementById("status");
  if (!el) return;
  el.textContent = mensagem;
}

export function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export function cacheGet(mapa, chave) {
  return mapa.get(chave);
}

export function cacheSet(mapa, chave, valor) {
  mapa.set(chave, valor);
  return valor;
}

export function waitMs(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
