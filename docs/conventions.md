# Convenciones del proyecto CIPOLFLO Web

## Capa de servicios HTTP

- Los servicios extienden `BaseHttpService` y son **capas HTTP puras**: reciben parámetros, llaman al backend y devuelven el DTO crudo (`*RespuestaDto`). No realizan transformaciones de presentación.
- `BaseHttpService.get()` acepta `Record<string, unknown>`. Los valores `null` y `undefined` se filtran automáticamente, así que los parámetros de query se pasan como objeto plano directamente (sin construir `HttpParams` manualmente).

```typescript
// ✅ Correcto
getAll({ page, size, filters }: TableQueryParams): Observable<PageResponse<ServicioRespuestaDto>> {
  return this.get<PageResponse<ServicioRespuestaDto>>('servicios', { page, size, ...filters });
}

// ❌ Incorrecto — el servicio no debe mapear a tipos de presentación
getAll(params: TableQueryParams): Observable<PageResponse<ServicioRow>> { ... }
```

---

## Capa de componentes

- La transformación de DTO a ViewModel (`*RespuestaDto` → `*Row`) ocurre en el `loadDataFn` del componente, no en el servicio.

```typescript
// ✅ Correcto — mapeo en el componente
protected readonly loadDataFn: LoadDataFn<ServicioRow> = (params) =>
  this.servicioService.getAll(params).pipe(
    map((response) => ({
      ...response,
      content: response.content.map((dto) => ({ ...dto, unidad: LABEL_MAP[dto.campo] })),
    })),
  );
```

---

## Estructura de componentes de listado

Cada listado debe separar su configuración en servicios dedicados:

| Responsabilidad | Dónde va |
|---|---|
| Definición de columnas | `*ColumnsService` — clase `@Injectable()` con `readonly columns: ColumnConfig[]` |
| Definición de filtros | `*FilterService` — extiende `FilterConfigProvider`, define `readonly filterFields` |
| Acciones de fila | Método `rowActions` en el **componente** (no en un servicio, son comportamiento) |
| Wiring (`loadDataFn`, `onFilterChange`) | Componente |

```
feature/
  components/
    listado-feature/
      listado-feature.ts       ← solo wiring
      listado-feature.html
      listado-feature.css
      listado-feature.spec.ts
  services/
    feature.service.ts          ← HTTP puro
    feature-columns.service.ts  ← columnas
    feature-filter.service.ts   ← filtros
  models/
    feature.model.ts            ← DTOs, enums, opciones
```

---

## Row actions — orden estándar

El orden de las acciones es igual en **todos** los listados. Se cargan comentadas y se van descomentando a medida que se implementa cada funcionalidad.

```typescript
protected readonly rowActions = (row: FeatureRow): RowAction<FeatureRow>[] => [
  // { label: 'Ver detalle',  icon: 'pi pi-eye',          command: () => ... },
  // { label: 'Modificar',    icon: 'pi pi-pencil',       command: () => ... },
  // ...(row.estado === EstadoFeature.Deshabilitado
  //   ? [{ label: 'Habilitar',    icon: 'pi pi-check-circle', command: () => ... }]
  //   : [{ label: 'Deshabilitar', icon: 'pi pi-ban',          command: () => ... }]),
  // { label: 'Eliminar',     icon: 'pi pi-trash',        command: () => ... },
];
```

- **Habilitar/Deshabilitar** son mutuamente excluyentes: se muestra uno u otro según el estado del registro, usando spread ternario.
- **Eliminar** va siempre al final (acción destructiva).

---

## Modelos

- **DTOs del backend**: interfaz `*RespuestaDto` con los campos tal como los devuelve el backend.
- **Tipos de fila para tabla**: interfaz `*Row extends Record<string, unknown>` con los campos que necesita la tabla (puede incluir campos derivados como `unidad`).
- **Mappings de enums del backend**: constante `Record<string, string>` nombrada `*_LABEL` (ej: `MODALIDAD_PRECIO_LABEL`).
- **Arrays de opciones para selects**: van en el mismo archivo de modelo que el enum del que derivan, exportados como `*_OPTIONS` (ej: `ESTADO_SERVICIO_OPTIONS`).

```typescript
// ✅ En feature.model.ts
export const ESTADO_FEATURE_OPTIONS = [
  { label: 'Habilitado', value: EstadoFeature.Habilitado },
  { label: 'Deshabilitado', value: EstadoFeature.Deshabilitado },
];
```

---

## Imports del módulo shared

Siempre importar desde el barrel `src/app/shared/index.ts`, nunca desde rutas internas.

```typescript
// ✅ Correcto
import { AppTable, TableStateService, ColumnConfig } from '../../../shared';

// ❌ Incorrecto
import { AppTable } from '../../../shared/components/table/table';
import { TableStateService } from '../../../shared/components/table/table-state.service';
```
