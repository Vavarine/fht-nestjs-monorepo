import { InMemoryCustomersRepository } from "@test/repositories/in-memory-cutomers-repository";
import { InMemoryCustomerIdentityRepository } from "@test/repositories/in-memory-customer-identity-repository";
import { CreateCustomer, CreateCustomerRequest } from "./create";
import { CustomerAlreadyExistsError } from "../../errors/customer-error";

describe("CreateCustomer", () => {
  let createCustomer: CreateCustomer;
  let customerDataRepository: InMemoryCustomersRepository;
  let customerIdentityRepository: InMemoryCustomerIdentityRepository;

  beforeEach(() => {
    customerDataRepository = new InMemoryCustomersRepository();
    customerIdentityRepository = new InMemoryCustomerIdentityRepository();
    createCustomer = new CreateCustomer(
      customerIdentityRepository,
      customerDataRepository,
    );
  });

  it("should create a customer successfully", async () => {
    const request: CreateCustomerRequest = {
      name: "João Silva",
      email: "joao@example.com",
      cpf: "12345678901",
    };

    const response = await createCustomer.execute(request);

    expect(response).toHaveProperty("customerId");
    expect(typeof response.customerId).toBe("string");

    const savedCustomer = await customerDataRepository.findById(
      response.customerId,
    );
    expect(savedCustomer).not.toBeNull();
    expect(savedCustomer?.name).toBe(request.name);
    expect(savedCustomer?.email).toBe(request.email);
    expect(savedCustomer?.cpf).toBe(request.cpf);
    expect(savedCustomer?.createdAt).toBeInstanceOf(Date);
  });

  it("should be able to find created customer by CPF", async () => {
    const request: CreateCustomerRequest = {
      name: "Ana Costa",
      email: "ana@example.com",
      cpf: "11122233344",
    };

    await createCustomer.execute(request);

    const foundCustomer = await customerDataRepository.findByEmail(
      request.cpf!,
    );
    expect(foundCustomer).not.toBeNull();
    expect(foundCustomer?.name).toBe(request.name);
    expect(foundCustomer?.email).toBe(request.email);
    expect(foundCustomer?.cpf).toBe(request.cpf);
  });

  it("should create customers with different IDs", async () => {
    const request1: CreateCustomerRequest = {
      cpf: "12345678901",
      name: "Cliente 1",
      email: "cliente1@example.com",
    };

    const request2: CreateCustomerRequest = {
      cpf: "98765432100",
      name: "Cliente 2",
      email: "cliente2@example.com",
    };

    const response1 = await createCustomer.execute(request1);
    const response2 = await createCustomer.execute(request2);

    expect(response1.customerId).not.toBe(response2.customerId);

    const customer1 = await customerDataRepository.findById(
      response1.customerId,
    );
    const customer2 = await customerDataRepository.findById(
      response2.customerId,
    );

    expect(customer1?.name).toBe(request1.name);
    expect(customer2?.name).toBe(request2.name);
  });

  it("should throw CustomerAlreadyExistsError when customer with same CPF already exists", async () => {
    const existingCustomer: CreateCustomerRequest = {
      name: "João Silva",
      email: "",
      cpf: "94960766026",
    };

    await createCustomer.execute(existingCustomer);

    const newCustomer: CreateCustomerRequest = {
      name: "José Souza",
      email: "",
      cpf: "94960766026",
    };

    await expect(createCustomer.execute(newCustomer)).rejects.toThrow(
      CustomerAlreadyExistsError,
    );
  });
});
