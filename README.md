# CardioIA

O CardioIA é um protótipo acadêmico de apoio à decisão para um serviço de cardiologia. Um sensor simulado mede temperatura, batimento e umidade. Uma API em Python estima a chance de um pico de risco e lista os protocolos que se aplicam. O médico acompanha as leituras no portal web e no aplicativo Android, e pode tirar dúvidas em um chat.

Os pacientes, os sinais e o modelo são simulados. O sistema não faz diagnóstico e não substitui avaliação clínica.

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

## O que o sistema faz

Quatro partes trabalham juntas:

- **Sensor.** Um circuito simulado no navegador, no [Wokwi](https://wokwi.com/projects/480298841772684289), lê temperatura e umidade e conta os pulsos de um botão como batimento. Um LED acende quando algum limite é ultrapassado. As leituras são enviadas à API.
- **API.** Recebe a leitura, completa o que o sensor não mede, consulta o modelo e devolve a probabilidade de pico, a classe e os protocolos.
- **Portal web.** Depois do login, a página Leituras mostra o que a API guardou. O Assistente responde perguntas sobre sintomas, triagem e emergência. Pacientes, consultas e novo agendamento formam uma clínica de exemplo, com registros fixos.
- **Aplicativo Android.** Usa o mesmo login e a mesma lista de leituras.

O login, no portal e no aplicativo, é `medico@cardioia.com` / `123456`. Ele só libera a navegação. Não existe cadastro de usuários.

## Como uma leitura chega na tela

1. A cada 2 segundos, o programa lê o sensor de temperatura e umidade (DHT22) da placa simulada. O botão conta pulsos. A cada 5 segundos, essa contagem vira batimentos por minuto: pulsos na janela × 12. Sem pulsos, o batimento fica em 0.
2. O LED acende se a temperatura passa de 38 °C, o batimento passa de 120 ou a umidade passa de 90%. Esse aviso fica no circuito. A classificação continua sendo feita pela API.
3. O envio para a API liga e desliga a cada 15 segundos. Enquanto está desligado, a leitura espera numa fila de até 100 amostras. Quando liga, a amostra segue com três campos: `temp`, `bpm` e `umid`. A rede do simulador (`Wokwi-GUEST`) permanece ligada. Quem alterna é só o envio.
4. A API recusa número fora da faixa. O batimento, por exemplo, precisa estar entre 0 e 250. Uma leitura recusada é descartada. Se a rede falha, a amostra continua na fila para a próxima tentativa.
5. A API completa os campos que faltam, calcula a classe e os protocolos, e guarda a análise. O portal e o aplicativo leem essa lista em **Leituras**. O botão **Atualizar** busca o que chegou desde a última consulta. O clique numa linha abre horário, temperatura, batimento, probabilidade, classe e protocolos.

A API guarda as últimas 20 análises na memória do processo. Quando o processo reinicia, a lista recomeça vazia.

## Como a API decide

Cada leitura produz duas respostas independentes.

A **classe** vem de uma árvore de decisão treinada numa base simulada de 5.000 cenários de um serviço. O rótulo dessa base, chamado pico de risco, vale 1 quando pelo menos duas destas situações ocorrem ao mesmo tempo:

- carga do sistema acima de 80%
- tempo de espera acima de 60 minutos
- saturação de oxigênio abaixo de 92%
- frequência cardíaca acima de 110 bpm
- mais de 4 eventos nas últimas 24 horas
- disponibilidade de recursos abaixo de 40%

A árvore devolve a probabilidade desse pico. A classe fica **ALTO RISCO** quando a árvore aponta o pico, e **BAIXO RISCO** no caso contrário. Na base, a temperatura representa o ambiente da simulação, em torno de 24 °C. Ela entra como dado, e não faz parte das seis situações acima.

Os **protocolos** são regras escritas. Basta uma delas para entrar na lista:

| Condição | Protocolo |
| --- | --- |
| Saturação abaixo de 88% | Suporte respiratório imediato |
| Carga do sistema acima de 85% | Abrir unidades temporárias |
| Frequência acima de 120 bpm | Monitoramento intensivo |
| Mais de 5 eventos em 24 h | Equipe de resposta rápida |
| Recursos abaixo de 30% | Redistribuir insumos |
| Espera acima de 90 minutos | Triagem emergencial |
| Temperatura acima de 38 °C | Protocolo infeccioso |
| Densidade de eventos acima de 6 | Plano de contingência |
| Pressão sistólica abaixo de 90 | Protocolo de choque |
| Classe ALTO RISCO | Estado de emergência |

Por isso as duas respostas podem divergir. Uma leitura com batimento de 132 e os demais campos no cenário calmo permanece em **BAIXO RISCO**, porque só uma das seis situações do treino está presente. O protocolo de monitoramento entra na lista, porque a frequência passou de 120.

### O que o sensor mede e o que a API completa

O modelo usa dez campos. O sensor envia temperatura, batimento e umidade. A umidade fica registrada na resposta e fica de fora do modelo. Cada campo ausente recebe o valor abaixo, e a resposta informa o que foi preenchido.

| Campo | Significado | Valor quando o sensor não envia |
| --- | --- | --- |
| `idade_media` | Idade média dos pacientes | 55 |
| `carga_sistema` | Ocupação do serviço, de 0 a 100 | 50 |
| `tempo_espera` | Espera em minutos | 30 |
| `fc_media` | Frequência cardíaca | 80, ou o `bpm` enviado |
| `spo2_media` | Saturação de oxigênio | 97 |
| `pa_sistolica` | Pressão sistólica | 120 |
| `temperatura` | Temperatura em °C | 24, ou o `temp` enviado |
| `densidade_eventos` | Concentração de eventos | 2 |
| `eventos_24h` | Eventos nas últimas 24 horas | 1 |
| `disponibilidade_recursos` | Recursos disponíveis, de 0 a 100 | 70 |

O número exibido nas telas é o da árvore e o das regras da tabela. No detalhe de uma leitura, **Gerar relatório** pede um texto a quatro agentes: o orquestrador encaminha o caso, o analista lê a probabilidade e a classe já calculadas, o especialista lê os protocolos já verificados e o planejador escreve o relatório. O texto repete esses dados e acrescenta um parágrafo de leitura para o plantão. Os agentes não calculam outro risco. Sem `OPENAI_API_KEY` no servidor, o botão avisa que eles estão indisponíveis.

### Assistente

A página Assistente envia a frase para `POST /api/chat`. Com as credenciais da IBM no servidor, a resposta vem do Watson Assistant. Sem essas credenciais, ou quando a IBM não responde, a API usa textos locais sobre sintomas de infarto, triagem e emergência (SAMU 192). Toda resposta local lembra que o conteúdo é acadêmico.

## Estrutura do repositório

| Pasta | Conteúdo |
| --- | --- |
| `iot/` | Programa do sensor em MicroPython e o circuito do Wokwi |
| `backend/` | API, modelo treinado e regras de protocolo |
| `web/` | Portal em React + Vite |
| `mobile/` | Aplicativo em Expo |
| `docs/` | Pasta reservada ao relatório em PDF |

### Sensor (`iot/`)

`main.py` roda na placa ESP32 simulada. `diagram.json` descreve o circuito: a placa, o DHT22, o botão e o LED. O projeto público está em https://wokwi.com/projects/480298841772684289.

### Backend (`backend/`)

`model.py` carrega `cardioia_modelo_risco.pkl`, valida a faixa de cada número e consulta a árvore. `agentes.py` monta os protocolos, confere se a resposta tem probabilidade entre 0 e 1, classe válida e lista de protocolos, guarda o histórico e, sob pedido, chama os quatro agentes. `app.py` publica isso em HTTP. As chaves do Watson e da OpenAI ficam em `backend/.env`, que não entra no Git. Os nomes esperados estão em `backend/.env.example`.

### Portal (`web/`)

React + Vite. O `vercel.json` faz a Vercel entregar `index.html` em qualquer endereço, para uma rota como `/leituras` abrir direto. Pacientes e consultas leem `src/services/mockData.js`.

### Aplicativo (`mobile/`)

Expo, com o mesmo login do portal. `app.json` identifica o Android como `br.com.fiap.cardioia`. `eas.json`, no perfil `preview`, gera um APK instalável fora da Play Store.

## Como executar

Requisitos: Python 3.10 ou superior e Node.js. O modelo foi salvo com scikit-learn 1.9.1. Python 3.9 abre o arquivo com aviso de versão.

### API

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

A API fica em `http://127.0.0.1:5000`. A raiz do servidor não tem página. A verificação é `GET /api/saude`.

| Método | Rota | Função |
| --- | --- | --- |
| `POST` | `/api/risco` | Recebe a leitura e devolve probabilidade, classe e protocolos |
| `GET` | `/api/historico` | Devolve as últimas 20 análises, da mais antiga para a mais recente |
| `POST` | `/api/relatorio` | Pede o texto dos agentes para uma leitura já guardada |
| `POST` | `/api/chat` | Responde uma frase sobre sintomas, triagem ou emergência |
| `GET` | `/api/saude` | Informa que a API está no ar e qual modelo está carregado |

### Portal

```bash
cd web
npm install
npm run dev
```

Abra `http://localhost:5173`. Sem a variável `VITE_API_URL`, o portal local usa `http://127.0.0.1:5000`.

### Aplicativo

```bash
cd mobile
npm install
npx expo start
```

O aplicativo consulta a API publicada. Para usar a API do computador, informe o IP da máquina. No celular, `127.0.0.1` é o próprio aparelho.

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP:5000 npx expo start
```

O Expo Go, na mesma rede do computador, abre o projeto durante o desenvolvimento. O APK é gerado na nuvem do Expo:

```bash
eas build -p android --profile preview
```

### Sensor

No Wokwi, abra o [projeto público](https://wokwi.com/projects/480298841772684289) ou crie um projeto MicroPython para ESP32 e cole `iot/diagram.json` e `iot/main.py`. O monitor serial mostra a leitura, o estado do envio e a resposta da API.

## Onde está publicado

- **API:** https://chap01-phase07-cardioai.onrender.com
- **Portal:** o endereço da Vercel entra aqui
- **Aplicativo:** o link do APK entra aqui
- **Sensor:** https://wokwi.com/projects/480298841772684289

A instância gratuita da API adormece depois de um tempo sem uso. A primeira chamada pode levar cerca de um minuto, e a lista de leituras volta vazia depois que o processo reinicia.
