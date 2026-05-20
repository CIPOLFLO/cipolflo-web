---
name: code-review
description: 'Revisión de código del frontend Angular (CIPOLFLO). Use for: revisar la rama actual antes de un PR, verificar convenciones del proyecto, ejecutar tests, y detectar si los cambios impactan el README o el AGENTS.md.'
argument-hint: 'opcional'
user-invocable: true
---

# Code Review

## Cuándo usarla

- Al terminar una feature y antes de abrir un PR.
- Para verificar que los archivos nuevos o modificados siguen las convenciones del proyecto.
- Para detectar si algún cambio requiere actualizar README.md o AGENTS.md.
- Para ejecutar tests y resumir fallos de forma simple.

## Cómo invocarla

- Manual (recomendado): escribir `/code-review` en el chat.
- Por intención: pedir en lenguaje natural una revisión de la rama antes de abrir PR.
- Si el flujo encuentra errores, activa el modo interactivo de sugerencias en la skill relacionada.

## Procedimiento

1. Obtener contexto de la rama.

   ```bash
   git rev-parse --abbrev-ref HEAD
   git diff --name-status develop...HEAD
   git diff develop...HEAD
   ```

   Si `develop` no existe como rama base, intentar con `main`. Si tampoco existe, usar
   `git diff HEAD~1` como fallback e indicarlo en el archivo final.

2. Leer solo lo relevante.
   - `README.md` para documentación de desarrolladores.
   - `AGENTS.md` para convenciones vigentes del proyecto.
   - `docs/conventions.md` para las convenciones de arquitectura del proyecto.
   - Cada archivo listado en el diff del paso anterior.

   No leer archivos que no hayan cambiado salvo que sea necesario para entender un cambio puntual.

3. Revisar cada archivo modificado o creado.

   Arquitectura y estructura
   - Los componentes usan `standalone: true`. No hay NgModules.
   - Los servicios de feature extienden `BaseHttpService`. No inyectan `HttpClient` directamente.
   - El environment se importa con `@env/environment`, nunca con ruta relativa.
   - Cada archivo está en la carpeta correcta según su tipo.
   - Los componentes reutilizables van en `shared/components/`.

   Convenciones de código
   - TypeScript strict: no hay `any` sin justificación.
   - Selectores de componentes con prefijo `app-` en kebab-case.
   - Selectores de directivas con prefijo `app` en camelCase.
   - No usar sintaxis Angular deprecada como `*ngIf` o `*ngFor`; usar `@if` y `@for`.
   - Single quotes en TypeScript, doble en HTML.
   - Las líneas no superan los 100 caracteres.
   - Solo se comenta el por qué, no el qué.

   Regla de error obligatorio
   - Marcar como `❌ Problema` cualquier uso de sintaxis Angular deprecada, incluyendo `*ngIf`, `*ngFor` o patrones equivalentes que deban migrarse a `@if` y `@for`.

   Servicios y datos
   - Los métodos placeholder tienen comentario `// TODO: reemplazar cuando el backend esté disponible.`
   - No hay lógica de negocio en componentes que debería estar en servicios.

   Convenciones del proyecto (`docs/conventions.md`)

   Para cada convención marcar ✅ cumple, ❌ no cumple (archivo y línea) o ➖ no aplica en este PR.
   - **Servicios HTTP puros**: el servicio devuelve `*RespuestaDto`, sin mapeos a tipos de presentación.
   - **Mapeo en el componente**: la transformación DTO → `*Row` ocurre en el `loadDataFn` del componente.
   - **Columnas en servicio dedicado**: las columnas de listados van en `*ColumnsService`, no inline en el componente.
   - **Filtros en servicio dedicado**: los filtros van en `*FilterService` extendiendo `FilterConfigProvider`.
   - **Row actions en el componente**: las acciones de fila están en el componente, no en un servicio.
   - **Orden de row actions**: Ver detalle → Modificar → Habilitar/Deshabilitar (spread ternario condicional) → separator → Eliminar. Cargadas como comentarios inicialmente.
   - **Modelos**: DTOs como `*RespuestaDto`, filas como `*Row extends Record<string, unknown>`, mappings de enums como `Record<string, string>` con sufijo `_LABEL`, opciones de select (`*_OPTIONS`) co-ubicadas con su enum.
   - **Imports del shared**: siempre desde el barrel `shared/index.ts`, nunca desde rutas internas de `shared/`.
   - **Query params en BaseHttpService**: se pasan como objeto plano `Record<string, unknown>`, sin construir `HttpParams` manualmente.

   PrimeNG
   - Los componentes se importan en el `imports` del `@Component`, no en un módulo global.
   - Se usan PrimeIcons (`pi pi-*`) cuando existe el equivalente.

