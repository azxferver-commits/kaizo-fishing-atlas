# KAIZO Gold Saucer

Guía estática e interactiva del Manderville Gold Saucer para GitHub Pages.

## Incluye

- Mapa práctico con siete zonas seleccionables.
- Cuenta atrás local para la siguiente GATE y el reinicio semanal.
- Calculadora de meta MGP y rutas según el tiempo disponible.
- Challenge Log interactivo con suma de recompensas.
- Fichas de 17 actividades, filtros y búsqueda.
- Fashion Report semanal con fuente en vivo y copia de seguridad local.
- Progreso guardado sólo en el navegador, sin cuenta ni inicio de sesión.

## Actualización semanal

El archivo `scripts/sync-fashion-report.py` transforma la última semana de la fuente pública en `data/fashion-report.json`. El workflow de `github-workflow/update-fashion-report.yml` debe vivir en `.github/workflows/` dentro del repositorio. Comprueba la fuente cada seis horas y sólo crea un commit cuando los datos cambian.

## Uso local

Sirve esta carpeta con cualquier servidor estático. Por ejemplo:

```bash
python3 -m http.server 4173
```

Después abre `http://localhost:4173/`.

FINAL FANTASY XIV © SQUARE ENIX. Proyecto comunitario no oficial.
