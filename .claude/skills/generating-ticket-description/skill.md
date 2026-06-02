# Generar descripción de ticket Jira

TRIGGER cuando el usuario escriba frases como:

- "genera la descripción de un ticket de jira para..."
- "crea un ticket de jira para..."
- "necesito un ticket para..."
- "arma el ticket de..."
- "describe el ticket de jira de..."
- "genera el ticket para..."
- cualquier variación que implique crear o describir un ticket de Jira.

Extrae la funcionalidad a describir del mensaje del usuario (lo que viene después de "para", "de" o similar) y trátalo como si fuera **$ARGUMENTS**.

Genera una descripción completa para un ticket de Jira basándote en el título o resumen: **$ARGUMENTS**

## Pasos a seguir

### 1. Leer las convenciones del proyecto

Lee el archivo `CLAUDE.md` del repositorio para tener presentes todas las convenciones vigentes antes de escribir cualquier cosa.

### 2. Buscar ejemplos similares en el código

Analiza la funcionalidad descrita en `$ARGUMENTS` e identifica componentes, servicios o flujos ya implementados que sean análogos. Para eso:

- Usa Glob con `src/app/**/*.ts` para detectar archivos relevantes.
- Usa Grep para buscar patrones relacionados (nombres de componentes, servicios, modelos, rutas).
- Lee entre 1 y 3 archivos que sean los más parecidos a lo que se pide.

Estos ejemplos te servirán para redactar los criterios de aceptación con terminología concreta del proyecto y para citarlos en la sección de referencias.

### 3. Generar la descripción del ticket

Produce la descripción en el siguiente formato Markdown. Respeta el orden y los encabezados exactos.

---

## 🎫 [PROYECTO-XXX] $ARGUMENTS

### Descripción

Explica en 2–4 oraciones qué se debe construir, por qué es necesario y qué valor aporta. Sé concreto: menciona el módulo Angular, la entidad de negocio y la acción del usuario involucrados.

---

### Contexto técnico

- **Módulo:** `src/app/<módulo>/`
- **Archivos a crear / modificar:** lista los archivos esperados (componente, servicio, modelo, rutas, spec).
- **Dependencias clave:** otros servicios o componentes que este ticket consume o expone.

---

### Ejemplos de referencia en el proyecto

Lista los archivos encontrados en el paso 2 que sirven de guía. Para cada uno indica por qué es relevante:

```
src/app/<módulo>/components/<componente>.ts   → ejemplo de <razón>
src/app/<módulo>/services/<servicio>.ts       → ejemplo de <razón>
```

Si no hay ejemplos directos, indicarlo explícitamente: _"No se encontraron componentes análogos; aplicar los patrones de CLAUDE.md desde cero."_

---

### Criterios de aceptación

Lista de ítems verificables. Cada ítem debe poder marcarse como hecho o no hecho. Incluye siempre:

#### Funcionales

- [ ] Describe el comportamiento visible para el usuario con verbos en infinitivo.
- [ ] (Agrega todos los comportamientos relevantes al caso.)

#### Técnicos — convenciones del proyecto (obligatorios en todos los tickets)

- [ ] El componente es `standalone: true` con `ChangeDetectionStrategy.OnPush` y selector `app-*`.
- [ ] El servicio extiende `BaseHttpService`; no se inyecta `HttpClient` directamente.
- [ ] El entorno se importa mediante el alias `@env/environment`, nunca con ruta relativa.
- [ ] La página usa `<app-page-layout>` con el `:host { display: flex; flex-direction: column; flex: 1; }` requerido.
- [ ] Los selects de filtros incluyen `{ label: 'Todos', value: '' }` como primera opción; los de formularios no obligatorios incluyen `{ label: '', value: '' }`.
- [ ] Si hay acciones de fila, respetan el orden: ver detalle → modificar → habilitar/deshabilitar (condicional) → separator → eliminar.
- [ ] No se usan NgModules; la arquitectura es 100 % standalone.
- [ ] No hay URLs de backend hardcodeadas; la URL base proviene de `environment`.
- [ ] No se usa `any` sin comentario justificativo.

#### Bajo acoplamiento

- [ ] El componente solo coordina la vista; toda lógica de negocio reside en el servicio.
- [ ] Los componentes reutilizables van en `shared/components/` sin referencias a módulos específicos.
- [ ] Las interfaces y DTOs se definen en `<módulo>/models/` o en `shared/models/` si son transversales.
- [ ] Se exponen `Output()` o `Observable` en lugar de referencias directas entre componentes hermanos.

#### Tests

- [ ] Existe un `.spec.ts` junto al archivo que cubre los casos principales.
- [ ] El test del servicio usa `provideHttpClientTesting()` — sin requests HTTP reales.
- [ ] Los tests pasan con `ng test --no-watch`.

#### Documentación (obligatorio)

- [ ] Si se agrega un nuevo patrón o convención, se actualiza `CLAUDE.md`.
- [ ] Si hay un contrato de API nuevo o modificado, se actualiza / crea el archivo de documentación correspondiente en el repositorio o en Confluence.
- [ ] El mensaje del commit final describe el _por qué_ del cambio, no solo el _qué_.
- [ ] Si el ticket introduce o modifica un flujo de UX complejo, se actualiza el diagrama o descripción en la memoria del proyecto (`.claude/memory/`).

---

### Notas para la implementación

- **Mientras el backend no esté disponible:** el servicio debe retornar `of(mockData)` con un comentario `// TODO: reemplazar cuando el backend esté disponible`.
- **Antes de abrir el PR:** ejecutar `npx prettier --write .`, `npx ng test --no-watch --coverage` y `npx ng lint`. Los tres deben pasar sin errores.
- **Convenciones de imports PrimeNG:** importar solo los módulos específicos necesarios (`primeng/button`, etc.), nunca `PrimeNGModule`.

---

### Checklist pre-PR

- [ ] `npx prettier --write .` — sin cambios residuales.
- [ ] `npx ng test --no-watch --coverage` — todos los tests pasan.
- [ ] `npx ng lint` — sin errores ni warnings.
- [ ] La rama sigue la convención `feature/DEV-XXX/descripcion-corta`.
- [ ] Documentación actualizada (ver sección de criterios).

---

### Dependencias / bloqueos

_Indicar aquí si este ticket depende de otro ticket, de una decisión de arquitectura pendiente o de que el backend exponga un endpoint._
