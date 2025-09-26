import { initMap } from "./map.js";
import { loadStates } from "./states.js";
import { setStatus } from "./utils.js";

window.addEventListener("DOMContentLoaded", async () => {
  initMap();

  try {
    await loadStates();
    setStatus("Estados carregados. Clique em um estado para ver as cidades.");
  } catch (erro) {
    console.error("Erro ao carregar estados:", erro);
    setStatus("Erro ao carregar estados. Verifique sua conexão e tente novamente.");
  }
});
