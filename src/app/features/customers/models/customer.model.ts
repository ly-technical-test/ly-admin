export interface CustomerAddress {
  city: string;
  complement?: string;
  number?: string;
  state: string;
  street: string;
  zip: string;
  zone: string;
}

export interface Customer {
  _id: string;
  address: CustomerAddress;
  cpfCnpj: string;
  email: string;
  lytexClientId: string;
  name: string;
}

export interface CreateCustomerPayload {
  address: CustomerAddress;
  cpfCnpj: string;
  email: string;
  name: string;
}
