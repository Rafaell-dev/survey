import { test, expect } from '@playwright/test';
import { SurveyEditorPage } from './poms/SurveyEditorPage';

test.describe('Fluxo Completo de Criação de Formulário', () => {

  test('Deve criar um formulário completo e publicar', async ({ page }) => {
    // 1. Criação do Formulário
    await page.goto('/dashboard/create');
    await page.fill('input[placeholder*="Título"]', 'Pesquisa de Satisfação E2E');
    await page.fill('textarea[placeholder*="descrição"]', 'Formulário gerado automaticamente pelo Playwright');
    await page.click('button:has-text("Salvar e Continuar")');
    
    // 2. Garante que redirecionou para a tela de edição
    await expect(page).toHaveURL(/\/dashboard\/edit\/.+/);
    const editor = new SurveyEditorPage(page);

    // 3. Adicionar Blocos
    // A interface começa vazia, então adicionamos o primeiro bloco.
    await editor.addBlock('Bloco Inicial');

    // 4. Adicionar Tipos de Perguntas
    // Texto Curto
    await editor.addQuestionToLastBlock('SHORT_TEXT', 'Qual o seu nome?');
    
    // Múltipla Escolha
    await editor.addQuestionToLastBlock('MULTIPLE_CHOICE', 'Quais suas cores favoritas?');
    await editor.addOptionToLastQuestion('Azul');
    await editor.addOptionToLastQuestion('Verde');
    await editor.addOptionToLastQuestion('Vermelho');

    // Likert
    await editor.addQuestionToLastBlock('LIKERT', 'Qual o seu nível de satisfação?');

    // 5. Testar Customização (Tema) e Header Image
    await editor.uploadHeaderImage('./e2e/test-assets/dummy-image.png');
    // Espera um tempinho para o upload processar no backend
    await page.waitForTimeout(2000);
    
    // 6. Publicação
    await editor.publishSurvey();
    
    // 7. Valida geração de link
    // Após publicar, a UI muda e exibe um input text com a URL pública
    const publicLinkInput = page.locator('div[role="dialog"] input[readonly]');
    await expect(publicLinkInput).toBeVisible({ timeout: 15000 });
    
    // Verifica se a URL gerada realmente contém "/survey/"
    const urlValue = await publicLinkInput.inputValue();
    expect(urlValue).toContain('/survey/');
  });

});
