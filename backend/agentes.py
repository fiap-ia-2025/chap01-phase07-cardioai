"""Quatro agentes da Fase 6, com duas correções pedidas no feedback.

O arquivo se chama agentes.py de propósito: a biblioteca da OpenAI também
se importa como `agents`. Se este módulo tivesse esse nome, o Python
carregaria o nosso arquivo no lugar da biblioteca.

A probabilidade e os protocolos são calculados em Python e só então
validados. O SDK da OpenAI entra apenas para redigir o relatório, e só
quando existe a variável OPENAI_API_KEY. A chave não fica neste arquivo.
"""

import json
import os
from datetime import datetime, timezone

from model import prever

LIMITE_HISTORICO = 20


class RelatorioInvalido(Exception):
    """O texto dos agentes não repetiu a classificação oficial."""

_historico = []


def montar_protocolos(valores, classificacao):
    protocolos = []
    if valores["spo2_media"] < 88:
        protocolos.append("SPO2 < 88%: iniciar suporte respiratório imediato.")
    if valores["carga_sistema"] > 85:
        protocolos.append("Carga do sistema > 85%: abrir unidades temporárias.")
    if valores["fc_media"] > 120:
        protocolos.append("FC > 120: iniciar monitoramento intensivo.")
    if valores["eventos_24h"] > 5:
        protocolos.append("Eventos em 24h > 5: ativar equipe de resposta rápida.")
    if valores["disponibilidade_recursos"] < 30:
        protocolos.append("Disponibilidade de recursos < 30%: redistribuir insumos.")
    if valores["tempo_espera"] > 90:
        protocolos.append("Tempo de espera > 90 min: priorizar triagem emergencial.")
    if valores["temperatura"] > 38:
        protocolos.append("Temperatura > 38 °C: iniciar protocolo infeccioso.")
    if valores["densidade_eventos"] > 6:
        protocolos.append("Densidade de eventos > 6: ativar plano de contingência.")
    if valores["pa_sistolica"] < 90:
        protocolos.append("PA sistólica < 90: iniciar protocolo de choque.")
    if classificacao == "ALTO RISCO":
        protocolos.append("Risco sistêmico alto: ativar estado de emergência.")
    return protocolos


def validar_saida(saida):
    """Segura a resposta antes de ela ir para a tela ou para o histórico."""
    risco = saida.get("risco_previsto")
    if isinstance(risco, bool) or not isinstance(risco, (int, float)):
        raise ValueError("A saída não tem uma probabilidade numérica.")
    if not 0 <= float(risco) <= 1:
        raise ValueError("A probabilidade de pico de risco precisa estar entre 0 e 1.")

    if saida.get("classificacao") not in ("ALTO RISCO", "BAIXO RISCO"):
        raise ValueError("A classificação precisa ser ALTO RISCO ou BAIXO RISCO.")

    protocolos = saida.get("protocolos")
    if not isinstance(protocolos, list) or not all(isinstance(item, str) for item in protocolos):
        raise ValueError("Os protocolos precisam ser uma lista de textos.")

    return saida


def registrar(saida):
    item = {
        "registrado_em": datetime.now(timezone.utc).isoformat(),
        "risco_previsto": saida["risco_previsto"],
        "classificacao": saida["classificacao"],
        "protocolos": list(saida["protocolos"]),
        "valores": dict(saida["valores"]),
        "campos_preenchidos": list(saida.get("campos_preenchidos", [])),
    }
    if "umidade" in saida:
        item["umidade"] = saida["umidade"]
    _historico.append(item)
    del _historico[:-LIMITE_HISTORICO]
    return item


def listar_historico():
    return list(_historico)


