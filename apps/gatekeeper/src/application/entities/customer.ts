import { Replace } from "@gatekeeper/helpers/Replace";
import { randomUUID } from "node:crypto";

export interface CustomerProps {
  cpf: string;
  name: string;
  email?: string;
  createdAt: Date;
}

export class Customer {
  private _id: string;
  private props: CustomerProps;

  constructor(
    props: Replace<CustomerProps, { createdAt?: Date }>,
    id?: string,
  ) {
    this._id = id ?? randomUUID();
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
    };
  }

  get id() {
    return this._id;
  }

  get cpf() {
    return this.props.cpf;
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  update(props: Partial<Omit<CustomerProps, "createdAt">>) {
    this.props = { ...this.props, ...props };
  }
}
