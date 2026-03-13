import { Replace } from "@gatekeeper/helpers/Replace";
import { randomUUID } from "node:crypto";

export interface CustomerProps {
  name: string;
  email: string;
  password?: string;
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

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  update(props: Partial<Omit<CustomerProps, "createdAt">>) {
    this.props = { ...this.props, ...props };
  }
}
