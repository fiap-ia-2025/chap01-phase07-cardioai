# CardioIA — Fase 7
# Mesma lógica da Fase 3 (ESP32, DHT22, botão de batimento, buffer de 100),
# agora em MicroPython. O LED acende quando algum limite clínico estoura.

import machine
import time
import dht

PINO_DHT = 4
PINO_BOTAO = 15
PINO_LED = 2

MAX_AMOSTRAS = 100
LEITURA_MS = 2000
JANELA_BPM_MS = 5000
DEBOUNCE_MS = 200
INTERVALO_WIFI_MS = 15000

TEMP_ALERTA = 38.0
BPM_ALERTA = 120
UMID_ALERTA = 90.0

sensor = dht.DHT22(machine.Pin(PINO_DHT))
botao = machine.Pin(PINO_BOTAO, machine.Pin.IN, machine.Pin.PULL_UP)
led = machine.Pin(PINO_LED, machine.Pin.OUT)

contagem_batimentos = 0
ultimo_batimento = 0
ultima_janela_bpm = time.ticks_ms()
bpm_atual = 0

buffer = []
wifi_conectado = False
ultimo_toggle_wifi = time.ticks_ms()
ultima_leitura = time.ticks_ms()


def ao_bater(pino):
    global contagem_batimentos, ultimo_batimento
    agora = time.ticks_ms()
    if time.ticks_diff(agora, ultimo_batimento) > DEBOUNCE_MS:
        contagem_batimentos += 1
        ultimo_batimento = agora


botao.irq(trigger=machine.Pin.IRQ_FALLING, handler=ao_bater)


def calcular_bpm():
    global contagem_batimentos, ultima_janela_bpm, bpm_atual
    agora = time.ticks_ms()
    if time.ticks_diff(agora, ultima_janela_bpm) < JANELA_BPM_MS:
        return bpm_atual

    estado = machine.disable_irq()
    try:
        batimentos = contagem_batimentos
        contagem_batimentos = 0
    finally:
        machine.enable_irq(estado)

    # 5 segundos vezes 12 = 1 minuto
    bpm_atual = batimentos * 12
    ultima_janela_bpm = agora
    print("[DEBUG] Batimentos em 5s:", batimentos, "-> BPM:", bpm_atual)
    return bpm_atual


def em_alerta(temp, umid, bpm):
    return temp > TEMP_ALERTA or umid > UMID_ALERTA or bpm > BPM_ALERTA


def adicionar_ao_buffer(amostra):
    if len(buffer) >= MAX_AMOSTRAS:
        buffer.pop(0)
        print("[AVISO] Buffer cheio. Amostra mais antiga descartada (FIFO).")
    buffer.append(amostra)


def linha_json(amostra):
    alerta = "true" if amostra["alerta"] else "false"
    return (
        '{"ts":%d,"temp":%.1f,"umid":%.1f,"bpm":%d,"alerta":%s}'
        % (amostra["ts"], amostra["temp"], amostra["umid"], amostra["bpm"], alerta)
    )


def sincronizar():
    if not buffer:
        return
    print("[NUVEM] Sincronizando", len(buffer), "amostras pendentes.")
    while buffer:
        print("[MQTT->NUVEM]", linha_json(buffer.pop(0)))
    print("[NUVEM] Buffer limpo.")


def simular_wifi():
    global wifi_conectado, ultimo_toggle_wifi
    agora = time.ticks_ms()
    if time.ticks_diff(agora, ultimo_toggle_wifi) < INTERVALO_WIFI_MS:
        return
    wifi_conectado = not wifi_conectado
    ultimo_toggle_wifi = agora
    estado = "CONECTADO" if wifi_conectado else "DESCONECTADO"
    print("[WIFI]", estado)


print("CardioIA - Monitor Cardiaco - MicroPython")
print("[INFO] Buffer offline: 100 amostras. Wi-Fi inicia desconectado.")

while True:
    simular_wifi()
    bpm = calcular_bpm()
    agora = time.ticks_ms()

    if time.ticks_diff(agora, ultima_leitura) >= LEITURA_MS:
        ultima_leitura = agora
        try:
            sensor.measure()
            temp = sensor.temperature()
            umid = sensor.humidity()
        except OSError:
            print("[ERRO] Falha na leitura do DHT22. Amostra ignorada.")
            time.sleep_ms(50)
            continue

        amostra = {
            "ts": agora,
            "temp": temp,
            "umid": umid,
            "bpm": bpm,
            "alerta": em_alerta(temp, umid, bpm),
        }
        led.value(1 if amostra["alerta"] else 0)

        if wifi_conectado:
            sincronizar()
            print("[MQTT->NUVEM]", linha_json(amostra))
        else:
            adicionar_ao_buffer(amostra)
            aviso = " | ALERTA CLINICO" if amostra["alerta"] else ""
            print(
                "[OFFLINE] T=%dms | Temp=%.1fC | Umid=%.1f%% | BPM=%d | Buffer=%d/%d%s"
                % (
                    amostra["ts"],
                    amostra["temp"],
                    amostra["umid"],
                    amostra["bpm"],
                    len(buffer),
                    MAX_AMOSTRAS,
                    aviso,
                )
            )

    time.sleep_ms(50)
