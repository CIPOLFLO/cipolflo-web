# API Contrato — CIPOLFLO Server

> Base URL: `http://localhost:8080`  
> Todos los endpoints requieren autenticación (Bearer Token JWT).  
> Las fechas/horas se manejan como `Instant` (ISO-8601 UTC, ej: `"2025-01-15T10:30:00Z"`).

---

## Índice

1. [Enums](#enums)
2. [DTOs Compartidos](#dtos-compartidos)
3. [Servicios — Endpoints](#servicios--endpoints)
4. [Servicios — DTOs](#servicios--dtos)
5. [Clientes — Endpoints](#clientes--endpoints)
6. [Clientes — DTOs](#clientes--dtos)
7. [Manejo de errores](#manejo-de-errores)

---

## Enums

### `Procedencia`
```
SEDE | CAMPING
```

### `EstadoServicio`
```
HABILITADO | DESHABILITADO
```

### `ModalidadPrecio`
```
POR_DIA | POR_PERSONA | POR_DIA_POR_PERSONA | POR_UNIDAD | POR_HORA
```

### `EstadoReserva`
```
PENDIENTE | CONFIRMADA | EN_CURSO | FINALIZADA | CANCELADA
```

### `TipoCliente`
```
SOCIO | PARTICULAR
```

### `EstadoSocio`
```
ACTIVO | INACTIVO | DE_BAJA
```

### `MetodoCobro`
```
COBRADORA | DESCUENTO_SALARIAL | TRANSFERENCIA | EN_SEDE | EFECTIVO
```

---

## DTOs Compartidos

### `PageRequestDto` — query params de paginación
| Campo  | Tipo    | Obligatorio | Validación               | Default |
|--------|---------|-------------|--------------------------|---------|
| `page` | integer | No          | >= 0                     | 0       |
| `size` | integer | No          | > 0, máximo 100          | 1       |

### `PageResponse<T>` — respuesta paginada
```json
{
  "content": [ /* array de T */ ],
  "page": 0,
  "size": 10,
  "totalElements": 42,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

## Servicios — Endpoints

### `GET /api/v1/servicios`
Retorna el listado paginado de servicios con filtros opcionales.

**Query params** (todos opcionales):

| Param         | Tipo            | Validación        |
|---------------|-----------------|-------------------|
| `nombre`      | string          | máx 100 caracteres |
| `procedencia` | `Procedencia`   | —                 |
| `estado`      | `EstadoServicio`| —                 |
| `page`        | integer         | >= 0, default 0   |
| `size`        | integer         | 1–100, default 1  |

**Respuesta 200:**
```json
{
  "content": [
    {
      "id": 1,
      "nombre": "Cancha de tenis",
      "procedencia": "SEDE",
      "precioParticular": 5000.00,
      "precioSocio": 2500.00,
      "modalidadPrecio": "POR_HORA",
      "estado": "HABILITADO"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

---

### `GET /api/v1/servicios/{id}`
Retorna el detalle completo de un servicio.

**Path param:** `id` — integer positivo

**Respuesta 200:**
```json
{
  "id": 1,
  "nombre": "Cancha de tenis",
  "procedencia": "SEDE",
  "cantidad": null,
  "precioSocio": 2500.00,
  "precioParticular": 5000.00,
  "capacidad": 4,
  "estado": "HABILITADO",
  "modalidadPrecio": "POR_HORA",
  "createdAt": "2025-01-10T09:00:00Z",
  "updatedAt": "2025-03-15T14:30:00Z",
  "createdBy": "admin@cipolflo.com",
  "updatedBy": "admin@cipolflo.com"
}
```

---

### `POST /api/v1/servicios`
Registra un nuevo servicio.

**Body** (`application/json`):
```json
{
  "nombre": "Pileta olímpica",
  "procedencia": "CAMPING",
  "precioSocio": 1000.00,
  "precioParticular": 2000.00,
  "modalidadPrecio": "POR_DIA",
  "capacidad": 50,
  "cantidad": null
}
```

| Campo             | Tipo             | Obligatorio | Validación                   |
|-------------------|------------------|-------------|------------------------------|
| `nombre`          | string           | Sí          | no vacío                     |
| `procedencia`     | `Procedencia`    | Sí          | —                            |
| `precioSocio`     | number (decimal) | Sí          | > 0                          |
| `precioParticular`| number (decimal) | Sí          | > 0                          |
| `modalidadPrecio` | `ModalidadPrecio`| Sí          | —                            |
| `capacidad`       | integer          | No          | > 0 si se envía              |
| `cantidad`        | integer          | No          | > 0 si se envía              |

> `capacidad` y `cantidad` son mutuamente excluyentes según el tipo de servicio. Enviar `null` o no incluir el campo que no aplica.

**Respuesta 201:** misma estructura que `GET /api/v1/servicios/{id}`

---

### `PUT /api/v1/servicios/{id}`
Reemplaza los datos de un servicio existente.

**Path param:** `id` — integer positivo

**Body** (`application/json`):
```json
{
  "nombre": "Pileta olímpica",
  "precioParticular": 2500.00,
  "precioSocio": 1200.00,
  "modalidadPrecio": "POR_DIA",
  "capacidad": 60,
  "cantidad": null
}
```

| Campo             | Tipo             | Obligatorio | Validación                  |
|-------------------|------------------|-------------|-----------------------------|
| `nombre`          | string           | Sí          | no vacío                    |
| `precioParticular`| number (decimal) | Sí          | > 0                         |
| `precioSocio`     | number (decimal) | Sí          | > 0                         |
| `modalidadPrecio` | `ModalidadPrecio`| Sí          | —                           |
| `capacidad`       | integer          | No          | >= 0 si se envía            |
| `cantidad`        | integer          | No          | >= 0 si se envía            |

> `procedencia` no es modificable. `capacidad` y `cantidad` son mutuamente excluyentes; enviar `null` o no incluir el que no aplica.

**Respuesta 200:** misma estructura que `GET /api/v1/servicios/{id}`

---

### `PATCH /api/v1/servicios/{id}/habilitacion`
Habilita o deshabilita un servicio. Al deshabilitar puede haber reservas próximas que cancelar.

**Path param:** `id` — integer positivo

**Body** (`application/json`):
```json
{
  "habilitado": false,
  "reservasACancelar": [12, 45, 78],
  "confirmarDevolucion": true
}
```

| Campo                | Tipo       | Obligatorio | Descripción                                                           |
|----------------------|------------|-------------|-----------------------------------------------------------------------|
| `habilitado`         | boolean    | Sí          | `true` = habilitar, `false` = deshabilitar                           |
| `reservasACancelar`  | integer[]  | No          | IDs de reservas a cancelar al deshabilitar (puede ser array vacío)   |
| `confirmarDevolucion`| boolean    | No          | Confirmar si se realiza devolución de pagos al cancelar reservas     |

**Respuesta 200:** misma estructura que `GET /api/v1/servicios/{id}`

---

### `GET /api/v1/servicios/{id}/reservas-proximas`
Retorna las reservas futuras/activas asociadas al servicio (útil antes de deshabilitarlo).

**Path param:** `id` — integer positivo

**Respuesta 200:**
```json
[
  {
    "id": 12,
    "clienteId": 5,
    "fechaEntrada": "2025-06-01T14:00:00Z",
    "fechaSalida": "2025-06-03T12:00:00Z",
    "pago": true,
    "estado": "CONFIRMADA"
  }
]
```

| Campo         | Tipo            | Descripción                         |
|---------------|-----------------|-------------------------------------|
| `id`          | integer         | ID de la reserva                    |
| `clienteId`   | integer         | ID del cliente                      |
| `fechaEntrada`| string (Instant)| Fecha/hora de entrada UTC           |
| `fechaSalida` | string (Instant)| Fecha/hora de salida UTC            |
| `pago`        | boolean         | Si la reserva fue pagada            |
| `estado`      | `EstadoReserva` | Estado actual de la reserva         |

---

## Servicios — DTOs

### Request DTOs

#### `ServicioRegistroRequestDto` — usado en `POST /api/v1/servicios`
```typescript
{
  nombre: string           // obligatorio, no vacío
  procedencia: Procedencia // obligatorio
  precioSocio: number      // obligatorio, > 0
  precioParticular: number // obligatorio, > 0
  modalidadPrecio: ModalidadPrecio // obligatorio
  capacidad?: number       // opcional, > 0
  cantidad?: number        // opcional, > 0
}
```

#### `ModificacionServicioDto` — usado en `PUT /api/v1/servicios/{id}`
```typescript
{
  nombre: string           // obligatorio, no vacío
  precioParticular: number // obligatorio, > 0
  precioSocio: number      // obligatorio, > 0
  modalidadPrecio: ModalidadPrecio // obligatorio
  capacidad?: number       // opcional, >= 0
  cantidad?: number        // opcional, >= 0
}
```

#### `ServicioRequestDto` — usado en `PATCH /api/v1/servicios/{id}/habilitacion`
```typescript
{
  habilitado: boolean          // obligatorio
  reservasACancelar?: number[] // opcional
  confirmarDevolucion?: boolean // opcional
}
```

#### `ListadoServiciosRequestDto` — query params en `GET /api/v1/servicios`
```typescript
{
  nombre?: string          // opcional, máx 100 chars
  procedencia?: Procedencia // opcional
  estado?: EstadoServicio  // opcional
}
```

### Response DTOs

#### `ServicioResponseDto` — respuesta de detalle
```typescript
{
  id: number
  nombre: string
  procedencia: Procedencia
  cantidad: number | null
  precioSocio: number
  precioParticular: number
  capacidad: number | null
  estado: EstadoServicio
  modalidadPrecio: ModalidadPrecio
  createdAt: string    // Instant ISO-8601 UTC
  updatedAt: string    // Instant ISO-8601 UTC
  createdBy: string
  updatedBy: string
}
```

#### `ListadoServiciosResponseDto` — ítem dentro del listado paginado
```typescript
{
  id: number
  nombre: string
  procedencia: Procedencia
  precioParticular: number
  precioSocio: number
  modalidadPrecio: ModalidadPrecio
  estado: EstadoServicio
}
```

#### `ReservaProximaResponseDto` — ítem en reservas próximas
```typescript
{
  id: number
  clienteId: number
  fechaEntrada: string   // Instant ISO-8601 UTC
  fechaSalida: string    // Instant ISO-8601 UTC
  pago: boolean
  estado: EstadoReserva
}
```

---

## Clientes — Endpoints

### `GET /api/v1/clientes`
Retorna el listado paginado de clientes con filtros opcionales.

**Query params** (todos opcionales):

| Param           | Tipo           | Validación                                                                                 |
|-----------------|----------------|--------------------------------------------------------------------------------------------|
| `tipoCliente`   | `TipoCliente`  | —                                                                                          |
| `nombre`        | string         | máx 100 caracteres                                                                         |
| `identificador` | string         | Solo dígitos (`12345678`) o formato parcial de cédula (`1.234`, `1.234.567-8`). Cualquier otro formato devuelve resultado vacío. |
| `estado`        | `EstadoSocio`  | Solo aplica a socios; combinarlo con `tipoCliente=PARTICULAR` devuelve resultado vacío     |
| `page`          | integer        | >= 0, default 0                                                                            |
| `size`          | integer        | 1–100, default 1                                                                           |

> El campo `identificador` busca por cédula o por número de socio usando el prefijo del valor ingresado (ej: `123` devuelve clientes cuya cédula o nro de socio comience con `123`). Los puntos y guiones del formato de cédula se normalizan automáticamente antes de la búsqueda.

**Respuesta 200:**
```json
{
  "content": [
    {
      "id": 1,
      "nombreCompleto": "Juan Pérez",
      "cedula": "12345678",
      "email": "juan@mail.com",
      "tipoCliente": "SOCIO",
      "numeroSocio": 5,
      "estado": "ACTIVO"
    },
    {
      "id": 2,
      "nombreCompleto": "Laura Fernández",
      "cedula": "67890123",
      "email": null,
      "tipoCliente": "PARTICULAR",
      "numeroSocio": null,
      "estado": null
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

---

### `GET /api/v1/clientes/{id}`
Retorna el detalle completo de un cliente.

**Path param:** `id` — integer positivo

**Respuesta 200:**
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "cedula": "12345678",
  "fechaNacimiento": "1990-01-01",
  "telefono": "099111111",
  "email": "juan@mail.com",
  "metodoCobro": "EN_SEDE",
  "pais": "Uruguay",
  "departamento": "Montevideo",
  "ciudad": "Montevideo",
  "direccion": "Av. 18 de Julio 100",
  "numeroSocio": 5,
  "tipoCliente": "SOCIO",
  "estado": "ACTIVO",
  "observaciones": null,
  "createdAt": "2024-03-01T10:00:00Z",
  "updatedAt": "2024-03-15T14:00:00Z",
  "createdBy": "admin@cipolflo.com",
  "updatedBy": "admin@cipolflo.com"
}
```

> Los campos `fechaNacimiento`, `metodoPago`, `pais`, `departamento`, `ciudad`, `direccion`, `numeroSocio` y `estado` son `null` para clientes de tipo `PARTICULAR`.

---

## Clientes — DTOs

### Request DTOs

#### `ListadoClientesRequestDto` — query params en `GET /api/v1/clientes`
```typescript
{
  tipoCliente?: TipoCliente   // opcional
  nombre?: string             // opcional, máx 100 chars
  identificador?: string      // opcional, solo dígitos o formato parcial de cédula
  estado?: EstadoSocio        // opcional
}
```

### Response DTOs

#### `ClienteResponseDto` — respuesta de detalle
```typescript
{
  id: number
  nombre: string
  cedula: string
  fechaNacimiento: string | null    // LocalDate ISO-8601 (yyyy-MM-dd), null para Particulares
  telefono: string
  email: string | null
  metodoCobro: MetodoCobro | null   // null para Particulares
  pais: string | null               // null para Particulares
  departamento: string | null       // null para Particulares
  ciudad: string | null             // null para Particulares
  direccion: string | null          // null para Particulares
  numeroSocio: number | null        // null para Particulares
  tipoCliente: TipoCliente
  estado: EstadoSocio | null        // null para Particulares
  observaciones: string | null
  createdAt: string                 // Instant ISO-8601 UTC
  updatedAt: string                 // Instant ISO-8601 UTC
  createdBy: string
  updatedBy: string
}
```

#### `ListadoClientesResponseDto` — ítem dentro del listado paginado
```typescript
{
  id: number
  nombreCompleto: string
  cedula: string
  email: string | null
  tipoCliente: TipoCliente
  numeroSocio: number | null   // null para Particulares
  estado: EstadoSocio | null   // null para Particulares
}
```

---

## Manejo de errores

Todos los errores retornan el siguiente body:
```json
{
  "codigo": "CODIGO_ERROR",
  "descripcion": "Mensaje legible del error"
}
```

| HTTP Status | Cuándo ocurre                                              |
|-------------|------------------------------------------------------------|
| 400         | Validación fallida en body o query params                  |
| 401         | Token ausente, inválido o expirado                         |
| 403         | Usuario autenticado sin permisos para la operación         |
| 404         | Recurso no encontrado por el ID proporcionado              |
| 409         | Conflicto de negocio (ej: deshabilitar con reservas activas sin confirmar) |
| 500         | Error interno del servidor                                 |
