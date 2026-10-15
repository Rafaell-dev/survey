# 📋 Dossiê de Especificação Funcional & Arquitetura: Dashboard Principal

> **Finalidade do Documento:** Fornecer ao agente especialista em UI/UX a totalidade das regras de negócio, fluxos de interação, estados de tela, permissões, dependências de API e gaps atuais da tela principal da plataforma **div.ar**.

---

## 1. Visão Geral e Propósito do Sistema

A tela `/dashboard` é o **hub central operacional** do pesquisador/criador na plataforma **div.ar** (sistema de criação e gestão de pesquisas científicas, formulários interativos e portfólio acadêmico).

### Objetivos do Usuário na Tela:
1. Obter uma visão rápida do volume e engajamento das suas pesquisas através de métricas globais (KPIs).
2. Criar novos formulários com um clique.
3. Localizar, monitorar o status e gerenciar o ciclo de vida dos formulários existentes (Rascunho, Publicado, Arquivado).
4. Executar ações rápidas operacionais: duplicar pesquisas inteiras, exportar dados consolidados em CSV, alternar destaque no portfólio público, abrir links compartilháveis e excluir formulários.

---

## 2. Estrutura do Layout Shell (`DashboardLayout`)

A tela é renderizada dentro de um shell responsivo composto por:

### 2.1. Barra Superior Mobile (`<header className="md:hidden">`)
- **Logo da Marca:** Imagem `/div.ar 21.png`.
- **Ação Rápida:** Botão de Logout (`LogOut`) com feedback visual destrutivo.
- **Comportamento:** Fixo no topo (`sticky top-0 z-20`) com sombra sutil.

### 2.2. Barra Lateral Desktop (`<aside className="hidden md:flex">`)
- **Largura:** 256px (`w-64`), fixa na altura da tela (`h-screen sticky top-0`).
- **Cabeçalho:** Logo oficial `/div.ar 21.png`.
- **Menu de Navegação:**
  - `Painel de Controle` (`/dashboard` - ícone `LayoutDashboard`) — Ativo por padrão nesta tela.
  - `Portfólio Institucional` (`/dashboard/portfolio` - ícone `Globe`) — Gestão de perfil acadêmico, publicações e ensino.
  - `Usuários` (`/dashboard/users` - ícone `Users`) — **Visível exclusivamente para usuários com papel `ADMIN`**.
- **Rodapé do Usuário (Identidade & Sessão):**
  - Avatar circular exibindo a primeira letra do nome do usuário logado.
  - Nome do usuário e e-mail com truncamento de texto (`truncate`).
  - Botão de logout (`LogOut`) com ação assíncrona que encerra token JWT e redireciona para `/login`.

---

## 3. Cabeçalho da Página e Ações Globais

Localizado no topo do conteúdo principal:

1. **Título e Contexto:**
   - Título: `"Painel de Controle"`
   - Subtítulo: `"Visão geral dos seus formulários e atividades recentes."`
2. **Botão de Ação Primária (CTA):**
   - Rótulo: `+ Criar Formulário` (`Plus` icon).
   - Destino: Rota `/dashboard/create`.
   - Comportamento: No mobile ocupa largura total (`w-full`); no desktop é compacto (`w-auto`).

---

## 4. Seção de Métricas Globais (Cards de KPI)

Dispostos em um grid responsivo (1 coluna mobile, 3 colunas em desktop):

| Métrica | Ícone | Fonte de Dados (`useSurveyStore`) | Significado de Negócio |
| :--- | :--- | :--- | :--- |
| **Total de Formulários** | `LayoutTemplate` | `total` (da paginação de pesquisas) | Quantidade total de formulários criados na conta. |
| **Total de Respostas** | `Users` | `globalMetrics.totalResponses` | Soma agregada de todas as respostas recebidas em todos os formulários. |
| **Novas Respostas (7 dias)** | `Clock` | `+${globalMetrics.newResponses7Days}` | Incremento de respostas registradas nos últimos 7 dias. |

---

## 5. Seção de Listagem: "Formulários Recentes"

### 5.1. Controles e Filtros
- **Título de Seção:** `"Formulários Recentes"`
- **Filtro de Arquivados:**
  - Componente: `Switch` com rótulo clicável `"Mostrar Arquivados"`.
  - Comportamento: Ao alternar (`showArchived`), dispara refetch na API com query param `includeArchived=true/false`.

