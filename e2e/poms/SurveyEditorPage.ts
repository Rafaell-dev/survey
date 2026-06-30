import { Page, Locator } from '@playwright/test';

export class SurveyEditorPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async addBlock(title: string, description?: string) {
    await this.page.click('button:has-text("Adicionar")'); // Pega tanto Primeiro Bloco quanto Novo Bloco
    const titleInputs = this.page.locator('input[placeholder*="Ex: Dados Pessoais"]');
    await titleInputs.last().fill(title);
    if (description) {
      const descInputs = this.page.locator('textarea[placeholder*="Breve introdução"]');
      await descInputs.last().fill(description);
    }
  }

  async addQuestionToLastBlock(type: string, text: string) {
    const previousCount = await this.page.locator('input[placeholder*="Digite a sua pergunta aqui"]').count();
    await this.page.click('button:has-text("Adicionar Pergunta")');
    
    // Espera o novo input de título aparecer para garantir que a pergunta foi renderizada
    const questionInputs = this.page.locator('input[placeholder*="Digite a sua pergunta aqui"]');
    await questionInputs.nth(previousCount).waitFor({ state: 'visible' });
    await questionInputs.last().fill(text);

    // Altera o select nativo para o tipo correto na última pergunta renderizada
    const typeSelects = this.page.locator('select');
    await typeSelects.last().selectOption({ value: type });
  }

  async addOptionToLastQuestion(optionText: string) {
    // Tira um screenshot para debugar o estado atual da página
    await this.page.screenshot({ path: 'test-results/debug-options.png', fullPage: true });

    // Clica no botão "Adicionar Opção" da última pergunta renderizada
    await this.page.locator('button:has-text("Adicionar Opção")').last().click();
    
    // Preenche a última opção adicionada
    const optionInputs = this.page.locator('input[placeholder*="Rótulo da Opção"]');
    await optionInputs.last().fill(optionText);
  }

  async uploadHeaderImage(filePath: string) {
    await this.page.getByRole('tab', { name: /Personalizar/i }).click(); // Vai para aba de personalização
    // Localiza o botão/área de upload de imagem de cabeçalho
    // A interface do shadcn-ui + upload button tem um input do tipo file escondido
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(filePath);
    
    // Espera a imagem carregar (normalmente o botão de upload dá lugar a um preview ou toast)
    // Opcional: aguardar toast.success
  }

  async publishSurvey() {
    await this.page.click('button:has-text("Compartilhar")');
    // Espera o modal abrir e clica no botão de publicar
    const dialog = this.page.locator('div[role="dialog"]');
    await dialog.locator('button:has-text("Publicar Survey")').click();
  }
}
