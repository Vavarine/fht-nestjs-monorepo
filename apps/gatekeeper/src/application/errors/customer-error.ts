export class CustomerAlreadyExistsError extends Error {
    constructor() {
        super('Customer with this CPF already exists.');
    }
}

export class CustomerNotFound extends Error {
    constructor(cpf: string) {
        super(`Customer with cpf ${cpf} not found`);
    }
}
export class CustomerMismatchError extends Error {
    constructor() {
        super("Customer ID does not match the cart owner");
    }
}