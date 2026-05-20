export interface ClienteRow extends Record<string, unknown> {
  id: number;
  nombre: string;
  tipoCliente: string;
  numeroSocio: string;
  cedula: string;
  email: string;
  estado: string;
}
