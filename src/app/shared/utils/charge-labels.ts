export function getPaymentMethodLabel(method: string): string {
  const methods: Record<string, string> = {
    all: 'Todos',
    boleto: 'Boleto',
    cartao: 'Cartão',
    creditCard: 'Cartão', // TODO: decidir entre Cartão ou Crédito aqui
    debitCard: 'Débito',
    pix: 'PIX',
  };

  return methods[method] ?? method;
}

export function getChargeStatusLabel(status: string): string {
  const statuses: Record<string, string> = {
    PAID: 'Pago',
    PENDING: 'Pendente',
  };

  return statuses[status] ?? status;
}
