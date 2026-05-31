# Project Context: Plataforma de Criação de Surveys Experimentais

## 1. Visão Geral do Produto
A plataforma é um sistema web para criação, edição, aplicação e análise de formulários/surveys experimentais. Funciona de maneira semelhante ao Google Forms, mas com foco em **recursos avançados para pesquisas acadêmicas e experimentos**.
**Diferencial Crítico:** A necessidade de **controle experimental**. O sistema não apenas coleta respostas, mas registra minuciosamente o comportamento do participante (ex: tempo por tela, interações com mídia). A plataforma deve ser flexível e reutilizável, permitindo múltiplos experimentos sem alterar o código-fonte.

## 2. Objetivo do Sistema
Permitir que pesquisadores criem, configurem, apliquem e exportem surveys experimentais personalizados, com controle avançado de fluxo, tempo e interação com estímulos multimídia.

## 3. Público-Alvo
- Pesquisadores, professores, estudantes de graduação/pós, grupos de pesquisa.
- Profissionais focados em percepção, julgamento, respostas subjetivas e análise comportamental.

## 4. Perfis de Usuário
1. **Administrador/Pesquisador**: Cria, configura, edita, aplica e acompanha experimentos. Exporta dados.
2. **Participante/Respondente**: Acessa via link, lê instruções, interage com mídias, responde perguntas e finaliza o fluxo.

## 5. Escopo e Principais Funcionalidades
- **Criação Flexível:** Criação de múltiplos surveys independentes, com título, descrição e instruções.
- **Tipos de Perguntas:** Texto (curto/longo), Múltipla escolha, Escolha única, Slider, Escala Likert, e perguntas com mídias (áudio, vídeo, imagem, ou combinação de imagem+áudio).
- **Escalas Likert Avançadas:** Personalizáveis (1 a 5, 1 a 100, etc.) e com representações visuais (números, emojis, ícones, slider, marcadores graduais, rótulos de texto). **Sempre convertidas em valor numérico no banco de dados.**
- **Organização por Blocos:** Agrupamento de perguntas e mídias em blocos independentes.
- **Lógica Condicional:** Direcionamento de fluxo entre blocos baseado nas respostas dadas pelo participante.
- **Controle de Tempo (Tracking):** Registro automático do tempo gasto por tela, por bloco e o tempo total de resposta.
- **Rastreamento de Mídia:** Registro detalhado de cliques, reproduções, pausas e finalizações de áudios e vídeos.
- **Exportação:** Geração de relatórios Excel detalhados preservando a ordem do experimento e todo o rastreamento comportamental.

## 6. Requisitos Não Funcionais (RNF)
- **RNF01 - Responsividade:** Funcionar em computadores, tablets e celulares.
- **RNF02 - Usabilidade:** Interface simples e intuitiva (inspirada no Google Forms) para usuários sem conhecimento técnico.
- **RNF03 - Flexibilidade:** Alto nível de personalização; evitar estruturas rígidas.
- **RNF04 - Segurança:** Armazenamento seguro de respostas e arquivos.
- **RNF05 - Exportação Confiável:** Dados rastreáveis, organizados e claros no Excel.
- **RNF06 - Compatibilidade Multimídia:** 
  - Áudio: MP3, WAV, OGG
  - Imagem: JPG, PNG, JPEG
  - Vídeo: MP4 ou link incorporado
- **RNF07 - Desempenho:** Carregamento eficiente de telas e mídias sem travamentos.

## 7. Regras de Negócio (RN)
- **RN01:** Todo survey deve ter um título.
- **RN02:** Não é permitido publicar surveys vazios (deve ter ao menos 1 pergunta ou bloco).
- **RN03:** Respostas visuais (emojis, sliders) devem gerar e armazenar saída numérica.
- **RN04:** O registro de tempo (por tela/bloco) deve ser automático, sem ação do participante.
- **RN05:** Tempo total calculado desde o início até a finalização.
- **RN06:** Toda interação com áudio (ex: clique para reproduzir) deve ser registrada.
- **RN07:** Após publicado e iniciada a coleta, a edição estrutural do survey pode ser restrita para manter consistência dos dados.
- **RN08:** Bloqueio de publicação se houver lógica condicional incompleta ou blocos sem destino.
- **RN09:** Validação de formatos de arquivo permitidos antes do upload.
- **RN10:** A exportação deve preservar o registro da ordem/sequência de telas acessadas por cada participante.
- **RN11:** Finalização da participação apenas após percorrer todo o fluxo definido.
- **RN12:** Completa independência entre diferentes experimentos na plataforma.

## 8. Dados a Serem Armazenados por Resposta
Para uma análise comportamental completa, os seguintes dados devem ser persistidos:
- ID do survey e do participante.
- Data/hora de início e finalização.
- Tempo total, tempo gasto por tela e por bloco.
- Perguntas respondidas, respostas selecionadas e respectivo valor numérico.
- Blocos acessados e a **ordem** em que foram acessados.
- Métricas de mídia: Quantidade de cliques no áudio, interações com vídeo/imagem (momentos de interação, reproduções, pausas).

## 9. Sugestões de Nomenclatura (Referência)
SurveyLab, ExperiForm, FormLab, Pesquisa+, LabSurvey, Percepta, ExperiSurvey.

---
*Este documento serve como a base de contexto (steering) para qualquer IA ou desenvolvedor atuando no projeto, garantindo o alinhamento com as regras experimentais e de rastreamento comportamental exigidas.*
