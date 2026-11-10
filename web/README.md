# FIAP - Faculdade de Informática e Administração Paulista

<p align="center">
  <a href="https://www.fiap.com.br/">
    <img src="./src/assets/logo-fiap.png" alt="FIAP - Faculdade de Informática e Administração Paulista" border="0" width="40%" height="40%">
  </a>
</p>

## 👨‍🎓 Integrantes do Grupo

- Amanda Vieira Pires (RM566330)
- Ana Gabriela Soares Santos (RM565235)
- Bianca Nascimento de Santa Cruz Oliveira (RM561390)
- Milena Pereira dos Santos Silva (RM565464)
- Nayana Mehta Miazaki (RM565045)

## 👩‍🏫 Professores

### Tutor(a)

- Caique Nonato da Silva Bezerra

### Coordenador(a)

- André Godoi

---

# CardioIA Portal

Portal de diagnóstico cardiovascular desenvolvido em React + Vite para simulação de gerenciamento de pacientes e consultas cardiológicas.

## 🚀 Tecnologias

- React 18
- Vite
- React Router DOM
- Context API
- CSS Modules
- JSONPlaceholder (API mock)

## 📋 Funcionalidades

- ✅ Autenticação simulada com JWT fake
- ✅ Dashboard com métricas
- ✅ Listagem de pacientes
- ✅ Agendamento de consultas
- ✅ Proteção de rotas
- ✅ Filtros de busca
- ✅ Design responsivo

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/fiap-ia-2025/grupo84-cardioia-portal.git
cd grupo84-cardioia-portal
```
2. Instale as dependências:

```bash
npm install
npm install react-router-dom

```

3. Execute o projeto:

```bash
npm run dev
```

Acesse http://localhost:5173

# 🔐 Credenciais de Teste

- **Email:** medico@cardioia.com
- **Senha:** 123456

---

# 📁 Estrutura do Projeto

```text
cardioia-portal/
├── src/
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── Dashboard/
│   │   │   ├── StatsCard.jsx
│   │   │   └── RecentAppointments.jsx
│   │   └── Patients/
│   │       └── PatientCard.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── mockData.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Patients.jsx
│   │   ├── Appointments.jsx
│   │   └── NewAppointment.jsx
│   ├── hooks/
│   │   └── useAppointments.js
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md

