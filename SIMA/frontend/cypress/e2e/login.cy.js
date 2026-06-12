describe('Portal de Login SIMA (Pruebas E2E - Cypress)', () => {
  beforeEach(() => {
    // Visitar la base URL (redirige a /login)
    cy.visit('/');
  });

  it('Debería renderizar la página de login correctamente', () => {
    // Validar título y subtítulo
    cy.get('h2.welcome-text').should('have.text', '¡Bienvenido!');
    cy.get('p.subtitle-text').should('have.text', 'Ingresa tus credenciales para continuar.');

    // Validar inputs
    cy.get('input[placeholder="ejemplo@sima.edu"]').should('be.visible');
    cy.get('input[placeholder="••••••••"]').should('be.visible');
  });

  it('Debería mostrar error al ingresar credenciales inválidas', () => {
    // Escribir datos inválidos
    cy.get('input[placeholder="ejemplo@sima.edu"]').clear().type('invalido@sima.com');
    cy.get('input[placeholder="••••••••"]').clear().type('badpass');

    // Hacer click en entrar
    cy.get('button[type="submit"]').click();

    // Verificar alert custom
    cy.get('.alert-custom')
      .should('be.visible')
      .and('contain.text', 'Credenciales inválidas');
  });

  it('Debería iniciar sesión como Admin y redirigir al Dashboard de Admin', () => {
    // Escribir credenciales por defecto de admin
    cy.get('input[placeholder="ejemplo@sima.edu"]').clear().type('admin@sima.com');
    cy.get('input[placeholder="••••••••"]').clear().type('admin');

    // Clic en Entrar
    cy.get('button[type="submit"]').click();

    // Debería redirigir a /admin
    cy.url().should('include', '/admin');

    // Verificar que estamos en el dashboard (ej. título de sección)
    cy.get('h2').should('be.visible');
  });
});
