# CardioIA

Plataforma de apoio à decisão em cardiologia. Um sensor simulado mede temperatura e batimento, a API estima a chance de um pico de risco e indica os protocolos, e o médico acompanha o resultado no portal web e no aplicativo Android.

Dados e modelos são simulados, para uso acadêmico. O sistema não substitui avaliação clínica.

<p align="center">
  <a href="https://www.fiap.com.br/">
    <img src="assets/img/logo-fiap.jpg" alt="FIAP" width="220">
  </a>
</p>

## Equipe

- Amanda Vieira Pires (RM566330)
- Ana Gabriela Soares Santos (RM565235)
- Bianca Nascimento de Santa Cruz Oliveira (RM561390)
- Milena Pereira dos Santos Silva (RM565464)
- Nayana Mehta Miazaki (RM565045)

**Tutor:** Caique Nonato da Silva Bezerra  
**Coordenador:** André Godoi

## Fluxo

```text
Sensor no Wokwi → API Python → modelo e protocolos → portal web e app Android
```

O sensor mede temperatura, batimento e umidade. A API completa os campos que o sensor não mede, consulta a árvore de decisão treinada na Fase 6 e devolve três informações: probabilidade de pico, classe (alto ou baixo risco) e protocolos acionados. O aplicativo e a página Leituras do portal consomem essa resposta em `/api/risco`. A página Assistente consome o chat em `/api/chat`. No Wokwi, o sensor guarda a leitura enquanto o link simulado está desligado. Quando o link volta, envia `temp`, `bpm` e `umid` para a API pública.

## Módulos

### Sensor (`iot/`)

`main.py` é a lógica da Fase 3, antes escrita em C++ para ESP32, reescrita em MicroPython. `diagram.json` é o circuito do Wokwi.

A cada 2 segundos o script lê temperatura e umidade no DHT22. O botão conta pulsos. A cada 5 segundos essa contagem vira batimentos por minuto (pulsos × 12). Acima de 38 °C, 120 bpm ou 90% de umidade, o LED acende.

A rede do simulador, `Wokwi-GUEST`, fica ligada o tempo todo: é ela que alcança a internet. O link com a API é outra chave, e começa desligado. Enquanto está desligado, a leitura entra num buffer de até 100 amostras. A cada 15 segundos o script alterna esse link, como na demonstração da Fase 3. Quando volta, cada amostra sai em `POST` para `https://chap01-phase07-cardioai.onrender.com/api/risco`, com `temp`, `bpm` e `umid`. O monitor serial continua mostrando a mesma linha.

### Backend (`backend/`)

`model.py` carrega `cardioia_modelo_risco.pkl`, a árvore de decisão da Fase 6. Ela espera dez campos: idade média, carga do sistema, tempo de espera, frequência cardíaca, SpO2, pressão sistólica, temperatura, densidade de eventos, eventos em 24 h e disponibilidade de recursos. O sensor mede três. A umidade fica registrada na resposta e não entra no modelo. Cada campo que não veio na requisição recebe um valor de cenário calmo, e a resposta lista o que foi preenchido. Número fora da faixa é recusado.

`agentes.py` aplica, sobre esses dez números, as dez regras de protocolo da Fase 6. A resposta só segue adiante se tiver probabilidade entre 0 e 1, classe alto ou baixo risco, e uma lista de protocolos. As últimas 20 análises ficam em memória. Os quatro agentes da Fase 6 (orquestrador, analista de risco, especialista em protocolos e planejador) só escrevem um relatório se `OPENAI_API_KEY` estiver definida. O número mostrado na tela é o da árvore.

`app.py` publica essas funções em HTTP. No chat, a frase segue para o Watson da Fase 5 quando `WATSON_API_KEY`, `WATSON_URL`, `WATSON_ASSISTANT_ID` e `WATSON_ENVIRONMENT_ID` estão no ambiente. Sem essas variáveis, ou se a IBM não responder, entram os textos locais sobre sintomas de infarto, triagem e emergência (SAMU 192). A chave fica em `backend/.env` e não vai para o Git.