### 5.2. Estados da Interface (UI States)

1. **Estado de Carregamento (`loading === true`):**
   - Exibe 3 cards com placeholders animados (`animate-pulse`) simulando título, descrição e rodapé.
2. **Estado Vazio (`surveys.length === 0`):**
   - Card com borda tracejada centralizado.
   - Ícone ilustrativo em círculo com cor primária.
   - Mensagem: *"Nenhum formulário encontrado. Você ainda não criou nenhum formulário ou todos foram excluídos..."*
   - Botão de ação direta: `"Crie seu primeiro formulário"` direcionando a `/dashboard/create`.
3. **Estado de Listagem Ativa:**
   - Grid de cards responsivo: 1 coluna (mobile), 2 colunas (`md:`), 3 colunas (`lg:`).

---

## 6. Anatomia e Ações do Card de Formulário

Cada formulário é apresentado em um card clicável com as seguintes seções e interações:

```
┌──────────────────────────────────────────────────────────────┐
│ [Título do Formulário]                  [ ★ ] [ ↗ ] [ ⤓ ] [ ⧉ ] [ 🗑 ] │
│                                                              │
│ Descrição do formulário com truncamento de até 2 linhas      │
│ ...                                                          │
├──────────────────────────────────────────────────────────────┤
│ 15/10/2026                                      [ Publicado ] │
└──────────────────────────────────────────────────────────────┘
```

### 6.1. Navegação Principal do Card
- **Ação:** Clicar em qualquer área livre do card navega para `/dashboard/edit/${survey.id}` (Construtor / Builder de Perguntas e Blocos).

### 6.2. Barra de Ações Rápidas (Ícones no Cabeçalho do Card)
*Nota de implementação: Todas as ações rápidas executam `e.stopPropagation()` e `e.preventDefault()` para não disparar a navegação do card.*

1. **Destacar no Portfólio (`Star` / Estrela):**
   - **Condição:** Exibido apenas se `survey.status === 'PUBLISHED'`.
   - **Comportamento:** Alterna o estado `isHighlighted` (amarelo preenchido quando ativo). Define se a pesquisa aparece em destaque na página pública do portfólio institucional do pesquisador.
2. **Acessar Formulário Público (`ExternalLink`):**
   - **Condição:** Exibido apenas se `survey.status === 'PUBLISHED'` e houver `survey.publicSlug`.
   - **Comportamento:** Abre a URL pública `/survey/${survey.publicSlug}` em uma nova aba do navegador.
3. **Exportar CSV (`Download`):**
   - **Condição:** Exibido apenas se `survey.status === 'PUBLISHED'`.
   - **Comportamento:** Faz requisição autenticada para `GET /surveys/${id}/export/csv`, gera um Blob binário e inicia o download do arquivo `survey_${id}_export.csv`. Notifica via Toast de sucesso ou erro.
4. **Duplicar Formulário (`Copy`):**
   - **Condição:** Disponível para qualquer formulário (Rascunho, Publicado ou Arquivado).
   - **Comportamento:** Abre o **Modal de Confirmação de Duplicação**.
5. **Excluir/Arquivar Formulário (`Trash2`):**
   - **Condição:** Disponível para qualquer formulário.
   - **Comportamento:** Abre o **Modal de Confirmação de Exclusão**.

### 6.3. Conteúdo Central e Rodapé do Card
- **Título:** Truncado se for extenso.
- **Descrição:** Limitada a 2 linhas (`line-clamp-2`), com fallback para *"Nenhuma descrição fornecida."*
- **Data de Criação:** Data formatada segundo a localidade (`toLocaleDateString()`).
- **Pill de Status:**
  - `Publicado`: Verde suave (`bg-green-100 text-green-800`).
  - `Arquivado`: Vermelho suave (`bg-destructive/10 text-destructive`).
  - `Rascunho`: Cinza neutro (`bg-secondary text-secondary-foreground`).

---

## 7. Modais de Confirmação e Fluxos Críticos

Ambos os modais utilizam backdrop escurecido com desfoque (`bg-black/50 backdrop-blur-sm`) e animações de entrada:

