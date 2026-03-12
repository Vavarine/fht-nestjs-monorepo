export class CustomerAlreadyExistsError extends Error {
  constructor() {
    super("Customer already exists.");
  }
}

export class CustomerNotFound extends Error {
  constructor(email: string) {
    super(`Customer with email ${email} not found`);
  }
}
export class CustomerMismatchError extends Error {
  constructor() {
    super("Customer ID does not match the cart owner");
  }
}
