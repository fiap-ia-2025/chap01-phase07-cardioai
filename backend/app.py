"""API que a web e o celular vão consumir.

O modelo responde o risco. As regras da Fase 6 respondem os protocolos.
O chat pergunta ao Watson da Fase 5 quando a chave está no ambiente.
Sem essa chave, responde com a lista de palavras.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from agentes import analisar, gerar_relatorio, listar_historico

load_dotenv(Path(__file__).with_name(".env"))

app = Flask(__name__)
CORS(app)

_watson = None

AVISO = "Orientação acadêmica do CardioIA. Não substitui avaliação médica."


def responder(mensagem):
    texto = mensagem.lower()
    if any(pista in texto for pista in ("emerg", "samu", "192", "socorro", "urgente")):
        resposta = (
            "Em emergência ou suspeita de infarto, ligue para o SAMU no 192 "
            "ou vá ao pronto-socorro mais próximo. Não dirija se estiver passando mal."
        )
    elif any(pista in texto for pista in ("sintoma", "infarto", "dor no peito")):
        resposta = (
            "Sinais que pedem avaliação imediata: dor ou queimação no peito, "
            "falta de ar, suor frio, náusea e dor irradiada para braço ou mandíbula."
        )
    elif "triag" in texto:
        resposta = (
            "A triagem junta os sinais (batimento, temperatura, oxigenação, pressão) "
            "com a carga do serviço. O modelo estima o pico de risco e as regras "
            "apontam o protocolo correspondente."
        )
    else:
        resposta = (
            "Posso orientar sobre sintomas de infarto, sobre como a triagem funciona "
            "ou sobre o que fazer em emergência."
        )
    return {"resposta": f"{resposta} {AVISO}", "origem": "orientacao_local"}


def _cliente_watson():
    """Monta o cliente uma vez. Sem as quatro variáveis, o Watson fica desligado."""
    global _watson
    chave = os.getenv("WATSON_API_KEY", "").strip()
    url = os.getenv("WATSON_URL", "").strip()
    assistente_id = os.getenv("WATSON_ASSISTANT_ID", "").strip()
    ambiente_id = os.getenv("WATSON_ENVIRONMENT_ID", "").strip()
    if not all((chave, url, assistente_id, ambiente_id)):
        return None
    if _watson is None:
        from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
        from ibm_watson import AssistantV2

        cliente = AssistantV2(
            version="2021-11-27",
            authenticator=IAMAuthenticator(chave),
        )
        cliente.set_service_url(url)
        _watson = (cliente, assistente_id, ambiente_id)
    return _watson


def consultar_watson(mensagem):
    configurado = _cliente_watson()
    if configurado is None:
        return None
    cliente, assistente_id, ambiente_id = configurado
    resultado = cliente.message_stateless(
        assistant_id=assistente_id,
        environment_id=ambiente_id,
        input={"message_type": "text", "text": mensagem},
        user_id="usuario_web",
    ).get_result()
    textos = [
        item["text"].strip()
        for item in resultado.get("output", {}).get("generic", [])
        if item.get("response_type") == "text" and item.get("text")
    ]
    return "\n\n".join(textos).strip() or None


@app.get("/api/saude")
def saude():
    return jsonify({"status": "ok", "modelo": "arvore_decisao"})


@app.post("/api/risco")
def risco():
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"erro": "Envie um JSON com os sinais."}), 400
    try:
        return jsonify(analisar(dados))
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400


@app.get("/api/historico")
def historico():
    return jsonify({"leituras": listar_historico()})


@app.post("/api/relatorio")
def relatorio():
    dados = request.get_json(silent=True) or {}
    registrado_em = dados.get("registrado_em")
    if not isinstance(registrado_em, str) or not registrado_em.strip():
        return jsonify({"erro": "Envie o campo registrado_em da leitura."}), 400
    try:
        return jsonify(gerar_relatorio(registrado_em))
    except KeyError:
        return jsonify({"erro": "Essa leitura não está mais na lista. Atualize a página."}), 404
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 502
    except RuntimeError as erro:
        codigo = 503 if "OPENAI_API_KEY" in str(erro) else 502
        return jsonify({"erro": str(erro)}), codigo


@app.post("/api/chat")
def chat():
    dados = request.get_json(silent=True) or {}
    mensagem = dados.get("mensagem", "")
    if not isinstance(mensagem, str) or not mensagem.strip():
        return jsonify({"erro": "Envie o campo mensagem."}), 400
    mensagem = mensagem.strip()
    try:
        texto = consultar_watson(mensagem)
    except Exception as erro:
        app.logger.warning("Watson indisponível (%s). A resposta local entra no lugar.", type(erro).__name__)
        texto = None
    if texto:
        return jsonify({"resposta": texto, "origem": "watson"})
    return jsonify(responder(mensagem))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
