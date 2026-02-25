import { Customer, CustomerProps } from './customer';

describe('Customer Entity', () => {
    it('should generate a unique id if none is provided', () => {
        const props: CustomerProps = {
            cpf: '12345678900',
            name: 'John Doe',
            email: 'john.doe@example.com',
            createdAt: new Date(),
        };

        const customer = new Customer(props);

        expect(customer.id).toBeDefined();
        expect(typeof customer.id).toBe('string');
    });

    it('should use the provided id if one is given', () => {
        const props: CustomerProps = {
            cpf: '12345678900',
            name: 'John Doe',
            email: 'john.doe@example.com',
            createdAt: new Date(),
        };

        const customId = 'custom-id-123';
        const customer = new Customer(props, customId);

        expect(customer.id).toBe(customId);
    });
});