import { test, expect } from '@playwright/test';

// Ejecutar tests en serie para evitar interferencia entre sesiones de navegador
test.describe.configure({ mode: 'serial' });

test.describe('Portal de Login SIMA (Pruebas E2E - Playwright)', () => {

  test('Debería renderizar la página de login correctamente', async ({ page }) => {
    await page.goto('/login');

    // Validar título y subtítulo
    await expect(page.locator('h2.welcome-text')).toHaveText('¡Bienvenido!');
    await expect(page.locator('p.subtitle-text')).toHaveText('Ingresa tus credenciales para continuar.');

    // Validar inputs
    await expect(page.locator('input[placeholder="ejemplo@sima.edu"]')).toBeVisible();
    await expect(page.locator('input[placeholder="••••••••"]')).toBeVisible();

    // Validar botón
    await expect(page.locator('button[type="submit"]')).toHaveText('Entrar al Sistema');
  });

  test('Debería mostrar error al ingresar credenciales inválidas', async ({ page }) => {
    await page.goto('/login');

    // Limpiar y escribir datos inválidos
    const emailInput = page.locator('input[placeholder="ejemplo@sima.edu"]');
    const passInput = page.locator('input[placeholder="••••••••"]');

    await emailInput.fill('invalido@sima.com');
    await passInput.fill('badpass');

    // Hacer click en entrar
    await page.click('button[type="submit"]');

    // Verificar alert custom (aparece después de que el API responde con error)
    const errorAlert = page.locator('.alert-custom');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });
    await expect(errorAlert).toContainText('Credenciales inválidas');
  });

  test('Debería iniciar sesión como Admin y redirigir al Dashboard de Admin', async ({ page }) => {
    await page.goto('/login');

    // Limpiar y escribir credenciales de admin
    const emailInput = page.locator('input[placeholder="ejemplo@sima.edu"]');
    const passInput = page.locator('input[placeholder="••••••••"]');

    await emailInput.fill('admin@sima.com');
    await passInput.fill('admin');

    // Clic en Entrar
    await page.click('button[type="submit"]');

    // Esperar la redirección — usar domcontentloaded porque los dashboards usan lazy loading
    await page.waitForURL('**/admin', { timeout: 15000, waitUntil: 'domcontentloaded' });
    expect(page.url()).toContain('/admin');
  });
});
