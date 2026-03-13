import { Customer } from "@gatekeeper/application/entities/customer";
import { GetCustomerById } from "./get-by-id";
import { InMemoryCustomersRepository } from "@test/repositories/in-memory-cutomers-repository";
import { CustomerNotFound } from "../../errors/customer-error";

describe("GetCustomerById", () => {
  let getCustomerById: GetCustomerById;
  let customerDataRepository: InMemoryCustomersRepository;

  beforeEach(() => {
    customerDataRepository = new InMemoryCustomersRepository();
    getCustomerById = new GetCustomerById(customerDataRepository);
  });

  it("should return customer when found by ID", async () => {
    const customer = new Customer({
      name: "João Silva",
      email: "joao@example.com",
      createdAt: new Date(),
    });

    await customerDataRepository.create(customer);
    const result = await getCustomerById.execute({ customerId: customer.id });

    expect(result.customer).not.toBeNull();
    expect(result.customer.id).toBe(customer.id);
    expect(result.customer.name).toBe("João Silva");
    expect(result.customer.email).toBe("joao@example.com");
    expect(result.customer.createdAt).toBeInstanceOf(Date);
  });

  it("should throw CustomerNotFound when customer is not found by ID", async () => {
    await expect(
      getCustomerById.execute({ customerId: "non-existing-id" }),
    ).rejects.toThrow(CustomerNotFound);
  });

  it("should return correct customer when multiple customers exist", async () => {
    const customer1 = new Customer({
      name: "João Silva",
      email: "joao@example.com",

      createdAt: new Date(),
    });

    const customer2 = new Customer({
      name: "Maria Santos",
      email: "maria@example.com",

      createdAt: new Date(),
    });

    await customerDataRepository.create(customer1);
    await customerDataRepository.create(customer2);

    const result = await getCustomerById.execute({ customerId: customer2.id });

    expect(result.customer.id).toBe(customer2.id);
    expect(result.customer.name).toBe("Maria Santos");
    expect(result.customer.email).toBe("maria@example.com");
  });
});
