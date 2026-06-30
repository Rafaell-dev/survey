import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

async function globalSetup(config: FullConfig) {
  // Limpar banco de dados via script no backend (Limpa apenas pesquisas e respostas, preservando usuários admin)
  console.log('Limpando dados de teste do banco de dados...');
  const apiPath = path.resolve(__dirname, '../../survey_api');
  execSync('npx tsx scripts/clear-db.ts', { cwd: apiPath, stdio: 'inherit' });

  // Autenticação (Login)
  console.log('Realizando login para armazenar sessão de testes...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000/login');
  
  // Utiliza as credenciais locais que você já usa no ambiente
  // Ajuste o email/senha conforme necessário para o seu ambiente de teste local
  await page.fill('input[type="email"]', 'e2e@test.com');
  await page.fill('input[type="password"]', '12345678');
  await page.click('button[type="submit"]');

  // Espera a navegação para o dashboard
  await page.waitForURL('**/dashboard');

  // Salva o estado (cookies/localStorage)
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();
}

export default globalSetup;
