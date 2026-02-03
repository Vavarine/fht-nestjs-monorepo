import { InMemoryCartsRepository } from '@test/repositories/in-memory-carts-repository';
import { Customer } from '@api/application/entities/customer';
import { Cart } from '@api/application/entities/carts';
import { CustomerNotFound } from '../../errors/customer-error';
import { CreateCart } from './create';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-cutomers-repository';

describe('CreateCart', () => {
    let createCart: CreateCart;
    let cartsRepository: InMemoryCartsRepository;
    let customerRepository: InMemoryCustomersRepository;

    beforeEach(() => {
        cartsRepository = new InMemoryCartsRepository();
        customerRepository = new InMemoryCustomersRepository();
        createCart = new CreateCart(cartsRepository);
    });

    describe('when customerId is provided (from Lambda/Cognito)', () => {
        it('should create a cart with the provided customerId', async () => {
            const cognitoCustomerId = 'cognito-sub-12345';
            const request = { customerId: cognitoCustomerId };
            const response = await createCart.execute(request);

            expect(response).toHaveProperty('cart');
            expect(response.cart).toBeInstanceOf(Cart);
            expect(response.cart.customerId).toBe(cognitoCustomerId);
            expect(response.cart.items).toEqual([]);

            const savedCart = await cartsRepository.findById(response.cart.id);
            expect(savedCart).not.toBeNull();
            expect(savedCart?.customerId).toBe(cognitoCustomerId);
            expect(savedCart?.items).toEqual([]);
        });

        it('should use customerId even when CPF is also provided', async () => {
            const cognitoCustomerId = 'cognito-sub-67890';
            const request = { cpf: '12345678901', customerId: cognitoCustomerId };
            const response = await createCart.execute(request);

            expect(response.cart.customerId).toBe(cognitoCustomerId);
            expect(response.cart.items).toEqual([]);
        });

        it('should create multiple carts with different customerId', async () => {
            const customerId1 = 'cognito-sub-111';
            const customerId2 = 'cognito-sub-222';

            const response1 = await createCart.execute({ customerId: customerId1 });
            const response2 = await createCart.execute({ customerId: customerId2 });

            expect(response1.cart.id).not.toBe(response2.cart.id);
            expect(response1.cart.customerId).toBe(customerId1);
            expect(response2.cart.customerId).toBe(customerId2);
        });
    });

    describe('when no customerId is provided (anonymous cart)', () => {
        it('should create an anonymous cart', async () => {
            const request = {
                customerId: null
            };
            const response = await createCart.execute(request);

            expect(response).toHaveProperty('cart');
            expect(response.cart).toBeInstanceOf(Cart);
            expect(response.cart.customerId).toBeUndefined();
            expect(response.cart.items).toEqual([]);

            const savedCart = await cartsRepository.findById(response.cart.id);
            expect(savedCart).not.toBeNull();
            expect(savedCart?.customerId).toBeUndefined();
            expect(savedCart?.items).toEqual([]);
        });

        it('should create anonymous cart when customerId is empty string', async () => {
            const request = { customerId: '' };
            const response = await createCart.execute(request);
            expect(response.cart.customerId).toBeUndefined();
            expect(response.cart.items).toEqual([]);
        });

        it('should create anonymous cart when customerId is undefined', async () => {
            const request = { customerId: null };
            const response = await createCart.execute(request);
            expect(response.cart.customerId).toBeUndefined();
            expect(response.cart.items).toEqual([]);
        });
    });

    describe('cart creation', () => {
        it('should create multiple carts with different IDs', async () => {
            const customerId1 = 'cognito-sub-aaa';
            const customerId2 = 'cognito-sub-bbb';

            const response1 = await createCart.execute({ customerId: customerId1 });
            const response2 = await createCart.execute({ customerId: customerId2 });
            const response3 = await createCart.execute({ customerId: null });

            expect(response1.cart.id).not.toBe(response2.cart.id);
            expect(response1.cart.id).not.toBe(response3.cart.id);
            expect(response2.cart.id).not.toBe(response3.cart.id);

            expect(response1.cart.customerId).toBe(customerId1);
            expect(response2.cart.customerId).toBe(customerId2);
            expect(response3.cart.customerId).toBeUndefined();
        });

        it('should initialize cart with empty items array', async () => {
            const customerId = 'cognito-sub-ccc';
            const response = await createCart.execute({ customerId });
            
            expect(response.cart.items).toEqual([]);
            expect(Array.isArray(response.cart.items)).toBe(true);
            expect(response.cart.items.length).toBe(0);
        });

        it('should handle anonymous cart creation', async () => {
            const response = await createCart.execute({ customerId: null });
            
            expect(response.cart.customerId).toBeUndefined();
            expect(response.cart.items).toEqual([]);

            const savedCart = await cartsRepository.findById(response.cart.id);
            expect(savedCart).not.toBeNull();
            expect(savedCart?.customerId).toBeUndefined();
        });
    });
});