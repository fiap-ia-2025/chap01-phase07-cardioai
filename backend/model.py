"""Carrega a árvore de decisão da Fase 6 e valida a entrada antes de prever.

O treino em si continua no notebook da Fase 6. Aqui fica só o que o
professor sentiu falta por lá: um módulo que sabe quais colunas o modelo
espera, recusa número absurdo e devolve uma probabilidade utilizável.
"""

from pathlib import Path

import joblib
import pandas as pd

COLUNAS = [
    "idade_media",
    "carga_sistema",
    "tempo_espera",
    "fc_media",
    "spo2_media",
    "pa_sistolica",
    "temperatura",
    "densidade_eventos",
    "eventos_24h",
    "disponibilidade_recursos",
]

# Cenário calmo, dentro da faixa em que a base da Fase 6 foi sorteada.
# Temperatura padrão é 24 °C porque o notebook gerou essa coluna com
# média 24 (ambiente simulado), não com temperatura corporal.
PADRAO = {
    "idade_media": 55,
    "carga_sistema": 50,
    "tempo_espera": 30,
    "fc_media": 80,
    "spo2_media": 97,
    "pa_sistolica": 120,
    "temperatura": 24,
    "densidade_eventos": 2,
    "eventos_24h": 1,
    "disponibilidade_recursos": 70,
}

LIMITES = {
    "idade_media": (0, 120),
    "carga_sistema": (0, 100),
    "tempo_espera": (0, 1440),
    "fc_media": (0, 250),
    "spo2_media": (0, 100),
    "pa_sistolica": (0, 300),
    "temperatura": (0, 50),
    "densidade_eventos": (0, 1000),
    "eventos_24h": (0, 10000),
    "disponibilidade_recursos": (0, 100),
    "umidade": (0, 100),
}

APELIDOS = {
    "temp": "temperatura",
    "bpm": "fc_media",
    "fc": "fc_media",
    "umid": "umidade",
}

_CAMINHO_MODELO = Path(__file__).with_name("cardioia_modelo_risco.pkl")
_modelo = None


def carregar_modelo():
    global _modelo
    if _modelo is None:
        _modelo = joblib.load(_CAMINHO_MODELO)
    return _modelo


def _numero(nome, valor):
    if isinstance(valor, bool) or not isinstance(valor, (int, float)):
        raise ValueError(f"O campo {nome} precisa ser numérico.")
    valor = float(valor)
    minimo, maximo = LIMITES[nome]
    if not (minimo <= valor <= maximo):
        raise ValueError(
            f"O campo {nome} está fora do intervalo {minimo:g}–{maximo:g}."
        )
    return valor


def normalizar(dados):
    """Aceita o JSON da tela ou o JSON curto do sensor (temp, bpm, umidade)."""
    if not isinstance(dados, dict):
        raise ValueError("Os sinais precisam chegar como um objeto JSON.")

    bruto = {}
    for chave, valor in dados.items():
        if chave in APELIDOS and APELIDOS[chave] not in dados:
            bruto[APELIDOS[chave]] = valor
        elif chave in COLUNAS or chave == "umidade":
            bruto[chave] = valor

    umidade = None
    if "umidade" in bruto:
        umidade = _numero("umidade", bruto["umidade"])

    valores = dict(PADRAO)
    preenchidos = []
    for coluna in COLUNAS:
        if coluna in bruto:
            valores[coluna] = _numero(coluna, bruto[coluna])
        else:
            preenchidos.append(coluna)

    return valores, preenchidos, umidade


def prever(dados):
    valores, preenchidos, umidade = normalizar(dados)
    modelo = carregar_modelo()
    tabela = pd.DataFrame([valores], columns=COLUNAS)

    classe = int(modelo.predict(tabela)[0])
    probabilidade = float(modelo.predict_proba(tabela)[0][1])

    resultado = {
        "risco_previsto": round(probabilidade, 4),
        "classificacao": "ALTO RISCO" if classe == 1 else "BAIXO RISCO",
        "pico_risco": classe,
        "valores": valores,
        "campos_preenchidos": preenchidos,
    }
    if umidade is not None:
        resultado["umidade"] = umidade
    return resultado
