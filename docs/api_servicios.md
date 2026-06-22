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
7. [Reservas — Endpoints](#reservas--endpoints)
8. [Reservas — DTOs](#reservas--dtos)
9. [Finanzas — Endpoints](#finanzas--endpoints)
10. [Finanzas — DTOs](#finanzas--dtos)
11. [Manejo de errores](#manejo-de-errores)


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

### `TipoMovimiento`
```
INGRESO | EGRESO
```

### `TipoReserva`
```
COMUN | COLABORACION_SIN_FINES_DE_LUCRO
```

### `Concepto`
```
PAGO_RESERVA | PAGO_CUOTA | UTE | OSE | ANTEL | SUELDOS | BARRACA | OTROS
```
---

## DTOs Compartidos

### `PageRequestDto` — query params de paginación
| Campo        | Tipo    | Obligatorio | Validación                        | Default |
|--------------|---------|-------------|-----------------------------------|---------|
| `page`       | integer | No          | >= 0                              | 0       |
| `size`       | integer | No          | > 0, máximo 100                   | 1       |
| `sortField`  | string  | No          | Valores permitidos según endpoint | —       |
| `sortOrder`  | string  | No          | `ASC` o `DESC`                    | `ASC`   |

> Si `sortField` no se envía o está vacío, los resultados no tienen ordenamiento explícito. Si `sortField` se envía y `sortOrder` se omite, se usa `ASC` por defecto.

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

| Param         | Tipo            | Validación                                             |
|---------------|-----------------|--------------------------------------------------------|
| `nombre`      | string          | máx 100 caracteres                                     |
| `procedencia` | `Procedencia`   | —                                                      |
| `estado`      | `EstadoServicio`| —                                                      |
| `page`        | integer         | >= 0, default 0                                        |
| `size`        | integer         | 1–100, default 1                                       |
| `sortField`   | string          | `nombre`, `precioParticular`, `precioSocio`            |
| `sortOrder`   | string          | `ASC` o `DESC`, default `ASC`                          |

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
    "fechaEntrada": "2025-06-01",
    "fechaSalida": "2025-06-03",
    "pago": true,
    "estado": "CONFIRMADA"
  }
]
```

| Campo         | Tipo               | Descripción                      |
|---------------|--------------------|----------------------------------|
| `id`          | integer            | ID de la reserva                 |
| `clienteId`   | integer            | ID del cliente                   |
| `fechaEntrada`| string `LocalDate` | Día de entrada (`yyyy-MM-dd`)    |
| `fechaSalida` | string `LocalDate` | Día de salida (`yyyy-MM-dd`)     |
| `pago`        | boolean            | Si la reserva fue pagada         |
| `estado`      | `EstadoReserva`    | Estado actual de la reserva      |

---

### `GET /api/v1/servicios/{id}/fechas-ocupadas`
Retorna las reservas activas del servicio que se solapan con la ventana `[desde, hasta]`, para alimentar el calendario de reservas (días ocupados). Devuelve una fila por reserva (rango `[fechaInicio, fechaFin]`), no un día por fila.

**Path param:** `id` — integer positivo

**Query params:**

| Param   | Tipo                | Descripción                              |
|---------|---------------------|------------------------------------------|
| `desde` | string `yyyy-MM-dd` | obligatorio, inicio de la ventana        |
| `hasta` | string `yyyy-MM-dd` | obligatorio, fin de la ventana inclusive |

**Reglas:**
- Solo se incluyen reservas en estado `PENDIENTE`, `CONFIRMADA` o `EN_CURSO`.
- Una reserva es ocupante si su rango `[entrada, salida]` se solapa con la ventana (solapamiento inclusivo: el día de salida cuenta como ocupado).
- Las fechas se devuelven completas, aunque la reserva empiece antes de `desde` o termine después de `hasta`.
- `desde` debe ser ≤ `hasta` → si no, 400 (`RANGO_FECHAS_INVALIDO`).

**Respuesta 200:**
```json
[
  {
    "reservaId": 12,
    "estado": "CONFIRMADA",
    "fechaInicio": "2026-06-10",
    "fechaFin": "2026-06-12"
  }
]
```

| Campo         | Tipo            | Descripción                                  |
|---------------|-----------------|----------------------------------------------|
| `reservaId`   | integer         | ID de la reserva ocupante                    |
| `estado`      | `EstadoReserva` | Estado de la reserva                         |
| `fechaInicio` | string `LocalDate` | Día de entrada (`yyyy-MM-dd`)             |
| `fechaFin`    | string `LocalDate` | Día de salida (`yyyy-MM-dd`)             |

**Errores:**

| Status | Código                   | Caso                                      |
|--------|--------------------------|-------------------------------------------|
| 400    | `ID_INVALIDO`            | `id` no es entero positivo                |
| 400    | `RANGO_FECHAS_INVALIDO`  | `desde` > `hasta`                         |
| 404    | `SERVICIO_NO_ENCONTRADO` | el servicio no existe                     |

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
  fechaEntrada: string   // LocalDate yyyy-MM-dd
  fechaSalida: string    // LocalDate yyyy-MM-dd
  pago: boolean
  estado: EstadoReserva
}
```

#### `ServicioReservaOcupacionDto` — ítem en fechas ocupadas
```typescript
{
  reservaId: number
  estado: EstadoReserva
  fechaInicio: string    // LocalDate yyyy-MM-dd
  fechaFin: string       // LocalDate yyyy-MM-dd
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
| `sortField`     | string         | `nombreCompleto`, `cedula`, `numeroSocio`                                                  |
| `sortOrder`     | string         | `ASC` o `DESC`, default `ASC`                                                              |

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

### `PATCH /api/v1/clientes/socios/{id}/baja`
Da de baja a un socio y cancela automáticamente todas sus reservas futuras en estado `PENDIENTE` o `CONFIRMADA` (incluso las pagas).

**Path param:** `id` — integer positivo

**Respuesta 204:** No Content

**Errores:**

| HTTP Status | Código                  | Cuándo ocurre                                    |
|-------------|-------------------------|--------------------------------------------------|
| 400         | `ID_INVALIDO`           | El `id` no es un número positivo                 |
| 404         | `SOCIO_NO_ENCONTRADO`   | No existe un socio con ese `id`                  |

---

### `GET /api/v1/clientes/socios/{id}/estado`
Devuelve el estado actual de un socio puntual (`ACTIVO`, `INACTIVO` o `DE_BAJA`) sin traer su detalle completo. Es de solo lectura: no modifica ningún dato.

**Path param:** `id` — integer positivo

**Respuesta 200:**
```json
{
  "id": 1,
  "estado": "ACTIVO",
  "numeroSocio": 5
}
```

**Errores:**

| HTTP Status | Código                  | Cuándo ocurre                                                          |
|-------------|-------------------------|-----------------------------------------------------------------------|
| 400         | `ID_INVALIDO`           | El `id` no es un número positivo                                      |
| 404         | `SOCIO_NO_ENCONTRADO`   | No existe un socio con ese `id` (inexistente o corresponde a un particular) |

---

### `PUT /api/v1/clientes/particulares/{id}`
Modifica los datos de un cliente particular.

**Path param:** `id` — integer positivo. Si no es positivo retorna 400 con código `ID_INVALIDO`.

**Body** (`application/json`):
```json
{
  "cedula": "12345672",
  "nombreCompleto": "Laura Fernández",
  "telefono": "099222222",
  "mail": "laura@mail.com",
  "notas": "Prefiere contacto por WhatsApp"
}
```

| Campo            | Tipo   | Obligatorio | Validación                                      |
|------------------|--------|-------------|-------------------------------------------------|
| `cedula`         | string | Sí          | no vacío, algoritmo de cédula uruguaya, única   |
| `nombreCompleto` | string | Sí          | no vacío                                        |
| `telefono`       | string | Sí          | no vacío                                        |
| `mail`           | string | No          | formato email válido si se envía, único         |
| `notas`          | string | No          | —                                               |

**Respuestas:**
- `200` — cliente modificado; mismo body que `GET /api/v1/clientes/{id}`
- `400` — campo obligatorio faltante o vacío (código `SOLICITUD_INVALIDA`), o id inválido (código `ID_INVALIDO`)
- `404` — el id no corresponde a un Particular (no existe o es un Socio) (código `CLIENTE_NO_ENCONTRADO`)

---

### `PUT /api/v1/clientes/socios/{id}`
Modifica los datos de un socio.

**Path param:** `id` — integer positivo. Si no es positivo retorna 400 con código `ID_INVALIDO`.

**Body** (`application/json`):
```json
{
  "cedula": "12345678",
  "nombreCompleto": "Juan Pérez",
  "telefono": "099111111",
  "mail": "juan@mail.com",
  "notas": null,
  "fechaNacimiento": "1990-01-01",
  "pais": "Uruguay",
  "departamento": "Montevideo",
  "ciudad": "Montevideo",
  "direccion": "Av. 18 de Julio 100",
  "metodoCobro": "EN_SEDE"
}
```

| Campo             | Tipo           | Obligatorio | Validación                                      |
|-------------------|----------------|-------------|-------------------------------------------------|
| `cedula`          | string         | Sí          | no vacío, algoritmo de cédula uruguaya, única   |
| `nombreCompleto`  | string         | Sí          | no vacío                                        |
| `telefono`        | string         | Sí          | no vacío                                        |
| `mail`            | string         | No          | formato email válido si se envía, único         |
| `notas`           | string         | No          | —          |
| `fechaNacimiento` | string (date)  | Sí          | `yyyy-MM-dd` |
| `pais`            | string         | Sí          | no vacío   |
| `departamento`    | string         | Sí          | no vacío   |
| `ciudad`          | string         | Sí          | no vacío   |
| `direccion`       | string         | Sí          | no vacío   |
| `metodoCobro`     | `MetodoCobro`  | Sí          | —          |

> Campos no modificables: `numeroSocio`, `estado`, `fechaIngreso`, `mesesSinPagar`, `fechaUltimoPago`.

**Respuestas:**
- `200` — socio modificado; mismo body que `GET /api/v1/clientes/{id}`
- `400` — campo obligatorio faltante o vacío (código `SOLICITUD_INVALIDA`), o id inválido (código `ID_INVALIDO`)
- `404` — el id no corresponde a un Socio (no existe o es un Particular) (código `CLIENTE_NO_ENCONTRADO`)

---

### `POST /api/v1/clientes/socios`
Registra un nuevo cliente de tipo socio.

**Body** (`application/json`):
```json
{
  "cedula": "1.234.567-8",
  "nombreCompleto": "Juan Pérez",
  "fechaNacimiento": "1990-05-10",
  "telefono": "099123456",
  "email": "juan@mail.com",
  "metodoCobro": "EFECTIVO",
  "pais": "Uruguay",
  "departamento": "Montevideo",
  "ciudad": "Montevideo",
  "direccion": "Av. Italia 1234",
  "observaciones": "Sin observaciones"
}
```

| Campo             | Tipo           | Obligatorio | Validación                                    |
|-------------------|----------------|-------------|-----------------------------------------------|
| `cedula`          | string         | Sí          | no vacío, algoritmo de cédula uruguaya, única |
| `nombreCompleto`  | string         | Sí          | no vacío                                      |
| `fechaNacimiento` | string (date)  | Sí          | `yyyy-MM-dd`                                  |
| `telefono`        | string         | Sí          | no vacío                                      |
| `email`           | string         | No          | formato email válido si se envía, único (case-insensitive) |
| `metodoCobro`     | `MetodoCobro`  | Sí          | —                                             |
| `pais`            | string         | Sí          | no vacío                                      |
| `departamento`    | string         | Sí          | no vacío                                      |
| `ciudad`          | string         | Sí          | no vacío                                      |
| `direccion`       | string         | No          | —                                             |
| `observaciones`   | string         | No          | —                                             |

> La cédula se normaliza automáticamente (se eliminan puntos y guión). El socio se crea con estado `ACTIVO`, `mesesSinPagar = 0` y `fechaIngreso` igual a la fecha actual. El `numeroSocio` se asigna de forma incremental.

**Respuesta 201:** mismo body que `GET /api/v1/clientes/{id}`

**Errores:**

| HTTP Status | Código              | Cuándo ocurre                                                 |
|-------------|---------------------|---------------------------------------------------------------|
| 400         | `SOLICITUD_INVALIDA`| Campo obligatorio faltante, vacío, o `metodoCobro` inválido  |
| 400         | `CEDULA_INVALIDA`   | La cédula no cumple el algoritmo de validación uruguayo       |
| 400         | `CEDULA_DUPLICADA`  | Ya existe un cliente con esa cédula                           |
| 400         | `EMAIL_INVALIDO`    | El email no tiene formato válido                              |
| 400         | `EMAIL_DUPLICADO`   | Ya existe un cliente con ese email                            |
| 401         | —                   | Token ausente, inválido o expirado                            |

---
### `POST /api/v1/clientes/particulares`
Registra un nuevo cliente de tipo particular.

**Body** (`application/json`):
```json
{
  "cedula": "1.234.567-8",
  "nombre": "Laura Fernández",
  "celular": "099222222",
  "mail": "laura@mail.com"
}
```
| Campo     | Tipo     | Obligatorio | Validación                     |
|-----------|----------|-------------|--------------------------------|
| `cedula`  | string   | Sí          | no vacío, cédula válida, única |
| `nombre`  | string   | Sí          | no vacío                       |
| `celular` | string   | Sí          | no vacío                       |
| `mail`    | string   | No          | —                              |


> El campo celular se persiste como telefono. La cédula se normaliza automáticamente, eliminando puntos y guion.

**Respuesta 201:** mismo body que GET `/api/v1/clientes/{id}`

**Errores:**

| HTTP Status | Código                | Cuándo ocurre                              |
|-------------|-----------------------|---------------------------------------------|
| 400         | `SOLICITUD_INVALIDA`  | Campo obligatorio faltante o vacío          |
| 400         | `CEDULA_INVALIDA`     | La cédula no cumple la validación definida  |
| 400         | `CEDULA_DUPLICADA`    | Ya existe un cliente con esa cédula         |
| 401         | —                     | Token ausente, inválido o expirado          |
---

## Clientes — DTOs

### Request DTOs

#### `RegistroSocioRequestDto` — body en `POST /api/v1/clientes/socios`
```typescript
{
  cedula: string              // obligatorio, algoritmo cédula uruguaya, única
  nombreCompleto: string      // obligatorio, no vacío
  fechaNacimiento: string     // obligatorio, LocalDate yyyy-MM-dd
  telefono: string            // obligatorio, no vacío
  email?: string              // opcional, formato email válido si se envía, único (case-insensitive)
  metodoCobro: MetodoCobro    // obligatorio
  pais: string                // obligatorio, no vacío
  departamento: string        // obligatorio, no vacío
  ciudad: string              // obligatorio, no vacío
  direccion?: string          // opcional
  observaciones?: string      // opcional
}
```

#### `ModificacionParticularRequestDto` — body en `PUT /api/v1/clientes/particulares/{id}`
```typescript
{
  cedula: string          // obligatorio, algoritmo cédula uruguaya, única
  nombreCompleto: string  // obligatorio, no vacío
  telefono: string        // obligatorio, no vacío
  mail?: string           // opcional, formato email válido si se envía, único
  notas?: string          // opcional
}
```

#### `ModificacionSocioRequestDto` — body en `PUT /api/v1/clientes/socios/{id}`
```typescript
{
  cedula: string              // obligatorio, algoritmo cédula uruguaya, única
  nombreCompleto: string      // obligatorio, no vacío
  telefono: string            // obligatorio, no vacío
  mail?: string               // opcional, formato email válido si se envía, único
  notas?: string              // opcional
  fechaNacimiento: string     // obligatorio, LocalDate yyyy-MM-dd
  pais: string                // obligatorio, no vacío
  departamento: string        // obligatorio, no vacío
  ciudad: string              // obligatorio, no vacío
  direccion: string           // obligatorio, no vacío
  metodoCobro: MetodoCobro    // obligatorio
}
```

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
## Reservas — Endpoints

### `POST /api/v1/reservas`
Crea una nueva reserva. Soporta tres variantes de cliente:
- **Cliente existente**: enviar `clienteId`.
- **Crear cliente en el momento**: enviar `crearCliente: true` con los datos del cliente.
- **Colaboración sin cliente del sistema**: enviar `rut` (solo válido para `tipoReserva: COLABORACION_SIN_FINES_DE_LUCRO`).

**Body** (`application/json`):
```json
{
  "tipoReserva": "COMUN",
  "procedencia": "CAMPING",
  "servicioId": 3,
  "fechaInicio": "2026-08-10",
  "fechaFin": "2026-08-15",
  "cantidadTotal": 4,
  "cantidadMenores": 1,
  "cantidad": null,
  "clienteId": 12,
  "crearCliente": false,
  "tipoCliente": null,
  "cedula": null,
  "nombre": null,
  "celular": null,
  "email": null,
  "rut": null,
  "notas": "Llegan a las 14hs"
}
```

| Campo           | Tipo            | Obligatorio | Validación                                                                       |
|-----------------|-----------------|-------------|----------------------------------------------------------------------------------|
| `tipoReserva`   | `TipoReserva`   | Sí          | —                                                                                |
| `procedencia`   | `Procedencia`   | Sí          | —                                                                                |
| `servicioId`    | integer         | Sí          | > 0, el servicio debe existir y estar habilitado                                 |
| `fechaInicio`   | string (date)   | Sí          | `yyyy-MM-dd`, no puede ser anterior a hoy                                        |
| `fechaFin`      | string (date)   | Sí          | `yyyy-MM-dd`, no puede ser anterior a `fechaInicio`                              |
| `cantidadTotal` | integer         | No          | >= 0                                                                             |
| `cantidadMenores`| integer        | No          | >= 0                                                                             |
| `cantidad`      | integer         | No          | >= 0                                                                             |
| `clienteId`     | integer         | Condicional | Requerido si `crearCliente` no es `true` y no se envía `rut`                    |
| `crearCliente`  | boolean         | No          | Si `true`, se crea un nuevo cliente particular con los campos siguientes         |
| `tipoCliente`   | `TipoCliente`   | No          | Indica el tipo de cliente a crear (pendiente de uso en cálculo de costo)         |
| `cedula`        | string          | Condicional | Requerido si `crearCliente: true`                                                |
| `nombre`        | string          | Condicional | Requerido si `crearCliente: true`                                                |
| `celular`       | string          | Condicional | Requerido si `crearCliente: true`                                                |
| `email`         | string          | No          | Solo usado si `crearCliente: true`                                               |
| `rut`           | string          | Condicional | Solo válido con `tipoReserva: COLABORACION_SIN_FINES_DE_LUCRO`; requerido si no hay `clienteId` ni `crearCliente` |
| `notas`         | string          | No          | —                                                                                |

**Estado inicial según tipo de reserva:**

| `tipoReserva`                      | Estado inicial | Importe inicial |
|------------------------------------|----------------|-----------------|
| `COMUN`                            | `PENDIENTE`    | null (se asigna al registrar pago) |
| `COLABORACION_SIN_FINES_DE_LUCRO`  | `CONFIRMADA`   | `0`             |

**Respuesta 201:**
```json
{
  "id": 42
}
```

**Errores:**

| HTTP Status | Código                                  | Cuándo ocurre                                                                  |
|-------------|-----------------------------------------|--------------------------------------------------------------------------------|
| 400         | `SOLICITUD_INVALIDA`                    | Campo obligatorio faltante o con formato inválido (validación Bean Validation) |
| 400         | `FECHA_PASADA`                          | `fechaInicio` es anterior a hoy                                                |
| 400         | `FECHA_FIN_ANTERIOR_A_INICIO`           | `fechaFin` < `fechaInicio`                                                     |
| 400         | `SERVICIO_NO_DISPONIBLE`                | El servicio no existe o está deshabilitado                                     |
| 400         | `FECHAS_SOLAPADAS`                      | El servicio ya tiene una reserva activa en ese período                         |
| 400         | `CLIENTE_REQUERIDO`                     | No se envió `clienteId`, `crearCliente` ni `rut`                              |
| 400         | `NOMBRE_REQUERIDO_PARA_CREAR_CLIENTE`   | `crearCliente: true` pero `nombre` está vacío                                  |
| 400         | `CEDULA_REQUERIDA_PARA_CREAR_CLIENTE`   | `crearCliente: true` pero `cedula` está vacío                                  |
| 400         | `CELULAR_REQUERIDO_PARA_CREAR_CLIENTE`  | `crearCliente: true` pero `celular` está vacío                                 |
| 400         | `RUT_SOLO_VALIDO_EN_COLABORACION`       | Se envió `rut` con un tipo de reserva distinto de `COLABORACION_SIN_FINES_DE_LUCRO` |
| 400         | `CEDULA_INVALIDA`                       | La cédula del nuevo cliente no pasa la validación del algoritmo uruguayo       |
| 400         | `CEDULA_DUPLICADA`                      | La cédula del nuevo cliente ya existe en el sistema                            |
| 401         | —                                       | Token ausente, inválido o expirado                                             |

---

## Reservas — DTOs

### Request DTOs

#### `ReservaCreacionRequestDto` — body en `POST /api/v1/reservas`
```typescript
{
  tipoReserva: TipoReserva       // obligatorio
  procedencia: Procedencia       // obligatorio
  servicioId: number             // obligatorio, > 0
  fechaInicio: string            // obligatorio, LocalDate yyyy-MM-dd
  fechaFin: string               // obligatorio, LocalDate yyyy-MM-dd
  cantidadTotal?: number         // opcional, >= 0
  cantidadMenores?: number       // opcional, >= 0
  cantidad?: number              // opcional, >= 0
  clienteId?: number             // condicional
  crearCliente?: boolean         // opcional
  tipoCliente?: TipoCliente      // opcional (pendiente de uso en cálculo de costo)
  cedula?: string                // condicional (requerido si crearCliente: true)
  nombre?: string                // condicional (requerido si crearCliente: true)
  celular?: string               // condicional (requerido si crearCliente: true)
  email?: string                 // opcional
  rut?: string                   // condicional (solo para COLABORACION_SIN_FINES_DE_LUCRO)
  notas?: string                 // opcional
}
```

### Response DTOs

#### `ReservaCreacionResponseDto` — respuesta de `POST /api/v1/reservas`
```typescript
{
  id: number    // ID de la reserva creada
}
```

---

## Finanzas — Endpoints

### `POST /api/v1/finanzas`

Registra manualmente un ingreso o egreso.

**Body** (`application/json`):

```json
{
  "tipoMovimiento": "INGRESO",
  "fecha": "2026-06-20",
  "importe": 1500.00,
  "concepto": "PAGO_RESERVA",
  "procedencia": "SEDE",
  "formaPago": "EFECTIVO",
  "notas": "Pago realizado en administración"
}
```

| Campo             | Tipo              | Obligatorio | Validación |
|-------------------|-------------------|-------------|------------|
| `tipoMovimiento`  | `TipoMovimiento`  | Sí          | — |
| `fecha`           | string (date)     | No          | `yyyy-MM-dd` |
| `importe`         | number (decimal)  | Sí          | > 0 |
| `concepto`        | `Concepto`        | Sí          | — |
| `procedencia`     | `Procedencia`     | Sí          | — |
| `formaPago`       | `FormaPago`       | Sí          | — |
| `notas`           | string            | No          | — |

> Si no se envía `fecha`, se utilizará la fecha actual del sistema.

**Respuesta 201:**

```json
{
  "id": 1,
  "tipoMovimiento": "INGRESO",
  "fecha": "2026-06-20",
  "importe": 1500.00,
  "concepto": "PAGO_RESERVA",
  "procedencia": "SEDE",
  "formaPago": "EFECTIVO",
  "notas": "Pago realizado en administración",
  "reservaId": null,
  "pagoCuotaId": null
}
```

**Errores:**

| HTTP Status | Código | Cuándo ocurre |
|-------------|---------|---------------|
| 400 | `SOLICITUD_INVALIDA` | Campo obligatorio faltante o valor inválido |
| 401 | — | Token ausente, inválido o expirado |

---

## Finanzas — DTOs

### Request DTOs

#### `FinanzaCrearRequestDto` — body en `POST /api/v1/finanzas`

```typescript
{
  tipoMovimiento: TipoMovimiento
  fecha?: string
  importe: number
  concepto: Concepto
  procedencia: Procedencia
  formaPago: FormaPago
  notas?: string
}
```

### Response DTOs

#### `FinanzaResponseDto`

```typescript
{
  id: number
  tipoMovimiento: TipoMovimiento
  fecha: string
  importe: number
  concepto: Concepto
  procedencia: Procedencia
  formaPago: FormaPago
  notas: string | null
  reservaId: number | null
  pagoCuotaId: number | null
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