4. Ejecutar tests.
   - Si el cambio es pequeño y se puede acotar, ejecutar solo los tests afectados.
   - Si no se puede acotar con seguridad, ejecutar `npm run test:coverage`.
   - Si el comando de cobertura no es viable, ejecutar `npm test`.
   - Si los tests fallan, resumir el resultado en lenguaje simple y breve.

5. Evaluar impacto en documentación.
   - `README.md`: actualizar si se agrega una dependencia, cambia un comando, cambia la estructura de directorios o el stack.
   - `AGENTS.md`: actualizar si se establece una convención nueva, se agrega un patrón de arquitectura o una librería que los agentes deben conocer.

6. Generar el archivo de salida.
   - Crear el archivo en la raíz del repositorio: `code_review_<nombre-de-la-rama>.md`
   - Reemplazar `/` por `-` en el nombre de la rama.

7. Activar el modo interactivo de sugerencias.
   Seguir el flujo definido en `review-error-suggestions/SKILL.md` tomando como entrada:
   - Los problemas marcados con ❌ en el archivo de salida del paso 6.
   - Los fallos de la sección `Tests > Fallos resumidos` del mismo archivo.

## Formato de salida

```markdown
<!-- ARCHIVO DE REVISIÓN LOCAL — NO PUSHEAR -->
<!-- Agregar a .gitignore: code_review_*.md -->

# Code Review — <nombre-de-la-rama>

**Fecha:** <fecha>
**Rama:** <rama>
**Base:** <rama base usada para el diff>

## Archivos revisados

- <ruta/archivo.ts> — [nuevo | modificado]

## Hallazgos por archivo

### <ruta/archivo.ts>

**✅ Correcto**

- <qué está bien>

**⚠️ Observaciones**

- <qué mejorar, con referencia a la regla>

**❌ Problemas**

- <qué debe corregirse antes del merge>

## Convenciones del proyecto

| Convención                                                | Estado       | Detalle |
| --------------------------------------------------------- | ------------ | ------- |
| Servicios HTTP puros                                      | ✅ / ❌ / ➖ |         |
| Mapeo en el componente                                    | ✅ / ❌ / ➖ |         |
| Columnas en servicio dedicado                             | ✅ / ❌ / ➖ |         |
| Filtros en servicio dedicado                              | ✅ / ❌ / ➖ |         |
| Row actions en el componente                              | ✅ / ❌ / ➖ |         |
| Orden de row actions                                      | ✅ / ❌ / ➖ |         |
| Modelos (`*RespuestaDto`, `*Row`, `*_LABEL`, `*_OPTIONS`) | ✅ / ❌ / ➖ |         |
| Imports desde barrel `shared/index.ts`                    | ✅ / ❌ / ➖ |         |
| Query params como objeto plano                            | ✅ / ❌ / ➖ |         |

## Tests

**Estado general:** ✅ Pasaron / ⚠️ Pasaron con advertencias / ❌ Fallaron

### Fallos resumidos

- <test o suite>: <qué falló> porque <causa breve>
- <test o suite>: <qué falló> porque <causa breve>

## Impacto en documentación

### README.md

- [ ] Sin cambios necesarios
- [ ] Requiere actualización → <qué sección y qué cambiar>

### AGENTS.md

- [ ] Sin cambios necesarios
- [ ] Requiere actualización → <qué sección y qué cambiar>

## Resumen

**Estado general:** ✅ Listo para PR / ⚠️ Revisiones menores / ❌ Bloqueante

<Párrafo corto con el estado general y próximos pasos>

## Recursos

- [convenciones](../../../docs/conventions.md)
- Skill relacionada: review-error-suggestions
```
