# TerraTech Agro — Web móvil (Home)

Carpeta autocontenida con la versión **móvil** del Home, basada en el diseño de Figma
(frame *Mobile*, 375 px) y en el desarrollo desktop existente.

## Estructura

```
web-mobile/
├── index.html                 Página móvil (abrir en el navegador)
└── assets/
    ├── hero-bg.webp           Fondo del hero
    ├── pilares-bg.webp        Foto continua Pilares → Experiencia (Rectangle 105 de Figma)
    ├── logo-dark.webp         Logo oscuro para el header claro
    └── fonts/
        ├── BaticaSans-Regular.woff2 / .woff
        └── BaticaSans-Bold.ttf
```

Todas las imágenes están en **WebP**. Las rutas son relativas, así que la carpeta
funciona tal cual (abrir `index.html`) o subiéndola completa al sitio.

## Secciones (orden)

1. **Header frosted** — vidrio esmerilado claro con espacio superior, logo + buscador + menú.
2. **Hero** — foto + degradado, título Batica, "sostenible" en amarillo, bajada y botón Contacto anclados abajo.
3. **Nuestro enfoque** — fondo verde claro, chip, texto, botón "Sobre nosotros".
4. **Pilares** — chip + 3 filas (Medio ambiente / Social / Gobernanza); tocar para expandir.
5. **Experiencia** — misma línea que desktop: +60k, KPIs, +25 con botón "+" (recuadro clickeable).
6. **Footer** — verde #043120, Dirección / Recursos / Ayuda.

Pilares y Experiencia comparten **una sola foto de fondo con degradado** (sin corte),
usando `pilares-bg.webp`.

## Paleta (igual a Figma / desktop)

| Uso | Color |
|-----|-------|
| Verde fondo (hero, experiencia, footer) | `#043120` |
| Verde oscuro (texto/botones) | `#01302b` |
| Verde claro (Nuestro enfoque) | `#f3faef` |
| Amarillo acento | `#f4df57` |
| Amarillo 90% (títulos footer) | `rgba(244,223,87,.9)` |
| Hojas Pilares | `#7BC250` · `#0D7233` · `#043120` |
| Borde chip / píldora | `#c2cfcd` · `rgba(194,207,205,.72)` |

## Tipografías

- **Outfit** (Google Fonts) — cuerpo, navbar, **números de Experiencia** (igual que desktop).
- **Batica Sans** (empaquetada en `assets/fonts/`) — titulares y chips.

## Notas

- La sección **Experiencia no venía diseñada en el Figma móvil**; se replicó con el estilo
  desktop ya desarrollado (números + botón "+") y con el valor **+25** del sitio en vivo
  (el Figma aún muestra +30).
- Los pilares en Figma son filas estáticas; se les agregó **expandir al tocar** (equivalente
  táctil del "hover revela contenido" del desktop).
- Se quitó "Canal de denuncias" del footer, según indicación.
