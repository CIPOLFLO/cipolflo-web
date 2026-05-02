---
name: review-error-suggestions
description: 'Analiza errores encontrados en un code review. Use for: investigar cada error, determinar la causa probable, y proponer la sugerencia mas apropiada de forma simple y accionable.'
argument-hint: 'archivo de resultados o lista de errores'
user-invocable: false
---

# Review Error Suggestions

## Cuándo usarla

- Después de generar un archivo de code review con errores o advertencias.
- Cuando el usuario quiere sugerencias para resolver cada error detectado.
- Cuando se necesita una propuesta breve por hallazgo, sin extenderse demasiado.

## Procedimiento

1. Leer el archivo de resultados o la lista de errores provista.
2. Identificar cada error y su contexto inmediato.
3. Investigar el archivo afectado y el código relacionado si hace falta.
4. Determinar la causa más probable de cada error.
5. Entrar en modo interactivo y procesar un error por vez.
6. Mostrar una sola sugerencia concreta para el error actual, priorizando buenas prácticas de Angular y convenciones del proyecto.
7. Preguntar al usuario cómo continuar con opciones fijas: `aplicar`, `saltear`, `terminar`.
8. Según respuesta:
   - `aplicar`: ejecutar el cambio mínimo necesario, validar y pasar al siguiente error.
   - `saltear`: no modificar código y pasar al siguiente error.
   - `terminar`: cortar el flujo y entregar un resumen parcial.
9. Si no hay suficiente información, decirlo de forma explícita y sugerir el siguiente dato a revisar.
10. Validación mínima cuando se aplica una sugerencia:
    - Si el cambio toca tests: ejecutar tests afectados; si no se puede acotar, ejecutar `npm test`.
    - Si el cambio toca código de app sin tests modificados: ejecutar al menos lint o la suite de tests afectada.
    - Si falla la validación, reportar fallo simple y no marcar la sugerencia como aplicada.

## Criterios de salida

- Una sugerencia por error.
- Lenguaje breve y claro.
- Priorizar el cambio mínimo que resuelva el problema.
- No proponer soluciones hipotéticas si el contexto no alcanza.
- No listar todas las sugerencias juntas: entregarlas una por turno.
- Al finalizar, incluir un resumen corto con aplicadas, salteadas y pendientes.
- Marcar como aplicada solo si pasa la validación mínima definida.

## Formato sugerido

### <error o hallazgo>

- Causa probable: <resumen corto>
- Sugerencia: <acción concreta>
- Prioridad: <alta | media | baja>

### Acción del usuario

- ¿Qué querés hacer con esta sugerencia? [aplicar | saltear | terminar]
