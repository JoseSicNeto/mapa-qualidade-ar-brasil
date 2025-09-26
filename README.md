# 🌎 Mapa de Qualidade do Ar no Brasil

Este projeto exibe a qualidade do ar (AQI) em cidades brasileiras, utilizando **malhas geográficas do IBGE** e dados da **API do OpenWeather**.  
O usuário pode clicar em um estado, visualizar os municípios e selecionar uma cidade para ver informações detalhadas de poluentes.

---

## 🚀 Tecnologias e APIs

- **Leaflet.js** → renderização do mapa interativo.  
- **IBGE Localidades API** → lista de estados e municípios (`https://servicodados.ibge.gov.br/api/v1/localidades`).  
- **OpenWeather Geocoding API** → converte nome da cidade em coordenadas (lat/lon).  
- **OpenWeather Air Pollution API** → retorna o índice de qualidade do ar (AQI) e concentrações de poluentes (`PM2.5`, `PM10`, `O₃`, `NO₂`, `SO₂`, `CO`).  
- **Malha municipal do IBGE (2024)** → shapefile convertido em GeoJSON para desenhar os municípios.

---

## 📂 Estrutura dos dados

- `br_states.json` → polígonos dos estados.  
- `XX.json` → polígonos dos municípios de cada estado (XX = sigla UF).  
- Cada município no GeoJSON contém propriedades como:
  ```json
  {
    "CD_MUN": "2504108",
    "NM_MUN": "Carrapateira",
    "SIGLA_UF": "PB",
    "AREA_KM2": 59.07
  }
  ```

---

## 🔑 Lógicas principais

1. **Carregamento inicial**  
   - O mapa abre centralizado no Brasil.  
   - Estados são carregados via `br_states.json`.  

2. **Clique em estado**  
   - Carrega lista de cidades via API do IBGE.  
   - Carrega malha municipal (`XX.json`).  

3. **Selecionando uma cidade**  
   - Busca coordenadas via OpenWeather Geocoding.  
   - Busca AQI via OpenWeather Air Pollution.  
   - Pinta o polígono do município com cor correspondente ao AQI.  
   - Mostra painel lateral com detalhes: índice, interpretação e poluentes.  

4. **Reset**  
   - Limpa seleção e volta à visão geral do Brasil.  

---

## 🗺️ Como consegui a malha municipal

- Fonte: **IBGE – Malha Municipal 2024**.  
- Arquivos originais vêm em formato **Shapefile** (`.shp`, `.shx`, `.dbf`, `.prj`, `.cpg`).  
- Conversão feita para **GeoJSON** usando [mapshaper.org](https://mapshaper.org).  
- Simplificação aplicada (5–0%) para reduzir tamanho dos arquivos.  
- Separação por estado (`split SIGLA_UF`) para carregar dinamicamente apenas o necessário.

---

## 🌬️ Possibilidades de melhoria


- **Cidades clicáveis:** atualmente só se seleciona a cidade pelo menu lateral.
- **Dados mais precisos**: usar estações locais de monitoramento em vez de apenas OpenWeather.  
- **Camadas adicionais**: sobrepor dados de queimadas, tráfego ou clima.  
- **Performance**: aplicar mais simplificação nos GeoJSON ou usar **vector tiles**.  
- **Visualização**: criar legenda dinâmica de cores para AQI e filtros por poluente.  
- **Offline cache**: armazenar resultados de AQI em IndexedDB para reduzir chamadas à API.  

---

## 📌 Resumo

Este projeto mostra como integrar **dados oficiais do IBGE** com **APIs globais de clima** para criar uma visualização interativa e educativa sobre qualidade do ar no Brasil.  

---