```

# 🎯 Requisitos Atendidos

## Autenticação simulada via Context API

- Implementada no arquivo `src/contexts/AuthContext.jsx`
- Utiliza JWT fake armazenado no `localStorage`
- Proteção de rotas com componente `ProtectedRoute`

## Listagem de pacientes com API fake

- Dados mockados em `src/services/mockData.js`
- Simulação de API em `src/services/api.js`
- Integração com JSONPlaceholder para dados complementares

## Formulário de agendamento com useState e useReducer

- Página `NewAppointment.jsx` com `useState` para controle do formulário
- Hook customizado `useAppointments` com `useReducer` para gerenciamento de estado global das consultas

## Dashboard com métricas

- Cards de estatísticas em `Dashboard.jsx`
- Contagem de pacientes e consultas agendadas
- Filtros por nível de risco

## Estilização com CSS Modules

- Todos os componentes utilizam CSS Modules
- Design responsivo para mobile e desktop
- Temas consistentes em toda a aplicação

---

## 🏥 Diagnósticos Suportados e Lógica de Triagem

A lista de diagnósticos utilizada no **CardioIA** foi definida a partir da base de dados `diagnostics.csv` (Parte 1 do projeto). Embora o foco do portal seja cardiovascular, a inclusão de condições como **Gastrite**, **Ansiedade** e **Enxaqueca** é intencional e baseada no conceito médico de **Diagnóstico Diferencial**.

No contexto de um pronto-socorro cardiológico, muitos pacientes chegam com queixas de "dor no peito" ou "coração acelerado", mas a origem do problema pode ser não-cardíaca. O sistema foi treinado para distinguir esses cenários com base nos sintomas mapeados no CSV:

| Diagnóstico | Sintomas Mapeados no CSV | Justificativa para Inclusão no Portal CardioIA |
|-------------|--------------------------|------------------------------------------------|
| **Infarto Agudo do Miocárdio** | Queimação no peito, Adormecimento no braço, Dor na mandíbula | **Diagnóstico Primário**. Alvo principal do portal. |
| **Insuficiência Cardíaca** | Pés inchados, Falta de ar ao deitar, Cansaço extremo | **Diagnóstico Primário**. Condição crônica gerenciada pelo cardiologista. |
| **Pneumonia** | Sem ar, Febre, Dor ao respirar | **Diferencial Cardiovascular**: A dor torácica ventilatório-dependente é uma das principais causas de confusão com Infarto. |
| **Gastrite** | Refluxo, Queimação na garganta, Dor na boca do estômago | **Diferencial Cardiovascular**: A queimação epigástrica irradia para o tórax, simulando perfeitamente uma angina. |
| **Transtorno de Ansiedade** | Coração bate rápido, Tremor nas mãos, Pânico, Sem ar | **Diferencial Cardiovascular**: É a causa mais comum de "taquicardia" e "sensação de morte iminente" na emergência. |
| **Enxaqueca** | Lampejos na vista, Dor unilateral, Sensibilidade à luz | **Diferencial Autonômico**: Pode desencadear alterações na pressão arterial e sintomas neurológicos que afetam o sistema cardiovascular. |

**Conclusão:** O **CardioIA** não é apenas um portal de doenças cardíacas, mas um simulador inteligente de **Triagem Cardiopulmonar**, capaz de sugerir se um caso suspeito de infarto é realmente cardíaco ou se trata de uma crise de ansiedade ou refluxo, otimizando o fluxo de atendimento.

---

## 🎥 Vídeo de Demonstração

[![CardioIA — demonstração](https://img.youtube.com/vi/ohYkkbLN7ts/hqdefault.jpg)](https://youtu.be/ohYkkbLN7ts)

*Clique na imagem para assistir ao vídeo*

---

# 📝 Observações

- Todos os dados são simulados e não há integração com back-end real
- O foco principal é a aplicação dos conceitos de React, Hooks e Context API

---

# 🔄 Hooks Utilizados

| Hook                            | Local                             | Finalidade                               |
| ------------------------------- | --------------------------------- | ---------------------------------------- |
| `useState`                      | Login, NewAppointment, Patients   | Gerenciar estado local dos formulários   |
| `useEffect`                     | Dashboard, Patients, Appointments | Carregar dados na montagem do componente |
| `useContext`                    | Header, ProtectedRoute, Sidebar   | Acessar estado de autenticação global    |
| `useReducer`                    | useAppointments                   | Gerenciar estado complexo das consultas  |
| `useNavigate`                   | Login, NewAppointment             | Navegação programática entre páginas     |
| `Custom Hook (useAppointments)` | -                                 | Lógica reutilizável para consultas       |

---

# 🎨 Paleta de Cores

| Cor            | Código    | Uso                        |
| -------------- | --------- | -------------------------- |
| Roxo Principal | `#667eea` | Header, botões, gradientes |
| Roxo Escuro    | `#764ba2` | Gradientes, hover states   |
| Azul Escuro    | `#2c3e50` | Sidebar, textos principais |
| Azul Claro     | `#3498db` | Links ativos, detalhes     |
| Vermelho       | `#e74c3c` | Casos críticos, alertas    |
| Laranja        | `#f39c12` | Alto risco, avisos         |
| Verde          | `#2ecc71` | Baixo risco, sucesso       |
| Cinza Claro    | `#ecf0f1` | Bordas, backgrounds        |

---

# 📱 Responsividade

O layout se adapta aos seguintes breakpoints:

| Dispositivo | Largura        | Comportamento                   |
| ----------- | -------------- | ------------------------------- |
| Mobile      | < 768px        | Menu colapsado, cards em coluna |
| Tablet      | 768px - 1024px | Menu lateral reduzido           |
| Desktop     | > 1024px       | Layout completo                 |

---

# 🚦 Status do Projeto

✅ **Concluído**

---


