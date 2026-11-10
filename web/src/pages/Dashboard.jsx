import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const BOTOES = [
  {
    id: "estavel",
    rotulo: "Leitura estável",
    sinais: { temperatura: 36.5, fc_media: 78, umidade: 50 },
  },
  {
    id: "limite",
    rotulo: "Sinais acima do limite",
    sinais: { temperatura: 38.6, fc_media: 132, umidade: 55 },
  },
];

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
  const [enviando, setEnviando] = useState(false);
  const [erroApi, setErroApi] = useState("");

  useEffect(() => {
    carregarLeituras();
  }, []);

  const carregarLeituras = async () => {
    try {
      const resposta = await fetch(`${API_URL}/api/historico`);
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErroApi(dados.erro || "Não foi possível carregar as leituras.");
        return;
      }
      setLeituras(dados.leituras || []);
    } catch {
      setErroApi(`Sem conexão com ${API_URL}. Suba o backend e tente de novo.`);
    }
  };

  const avaliar = async (sinais) => {
    setEnviando(true);
    setErroApi("");
    try {
      const resposta = await fetch(`${API_URL}/api/risco`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sinais),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErroApi(dados.erro || "O backend recusou a leitura.");
        return;
      }
      await carregarLeituras();
      setAberta(0);
    } catch {
      setErroApi(`Sem conexão com ${API_URL}. Suba o backend e tente de novo.`);
    } finally {
      setEnviando(false);
    }
  };

  const recentes = [...leituras].reverse();
  const altoRisco = leituras.filter((item) => item.classificacao === "ALTO RISCO").length;
  const comProtocolo = leituras.filter((item) => item.protocolos.length > 0).length;

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Leituras</h1>

      <div className={styles.section}>
        <p className={styles.explicacao}>
          Escolha uma leitura para ver a classe, a chance de pico e os protocolos.
        </p>
        <div className={styles.botoes}>
          {BOTOES.map((botao) => (
            <button
              key={botao.id}
              type="button"
              className={botao.id === "limite" ? styles.botaoAlerta : styles.botao}
              disabled={enviando}
              onClick={() => avaliar(botao.sinais)}
            >
              {enviando ? "Avaliando..." : botao.rotulo}
            </button>
          ))}
        </div>
        {erroApi ? <p className={styles.erro}>{erroApi}</p> : null}
        <div className={styles.contadores}>
          <span>Alto risco: {altoRisco}</span>
          <span>Com protocolo: {comProtocolo}</span>
        </div>
        {recentes.length === 0 ? (
          <p className={styles.vazio}>Nenhuma leitura ainda.</p>
        ) : (
          <ul className={styles.lista}>
            {recentes.map((item, indice) => {
              const abertaEsta = aberta === indice;
              return (
                <li key={`${item.registrado_em}-${indice}`}>
                  <button
                    type="button"
                    className={styles.linha}
                    aria-expanded={abertaEsta}
                    onClick={() => setAberta(abertaEsta ? null : indice)}
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
        )}
      </div>
    </div>
  );
};
