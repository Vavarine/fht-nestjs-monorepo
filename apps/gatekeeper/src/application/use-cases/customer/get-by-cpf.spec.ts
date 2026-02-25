import { Customer } from "@gatekeeper/application/entities/customer";
import { GetCustomerByCpf } from "./get-by-cpf";
import { InMemoryCustomersRepository } from "@test/repositories/in-memory-cutomers-repository";
import { InMemoryCustomerIdentityRepository } from "@test/repositories/in-memory-customer-identity-repository";

describe("GetCustomerByCpf", () => {
  let getCustomerByCpf: GetCustomerByCpf;
  let customerDataRepository: InMemoryCustomersRepository;
  let customerIdentityRepository: InMemoryCustomerIdentityRepository;

  beforeEach(() => {
    customerDataRepository = new InMemoryCustomersRepository();
    customerIdentityRepository = new InMemoryCustomerIdentityRepository();
    getCustomerByCpf = new GetCustomerByCpf(
      customerDataRepository,
      customerIdentityRepository,
    );
  });

  it("should return customer when found by CPF", async () => {
    const customer = new Customer({
      name: "João Silva",
      email: "joao@example.com",
      cpf: "12345678901",
      createdAt: new Date(),
    });

    await customerDataRepository.create(customer);
    const result = await getCustomerByCpf.execute("12345678901");

    expect(result).not.toBeNull();
    expect(result?.id).toBe(customer.id);
    expect(result?.name).toBe("João Silva");
    expect(result?.email).toBe("joao@example.com");
    expect(result?.cpf).toBe("12345678901");
    expect(result?.createdAt).toBeInstanceOf(Date);
  });

  it("should throw NotFoundException when customer is not found by CPF", async () => {
    await expect(getCustomerByCpf.execute("99999999999")).rejects.toThrow(
      "Customer with CPF 99999999999 not found",
    );
  });

  it("should return correct customer when multiple customers exist", async () => {
    const customer1 = new Customer({
      name: "João Silva",
      email: "joao@example.com",
      cpf: "11111111111",
      createdAt: new Date(),
    });

    const customer2 = new Customer({
      name: "Maria Santos",
      email: "maria@example.com",
      cpf: "22222222222",
      createdAt: new Date(),
    });

    const customer3 = new Customer({
      name: "Pedro Oliveira",
      email: "pedro@example.com",
      cpf: "33333333333",
      createdAt: new Date(),
    });

    await customerDataRepository.create(customer1);
    await customerDataRepository.create(customer2);
    await customerDataRepository.create(customer3);

    const result = await getCustomerByCpf.execute("22222222222");
    expect(result).not.toBeNull();
    expect(result?.id).toBe(customer2.id);
    expect(result?.name).toBe("Maria Santos");
    expect(result?.email).toBe("maria@example.com");
    expect(result?.cpf).toBe("22222222222");
  });

  it("should handle empty repository", async () => {
    await expect(getCustomerByCpf.execute("12345678901")).rejects.toThrow(
      "Customer with CPF 12345678901 not found",
    );
  });

  it("should be case sensitive for CPF search", async () => {
    const customer = new Customer({
      name: "Ana Costa",
      email: "ana@example.com",
      cpf: "12345678901",
      createdAt: new Date(),
    });

    await customerDataRepository.create(customer);
    await expect(getCustomerByCpf.execute("12345678902")).rejects.toThrow(
      "Customer with CPF 12345678902 not found",
    );
  });

  it("should return customer with all properties intact", async () => {
    const originalDate = new Date("2024-01-15T10:30:00Z");
    const customer = new Customer({
      name: "Carlos Ferreira",
      email: "carlos@example.com",
      cpf: "98765432100",
      createdAt: originalDate,
    });

    await customerDataRepository.create(customer);
    const result = await getCustomerByCpf.execute("98765432100");

    expect(result).not.toBeNull();
    expect(result?.id).toBe(customer.id);
    expect(result?.name).toBe("Carlos Ferreira");
    expect(result?.email).toBe("carlos@example.com");
    expect(result?.cpf).toBe("98765432100");
    expect(result?.createdAt).toEqual(originalDate);
  });

  it("should handle customer with minimal data", async () => {
    const customer = new Customer({
      name: "Carlos Silva",
      cpf: "55555555555",
      createdAt: new Date(),
    });

    await customerDataRepository.create(customer);

    const result = await getCustomerByCpf.execute("55555555555");
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Carlos Silva");
    expect(result?.cpf).toBe("55555555555");
    expect(result?.email).toBeUndefined();
  });
});
