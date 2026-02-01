export interface Snack {
  id?: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
