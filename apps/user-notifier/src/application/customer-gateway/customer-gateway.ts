export interface CustomerData {
  id: string;
  name: string;
  email: string;
}

export abstract class CustomerGateway {
  abstract getById(customerId: string): Promise<CustomerData>;
}
