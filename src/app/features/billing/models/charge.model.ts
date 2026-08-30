export interface Charge {
  _id: string;
  amount: number;
  createdAt: string;
  customer: string;
  description: string;
  linkBoleto?: string;
  linkCheckout: string;
  paymentMethod: string;
  status: string;
  updatedAt: string;
}

export interface CheckoutCharge extends Charge {
  boleto?: {
    barcode: string;
    digitableLine: string;
  };
  pix?: {
    qrcode: string;
  };
}

export interface PayCardPayload {
  cardNumber: string;
  chargeId: string;
  cvc: string;
  expiry: string;
  holder: string;
  method: 'cartao' | 'creditCard' | 'debitCard';
}

export interface IssueChargePayload {
  amount: number;
  customerId: string;
  description: string;
  payment_method: 'all' | 'boleto' | 'cartao' | 'pix';
}
