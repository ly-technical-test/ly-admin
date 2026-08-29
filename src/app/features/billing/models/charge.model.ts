export interface Charge {
  _id: string;
  amount: number;
  createdAt: string;
  customer: string;
  description: string;
  lytexHashId: string;
  lytexId: string;
  paymentMethod: string;
  status: string;
  updatedAt: string;
}

export interface IssueChargePayload {
  amount: number;
  customerId: string;
  description: string;
  payment_method: 'all' | 'boleto' | 'cartao' | 'pix';
}
