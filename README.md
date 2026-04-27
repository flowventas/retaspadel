# 6 loco

App web para organizar retas de padel con rounds automáticos, scores rapidos y tabla de poder en vivo.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Estado persistido en `localStorage`

## Correr localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Incluye

- Retas para `8`, `12`, `16` y `20` jugadores
- Captura de scores a `5` o `6` juegos
- Tabla de poder dinamica
- Historial editable de rondas
- Exportacion a CSV
- Modo claro / oscuro
- Jugadores recientes guardados localmente

## Notas

- Formato `8 jugadores`: 7 rondas
- Formato `12 jugadores`: 9 rondas
- Formato `16 jugadores`: 10 rondas
- Formato `20 jugadores`: 10 rondas
- Puedes usar `Cargar demo rapido` para probar la app