### 7.1. Modal de Duplicação
- **Gatilho:** Clique no botão de cópia de um card.
- **Conteúdo:** Alerta que toda a árvore de blocos, questões, opções e lógicas condicionais será clonada e o novo formulário terá status inicial de **Rascunho**.
- **Ações:**
  - *Cancelar:* Fecha o modal sem alterar o estado.
  - *Sim, duplicar:* Dispara `POST /surveys/${id}/duplicate`. Exibe estado de carregamento com spinner (`Loader2`) e texto `"Duplicando..."`, desabilitando cliques concorrentes. Fecha e insere o novo item no topo da lista com Toast de confirmação.

### 7.2. Modal de Exclusão
- **Gatilho:** Clique no botão de lixeira de um card.
- **Conteúdo:** Mensagem de advertência: *"Essa ação irá remover ou arquivar este formulário. Respostas vinculadas a ele poderão deixar de ser computadas."*
- **Ações:**
  - *Cancelar:* Descarta a intenção.
  - *Sim, excluir (Botão Destrutivo):* Dispara `DELETE /surveys/${id}`, atualiza a store removendo o item da lista visual e reduzindo o contador global `total`.

---

## 8. Modelo de Dados e Integração com Backend

### 8.1. Entidade Principal (`Survey`)
```typescript
interface Survey {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  participantIdentificationType: "ANONYMOUS" | "EMAIL" | "PHONE" | "EMAIL_OR_PHONE" | "NAME_AND_EMAIL";
  allowMultipleResponses: boolean;
  publicSlug: string | null;
  publicLinkActive: boolean;
  acceptingResponses: boolean; // Indica se ainda aceita novas submissões
  isHighlighted?: boolean;     // Destaque no portfólio
  categoryId?: string | null;  // Categoria temática da pesquisa
  category?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}
```

### 8.2. Endpoints Consumidos Diretamente por Esta Tela
- `GET /surveys?page=1&limit=20&search=&includeArchived=false`
- `GET /surveys/metrics` (Retorna `{ totalResponses: number, newResponses7Days: number }`)
- `POST /surveys/${id}/duplicate`
- `PATCH /surveys/${id}` (Usado no toggle de `isHighlighted`)
- `DELETE /surveys/${id}`
- `GET /surveys/${id}/export/csv`

---

## 9. Diagnóstico de Gaps Atuais & Oportunidades para o Redesenho UI/UX

Para orientar o agente de UI/UX a elevar a experiência para um nível de excelência, os seguintes problemas e lacunas do design atual devem ser considerados:

1. **Poluição de Ações Rápidas no Card:**
   - Atualmente, podem existir até **5 botões de ícone** espremidos no canto superior direito do card. Em telas menores ou com títulos médios, o título quebra de forma agressiva.
   - *Recomendação de UX:* Utilizar um menu de contexto com dropdown (`MoreVertical` / `...`) para ações secundárias (Exportar, Duplicar, Excluir) e manter visível no card apenas ações de status/visibilidade imediata (ou ações no hover).
2. **Ausência de Campo de Busca e Filtros Avançados:**
   - O backend já possui suporte a parâmetro `search`, mas a UI atual não oferece barra de pesquisa por nome/termo, filtro por status (Rascunho vs Publicado) ou filtro por categoria temática.
3. **Controle de Paginação Inexistente na Interface:**
   - A requisição busca apenas a primeira página de 20 registros fixos. Se o usuário tiver 50 pesquisas, não há controles de navegação entre páginas.
4. **Subutilização de Indicadores de Negócio no Card:**
   - O campo `acceptingResponses` (se o formulário está ativo para receber respostas no momento ou pausado) não é visível no card.
   - O card atual não mostra o número de respostas individuais de cada formulário nem sua taxa de conversão, forçando o usuário a entrar na edição para descobrir.
5. **Alternância de Visualização (Grid vs Lista/Tabela):**
   - Usuários com dezenas de pesquisas se beneficiariam enormemente de uma visualização em tabela densa para comparação rápida.
6. **Apresentação dos KPIs:**
   - Os cards de KPI exibem apenas números brutos. Poderiam incluir mini gráficos de tendência (sparklines) ou comparativos percentuais de crescimento semana a semana.
