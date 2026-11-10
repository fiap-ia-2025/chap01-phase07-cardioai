import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

function horario(iso) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return iso;
  }
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export const Dashboard = () => {
  const [leituras, setLeituras] = useState([]);
  const [aberta, setAberta] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const [erroApi, setErroApi] = useState("");

  const carregarLeituras = async () => {
    setAtualizando(true);
    setErroApi("");
    try {
      const resposta = await fetch(`${API_URL}/api/historico`);
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErroApi(dados.erro || "Não foi possível buscar as leituras.");
        return;
      }
      setLeituras(dados.leituras || []);
    } catch {
      setErroApi("Não foi possível buscar as leituras. Tente atualizar de novo.");
    } finally {
      setAtualizando(false);
    }
  };

  useEffect(() => {
    carregarLeituras();
  }, []);

  const recentes = [...leituras].reverse();
  const altoRisco = leituras.filter((item) => item.classificacao === "ALTO RISCO").length;
  const comProtocolo = leituras.filter((item) => item.protocolos.length > 0).length;

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Leituras</h1>

      <div className={styles.section}>
        <p className={styles.explicacao}>
          O sensor envia temperatura e batimento. Cada linha é uma leitura já avaliada.
          Clique nela para ver a chance de pico e os protocolos. Clique de novo para fechar.
        </p>
        <div className={styles.barra}>
          <button
            type="button"
            className={styles.botao}
            disabled={atualizando}
            onClick={carregarLeituras}
          >
            {atualizando ? "Atualizando..." : "Atualizar"}
          </button>
          <p className={styles.dica}>
            Use Atualizar depois que o sensor conectar, para trazer as leituras novas.
          </p>
        </div>
        {erroApi ? <p className={styles.erro}>{erroApi}</p> : null}
        <div className={styles.contadores}>
          <span>{leituras.length} leituras</span>
          <span>Alto risco: {altoRisco}</span>
          <span>Com protocolo: {comProtocolo}</span>
        </div>
        {recentes.length === 0 ? (
          <p className={styles.vazio}>
            Nenhuma leitura ainda. Rode o sensor e, quando o link conectar, clique em Atualizar.
          </p>
        ) : (
          <>
            <div className={styles.cabecalho} aria-hidden="true">
              <span>Classe</span>
              <span>Horário</span>
              <span>Temperatura</span>
              <span>Batimento</span>
            </div>
            <ul className={styles.lista}>
              {recentes.map((item, indice) => {
                const chave = `${item.registrado_em}-${indice}`;
                const abertaEsta = aberta === chave;
                return (
                  <li key={chave}>
                    <button
                      type="button"
                      className={styles.linha}
                      aria-expanded={abertaEsta}
                      onClick={() => setAberta(abertaEsta ? null : chave)}
                    >
                      <span className={item.classificacao === "ALTO RISCO" ? styles.alto : styles.baixo}>
                        {item.classificacao}
                      </span>
                      <span>{horario(item.registrado_em)}</span>
                      <span>{item.valores.temperatura} °C</span>
                      <span>{item.valores.fc_media} bpm</span>
                    </button>
                    {abertaEsta ? (
                      <div className={styles.detalhe}>
                        <p>Horário: {horario(item.registrado_em)}</p>
                        <p>Temperatura: {item.valores.temperatura} °C</p>
                        <p>Batimento: {item.valores.fc_media} bpm</p>
                        <p>Probabilidade de pico: {Math.round(item.risco_previsto * 100)}%</p>
                        <p>Classe: {item.classificacao}</p>
                        <p className={styles.rotulo}>Protocolos</p>
                        {item.protocolos.length === 0 ? (
                          <p>Nenhum protocolo acionado.</p>
                        ) : (
                          <ul>
                            {item.protocolos.map((protocolo) => (
                              <li key={protocolo}>{protocolo}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};
