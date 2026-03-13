import { InMemoryCustomerIdentityRepository } from "@test/repositories/in-memory-customer-identity-repository";
import { CreateCustomer, CreateCustomerRequest } from "./create";
import { CustomerAlreadyExistsError } from "../../errors/customer-error";

describe("CreateCustomer", () => {
  let createCustomer: CreateCustomer;
  let customerIdentityRepository: InMemoryCustomerIdentityRepository;

  beforeEach(() => {
    customerIdentityRepository = new InMemoryCustomerIdentityRepository();
    createCustomer = new CreateCustomer(customerIdentityRepository);
  });

  it("should create a customer successfully", async () => {
    const request: CreateCustomerRequest = {
      name: "João Silva",
      email: "joao@example.com",
      password: "secret123",
    };

    const response = await createCustomer.execute(request);

    expect(response).toHaveProperty("customerId");
    expect(typeof response.customerId).toBe("string");

    const savedCustomer = await customerIdentityRepository.findById(
      response.customerId,
    );
    expect(savedCustomer).not.toBeNull();
    expect(savedCustomer?.name).toBe(request.name);
    expect(savedCustomer?.email).toBe(request.email);
    expect(savedCustomer?.createdAt).toBeInstanceOf(Date);
  });

  it("should be able to find created customer by email", async () => {
    const request: CreateCustomerRequest = {
      name: "Ana Costa",
      email: "ana@example.com",
      password: "secret123",
    };

    await createCustomer.execute(request);

    const foundCustomer = await customerIdentityRepository.findByEmail(
      request.email,
    );
    expect(foundCustomer).not.toBeNull();
    expect(foundCustomer?.name).toBe(request.name);
    expect(foundCustomer?.email).toBe(request.email);
  });

  it("should create customers with different IDs", async () => {
    const request1: CreateCustomerRequest = {
      name: "Cliente 1",
      email: "cliente1@example.com",
      password: "secret123",
    };

    const request2: CreateCustomerRequest = {
      name: "Cliente 2",
      email: "cliente2@example.com",
      password: "secret123",
    };

    const response1 = await createCustomer.execute(request1);
    const response2 = await createCustomer.execute(request2);

    expect(response1.customerId).not.toBe(response2.customerId);

    const customer1 = await customerIdentityRepository.findById(
      response1.customerId,
    );
    const customer2 = await customerIdentityRepository.findById(
      response2.customerId,
    );

    expect(customer1?.name).toBe(request1.name);
    expect(customer2?.name).toBe(request2.name);
  });

  it("should throw CustomerAlreadyExistsError when customer with same email already exists", async () => {
    const existingCustomer: CreateCustomerRequest = {
      name: "João Silva",
      email: "joao@example.com",
      password: "secret123",
    };

    await createCustomer.execute(existingCustomer);

    const newCustomer: CreateCustomerRequest = {
      name: "José Souza",
      email: "joao@example.com",
      password: "other123",
    };

    await expect(createCustomer.execute(newCustomer)).rejects.toThrow(
      CustomerAlreadyExistsError,
    );
  });
});
