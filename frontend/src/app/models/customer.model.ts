export interface Customer {
  id?: string;
  name: string;
  whatsApp: string;
  whatsAppFormatted?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
