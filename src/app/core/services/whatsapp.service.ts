import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {

  open(
    phone: string,
    message?: string
  ): void {
    const normalizedPhone =
      this.normalizePhone(phone);

    if (!normalizedPhone) {
      return;
    }

    const url =
      `https://wa.me/${normalizedPhone}` +
      (message
        ? `?text=${encodeURIComponent(message)}`
        : '');

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (!digits) {
      return '';
    }

    // Se estiver armazenando números brasileiros sem DDI,
    // acrescentamos 55.
    if (
      digits.length === 10 ||
      digits.length === 11
    ) {
      return `55${digits}`;
    }

    return digits;
  }
}
