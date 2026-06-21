# Nueva Reserva — Documentación de Flujo

## Índice

1. [Puntos de entrada](#1-puntos-de-entrada)
2. [Sección: Información de la Reserva](#2-sección-información-de-la-reserva)
3. [Sección: Información del Cliente](#3-sección-información-del-cliente)
4. [Verificación del estado del socio](#4-verificación-del-estado-del-socio)
5. [Confirmación y envío](#5-confirmación-y-envío)
6. [Casuísticas en la construcción del DTO](#6-casuísticas-en-la-construcción-del-dto)
7. [Tickets pendientes](#7-tickets-pendientes)
8. [Detalles y restricciones a tener en cuenta](#8-detalles-y-restricciones-a-tener-en-cuenta)

---

## 1. Puntos de entrada

### A. Desde el listado de reservas

Navegación directa a `/reservas/nueva`. Todos los campos parten vacíos. El selector de tipo de reserva ofrece **Común** y **Colaboración sin fines de lucro**.

### B. Desde el listado de clientes

La acción "Nueva reserva" en el listado de clientes navega a `/reservas/nueva?clienteId=<id>`. Al detectar el query param:

- `clientePrellenado` se activa (`true`)
- Se llama a `GET /api/v1/clientes/{id}` y los datos del cliente se precargan en readonly
- La opción **Colaboración sin fines de lucro** se **oculta** del selector de tipo (no tiene sentido asociar una colaboración a un cliente particular/socio concreto)
- La lupita de búsqueda por cédula no aparece

---

## 2. Sección: Información de la Reserva

### Procedencia → Servicio

Al elegir una **procedencia** (SEDE / CAMPING):

- Se limpia el servicio seleccionado
- Se pide `GET /api/v1/servicios?procedencia=X&estado=HABILITADO&size=100` (mock hoy, real ya implementado)
- El selector de servicio se habilita con la lista obtenida

Al elegir un **servicio**, se determinan dos modos mutuamente excluyentes según los campos del servicio:

| Modo          | Condición                     | Campos que aparecen                                         |
| ------------- | ----------------------------- | ----------------------------------------------------------- |
| **Capacidad** | `servicio.capacidad !== null` | Cantidad total (requerido) + Cantidad de menores (opcional) |
| **Cantidad**  | `servicio.cantidad !== null`  | Cantidad (requerido)                                        |
| **Sin modo**  | Ambos `null`                  | Ningún campo extra                                          |

Adicionalmente se carga el calendario de fechas ocupadas con `GET /api/v1/servicios/{id}/fechas-ocupadas`.

### Fechas

El calendario bloquea los rangos ya ocupados. Al seleccionar un rango se actualizan `fechaInicio` y `fechaFin` en el form.

### Costo en tiempo real

Con un debounce de 300ms, cada cambio en `servicioId`, `fechaInicio`, `fechaFin`, `cantidadTotal`, `cantidadMenores` o `cantidad` dispara `POST /api/v1/reservas/costo` (actualmente mocked). El costo se muestra debajo del calendario solo si hay servicio y rango completos.

---

## 3. Sección: Información del Cliente

El comportamiento de esta sección depende por completo del **tipo de reserva**.

### Tipo: Colaboración sin fines de lucro

Los campos de identificación de persona física **no aplican**. Solo se piden:

| Campo                            | Obligatorio |
| -------------------------------- | ----------- |
| Nombre del cliente (institución) | Sí          |
| RUT del cliente                  | No          |

No hay búsqueda de cliente. El botón Confirmar no queda bloqueado por `busquedaRealizada`.

---

### Tipo: Común

Hay tres sub-escenarios según cómo se entró al formulario y el resultado de la búsqueda.

#### Escenario 1 — Cliente precargado (`clienteId` en query param)

- La cédula y los datos ya están cargados en readonly desde el inicio
- No se muestra la lupita
- No hace falta buscar: `busquedaRealizada` ya es `true` (lo pone `aplicarCliente`)
- El flujo de verificación de socio aplica normalmente al confirmar

#### Escenario 2 — Búsqueda por cédula: cliente encontrado

1. Usuario escribe la cédula y presiona la lupita (o Enter si se implementa)
2. Se llama a `GET /api/v1/clientes?size=1&identificador=<cedula>` (`ClientesService.getByCedula`)
3. Si hay resultado, se llama a `GET /api/v1/clientes/{id}` para traer el detalle completo
4. Los datos se precargan en readonly
5. El badge cambia a "✓ Verificada"
6. Si el usuario edita la cédula posteriormente, toda la sección se **resetea** (campos vacíos, badge vuelve a "Sin verificar")

> Si el cliente tiene observaciones, se muestra un campo de texto en readonly debajo de los datos.

#### Escenario 3 — Búsqueda por cédula: cliente no encontrado

1. El backend devuelve una página vacía para ese `identificador`
2. Se muestra el mensaje: _"No se encontró ningún cliente con esa cédula. Ingrese los datos básicos del cliente."_
3. Los campos nombre, celular y email se habilitan para ingreso manual
4. El tipo de cliente se fija internamente como **Particular** (no se puede elegir)
5. Al confirmar, se envía `crearCliente: true` para que el backend cree el Particular

En ningún caso el usuario elige el tipo de cliente: siempre se deriva de la búsqueda o se fija como Particular.

---

## 4. Verificación del estado del socio

Solo aplica para reservas **Comunes** cuyo cliente encontrado es de tipo **Socio**.

Se llama a `GET /api/v1/clientes/socios/{id}/estado` al presionar Confirmar. Existen tres ramas:

| Estado del socio | Comportamiento                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `ACTIVO`         | Se crea la reserva sin interrupciones                                                                     |
| `INACTIVO`       | Se muestra un diálogo de advertencia. Si el operador confirma, se crea la reserva. Si cancela, se aborta. |
| `DE_BAJA`        | Se muestra un error bloqueante. No es posible crear la reserva.                                           |

---

## 5. Confirmación y envío

### Condiciones para que el botón Confirmar esté habilitado

El botón permanece deshabilitado (`confirmDisabled`) si se cumple **cualquiera** de estas condiciones:

- El formulario tiene algún campo inválido
- La reserva es **Común** y `busquedaRealizada` es `false` (no se verificó la cédula)
- Hay una operación HTTP en curso (`loading`)

### Estado inicial de la reserva

| Tipo de reserva                 | Estado inicial |
| ------------------------------- | -------------- |
| Común                           | `PENDIENTE`    |
| Colaboración sin fines de lucro | `CONFIRMADA`   |

### Flujo de confirmación completo

```
onConfirmar()
  ├─ form inválido → nada (validadores muestran errores)
  ├─ Colaboración → guardar()
  └─ Común
       ├─ cliente no encontrado (crearCliente) → guardar()
       ├─ cliente Particular → guardar()
       └─ cliente Socio
            └─ verificarSocioYGuardar(clienteId)
                 ├─ ACTIVO → guardar()
                 ├─ INACTIVO → confirmDialog → [confirma] guardar() / [cancela] nada
                 └─ DE_BAJA → errorDialog (bloqueante)
```

---

## 6. Casuísticas en la construcción del DTO

El método `construirDto()` resuelve los diferentes escenarios:

| Campo del DTO     | Común con cliente existente | Común sin cliente (crearCliente) | Colaboración                  |
| ----------------- | --------------------------- | -------------------------------- | ----------------------------- |
| `clienteId`       | ID del cliente              | `null`                           | `null`                        |
| `crearCliente`    | `false`                     | `true`                           | `false`                       |
| `tipoCliente`     | tipo del cliente            | `PARTICULAR`                     | `null`                        |
| `cedula`          | cédula                      | cédula ingresada                 | `null`                        |
| `nombre`          | nombre del cliente          | nombre ingresado                 | valor de `nombreColaboracion` |
| `celular`         | teléfono del cliente        | celular ingresado                | `null`                        |
| `rut`             | `null`                      | `null`                           | RUT ingresado (si hay)        |
| `cantidadTotal`   | solo si `modoCapacidad`     | —                                | —                             |
| `cantidadMenores` | solo si `modoCapacidad`     | —                                | —                             |
| `cantidad`        | solo si `modoCantidad`      | —                                | —                             |

---

## 7. Tickets pendientes

### Backend no disponible (TODO en `ReservasService`)

| Ticket     | Descripción                            | Archivo                                   | Detalle                                                                                                                                          |
| ---------- | -------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **DEV-??** | Integrar `GET /api/v1/reservas`        | `reservas.service.ts` → `getDatos()`      | Reemplazar el array mock. Alinear `ReservaRow` / `ReservaListadoResponseDto` con el contrato real del backend.                                   |
| **DEV-??** | Integrar `POST /api/v1/reservas`       | `reservas.service.ts` → `crear()`         | Reemplazar el mock. Manejar error `409 SERVICIO_NO_DISPONIBLE` (el rango quedó ocupado entre que el usuario eligió fechas y presionó confirmar). |
| **DEV-??** | Integrar `POST /api/v1/reservas/costo` | `reservas.service.ts` → `calcularCosto()` | Reemplazar `costoMock()` y eliminarla. El campo de costo ya está conectado al resultado.                                                         |

### Funcionalidades del listado no implementadas

| Ticket     | Descripción                     | Detalle                                                                                                                                                                                                                                 |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DEV-??** | Filtros del listado de reservas | `ReservasFilterService` define los campos pero no llegan al endpoint (el mock los ignora). Los select de `servicio` y `estado` tienen `options: []`.                                                                                    |
| **DEV-??** | Ver detalle de reserva          | La acción "Ver detalle" navega a `/reservas/:id`, ruta que aún no existe.                                                                                                                                                               |
| **DEV-??** | Editar reserva                  | La acción "Editar" solo hace `console.log`. Requiere implementar el formulario de edición extendiendo `ReservaFormBase` (la clase base fue diseñada para esto: la sección de cliente queda en readonly, sin lupita ni campos manuales). |
| **DEV-??** | Exportar reservas               | El botón "Exportar" existe en el listado sin funcionalidad.                                                                                                                                                                             |

### UI pendiente

| Ticket     | Descripción                   | Detalle                                                                                                                                                                              |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **DEV-??** | Vista mobile de nueva reserva | Solo existe la vista desktop. La estructura wizard (`MobStepper`) debería dividirse en pasos: (1) Info reserva, (2) Selección de fechas, (3) Info cliente, (4) Resumen/confirmación. |

---

## 8. Detalles y restricciones a tener en cuenta

### Comportamiento de la cédula

- La cédula se escribe en el form con `{ emitEvent: false }` cuando viene de una búsqueda (`aplicarCliente`), para no disparar el listener que invalidaría la verificación recién hecha.
- Cualquier otra edición de la cédula (hecha por el usuario) **sí** emite y resetea todo: `busquedaRealizada → false`, `clienteBusqueda → null`, campos a `null`.

### Validadores condicionales

Los validadores `required` de `cedula`, `nombre`, `celular` se activan/desactivan dinámicamente según el tipo de reserva:

- **Común**: `cedula`, `nombre`, `celular` son requeridos
- **Colaboración**: `nombreColaboracion` es requerido; los anteriores se limpian

Los validadores de `cantidadTotal` y `cantidad` se activan/desactivan según el modo del servicio seleccionado. `cantidadMenores` siempre tiene solo `min(0)`.

### Errores de validación

Los errores de validación se muestran al hacer blur en cada campo **o** al presionar Confirmar (`submitted: true`). La excepción son los errores de cantidad negativa (`min`): se muestran de inmediato sin esperar blur ni submit.

### Carga del costo

Si el cálculo de costo falla (error HTTP), se muestra el error vía `ErrorHandlerService` y el panel de costo desaparece (`costo → null`). La reserva igual se puede crear: el costo es informativo, no bloquea.

### `ReservaFormBase` y futura edición

La base fue diseñada para ser extendida por un futuro `EditarReserva`. Las señales de estado de cliente (`busquedaRealizada`, `clientePrellenado`, `clienteBusqueda`) viven en la base porque `confirmDisabled` y el template las necesitan. La lógica de búsqueda activa (lupita, reset, formulario manual) vive solo en `NuevaReserva` y no existirá en la edición.