def _relatorio_agentes(saida):
    from agents import Agent, Runner, function_tool

    oficial = {
        "risco_previsto": saida["risco_previsto"],
        "classificacao": saida["classificacao"],
        "protocolos": saida["protocolos"],
        "valores": saida.get("valores", {}),
        "campos_preenchidos": saida.get("campos_preenchidos", []),
    }
    if "umidade" in saida:
        oficial["umidade"] = saida["umidade"]
    pacote = json.dumps(oficial, ensure_ascii=False)

    @function_tool
    def calcular_score_risco() -> str:
        """Devolve a probabilidade e a classe já calculadas pela árvore de decisão."""
        return pacote

    @function_tool
    def consultar_protocolos() -> str:
        """Devolve os protocolos já verificados para este caso."""
        return pacote

    planejador = Agent(
        name="Agente Planejador de Resposta",
        instructions=(
            "Compile o relatório em português, neste formato:\n"
            "RISCO PREVISTO: <probabilidade>\n"
            "CLASSIFICAÇÃO: <ALTO RISCO ou BAIXO RISCO>\n"
            "PROTOCOLOS SUGERIDOS:\n"
            "- <protocolo>\n"
            "LEITURA:\n"
            "<quatro frases para o plantão>\n"
            "Copie a probabilidade, a classificação e os protocolos exatamente como "
            "vieram nas ferramentas. Se a lista vier vazia, o único item é "
            "'Nenhum protocolo acionado.'\n"
            "Nas quatro frases, use só números que já estão no pacote. "
            "A primeira diz o que foi medido: os campos de valores que não estão "
            "em campos_preenchidos e, se existir, a umidade. "
            "A segunda diz o que a API completou: cada nome em campos_preenchidos "
            "e o valor correspondente. "
            "A terceira explica a classe: o pico só existe quando duas destas "
            "condições acontecem juntas — carga acima de 80, espera acima de 60, "
            "saturação abaixo de 92, frequência acima de 110, mais de 4 eventos "
            "em 24 horas, recursos abaixo de 40. "
            "A quarta diz a ação de cada protocolo que já está na lista, sem criar outro. "
            "Não invente paciente nem sintoma. Traduza os nomes: "
            "idade_media é idade média, carga_sistema é carga do serviço, "
            "tempo_espera é espera em minutos, fc_media é frequência cardíaca, "
            "spo2_media é saturação, pa_sistolica é pressão sistólica, "
            "temperatura é temperatura, densidade_eventos é densidade de eventos, "
            "eventos_24h é eventos em 24 horas, disponibilidade_recursos é recursos disponíveis."
        ),
    )
    especialista = Agent(
        name="Agente Especialista em Protocolos",
        instructions=(
            "Use a ferramenta consultar_protocolos. Depois faça handoff para o "
            "Agente Planejador de Resposta com o resultado, sem alterar números."
        ),
        tools=[consultar_protocolos],
        handoffs=[planejador],
    )
    analista = Agent(
        name="Agente Analista de Risco",
        instructions=(
            "Use a ferramenta calcular_score_risco. Depois faça handoff para o "
            "Agente Especialista em Protocolos com o resultado, sem alterar números."
        ),
        tools=[calcular_score_risco],
        handoffs=[especialista],
    )
    orquestrador = Agent(
        name="Agente Orquestrador",
        instructions=(
            "Receba o caso e faça handoff para o Agente Analista de Risco. "
            "Não calcule risco por conta própria."
        ),
        handoffs=[analista],
    )

    resultado = Runner.run_sync(
        orquestrador,
        "Processe a análise deste caso. Os números oficiais estão nas ferramentas "
        "e repetidos aqui para conferência:\n"
        + pacote,
    )
    texto = str(resultado.final_output).strip()
    if saida["classificacao"] not in texto:
        raise RelatorioInvalido("O relatório do agente não repetiu a classificação validada.")
    return texto[:2000]


def analisar(dados):
    previsao = prever(dados)
    saida = {
        "risco_previsto": previsao["risco_previsto"],
        "classificacao": previsao["classificacao"],
        "pico_risco": previsao["pico_risco"],
        "protocolos": montar_protocolos(previsao["valores"], previsao["classificacao"]),
        "valores": previsao["valores"],
        "campos_preenchidos": previsao["campos_preenchidos"],
    }
    if "umidade" in previsao:
        saida["umidade"] = previsao["umidade"]

    validar_saida(saida)
    return registrar(saida)


def gerar_relatorio(registrado_em):
    """Pede o texto dos quatro agentes para uma leitura que já está no histórico."""
    item = next((atual for atual in _historico if atual["registrado_em"] == registrado_em), None)
    if item is None:
        raise KeyError(registrado_em)
    if item.get("relatorio_agente"):
        return item
    if not os.getenv("OPENAI_API_KEY", "").strip():
        raise RuntimeError("Os agentes precisam da variável OPENAI_API_KEY no servidor.")
    try:
        item["relatorio_agente"] = _relatorio_agentes(item)
    except RelatorioInvalido:
        raise ValueError("O relatório não repetiu a classificação desta leitura.")
    except Exception as erro:
        texto = str(erro)
        if "invalid_api_key" in texto or "Incorrect API key" in texto:
            raise RuntimeError(
                "A chave da OpenAI foi recusada. Gere outra no painel da OpenAI e atualize OPENAI_API_KEY."
            )
        raise RuntimeError("Não foi possível consultar os agentes agora.")
    return item
