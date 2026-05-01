# Estructura para skills de Copilot

Este directorio contiene skills reutilizables para Copilot en el workspace.

## Estructura recomendada

```text
.github/skills/<skill-name>/
├── SKILL.md
├── scripts/
├── references/
└── assets/
```

## Cómo agregar una skill nueva

1. Crea una carpeta dentro de `.github/skills/` con un nombre corto y en minúsculas.
2. Agrega un archivo `SKILL.md` con frontmatter YAML válido.
3. Coloca scripts auxiliares en `scripts/`.
4. Guarda documentación de apoyo en `references/`.
5. Usa `assets/` para plantillas, ejemplos o archivos de referencia.

## Convenciones

- El nombre de la carpeta y el campo `name` de `SKILL.md` deben coincidir.
- La descripción debe incluir palabras clave claras para que Copilot la detecte.
- Mantén el contenido del `SKILL.md` enfocado y delega lo reutilizable a archivos auxiliares.