No treino, a temperatura ficou em torno de 24 °C, e o pico só era marcado com pelo menos duas condições da base ao mesmo tempo. O protocolo de febre usa 38 °C. Um batimento de 132 bpm, com o restante calmo, aciona o monitoramento e a árvore permanece em baixo risco.

### Portal web (`web/`)

Portal em React + Vite, trazido das fases anteriores. O login é simulado: `medico@cardioia.com` / `123456` gera um token guardado no navegador e libera leituras, pacientes, consultas, novo agendamento e o assistente. Pacientes e consultas leem registros fictícios em `src/services/mockData.js`. A página Leituras envia os dois casos para `POST /api/risco`, guarda as últimas 20 respostas e abre o detalhe ao clicar: horário, temperatura, batimento, probabilidade, classe e protocolos. A página Assistente envia a frase para `POST /api/chat`. O `vercel.json` pede à Vercel que entregue `index.html` em qualquer endereço, para rotas como `/leituras` abrirem direto.

### Aplicativo (`mobile/`)

App Expo criado nesta fase, com o mesmo login do portal. Depois de entrar, a tela de dados cardíacos oferece duas leituras. "Leitura estável" envia 36,5 °C e 78 bpm. "Sinais acima do limite" envia 38,6 °C e 132 bpm. As duas chamam `POST /api/risco` e mostram classe, probabilidade e protocolos.

`app.json` identifica o Android como `br.com.fiap.cardioia`. `eas.json`, no perfil `preview`, pede um APK instalável fora da Play Store.

## Executar

Requisitos: Python 3.10 ou superior e Node.js. O modelo foi salvo com scikit-learn 1.9.1. Python 3.9 carrega o arquivo com aviso de versão.

Suba a API antes do portal e do aplicativo.

### API

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Disponível em `http://127.0.0.1:5000`.

| Método | Rota | Retorno |
| --- | --- | --- |
| `POST` | `/api/risco` | Probabilidade, classe e protocolos |
| `GET` | `/api/historico` | Últimas 20 análises |
| `POST` | `/api/chat` | Orientação sobre sintomas, triagem ou emergência |
| `GET` | `/api/saude` | Confirma que a API está no ar |

### Portal web

```bash
cd web
npm install
npm run dev
```

Acesse `http://localhost:5173`.

Login, também usado no aplicativo: `medico@cardioia.com` / `123456`.

### Aplicativo

```bash
cd mobile
npm install
npx expo start
```

Abra com o aplicativo Expo Go, no mesmo Wi-Fi do computador. No celular, `127.0.0.1` é o próprio aparelho. Para as leituras chegarem na API que está no computador, suba o Expo com o IP da máquina:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP:5000 npx expo start
```

O APK para instalar no celular é gerado na nuvem do Expo, no perfil `preview`:

```bash
eas build -p android --profile preview
```

O identificador Android é `br.com.fiap.cardioia`.

### Sensor

No [Wokwi](https://wokwi.com), crie um projeto MicroPython para ESP32 e use `iot/diagram.json` e `iot/main.py`. O circuito, o buffer e os limites do LED estão descritos em Módulos.

## Repositório

| Pasta | Conteúdo |
| --- | --- |
| `web/` | Portal em React + Vite e `vercel.json` para as rotas da aplicação |
| `mobile/` | Aplicativo Expo, `app.json` e `eas.json` |
| `backend/` | API, modelo `cardioia_modelo_risco.pkl`, validação da previsão e protocolos |
| `iot/` | Código MicroPython e circuito do Wokwi |
| `docs/` | Pasta do relatório em PDF. O arquivo ainda não está no repositório |

## Publicação

- **API:** https://chap01-phase07-cardioai.onrender.com
- **Web:** URL da Vercel
- **Android:** link do APK no painel do Expo
- **Simulação:** https://wokwi.com/projects/480298841772684289
- **Relatório:** `docs/`
