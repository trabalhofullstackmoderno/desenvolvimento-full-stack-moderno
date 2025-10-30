export class EmailValidationService {
  private static readonly ALLOWED_DOMAIN = '@sou.fae.br';

  /**
   * Verifica se o email possui o domínio permitido (@sou.fae.br)
   * @param email Email a ser validado
   * @returns true se o email é válido, false caso contrário
   */
  static isValidDomain(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    return email.toLowerCase().endsWith(this.ALLOWED_DOMAIN.toLowerCase());
  }

  /**
   * Valida e normaliza um email
   * @param email Email a ser validado
   * @returns Email normalizado ou null se inválido
   */
  static validateAndNormalize(email: string): string | null {
    if (!email || typeof email !== 'string') {
      return null;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!this.isValidDomain(normalizedEmail)) {
      return null;
    }

    // Validação básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return null;
    }

    return normalizedEmail;
  }

  /**
   * Obtém o domínio permitido
   * @returns Domínio permitido
   */
  static getAllowedDomain(): string {
    return this.ALLOWED_DOMAIN;
  }
}