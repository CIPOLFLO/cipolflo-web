API Contrato — CIPOLFLO Server
Base URL: http://localhost:8080
Todos los endpoints requieren autenticación (Bearer Token JWT), salvo el webhook de Telegram (/api/public/\*\*), que se autentica con un secret token propio.
Las fechas/horas se manejan como Instant (ISO-8601 UTC, ej: "2025-01-15T10:30:00Z").

Índice
Enums
DTOs Compartidos
Servicios — Endpoints
Servicios — DTOs
Clientes — Endpoints
Clientes — DTOs
Reservas — Endpoints
POST /api/v1/pago_reserva/{id}
Reservas — DTOs
Finanzas — Endpoints
Finanzas — DTOs
Integraciones — Endpoints
Ajustes — Endpoints
Ajustes — DTOs
Manejo de errores
Enums
Procedencia
SEDE | CAMPING

EstadoServicio
HABILITADO | DESHABILITADO

ModalidadPrecio
POR_DIA | POR_PERSONA | POR_DIA_POR_PERSONA | POR_UNIDAD | POR_HORA

EstadoReserva
PENDIENTE | CONFIRMADA | EN_CURSO | FINALIZADA | CANCELADA

PlazoConfirmacion
VEINTICUATRO_HORAS | TRES_MESES

PENDIENTE | CONFIRMADA | EN_CURSO | VENCIDA_SIN_PAGO | FINALIZADA | CANCELADA
VENCIDA_SIN_PAGO no se puede setear vía API: la asigna automáticamente una tarea programada diaria a las reservas EN_CURSO cuya fechaSalida ya pasó y siguen sin estar pagas. Se cierra (pasa a FINALIZADA) con PATCH /api/v1/reservas/{id}/finalizacion, igual que una reserva EN_CURSO.

TipoCliente
Plazo para confirmar (pagar seña y/o entregar documentación) una reserva antes de que se cancele automáticamente. Solo aplica cuando requiereSena y/o requiereDocumentacion son true. VEINTICUATRO_HORAS cancela 24 hs antes del inicio de la reserva; TRES_MESES cancela 3 meses antes.

TipoCliente
SOCIO | PARTICULAR | EMPRESA

EstadoSocio
ACTIVO | INACTIVO | DE_BAJA

CategoriaSocio
POLICIA_ACTIVO | POLICIA_RETIRADO | SOCIO_COMUN
MetodoCobro
COBRADORA | DESCUENTO_SALARIAL | TRANSFERENCIA | EN_SEDE | EFECTIVO

TipoMovimiento
INGRESO | EGRESO

TipoReserva
COMUN | COLABORACION_SIN_FINES_DE_LUCRO

FormaPago
EFECTIVO | TRANSFERENCIA | DEBITO | CREDITO

Concepto
PAGO_RESERVA | PAGO_CUOTA | UTE | OSE | ANTEL | SUELDOS | BARRACA | OTROS

DTOs Compartidos
PageRequestDto — query params de paginación
Campo Tipo Obligatorio Validación Default
page integer No = 0 0
size integer No 0, máximo 100 1
sortField string No Valores permitidos según endpoint —
sortOrder string No ASC o DESC ASC
Si sortField no se envía o está vacío, los resultados no tienen ordenamiento explícito. Si sortField se envía y sortOrder se omite, se usa ASC por defecto.

PageResponse<T> — respuesta paginada
{
"content": [/* array de T */],
"page": 0,
"size": 10,
"totalElements": 42,
"totalPages": 5,
"first": true,
"last": false
}
Servicios — Endpoints
GET /api/v1/servicios
Retorna el listado paginado de servicios con filtros opcionales.

Query params (todos opcionales):

Param Tipo Validación
nombre string máx 100 caracteres
procedencia Procedencia —
estado EstadoServicio —
page integer = 0, default 0
size integer 1–100, default 1
sortField string nombre, precioParticular, precioSocio
sortOrder string ASC o DESC, default ASC
Respuesta 200:

{
"content": [
{
"id": 1,
"nombre": "Cancha de tenis",
"procedencia": "SEDE",
"precioParticular": 5000.0,
"precioSocio": 2500.0,
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
GET /api/v1/servicios/{id}
Retorna el detalle completo de un servicio.

Path param: id — integer positivo

Respuesta 200:

{
"id": 1,
"nombre": "Cancha de tenis",
"procedencia": "SEDE",
"cantidad": null,
"precioSocio": 2500.0,
"precioParticular": 5000.0,
"capacidad": 4,
"costoPersonaExtra": null,
"estado": "HABILITADO",
"modalidadPrecio": "POR_HORA",
"createdAt": "2025-01-10T09:00:00Z",
"updatedAt": "2025-03-15T14:30:00Z",
"createdBy": "admin@cipolflo.com",
"updatedBy": "admin@cipolflo.com"
}
POST /api/v1/servicios
Registra un nuevo servicio.

Body (application/json):

{
"nombre": "Pileta olímpica",
"procedencia": "CAMPING",
"precioSocio": 1000.0,
"precioParticular": 2000.0,
"modalidadPrecio": "POR_DIA",
"capacidad": 50,
"cantidad": null,
"costoPersonaExtra": null
}
Campo Tipo Obligatorio Validación
nombre string Sí no vacío
procedencia Procedencia Sí —
precioSocio number (decimal) Sí 0
precioParticular number (decimal) Sí 0
modalidadPrecio ModalidadPrecio Sí —
capacidad integer No 0 si se envía
cantidad integer No 0 si se envía
costoPersonaExtra number (decimal) No = 0 si se envía
capacidad y cantidad son mutuamente excluyentes según el tipo de servicio. Enviar null o no incluir el campo que no aplica.

Respuesta 201: misma estructura que GET /api/v1/servicios/{id}

PUT /api/v1/servicios/{id}
Reemplaza los datos de un servicio existente.

Path param: id — integer positivo

Body (application/json):

{
"nombre": "Pileta olímpica",
"precioParticular": 2500.0,
"precioSocio": 1200.0,
"modalidadPrecio": "POR_DIA",
"capacidad": 60,
"cantidad": null,
"costoPersonaExtra": null
}
Campo Tipo Obligatorio Validación
nombre string Sí no vacío
precioParticular number (decimal) Sí 0
precioSocio number (decimal) Sí 0
modalidadPrecio ModalidadPrecio Sí —
capacidad integer No = 0 si se envía
cantidad integer No = 0 si se envía
costoPersonaExtra number (decimal) No = 0 si se envía
procedencia no es modificable. capacidad y cantidad son mutuamente excluyentes; enviar null o no incluir el que no aplica.

Respuesta 200: misma estructura que GET /api/v1/servicios/{id}

PATCH /api/v1/servicios/{id}/habilitacion
Habilita o deshabilita un servicio. Al deshabilitar puede haber reservas próximas que cancelar.

Path param: id — integer positivo

Body (application/json):

{
"habilitado": false,
"reservasACancelar": [12, 45, 78],
"confirmarDevolucion": true
}
Campo Tipo Obligatorio Descripción
habilitado boolean Sí true = habilitar, false = deshabilitar
reservasACancelar integer[] No IDs de reservas a cancelar al deshabilitar (puede ser array vacío)
confirmarDevolucion boolean No Confirmar si se realiza devolución de pagos al cancelar reservas
Respuesta 200: misma estructura que GET /api/v1/servicios/{id}

GET /api/v1/servicios/{id}/reservas-proximas
Retorna las reservas futuras/activas asociadas al servicio (útil antes de deshabilitarlo).

Path param: id — integer positivo

Respuesta 200:

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
Campo Tipo Descripción
id integer ID de la reserva
clienteId integer ID del cliente
fechaEntrada string LocalDate Día de entrada (yyyy-MM-dd)
fechaSalida string LocalDate Día de salida (yyyy-MM-dd)
pago boolean Si la reserva fue pagada
estado EstadoReserva Estado actual de la reserva
GET /api/v1/servicios/{id}/fechas-ocupadas
Retorna las reservas activas del servicio que se solapan con la ventana [desde, hasta], para alimentar el calendario de reservas (días ocupados). Devuelve una fila por reserva (rango [fechaInicio, fechaFin]), no un día por fila.

Path param: id — integer positivo

Query params:

Param Tipo Descripción
desde string yyyy-MM-dd obligatorio, inicio de la ventana
hasta string yyyy-MM-dd obligatorio, fin de la ventana inclusive
Reglas:

Solo se incluyen reservas en estado PENDIENTE, CONFIRMADA o EN_CURSO.
Una reserva es ocupante si su rango [entrada, salida] se solapa con la ventana (solapamiento inclusivo: el día de salida cuenta como ocupado).
Las fechas se devuelven completas, aunque la reserva empiece antes de desde o termine después de hasta.
desde debe ser ≤ hasta → si no, 400 (RANGO_FECHAS_INVALIDO).
Respuesta 200:

[
{
"reservaId": 12,
"estado": "CONFIRMADA",
"fechaInicio": "2026-06-10",
"fechaFin": "2026-06-12"
}
]
Campo Tipo Descripción
reservaId integer ID de la reserva ocupante
estado EstadoReserva Estado de la reserva
fechaInicio string LocalDate Día de entrada (yyyy-MM-dd)
fechaFin string LocalDate Día de salida (yyyy-MM-dd)
Errores:

Status Código Caso
400 ID_INVALIDO id no es entero positivo
400 RANGO_FECHAS_INVALIDO desde > hasta
404 SERVICIO_NO_ENCONTRADO el servicio no existe
Servicios — DTOs
Request DTOs
ServicioRegistroRequestDto — usado en POST /api/v1/servicios
{
nombre: string // obligatorio, no vacío
procedencia: Procedencia // obligatorio
precioSocio: number // obligatorio, > 0
precioParticular: number // obligatorio, > 0
modalidadPrecio: ModalidadPrecio // obligatorio
capacidad?: number // opcional, > 0
cantidad?: number // opcional, > 0
costoPersonaExtra?: number // opcional, >= 0; recargo por persona que exceda la capacidad
}
ModificacionServicioDto — usado en PUT /api/v1/servicios/{id}
{
nombre: string // obligatorio, no vacío
precioParticular: number // obligatorio, > 0
precioSocio: number // obligatorio, > 0
modalidadPrecio: ModalidadPrecio // obligatorio
capacidad?: number // opcional, >= 0
cantidad?: number // opcional, >= 0
costoPersonaExtra?: number // opcional, >= 0; recargo por persona que exceda la capacidad
}
ServicioRequestDto — usado en PATCH /api/v1/servicios/{id}/habilitacion
{
habilitado: boolean // obligatorio
reservasACancelar?: number[] // opcional
confirmarDevolucion?: boolean // opcional
}
ListadoServiciosRequestDto — query params en GET /api/v1/servicios
{
nombre?: string // opcional, máx 100 chars
procedencia?: Procedencia // opcional
estado?: EstadoServicio // opcional
}
Response DTOs
ServicioResponseDto — respuesta de detalle
{
id: number;
nombre: string;
procedencia: Procedencia;
cantidad: number | null;
precioSocio: number;
precioParticular: number;
capacidad: number | null;
costoPersonaExtra: number | null; // recargo por persona que exceda la capacidad; null si no aplica
estado: EstadoServicio;
modalidadPrecio: ModalidadPrecio;
createdAt: string; // Instant ISO-8601 UTC
updatedAt: string; // Instant ISO-8601 UTC
createdBy: string;
updatedBy: string;
}
ListadoServiciosResponseDto — ítem dentro del listado paginado
{
id: number;
nombre: string;
procedencia: Procedencia;
precioParticular: number;
precioSocio: number;
modalidadPrecio: ModalidadPrecio;
estado: EstadoServicio;
}
ReservaProximaResponseDto — ítem en reservas próximas
{
id: number;
clienteId: number;
fechaEntrada: string; // LocalDate yyyy-MM-dd
fechaSalida: string; // LocalDate yyyy-MM-dd
pago: boolean;
estado: EstadoReserva;
}
ServicioReservaOcupacionDto — ítem en fechas ocupadas
{
reservaId: number;
estado: EstadoReserva;
fechaInicio: string; // LocalDate yyyy-MM-dd
fechaFin: string; // LocalDate yyyy-MM-dd
}
Clientes — Endpoints
GET /api/v1/clientes
Retorna el listado paginado de clientes con filtros opcionales.

Query params (todos opcionales):

Param Tipo Validación
tipoCliente TipoCliente —
nombre string máx 100 caracteres
identificador string Solo dígitos (12345678) o formato parcial de cédula (1.234, 1.234.567-8). Cualquier otro formato devuelve resultado vacío.
estado EstadoSocio Solo aplica a socios; combinarlo con tipoCliente=PARTICULAR devuelve resultado vacío
page integer = 0, default 0
size integer 1–100, default 1
sortField string nombreCompleto, cedula, numeroSocio
sortOrder string ASC o DESC, default ASC
El campo identificador busca por cédula, por número de socio o por RUT (clientes EMPRESA) usando el prefijo del valor ingresado (ej: 123 devuelve clientes cuya cédula, nro de socio o RUT comience con 123). Los puntos y guiones del formato se normalizan automáticamente antes de la búsqueda.

Respuesta 200:

{
"content": [
{
"id": 1,
"nombreCompleto": "Juan Pérez",
"cedula": "12345678",
"rut": null,
"email": "juan@mail.com",
"tipoCliente": "SOCIO",
"numeroSocio": 5,
"estado": "ACTIVO"
},
{
"id": 2,
"nombreCompleto": "Laura Fernández",
"cedula": "67890123",
"rut": null,
"email": null,
"tipoCliente": "PARTICULAR",
"numeroSocio": null,
"estado": null
},
{
"id": 3,
"nombreCompleto": "Cipolatti S.A.",
"cedula": null,
"rut": "210001230018",
"email": "empresa@mail.com",
"tipoCliente": "EMPRESA",
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
GET /api/v1/clientes/{id}
Retorna el detalle completo de un cliente.

Path param: id — integer positivo

Respuesta 200:

{
"id": 1,
"nombre": "Juan Pérez",
"cedula": "12345678",
"rut": null,
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
Los campos fechaNacimiento, metodoPago, pais, departamento, ciudad, direccion, numeroSocio y estado son null para clientes de tipo PARTICULAR.

El campo rut es null para clientes de tipo SOCIO y PARTICULAR, y contiene el RUT para clientes de tipo EMPRESA. Inversamente, cedula es null para clientes de tipo EMPRESA (que no tienen cédula).

GET /api/v1/clientes/rut/{rut}
Busca una empresa por su RUT. Es el punto de entrada del flujo de reserva para cliente empresa: el usuario ingresa el RUT y, si la empresa ya existe, se usa el id retornado como clienteId al crear la reserva; si no existe (404), el front ofrece registrarla con POST /api/v1/clientes/empresas.

Path param: rut — RUT uruguayo. Se acepta con o sin puntos y guiones (21.100342.001-7 y 211003420017 resuelven al mismo cliente): se valida el algoritmo y se normaliza antes de buscar.

Respuesta 200:

{
"id": 7,
"nombre": "Antel S.A.",
"rut": "211003420017",
"telefono": "099123456",
"mail": "contacto@antel.com.uy",
"observaciones": null,
"tipoCliente": "EMPRESA"
}
Solo devuelve clientes de tipo EMPRESA: el RUT es un atributo exclusivo de ese tipo de cliente, por lo que tipoCliente siempre es EMPRESA.

Errores:

HTTP Status Código Cuándo ocurre
400 RUT_INVALIDO El RUT no cumple el algoritmo de validación uruguayo
404 CLIENTE_NO_ENCONTRADO No existe una empresa registrada con ese RUT
401 — Token ausente, inválido o expirado
PATCH /api/v1/clientes/socios/{id}/baja
Da de baja a un socio y cancela automáticamente todas sus reservas futuras en estado PENDIENTE o CONFIRMADA (incluso las pagas).

Path param: id — integer positivo

Respuesta 204: No Content

Errores:

HTTP Status Código Cuándo ocurre
400 ID_INVALIDO El id no es un número positivo
404 SOCIO_NO_ENCONTRADO No existe un socio con ese id
GET /api/v1/clientes/socios/{id}/estado
Devuelve el estado actual de un socio puntual (ACTIVO, INACTIVO o DE_BAJA) sin traer su detalle completo. Es de solo lectura: no modifica ningún dato.

Path param: id — integer positivo

Respuesta 200:

{
"id": 1,
"estado": "ACTIVO",
"numeroSocio": 5
}
Errores:

HTTP Status Código Cuándo ocurre
400 ID_INVALIDO El id no es un número positivo
404 SOCIO_NO_ENCONTRADO No existe un socio con ese id (inexistente o corresponde a un particular)
PUT /api/v1/clientes/particulares/{id}
Modifica los datos de un cliente particular.

Path param: id — integer positivo. Si no es positivo retorna 400 con código ID_INVALIDO.

Body (application/json):

{
"cedula": "12345672",
"nombreCompleto": "Laura Fernández",
"telefono": "099222222",
"mail": "laura@mail.com",
"notas": "Prefiere contacto por WhatsApp"
}
Campo Tipo Obligatorio Validación
cedula string Sí no vacío, algoritmo de cédula uruguaya, única
nombreCompleto string Sí no vacío
telefono string Sí no vacío
mail string No formato email válido si se envía, único
notas string No —
Respuestas:

200 — cliente modificado; mismo body que GET /api/v1/clientes/{id}
400 — campo obligatorio faltante o vacío (código SOLICITUD_INVALIDA), o id inválido (código ID_INVALIDO)
404 — el id no corresponde a un Particular (no existe o es un Socio) (código CLIENTE_NO_ENCONTRADO)
PUT /api/v1/clientes/socios/{id}
Modifica los datos de un socio.

Path param: id — integer positivo. Si no es positivo retorna 400 con código ID_INVALIDO.

Body (application/json):

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
"metodoCobro": "EN_SEDE",
"categoriaSocio": "SOCIO_COMUN",
"fechaIngreso": "2020-01-01"
}
Campo Tipo Obligatorio Validación
cedula string Sí no vacío, algoritmo de cédula uruguaya, única
nombreCompleto string Sí no vacío
telefono string Sí no vacío
mail string No formato email válido si se envía, único
notas string No —
fechaNacimiento string (date) Sí yyyy-MM-dd
pais string Sí no vacío
departamento string Sí no vacío
ciudad string Sí no vacío
direccion string Sí no vacío
metodoCobro MetodoCobro Sí —
categoriaSocio CategoriaSocio Sí —
fechaIngreso string (date) Sí yyyy-MM-dd, no puede ser posterior a hoy
Campos no modificables: numeroSocio, estado, fechaUltimoPago. Los campos categoriaSocio y fechaIngreso solo se informan para clientes de tipo SOCIO; para PARTICULAR y EMPRESA son null.

Respuestas:

200 — socio modificado; mismo body que GET /api/v1/clientes/{id}
400 — campo obligatorio faltante o vacío (código SOLICITUD_INVALIDA), o id inválido (código ID_INVALIDO)
404 — el id no corresponde a un Socio (no existe o es un Particular) (código CLIENTE_NO_ENCONTRADO)
POST /api/v1/clientes/socios
Registra un nuevo cliente de tipo socio.

Body (application/json):

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
"observaciones": "Sin observaciones",
"categoriaSocio": "SOCIO_COMUN",
"fechaIngreso": "2020-01-01"
}
Campo Tipo Obligatorio Validación
cedula string Sí no vacío, algoritmo de cédula uruguaya, única
nombreCompleto string Sí no vacío
fechaNacimiento string (date) Sí yyyy-MM-dd
telefono string Sí no vacío
email string No formato email válido si se envía, único (case-insensitive)
metodoCobro MetodoCobro Sí —
pais string Sí no vacío
departamento string Sí no vacío
ciudad string Sí no vacío
direccion string No —
observaciones string No —
categoriaSocio CategoriaSocio Sí —
fechaIngreso string (date) Sí yyyy-MM-dd, no puede ser posterior a hoy
La cédula se normaliza automáticamente (se eliminan puntos y guión). El socio se crea con estado ACTIVO y fechaIngreso igual al valor recibido en el body. El numeroSocio se asigna de forma incremental.

Respuesta 201: mismo body que GET /api/v1/clientes/{id}

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA Campo obligatorio faltante, vacío, o metodoCobro inválido
400 CEDULA_INVALIDA La cédula no cumple el algoritmo de validación uruguayo
400 CEDULA_DUPLICADA Ya existe un cliente con esa cédula
400 EMAIL_INVALIDO El email no tiene formato válido
400 EMAIL_DUPLICADO Ya existe un cliente con ese email
401 — Token ausente, inválido o expirado
POST /api/v1/clientes/particulares
Registra un nuevo cliente de tipo particular.

Body (application/json):

{
"cedula": "1.234.567-8",
"nombre": "Laura Fernández",
"celular": "099222222",
"mail": "laura@mail.com"
}
Campo Tipo Obligatorio Validación
cedula string Sí no vacío, cédula válida, única
nombre string Sí no vacío
celular string Sí no vacío
mail string No —
El campo celular se persiste como telefono. La cédula se normaliza automáticamente, eliminando puntos y guion.

Respuesta 201: mismo body que GET /api/v1/clientes/{id}

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA Campo obligatorio faltante o vacío
400 CEDULA_INVALIDA La cédula no cumple la validación definida
400 CEDULA_DUPLICADA Ya existe un cliente con esa cédula
401 — Token ausente, inválido o expirado
POST /api/v1/clientes/empresas
Registra un nuevo cliente de tipo empresa.

Body (application/json):

{
"razonSocial": "Antel S.A.",
"rut": "21.100342.001-7",
"pais": "Uruguay",
"departamento": "Montevideo",
"ciudad": "Montevideo",
"direccion": "Guatemala 1075",
"telefono": "099123456",
"mail": "empresa@mail.com",
"observaciones": "Sin observaciones"
}
Campo Tipo Obligatorio Validación
razonSocial string Sí no vacío
rut string Sí no vacío, algoritmo de RUT uruguayo, único
pais string Sí no vacío
departamento string Sí no vacío
ciudad string Sí no vacío
direccion string Sí no vacío
telefono string Sí no vacío
mail string No formato email válido si se envía, único
observaciones string No —
El RUT se normaliza automáticamente (se eliminan puntos y guiones).

Respuesta 201: mismo body que GET /api/v1/clientes/{id}

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA Campo obligatorio faltante o vacío
400 RUT_INVALIDO El RUT no cumple el algoritmo de validación uruguayo
400 RUT_DUPLICADO Ya existe un cliente con ese RUT
400 EMAIL_INVALIDO El email no tiene formato válido
400 EMAIL_DUPLICADO Ya existe un cliente con ese email
401 — Token ausente, inválido o expirado
Clientes — DTOs
Request DTOs
RegistroSocioRequestDto — body en POST /api/v1/clientes/socios
{
cedula: string // obligatorio, algoritmo cédula uruguaya, única
nombreCompleto: string // obligatorio, no vacío
fechaNacimiento: string // obligatorio, LocalDate yyyy-MM-dd
telefono: string // obligatorio, no vacío
email?: string // opcional, formato email válido si se envía, único (case-insensitive)
metodoCobro: MetodoCobro // obligatorio
pais: string // obligatorio, no vacío
departamento: string // obligatorio, no vacío
ciudad: string // obligatorio, no vacío
direccion?: string // opcional
observaciones?: string // opcional
categoriaSocio: CategoriaSocio // obligatorio
fechaIngreso: string // obligatorio, LocalDate yyyy-MM-dd, no futura
}
RegistroEmpresaRequestDto — body en POST /api/v1/clientes/empresas
{
razonSocial: string // obligatorio, no vacío
rut: string // obligatorio, algoritmo de RUT uruguayo, único
pais: string // obligatorio, no vacío
departamento: string // obligatorio, no vacío
ciudad: string // obligatorio, no vacío
direccion: string // obligatorio, no vacío
telefono: string // obligatorio, no vacío
mail?: string // opcional, formato email válido si se envía, único
observaciones?: string // opcional
}
ModificacionParticularRequestDto — body en PUT /api/v1/clientes/particulares/{id}
{
cedula: string // obligatorio, algoritmo cédula uruguaya, única
nombreCompleto: string // obligatorio, no vacío
telefono: string // obligatorio, no vacío
mail?: string // opcional, formato email válido si se envía, único
notas?: string // opcional
}
ModificacionSocioRequestDto — body en PUT /api/v1/clientes/socios/{id}
{
cedula: string // obligatorio, algoritmo cédula uruguaya, única
nombreCompleto: string // obligatorio, no vacío
telefono: string // obligatorio, no vacío
mail?: string // opcional, formato email válido si se envía, único
notas?: string // opcional
fechaNacimiento: string // obligatorio, LocalDate yyyy-MM-dd
pais: string // obligatorio, no vacío
departamento: string // obligatorio, no vacío
ciudad: string // obligatorio, no vacío
direccion: string // obligatorio, no vacío
metodoCobro: MetodoCobro // obligatorio
categoriaSocio: CategoriaSocio // obligatorio
fechaIngreso: string // obligatorio, LocalDate yyyy-MM-dd, no futura
}
ListadoClientesRequestDto — query params en GET /api/v1/clientes
{
tipoCliente?: TipoCliente // opcional
nombre?: string // opcional, máx 100 chars
identificador?: string // opcional, solo dígitos o formato parcial de cédula
estado?: EstadoSocio // opcional
}
Response DTOs
ClienteResponseDto — respuesta de detalle
{
id: number;
nombre: string;
cedula: string | null; // null para Empresas
rut: string | null; // null para Socios y Particulares; presente para Empresas
fechaNacimiento: string | null; // LocalDate ISO-8601 (yyyy-MM-dd), null para Particulares
telefono: string;
email: string | null;
metodoCobro: MetodoCobro | null; // null para Particulares
pais: string | null; // null para Particulares
departamento: string | null; // null para Particulares
ciudad: string | null; // null para Particulares
direccion: string | null; // null para Particulares
numeroSocio: number | null; // null para Particulares
tipoCliente: TipoCliente;
estado: EstadoSocio | null; // null para Particulares
categoriaSocio: CategoriaSocio | null; // null para Particulares y Empresas
fechaIngreso: string | null; // LocalDate yyyy-MM-dd; null para Particulares y Empresas
observaciones: string | null;
createdAt: string; // Instant ISO-8601 UTC
updatedAt: string; // Instant ISO-8601 UTC
createdBy: string;
updatedBy: string;
}
ListadoClientesResponseDto — ítem dentro del listado paginado
{
id: number;
nombreCompleto: string;
cedula: string | null; // null para Empresas
rut: string | null; // null para Socios y Particulares; presente para Empresas
email: string | null;
tipoCliente: TipoCliente;
numeroSocio: number | null; // null para Particulares
estado: EstadoSocio | null; // null para Particulares
}
BusquedaRutResponseDto — respuesta de GET /api/v1/clientes/rut/{rut}
{
id: number;
nombre: string;
rut: string; // normalizado, sin puntos ni guiones
telefono: string | null;
mail: string | null;
observaciones: string | null;
tipoCliente: TipoCliente; // siempre EMPRESA
}
Reservas — Endpoints
GET /api/v1/reservas
Retorna el listado paginado de reservas con filtros opcionales.

Query params (todos opcionales):

Param Tipo Validación
procedencia Procedencia —
servicioId integer = 0
nombreCliente string máx 100 caracteres
estadoReserva EstadoReserva —
fechaDesde string (date) yyyy-MM-dd
fechaHasta string (date) yyyy-MM-dd
page integer = 0, default 0
size integer 1–100, default 1
sortField string fechaEntrada, fechaSalida, nombreCliente
sortOrder string ASC o DESC, default ASC
fechaDesde filtra reservas cuya fechaEntrada sea igual o posterior a esa fecha. fechaHasta filtra reservas cuya fechaSalida sea igual o anterior. El filtro nombreCliente busca por coincidencia parcial (case-insensitive) en el nombre completo del cliente; si varios clientes comparten el nombre, se incluyen las reservas de todos ellos.

Respuesta 200:

{
"content": [
{
"id": 42,
"clienteId": 12,
"nombreCliente": "Juan Pérez",
"servicioId": 3,
"servicioNombre": "Cabaña del río",
"fechaEntrada": "2026-08-10",
"fechaSalida": "2026-08-15",
"estadoReserva": "PENDIENTE",
"requiereDocumentacion": false,
"tieneDocumentacion": false,
"montoImpago": 5000.00,
"plazoConfirmacion": "VEINTICUATRO_HORAS",
"fechaLimiteConfirmacion": "2026-08-09T00:00:00",
"fechaInicioAlerta": "2026-08-08T00:00:00",
"requiereSena": true,
"pago": false
}
],
"page": 0,
"size": 10,
"totalElements": 1,
"totalPages": 1,
"first": true,
"last": true
}
Toda reserva tiene un cliente asociado: clienteId y nombreCliente nunca son null. Las reservas COLABORACION_SIN_FINES_DE_LUCRO se asocian a un cliente de tipo EMPRESA.

plazoConfirmacion, fechaLimiteConfirmacion y fechaInicioAlerta son null cuando la reserva no requiere seña ni documentación. El front usa fechaInicioAlerta/fechaLimiteConfirmacion junto con estadoReserva, requiereSena, pago, requiereDocumentacion y tieneDocumentacion para mostrar el indicador de alerta de una reserva PENDIENTE próxima a cancelarse.

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA sortField inválido o parámetro con valor inválido
401 — Token ausente, inválido o expirado
POST /api/v1/reservas
Crea una nueva reserva. Toda reserva requiere un cliente del sistema y hay dos variantes para indicarlo:

Cliente existente: enviar clienteId (debe existir; puede ser PARTICULAR, SOCIO o EMPRESA).
Crear cliente particular en el momento: enviar crearCliente: true con los datos del cliente.
Reservas de empresa / colaboración: las reservas con tipoReserva: COLABORACION_SIN_FINES_DE_LUCRO deben enviar el clienteId de un cliente de tipo EMPRESA. Para obtenerlo a partir del RUT, usar GET /api/v1/clientes/rut/{rut}; si el RUT no está registrado, primero hay que dar de alta la empresa con POST /api/v1/clientes/empresas.

Body (application/json):

{
"tipoReserva": "COMUN",
"procedencia": "CAMPING",
"servicioId": 3,
"fechaInicio": "2026-08-10",
"fechaFin": "2026-08-15",
"horaInicio": null,
"horaFin": null,
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
"notas": "Llegan a las 14hs",
"requiereDocumentacion": true,
"requiereSena": true,
"plazoConfirmacion": "VEINTICUATRO_HORAS"
}
Campo Tipo Obligatorio Validación
tipoReserva TipoReserva Sí —
procedencia Procedencia Sí —
servicioId integer Sí 0, el servicio debe existir y estar habilitado
fechaInicio string (date) Sí yyyy-MM-dd, no puede ser anterior a hoy
fechaFin string (date) Sí yyyy-MM-dd, no puede ser anterior a fechaInicio
horaInicio string (time) No HH:mm; obligatorio si el servicio es POR_HORA
horaFin string (time) No HH:mm; obligatorio si el servicio es POR_HORA
cantidadTotal integer No = 0
cantidadMenores integer No = 0
cantidad integer No = 0
clienteId integer Condicional Requerido si crearCliente no es true. El cliente debe existir; si tipoReserva es COLABORACION_SIN_FINES_DE_LUCRO debe ser de tipo EMPRESA
crearCliente boolean No Si true, se crea un nuevo cliente particular con los campos siguientes
tipoCliente TipoCliente No Usado para calcular el costo (precio socio vs. particular)
cedula string Condicional Requerido si crearCliente: true
nombre string Condicional Requerido si crearCliente: true
celular string Condicional Requerido si crearCliente: true
email string No Solo usado si crearCliente: true
notas string No —
requiereDocumentacion boolean No Default false. Lo define el usuario al crear la reserva. Si es true, la reserva queda PENDIENTE hasta recibir la documentación
requiereSena boolean No Default false. Lo define el usuario al crear la reserva. Si es true, la reserva queda PENDIENTE hasta pagar al menos el 50%
plazoConfirmacion PlazoConfirmacion Condicional Requerido si requiereDocumentacion y/o requiereSena son true; no debe enviarse si ambos son false. Define cuándo se cancela automáticamente la reserva si no se confirma (ver tarea programada de cancelación automática)
Estado inicial según tipo de reserva:

tipoReserva Estado inicial Importe inicial
COMUN CONFIRMADA si requiereDocumentacion y requiereSena son ambos false; en caso contrario PENDIENTE calculado al crear (según servicio y tipo de cliente)
COLABORACION_SIN_FINES_DE_LUCRO CONFIRMADA (siempre, ignora requiereDocumentacion/requiereSena) 0
Respuesta 201:

{
"id": 42
}
Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA Campo obligatorio faltante o con formato inválido (validación Bean Validation)
400 FECHA_PASADA fechaInicio es anterior a hoy
400 FECHA_FIN_ANTERIOR_A_INICIO fechaFin < fechaInicio
400 SERVICIO_NO_DISPONIBLE El servicio no existe o está deshabilitado
400 FECHAS_SOLAPADAS El servicio ya tiene una reserva activa en ese período
400 CLIENTE_REQUERIDO No se envió clienteId ni crearCliente: true
400 NOMBRE_REQUERIDO_PARA_CREAR_CLIENTE crearCliente: true pero nombre está vacío
400 CEDULA_REQUERIDA_PARA_CREAR_CLIENTE crearCliente: true pero cedula está vacío
400 CELULAR_REQUERIDO_PARA_CREAR_CLIENTE crearCliente: true pero celular está vacío
400 CLIENTE_EMPRESA_REQUERIDO_PARA_COLABORACION tipoReserva: COLABORACION_SIN_FINES_DE_LUCRO con un clienteId que no es de tipo EMPRESA
400 PLAZO_CONFIRMACION_REQUERIDO requiereDocumentacion y/o requiereSena son true pero no se envió plazoConfirmacion
400 PLAZO_CONFIRMACION_NO_APLICA requiereDocumentacion y requiereSena son ambos false pero se envió plazoConfirmacion
400 PLAZO_CONFIRMACION_VENCIDO La fecha límite de confirmación resultante ya pasó (ej. reserva para mañana con plazo de 3 meses)
400 CEDULA_INVALIDA La cédula del nuevo cliente no pasa la validación del algoritmo uruguayo
400 CEDULA_DUPLICADA La cédula del nuevo cliente ya existe en el sistema
404 CLIENTE_NO_ENCONTRADO El clienteId enviado no existe
401 — Token ausente, inválido o expirado
GET /api/v1/reservas/{id}
Retorna el detalle completo de una reserva.

Path param: id — integer positivo

Respuesta 200:

{
"id": 42,
"tipoReserva": "COMUN",
"estado": "PENDIENTE",
"procedencia": "CAMPING",
"fechaEntrada": "2026-08-10",
"fechaSalida": "2026-08-15",
"horaInicio": null,
"horaFin": null,
"cantidadTotal": 4,
"cantidadMenores": 1,
"cantidad": null,
"importe": 15000.00,
"montoImpago": 15000.00,
"pago": false,
"requiereDocumentacion": true,
"tieneDocumentacion": false,
"requiereSena": true,
"plazoConfirmacion": "VEINTICUATRO_HORAS",
"fechaLimiteConfirmacion": "2026-08-09T00:00:00",
"notas": "Llegan a las 14hs",
"cliente": {
"id": 12,
"nombre": "Juan Pérez",
"cedula": "12345678",
"rut": null,
"telefono": "099111111",
"email": "juan@mail.com",
"tipoCliente": "SOCIO"
},
"servicio": {
"id": 3,
"nombre": "Cabaña del río",
"procedencia": "CAMPING",
"modalidadPrecio": "POR_DIA"
},
"createdAt": "2026-07-01T10:00:00Z",
"updatedAt": "2026-07-05T14:30:00Z",
"createdBy": "admin@cipolflo.com",
"updatedBy": "admin@cipolflo.com"
}
El campo cliente siempre viene informado: toda reserva tiene un cliente asociado. En las reservas COLABORACION_SIN_FINES_DE_LUCRO es el cliente de tipo EMPRESA (su rut se obtiene desde el detalle del cliente). importe y formaPago son null mientras la reserva no haya sido pagada. requiereDocumentacion y requiereSena se definen al crear la reserva; tieneDocumentacion se marca en true al confirmar la documentación vía PATCH /api/v1/reservas/{id}/documentacion. plazoConfirmacion y fechaLimiteConfirmacion son de solo lectura (no editables en ningún flujo) y son null si la reserva no requiere seña ni documentación.

Errores:

HTTP Status Código Cuándo ocurre
400 ID_INVALIDO id no es un entero positivo
404 RESERVA_NO_ENCONTRADA No existe una reserva con ese id
401 — Token ausente, inválido o expirado
PATCH /api/v1/reservas/{id}/documentacion
Confirma que se recibió la documentación de una reserva. Marca tieneDocumentacion en true y, si la reserva está PENDIENTE y ya cumple la seña (requiereSena = false o al menos el 50% pagado), transiciona automáticamente a CONFIRMADA.

Path param: id — integer positivo

Respuesta 204: sin body.

Errores:

HTTP Status Código Cuándo ocurre
400 ID_INVALIDO id no es un entero positivo
404 RESERVA_NO_ENCONTRADA No existe una reserva con ese id
401 — Token ausente, inválido o expirado
GET /api/v1/reservas/{id}/comprobante
Descarga el comprobante en PDF de una reserva (para entregar al cliente o archivar). El PDF se genera en el backend con Apache PDFBox y contiene: tipo de reserva, estado, fechas de entrada/salida, horario (si aplica), cantidades, importe (costo total), si está pago y saldo a pagar (solo cuando la reserva no está paga), cliente asociado (nombre, documento, tipo de cliente), servicio asociado (nombre y procedencia) y notas. Todo comprobante incluye arriba, de forma automática, la fecha/hora de generación del documento.

Path param: id — integer positivo

Respuesta 200: cuerpo binario.

Header Valor
Content-Type application/pdf
Content-Disposition attachment; filename="comprobante-reserva-{id}\_yyyy-MM-dd_HHmm.pdf"
Errores:

HTTP Status Código Cuándo ocurre
400 ID_INVALIDO id no es un entero positivo
404 RESERVA_NO_ENCONTRADA No existe una reserva con ese id
401 — Token ausente, inválido o expirado
POST /api/v1/reservas/calcular-costo
Calcula el costo estimado de una reserva en tiempo real, sin efectos secundarios. Se invoca cada vez que el usuario modifica un campo relevante en el formulario de reserva.

Body (application/json):

{
"servicioId": 3,
"fechaInicio": "2026-08-10",
"fechaFin": "2026-08-15",
"horaInicio": null,
"horaFin": null,
"cantidadTotal": 4,
"cantidadMenores": 1,
"cantidad": null,
"tipoCliente": "SOCIO"
}
Campo Tipo Obligatorio Validación
servicioId integer Sí 0, el servicio debe existir
fechaInicio string (date) Sí yyyy-MM-dd
fechaFin string (date) Sí yyyy-MM-dd, no puede ser anterior a fechaInicio
horaInicio string (time) No HH:mm; obligatorio si el servicio es POR_HORA
horaFin string (time) No HH:mm; obligatorio si el servicio es POR_HORA
cantidadTotal integer No = 0; personas totales (para modalidades POR_PERSONA y POR_DIA_POR_PERSONA)
cantidadMenores integer No = 0; menores de 10 años (no generan recargo por excedente de capacidad)
cantidad integer No = 0; unidades alquiladas (para modalidad POR_UNIDAD)
tipoCliente TipoCliente No Si no se envía, se asume PARTICULAR
El costo se calcula según la modalidadPrecio del servicio:

POR_DIA: precioBase × numeroDias, donde numeroDias = fechaFin − fechaInicio + 1.
POR_HORA: precioBase × numeroHoras, donde numeroHoras = horaFin − horaInicio. Requiere horaInicio y horaFin.
POR_UNIDAD: precioBase × cantidad (si cantidad es null se asume 1).
POR_PERSONA: precioBase + costoPersonaExtra × excedente, donde excedente = max(0, cantidadTotal − cantidadMenores − capacidad).
POR_DIA_POR_PERSONA: igual que POR_PERSONA pero multiplicado por numeroDias.
precioBase es precioSocio si tipoCliente = SOCIO, o precioParticular en caso contrario.

Respuesta 200:

{
"costoTotal": 12600.0
}
Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA Campo obligatorio faltante o con formato inválido
400 FECHA_FIN_ANTERIOR_A_INICIO fechaFin < fechaInicio
400 HORA_REQUERIDA_PARA_SERVICIO_POR_HORA Servicio POR_HORA pero no se enviaron horaInicio y horaFin
404 SERVICIO_NO_ENCONTRADO No existe un servicio con el servicioId indicado
401 — Token ausente, inválido o expirado
POST /api/v1/pago_reserva/{id}
Registra un pago sobre una reserva existente. Genera un ingreso en finanzas y actualiza el saldo impago de la reserva. Si el pago se marca como total (o el importe coincide exactamente con el saldo impago), la reserva queda marcada como paga y puede transicionar automáticamente a CONFIRMADA.

Path param: id — integer positivo; ID de la reserva a pagar

Body (application/json):

{
"importe": 15000.0,
"esPagoTotal": true,
"formaPago": "EFECTIVO",
"notas": "Pago en efectivo en administración"
}
Campo Tipo Obligatorio Validación
importe number Sí 0; no puede superar el saldo impago actual
esPagoTotal boolean Sí Si true, la reserva queda marcada como paga independientemente del importe
formaPago FormaPago Sí —
notas string No —
Pago total (esPagoTotal: true): se registra el ingreso con el importe enviado (puede ser menor al saldo para contemplar descuentos), montoImpago pasa a 0 y pago a true.

Pago parcial (esPagoTotal: false): se registra el importe y montoImpago se reduce en ese valor. Si el importe coincide exactamente con el saldo, el sistema lo trata como pago total.

Al registrar el pago, la reserva transiciona a CONFIRMADA solo si estando en PENDIENTE cumple ambas condiciones: la documentación (requiereDocumentacion = false, o tieneDocumentacion = true) y la seña (requiereSena = false, o ya se pagó al menos el 50% del importe).

Respuesta 204: sin body.

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA Campo obligatorio faltante o con formato inválido (Bean Validation)
400 RESERVA_ESTADO_INVALIDO_PARA_PAGO La reserva está en estado FINALIZADA o CANCELADA
400 PAGO_NO_APLICA_COLABORACION La reserva es de tipo COLABORACION_SIN_FINES_DE_LUCRO
400 PAGO_IMPORTE_SUPERA_SALDO El importe enviado supera el saldo impago actual
404 RESERVA_NO_ENCONTRADA No existe una reserva con ese id
401 — Token ausente, inválido o expirado
GET /api/v1/reservas/{id}/finalizacion
Verifica si una reserva EN_CURSO o VENCIDA_SIN_PAGO puede finalizarse sin completar un pago pendiente. Se usa para decidir qué pedirle al usuario antes de confirmar la finalización (checkout).

Path param: id — integer positivo

Respuesta 200:

{
"puedeFinalizarSinPago": true,
"montoImpago": 0.00
}
Campo Tipo Descripción
puedeFinalizarSinPago boolean true si la reserva ya está paga (estaPaga())
montoImpago number Saldo que falta pagar
Errores:

HTTP Status Código Cuándo ocurre
400 ID_INVALIDO id no es un entero positivo
400 RESERVA_NO_FINALIZABLE La reserva no está EN_CURSO ni VENCIDA_SIN_PAGO
404 RESERVA_NO_ENCONTRADA No existe una reserva con ese id
401 — Token ausente, inválido o expirado
PATCH /api/v1/reservas/{id}/finalizacion
Finaliza una reserva EN_CURSO o VENCIDA_SIN_PAGO, opcionalmente completando el saldo pendiente en el mismo paso.

Path param: id — integer positivo

Body (application/json):

{
"completarPago": true,
"formaPago": "EFECTIVO",
"notas": "Salda saldo al finalizar"
}
Campo Tipo Obligatorio Validación
completarPago boolean Condicional Requerido si la reserva no está paga
formaPago FormaPago Condicional Requerido si completarPago: true
notas string No —
Si la reserva ya está paga, completarPago y formaPago no son necesarios y se ignoran: la reserva pasa directo a FINALIZADA.

Si completarPago: true, se salda exactamente el montoImpago actual (no altera el importe total de la reserva) y luego finaliza.

Si completarPago: false, la reserva finaliza igual con el saldo pendiente sin saldar (queda como deuda histórica; no hay forma de distinguir después una FINALIZADA con deuda de una que no la tuvo).

Respuesta 204: sin body.

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA Campo con formato inválido (Bean Validation)
400 ID_INVALIDO id no es un entero positivo
400 RESERVA_NO_FINALIZABLE La reserva no está EN_CURSO ni VENCIDA_SIN_PAGO
400 DECISION_PAGO_REQUERIDA La reserva no está paga y no se envió completarPago
400 FORMA_PAGO_REQUERIDA_PARA_PAGO completarPago: true pero no se envió formaPago
404 RESERVA_NO_ENCONTRADA No existe una reserva con ese id
401 — Token ausente, inválido o expirado
Reservas — DTOs
Request DTOs
ListadoReservasRequestDto — query params en GET /api/v1/reservas
{
procedencia?: Procedencia // opcional
servicioId?: number // opcional, >= 0
nombreCliente?: string // opcional, máx 100 chars
estadoReserva?: EstadoReserva // opcional
fechaDesde?: string // opcional, LocalDate yyyy-MM-dd
fechaHasta?: string // opcional, LocalDate yyyy-MM-dd
}
ReservaCreacionRequestDto — body en POST /api/v1/reservas
{
tipoReserva: TipoReserva // obligatorio
procedencia: Procedencia // obligatorio
servicioId: number // obligatorio, > 0
fechaInicio: string // obligatorio, LocalDate yyyy-MM-dd
fechaFin: string // obligatorio, LocalDate yyyy-MM-dd
horaInicio?: string // opcional, LocalTime HH:mm; obligatorio para servicios POR_HORA
horaFin?: string // opcional, LocalTime HH:mm; obligatorio para servicios POR_HORA
cantidadTotal?: number // opcional, >= 0
cantidadMenores?: number // opcional, >= 0
cantidad?: number // opcional, >= 0
clienteId?: number // condicional (requerido si crearCliente no es true); debe ser EMPRESA si tipoReserva es COLABORACION_SIN_FINES_DE_LUCRO
crearCliente?: boolean // opcional
tipoCliente?: TipoCliente // opcional; usado para calcular costo (precio socio vs. particular)
cedula?: string // condicional (requerido si crearCliente: true)
nombre?: string // condicional (requerido si crearCliente: true)
celular?: string // condicional (requerido si crearCliente: true)
email?: string // opcional
notas?: string // opcional
requiereDocumentacion?: boolean // opcional, default false; si true la reserva nace PENDIENTE hasta recibir documentación
requiereSena?: boolean // opcional, default false; si true la reserva nace PENDIENTE hasta pagar >= 50%
plazoConfirmacion?: PlazoConfirmacion // condicional; requerido si requiereDocumentacion y/o requiereSena son true; no debe enviarse si ambos son false
}
RegistroPagoReservaRequestDto — body en POST /api/v1/pago_reserva/{id}
{
importe: number // obligatorio, > 0; no puede superar el saldo impago
esPagoTotal: boolean // obligatorio
formaPago: FormaPago // obligatorio
notas?: string // opcional
}
ReservaFinalizacionRequestDto — body en PATCH /api/v1/reservas/{id}/finalizacion
{
completarPago?: boolean // condicional, requerido si la reserva no está paga
formaPago?: FormaPago // condicional, requerido si completarPago: true
notas?: string // opcional
}
CalculoCostoRequestDto — body en POST /api/v1/reservas/calcular-costo
{
servicioId: number // obligatorio, > 0
fechaInicio: string // obligatorio, LocalDate yyyy-MM-dd
fechaFin: string // obligatorio, LocalDate yyyy-MM-dd
horaInicio?: string // opcional, LocalTime HH:mm; obligatorio para servicios POR_HORA
horaFin?: string // opcional, LocalTime HH:mm; obligatorio para servicios POR_HORA
cantidadTotal?: number // opcional, >= 0; personas totales
cantidadMenores?: number // opcional, >= 0; menores de 10 años (no generan recargo)
cantidad?: number // opcional, >= 0; unidades para modalidad POR_UNIDAD
tipoCliente?: TipoCliente // opcional; default PARTICULAR si no se envía
}
Response DTOs
ListadoReservasResponseDto — ítem dentro del listado paginado
{
id: number;
clienteId: number | null; // null para reservas de colaboración sin cliente
nombreCliente: string | null; // nombre del cliente, o nombre de la organización si clienteId es null (temporal)
servicioId: number;
servicioNombre: string;
fechaEntrada: string; // LocalDate yyyy-MM-dd
fechaSalida: string; // LocalDate yyyy-MM-dd
estadoReserva: EstadoReserva;
requiereDocumentacion: boolean;
tieneDocumentacion: boolean;
montoImpago: number | null; // saldo pendiente de pago
plazoConfirmacion: PlazoConfirmacion | null; // null si no requiere seña ni documentación
fechaLimiteConfirmacion: string | null; // LocalDateTime yyyy-MM-dd'T'HH:mm:ss; null si no aplica
fechaInicioAlerta: string | null; // LocalDateTime yyyy-MM-dd'T'HH:mm:ss; calculado, no persistido; null si no aplica
requiereSena: boolean;
pago: boolean;
}
ReservaCreacionResponseDto — respuesta de POST /api/v1/reservas
{
id: number; // ID de la reserva creada
}
CalculoCostoResponseDto — respuesta de POST /api/v1/reservas/calcular-costo
{
costoTotal: number; // costo estimado de la reserva según la modalidad del servicio
}
ReservaFinalizacionCheckResponseDto — respuesta de GET /api/v1/reservas/{id}/finalizacion
{
puedeFinalizarSinPago: boolean; // true si la reserva ya está paga (estaPaga())
montoImpago: number; // saldo pendiente de pago
}
ReservaDetalleResponseDto — respuesta de GET /api/v1/reservas/{id}
{
id: number
tipoReserva: TipoReserva
estado: EstadoReserva
procedencia: Procedencia
fechaEntrada: string // LocalDate yyyy-MM-dd
fechaSalida: string // LocalDate yyyy-MM-dd
horaInicio: string | null // LocalTime HH:mm; null si no aplica
horaFin: string | null // LocalTime HH:mm; null si no aplica
cantidadTotal: number | null
cantidadMenores: number | null
cantidad: number | null
importe: number | null // null si es reserva de colaboración (monto 0)
montoImpago: number
pago: boolean
requiereDocumentacion: boolean
tieneDocumentacion: boolean
requiereSena: boolean
plazoConfirmacion: PlazoConfirmacion | null // solo lectura; null si no requiere seña ni documentación
fechaLimiteConfirmacion: string | null // LocalDateTime yyyy-MM-dd'T'HH:mm:ss; solo lectura; null si no aplica
notas: string | null
cliente: ClienteDetalleReservaDto // siempre presente; EMPRESA en reservas de colaboración
servicio: ServicioDetalleReservaDto
createdAt: string // Instant ISO-8601 UTC
updatedAt: string // Instant ISO-8601 UTC
createdBy: string
updatedBy: string
}
ClienteDetalleReservaDto — cliente embebido en el detalle de reserva
{
id: number;
nombre: string;
cedula: string | null; // null para clientes EMPRESA
rut: string | null; // presente solo para clientes EMPRESA
telefono: string;
email: string | null;
tipoCliente: TipoCliente;
}
El documento identificatorio del cliente es el rut si tipoCliente es EMPRESA y la cedula en los demás casos. El comprobante en PDF usa ese mismo criterio para el campo documento.

ServicioDetalleReservaDto — servicio embebido en el detalle de reserva
{
id: number;
nombre: string;
procedencia: Procedencia;
modalidadPrecio: ModalidadPrecio;
}
Finanzas — Endpoints
POST /api/v1/finanzas
Registra manualmente un ingreso o egreso.

Body (application/json):

{
"tipoMovimiento": "INGRESO",
"fecha": "2026-06-20",
"importe": 1500.0,
"concepto": "PAGO_RESERVA",
"procedencia": "SEDE",
"formaPago": "EFECTIVO",
"notas": "Pago realizado en administración"
}
Campo Tipo Obligatorio Validación
tipoMovimiento TipoMovimiento Sí —
fecha string (date) No yyyy-MM-dd
importe number (decimal) Sí 0
concepto Concepto Sí —
procedencia Procedencia Sí —
formaPago FormaPago Sí —
notas string No —
Si no se envía fecha, se utilizará la fecha actual del sistema.

Respuesta 201:

{
"id": 1,
"tipoMovimiento": "INGRESO",
"fecha": "2026-06-20",
"importe": 1500.0,
"concepto": "PAGO_RESERVA",
"procedencia": "SEDE",
"formaPago": "EFECTIVO",
"notas": "Pago realizado en administración",
"reservaId": null,
"pagoCuotaId": null
}
Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA Campo obligatorio faltante o valor inválido
401 — Token ausente, inválido o expirado
DELETE /api/v1/finanzas/{id}
Elimina una finanza. La eliminación es consciente del origen del movimiento: aplica las reglas de negocio de la reserva o el pago de cuota asociado antes de borrar.

Path param: id — integer positivo; ID de la finanza a eliminar.

Query param:

Parámetro Tipo Obligatorio Default Descripción
confirmar boolean No false Confirma la eliminación de un ingreso cuya reserva ya está FINALIZADA o CANCELADA (ver comportamiento).
Comportamiento según el origen del movimiento:

Finanza manual (ingreso/egreso sin reservaId ni pagoCuotaId): se elimina sin lógica adicional → 204.
Ingreso de pago de cuota (pagoCuotaId != null): no se permite eliminar → 400 ELIMINACION_PAGO_CUOTA_NO_PERMITIDA. La anulación de cuotas es una funcionalidad pendiente.
Egreso asociado a una reserva (reservaId != null): no se permite eliminar → 400 ELIMINACION_EGRESO_RESERVA_NO_PERMITIDA. Si se cargó por error, la forma de compensarlo es registrar un ingreso que lo anule.
Ingreso de pago de reserva (reservaId != null): al eliminar se devuelve el importe al montoImpago de la reserva y se ajusta su pago/estado según el estado:
PENDIENTE / EN_CURSO / VENCIDA_SIN_PAGO: se elimina el ingreso, montoImpago += importe, pago pasa a false si estaba en true; el estado no cambia → 204.
CONFIRMADA: además de lo anterior, si la reserva requiereSena == true y tras la devolución el saldo pagado queda por debajo del 50% del importe total, el estado vuelve a PENDIENTE; si requiereSena == false, permanece CONFIRMADA → 204.
FINALIZADA / CANCELADA:
Con confirmar = false (o ausente) → 428 CONFIRMACION_ELIMINACION_REQUERIDA; no se elimina nada ni se modifica la reserva. Se sugiere registrar un egreso asociado en su lugar; el front usa este error para mostrar la advertencia con las opciones "registrar egreso" / "eliminar de todas formas".
Con confirmar = true → se elimina únicamente el ingreso; no se tocan montoImpago, pago ni estado de la reserva → 204.
La devolución de importe nunca deja el montoImpago por encima del importe total de la reserva. Toda la operación es transaccional: si falla la actualización de la reserva, no se elimina el movimiento, y viceversa.

Respuesta 204: sin body.

Errores:

HTTP Status Código Cuándo ocurre
400 ID_INVALIDO El id no es un número positivo
400 SOLICITUD_INVALIDA confirmar con un valor no booleano
400 ELIMINACION_PAGO_CUOTA_NO_PERMITIDA La finanza es un ingreso de pago de cuota (pagoCuotaId != null)
400 ELIMINACION_EGRESO_RESERVA_NO_PERMITIDA La finanza es un egreso asociado a una reserva (reservaId != null)
404 FINANZA_NO_ENCONTRADA No existe una finanza con ese id
404 RESERVA_NO_ENCONTRADA El ingreso apunta a una reserva inexistente
428 CONFIRMACION_ELIMINACION_REQUERIDA Ingreso de una reserva FINALIZADA/CANCELADA sin confirmar=true
401 — Token ausente, inválido o expirado
Finanzas — DTOs
Request DTOs
FinanzaCrearRequestDto — body en POST /api/v1/finanzas
{
tipoMovimiento: TipoMovimiento
fecha?: string
importe: number
concepto: Concepto
procedencia: Procedencia
formaPago: FormaPago
notas?: string
}
Response DTOs
FinanzaResponseDto
{
id: number;
tipoMovimiento: TipoMovimiento;
fecha: string;
importe: number;
concepto: Concepto;
procedencia: Procedencia;
formaPago: FormaPago;
notas: string | null;
reservaId: number | null;
pagoCuotaId: number | null;
}
Integraciones — Endpoints
POST /api/public/telegram/webhook
Recibe los updates del bot de Telegram (RF6, ticket DEV-149). Es el único endpoint del sistema que no requiere JWT de Auth0 — Telegram no puede enviar nuestro Bearer Token. Va bajo /api/public/\*\*, fuera del esquema de autenticación general de este documento.

Autenticación: header X-Telegram-Bot-Api-Secret-Token, comparado en tiempo constante contra el secret configurado (cipolflo.telegram.webhook-secret) — no JWT.

Header Requerido Descripción
X-Telegram-Bot-Api-Secret-Token Sí Secret acordado con Telegram al registrar el webhook (setWebhook)
Body: el payload de update de Telegram (solo se mapean update_id, message.text, message.chat.id, message.chat.username — sin Bean Validation, un campo desconocido no rompe el binding).

Respuesta:

HTTP Status Cuándo
200 Siempre, una vez validado el secret — aun si el mensaje se descarta o falla el procesamiento. El procesamiento ocurre de forma asíncrona, no bloquea la respuesta.
401 (TELEGRAM_SECRET_INVALIDO) El header falta o no coincide con el secret configurado. No se procesa nada.
Ver arquitectura completa en telegram-bot-arquitectura.md.

Ajustes — Endpoints
Panel de configuración operable por el propio administrador desde la pantalla de Ajustes, sin depender de despliegues de backend. Son tres recursos independientes, cada uno con su propia tabla y su propio endpoint — no hay un guardado global. Todos requieren autenticación (@PreAuthorize("isAuthenticated()")).

GET /api/v1/ajustes/costo-cuota
Devuelve el monto vigente de referencia de la cuota social. Existe siempre: la fila se siembra por migración (costo_cuota_socio, id fijo). Es solo un valor de referencia para esta pantalla — no se usa como default ni validación en POST /api/v1/pago_cuota (el importe de cada pago sigue siendo libre).

Respuesta 200:

{
"monto": 200.00,
"updatedAt": "2026-01-10T09:00:00Z",
"updatedBy": "admin@cipolflo.com"
}
PUT /api/v1/ajustes/costo-cuota
Actualiza el monto de referencia de la cuota social.

Body (application/json):

{
"monto": 250.00
}
Campo Tipo Obligatorio Validación
monto number (decimal) Sí 0
Respuesta 200: mismo body que GET /api/v1/ajustes/costo-cuota

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA monto nulo, negativo o cero
401 — Token ausente, inválido o expirado
GET /api/v1/ajustes/antiguedad-reservas
Devuelve la antigüedad configurada (en años) para la limpieza automática de reservas vencidas. Lee directamente la clave LIMPIEZA_RESERVAS_RETENCION_ANIOS de configuracion_tarea — la misma tabla y fila que consulta LimpiezaReservasYFinanzasService en cada corrida (ver Tareas Programadas). No expone ni modifica LIMPIEZA_FINANZAS_SUELTAS_RETENCION_ANIOS, que queda fuera del alcance de esta pantalla.

Respuesta 200:

{
"anios": 2,
"updatedAt": "2026-01-10T09:00:00Z",
"updatedBy": "admin@cipolflo.com"
}
PUT /api/v1/ajustes/antiguedad-reservas
Actualiza la antigüedad de retención. La siguiente corrida del scheduler de limpieza usa el nuevo valor sin necesidad de deploy.

Body (application/json):

{
"anios": 5
}
Campo Tipo Obligatorio Validación
anios integer Sí entero > 0
Respuesta 200: mismo body que GET /api/v1/ajustes/antiguedad-reservas

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA anios nulo, negativo o cero
401 — Token ausente, inválido o expirado
GET /api/v1/ajustes/clientes-telegram
Retorna el listado paginado de clientes (chats) autorizados del bot de Telegram, con filtros opcionales.

Query params (todos opcionales):

Param Tipo Validación
alias string contiene, case-insensitive, máx 100 chars
activo boolean —
page integer = 0, default 0
size integer 1–100, default 1
sortField string —
sortOrder string ASC o DESC, default ASC
Respuesta 200:

{
"content": [
{
"id": 1,
"chatId": 123456789,
"alias": "Juan Pérez",
"activo": true,
"recibeNotificaciones": true,
"createdAt": "2026-01-10T09:00:00Z",
"updatedAt": "2026-01-10T09:00:00Z"
}
],
"page": 0,
"size": 10,
"totalElements": 1,
"totalPages": 1,
"first": true,
"last": true
}
GET /api/v1/ajustes/clientes-telegram/{id}
Retorna el detalle de un cliente autorizado de Telegram.

Path param: id — integer positivo

Respuesta 200: mismo shape que un ítem del listado (ver arriba).

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA id no es un número positivo
404 CHAT_NO_ENCONTRADO No existe un chat con ese id
401 — Token ausente, inválido o expirado
POST /api/v1/ajustes/clientes-telegram
Da de alta un nuevo chat autorizado (reemplaza el alta manual "por script de datos").

Body (application/json):

{
"chatId": 123456789,
"alias": "Juan Pérez",
"recibeNotificaciones": true
}
Campo Tipo Obligatorio Validación
chatId integer Sí 0, único
alias string Sí no vacío, máx 100 caracteres
recibeNotificaciones boolean No default true si no se envía o es nulo
El cliente se crea con activo: true.

Respuesta 201: mismo shape que GET /api/v1/ajustes/clientes-telegram/{id}

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA Campo obligatorio faltante o inválido
400 CHAT_ID_DUPLICADO Ya existe un cliente con ese chatId
401 — Token ausente, inválido o expirado
PUT /api/v1/ajustes/clientes-telegram/{id}
Modifica alias y recibeNotificaciones de un cliente autorizado. El chatId no es editable: para cambiarlo hay que eliminar el cliente y crear uno nuevo.

Path param: id — integer positivo

Body (application/json):

{
"alias": "Juan Pérez",
"recibeNotificaciones": false
}
Campo Tipo Obligatorio Validación
alias string Sí no vacío, máx 100 caracteres
recibeNotificaciones boolean Sí —
Respuesta 200: mismo shape que GET /api/v1/ajustes/clientes-telegram/{id}

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA Campo obligatorio faltante o inválido, o id no positivo
404 CHAT_NO_ENCONTRADO No existe un chat con ese id
401 — Token ausente, inválido o expirado
PATCH /api/v1/ajustes/clientes-telegram/{id}/habilitacion
Activa o desactiva un cliente sin borrar el registro. Un chat desactivado deja de estar autorizado en la próxima consulta del bot (ProcesadorMensajeTelegram ya filtra por activo, no requiere cambios).

Path param: id — integer positivo

Body (application/json):

{
"activo": false
}
Campo Tipo Obligatorio Descripción
activo boolean Sí true = habilitar, false = deshabilitar
Respuesta 200: mismo shape que GET /api/v1/ajustes/clientes-telegram/{id}

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA activo faltante, o id no positivo
404 CHAT_NO_ENCONTRADO No existe un chat con ese id
401 — Token ausente, inválido o expirado
DELETE /api/v1/ajustes/clientes-telegram/{id}
Elimina definitivamente un cliente autorizado de Telegram.

Path param: id — integer positivo

Respuesta 204: sin body.

Errores:

HTTP Status Código Cuándo ocurre
400 SOLICITUD_INVALIDA id no positivo
404 CHAT_NO_ENCONTRADO No existe un chat con ese id
401 — Token ausente, inválido o expirado
Ajustes — DTOs
Request DTOs
CostoCuotaRequestDto — body en PUT /api/v1/ajustes/costo-cuota
{
monto: number // obligatorio, > 0
}
AntiguedadReservasRequestDto — body en PUT /api/v1/ajustes/antiguedad-reservas
{
anios: number // obligatorio, entero > 0
}
RegistroClienteTelegramRequestDto — body en POST /api/v1/ajustes/clientes-telegram
{
chatId: number // obligatorio, > 0, único
alias: string // obligatorio, no vacío, máx 100 chars
recibeNotificaciones?: boolean // opcional, default true si se omite o es nulo
}
ModificacionClienteTelegramRequestDto — body en PUT /api/v1/ajustes/clientes-telegram/{id}
{
alias: string // obligatorio, no vacío, máx 100 chars
recibeNotificaciones: boolean // obligatorio
}
chatId no forma parte de este DTO: no es modificable.

HabilitacionClienteTelegramRequestDto — body en PATCH /api/v1/ajustes/clientes-telegram/{id}/habilitacion
{
activo: boolean // obligatorio
}
ListadoClientesTelegramRequestDto — query params en GET /api/v1/ajustes/clientes-telegram
{
alias?: string // opcional, máx 100 chars, contiene case-insensitive
activo?: boolean // opcional, null = todos
}
Response DTOs
CostoCuotaResponseDto
{
monto: number;
updatedAt: string; // Instant ISO-8601 UTC
updatedBy: string;
}
AntiguedadReservasResponseDto
{
anios: number;
updatedAt: string; // Instant ISO-8601 UTC
updatedBy: string;
}
ClienteTelegramResponseDto / ListadoClienteTelegramResponseDto
{
id: number;
chatId: number;
alias: string;
activo: boolean;
recibeNotificaciones: boolean;
createdAt: string; // Instant ISO-8601 UTC
updatedAt: string; // Instant ISO-8601 UTC
}
Manejo de errores
Todos los errores retornan el siguiente body:

{
"codigo": "CODIGO_ERROR",
"descripcion": "Mensaje legible del error"
}
HTTP Status Cuándo ocurre
400 Validación fallida en body o query params
401 Token ausente, inválido o expirado (o, en el webhook de Telegram, TELEGRAM_SECRET_INVALIDO)
403 Usuario autenticado sin permisos para la operación
404 Recurso no encontrado por el ID proporcionado
409 Conflicto de negocio (ej: deshabilitar con reservas activas sin confirmar)
428 Falta una precondición para proceder (ej: confirmar la eliminación de un ingreso de reserva ya cerrada)
500 Error interno del servidor
