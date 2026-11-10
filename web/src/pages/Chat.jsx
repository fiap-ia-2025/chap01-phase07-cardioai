import { useState } from "react";
import styles from "./Chat.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export const Chat = () => {
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState([
    {
      autor: "assistente",
      texto: "Olá. Sou o assistente do CardioIA. Posso orientar sobre sintomas de infarto, triagem ou emergência.",
    },
  ]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async (event) => {
    event.preventDefault();
    const texto = mensagem.trim();
    if (!texto || enviando) {
      return;
    }

    setMensagem("");
    setErro("");
    setHistorico((atual) => [...atual, { autor: "paciente", texto }]);
    setEnviando(true);

    try {
      const resposta = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: texto }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || "Não foi possível consultar o assistente.");
        return;
      }
      setHistorico((atual) => [
        ...atual,
        { autor: "assistente", texto: dados.resposta, origem: dados.origem },
      ]);
    } catch {
      setErro(`Sem conexão com ${API_URL}. Suba o backend e tente de novo.`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.chat}>
      <h1 className={styles.title}>Assistente</h1>
      <div className={styles.painel}>
        <div className={styles.mensagens}>
          {historico.map((item, indice) => (
            <div
              key={`${item.autor}-${indice}`}
              className={
                item.autor === "paciente" ? styles.paciente : styles.assistente
              }
            >
              <p>{item.texto}</p>
              {item.origem ? (
                <span className={styles.origem}>
                  {item.origem === "watson" ? "Watson" : "orientação local"}
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <form className={styles.form} onSubmit={enviar}>
          <input
            className={styles.campo}
            value={mensagem}
            onChange={(event) => setMensagem(event.target.value)}
            placeholder="Escreva a dúvida do paciente"
            disabled={enviando}
          />
          <button className={styles.botao} type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </form>
        {erro ? <p className={styles.erro}>{erro}</p> : null}
      </div>
    </div>
  );
};
