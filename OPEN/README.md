# FSPZAP - Dashboard de Monitoramento de Atendimentos WhatsApp

Painel web para monitoramento e análise de indicadores de atendimentos via WhatsApp. Permite visualizar KPIs, gráficos por agente/departamento/hora, gerar relatórios detalhados e importar dados via planilha Excel.

## Funcionalidades

### Indicadores
- **KPIs**: total de atendimentos, satisfação média, tempo médio de atendimento (TMA), cobertura de avaliação
- **Gráficos**: atendimentos por agente (barras), por departamento (pizza), distribuição por hora (linha), distribuição de avaliações (rosca)
- **Filtros**: período, atendente, departamento

### Relatório
- Tabela detalhada com paginação
- Colunas: protocolo, origem, status, atendente, departamento, nome, número, data, avaliação, tempo
- Exportação para CSV

### Importação
- Upload de planilhas Excel (.xlsx/.xls) com drag and drop
- Validação de colunas obrigatórias e opcionais
- Processamento em lotes com barra de progresso
- Upsert automático (atualiza registros existentes pelo protocolo)

## Colunas da Planilha

| Coluna | Obrigatória | Descrição |
|--------|:-----------:|-----------|
| ORIGEM | Sim | Canal de origem |
| PROTOCOLO | Sim | Identificador único do atendimento |
| STATUS | Sim | Status do atendimento |
| NUMERO | Sim | Número de telefone |
| DATA | Sim | Data/hora do atendimento |
| ATENDENTE | Não | Nome do atendente |
| DEPARTAMENTO | Não | Departamento |
| MOTIVO | Não | Motivo do contato |
| NOME | Não | Nome do cliente |
| DATA_FINALIZACAO | Não | Data/hora de finalização |
| DATA_ULTIMA_MENSAGEM | Não | Data da última mensagem |
| POSUI_ANEXO | Não | Se possui anexo (1=sim, 0=não) |
| AVALIACAO | Não | Nota de 1 a 5 |

## Stack

- **Backend**: Node.js + Express
- **Banco de dados**: Firebase Firestore
- **Frontend**: HTML/CSS/JS vanilla + Chart.js
- **Excel**: xlsx (SheetJS)

## Pré-requisitos

- Node.js >= 14
- Conta no Firebase (https://console.firebase.google.com)

## Instalação

```bash
git clone <repositorio>
cd FSPZAP
npm install
```

## Configuração do Firebase

### 1. Criar Projeto no Firebase

1. Acesse https://console.firebase.google.com
2. Clique em "Criar projeto" ou "Add project"
3. Nomeie o projeto (ex: `fspzap-dashboard`)
4. Desative o Google Analytics (opcional) e clique em "Criar projeto"

### 2. Criar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione "Em modo de teste" (para desenvolvimento)
4. Escolha a região mais próxima
5. Clique em "Ativar"

### 3. Gerar Chave de Serviço

1. No menu lateral, clique em "Configurações do projeto" (engrenagem)
2. Vá em "Contas de serviço"
3. Clique em "Gerar nova chave privada"
4. Confirme o download do arquivo JSON
5. Renomeie para `serviceAccountKey.json`
6. Coloque o arquivo na raiz do projeto

### 4. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

O arquivo `.env` deve conter:

```env
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

## Iniciar

```bash
npm start
```

Acesse http://localhost:3001

## API

Todas as rotas estão sob `/api/fspzap`:

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/kpis` | KPIs gerais (total, satisfação, TMA, cobertura) |
| GET | `/por-agente` | Atendimentos agrupados por atendente |
| GET | `/por-departamento` | Atendimentos agrupados por departamento |
| GET | `/por-hora` | Atendimentos agrupados por hora |
| GET | `/satisfacao` | Distribuição de avaliações |
| GET | `/relatorio` | Relatório paginado |
| GET | `/resumo-importacao` | Resumo da última importação |
| POST | `/import` | Importar dados via JSON (fileData, fileName, batchSize) |

### Parâmetros de filtro (query string)

- `startDate` / `endDate` — filtro por período (ISO date)
- `atendente` — filtro por atendente
- `departamento` — filtro por departamento

## Estrutura

```
FSPZAP/
├── server/
│   ├── index.js              # Servidor Express
│   ├── routes/
│   │   ├── megazap.js        # Rotas da API
│   │   └── import.js         # Lógica de importação
│   └── db/
│       ├── firebase.js       # Conexão Firebase
│       └── firebase-queries.js  # Queries Firestore
├── public/
│   ├── index.html            # Dashboard (Indicadores)
│   ├── relatorio.html        # Relatório
│   ├── importacao.html       # Importação
│   ├── css/styles.css        # Estilos
│   └── js/
│       ├── api.js            # Cliente API
│       ├── utils.js          # Utilitários
│       ├── dashboard.js      # Lógica do dashboard
│       ├── relatorio.js      # Lógica do relatório
│       └── importacao.js     # Lógica da importação
├── serviceAccountKey.json    # Chave de serviço Firebase (não commitar!)
├── .env.example              # Template de configuração
├── .env                      # Configuração local (não commitar)
└── package.json
```

## Funcionalidades Planejadas

### Chatbot WhatsApp (Em desenvolvimento - PAUSADO em 2026-07-11)

**Status**: Análise concluída, aguardando implementação

**Objetivo**: Criar chatbot automatizado para WhatsApp integrado ao dashboard

**API escolhida**: Evolution API (open-source, gratuita)

**Fluxos planejados**:
- Menu inicial com opções numéricas
- FAQ automático (respostas para perguntas frequentes)
- Coleta de dados (nome, telefone, motivo)
- Transferência para humano

**Arquivos criados**:
- `Evolution-API-Explicacao.txt` - Documentação detalhada da API
- `bot-config.json` (planejado) - Configuração dos fluxos

**Próximos passos**:
1. Instalar Evolution API (Docker)
2. Configurar webhook no MEGAZAP
3. Criar handler.js com lógica do bot
4. Integrar com Firestore (coleção fspzap_chats)
5. Adicionar página de gerenciamento no dashboard

**Onde pausamos**: Após conclusão da análise e documentação da Evolution API. Aguardando decisão do usuário para prosseguir com implementação.

---

## Segurança

- Nunca commite o arquivo `serviceAccountKey.json` no Git
- O arquivo `.env` também deve ser ignorado pelo Git
- Para produção, configure as regras de segurança do Firestore
