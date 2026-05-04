# Resultado de Pruebas de Rendimiento (Autocannon)

## Objetivo
Medir tiempos de respuesta y estabilidad basica del backend bajo distintos niveles de concurrencia.

## Fecha y entorno
- Fecha: 2026-04-20
- Herramienta: autocannon 8.0.0
- Endpoint probado: http://localhost:5000/
- Duracion por escenario: 15 segundos
- Entorno: local (Windows)

## Resultados resumidos

| Escenario | Concurrencia | Latencia promedio | Latencia p99 | Req/s promedio | Tasa de error |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Carga minima | 1 | 2.85 ms | 20 ms | 309.94 | 0% |
| Carga media | 10 | 3.22 ms | 21 ms | 2716.40 | 0% |
| Carga alta | 50 | 6.28 ms | 29 ms | 7375.94 | 0% |
| Punto de quiebre inicial | 100 | 9.79 ms | 37 ms | 9713.74 | 0% |

## Hallazgos
- El backend se mantuvo estable en todos los escenarios ejecutados.
- No se observaron errores HTTP durante la ventana de prueba.
- La latencia aumenta con la concurrencia, pero se mantiene en rangos bajos para 100 conexiones.

## Comandos ejecutados
- npx autocannon -c 1 -d 15 http://localhost:5000/
- npx autocannon -c 10 -d 15 http://localhost:5000/
- npx autocannon -c 50 -d 15 http://localhost:5000/
- npx autocannon -c 100 -d 15 http://localhost:5000/
