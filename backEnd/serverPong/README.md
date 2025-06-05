# Servicio: Serverpong

*   Autor: Fran Montserrat
*   Contacto: @fmontser en *Slack*

Este directorio contiene el código fuente y la configuración para el servicio **Serverpong** del proyecto Trascendence.

`src/serverpong.ts`: Archivo main, configura el servicio.

`src/endpoint.ts`: Configura endpoints con websocket e implementa las comunicaciones.

`src/pongEngine.ts`: Define el objeto juego que orquestra el gameplay genera la informacion para ser enviada a cliente y otros servicios.

`src/gameObject.ts`: Definicion de clase abstracta para gameObjects.

`src/playField.ts`: Define e implementa el comportamiento de la zona de juego.

`src/ball.ts`: Define e implementa el comportamiento de la bola.

`src/paddle.ts`: Define e implementa el comportamiento de las palas.



## Documentación del Servicio

*   **Propósito del Servicio:** Este servicio implementa la logica de juego pong, controla la posicion, el movimiento y el comportamiento de todos los elementos del jeugo. Recibe el input del cliente, lo procesa y devuelve el estado cada 16ms (60 fps). Al finalizar envia el resultado del juego.

---

*   **API:**
	*   El servicio se comunica por websocket con el cliente, queda pendiente la comunicacion con matchmaker para multijugador online (HTTP).

	*   El cliente debe establecer comunicacion con el endpoint mediante secure websocket wss, para luego recibir y enviar mensajes mediante el sistema de eventos (ver endpoint).

	```typescript
	function connect(): void { 
		ws = new WebSocket(`wss://${window.location.hostname}:8443/serverpong/front/get/pong`);
		//...
	}
	```
---
*   **Endpoints WEBSOCKET:**

*   La comunicación entre cliente y servidor sigue esta secuencia:

1. **Cliente solicita configuración inicial:**
	```json
	{
		"type": "setupRequest"
	}
	```

2. **Servidor envía la configuración:**
	```json
	{
		"type": "configuration",
		"ballPos": {
			"x": "number",
			"y": "number"
		},
		"ballRadius": "number",
		"paddlesPos": [
			{ "x": "number", "y": "number" },
			{ "x": "number", "y": "number" }
		],
		"paddleHeight": "number",
		"paddleWidth": "number",
		"score": [0, 0]
	}
	```

3. **Cliente configura y solicita nueva partida:**
	```json
	{
		"type": "newGame",
		"gameUID": "number",
		"player1UID": "number",
		"player2UID": "number"
	}
	```

4. **Comunicación durante el juego:**

- Cliente envía movimientos de paleta:
	```json
	{
		"type": "input",
		"playerId": "number",
		"direction": "up | down | stop"
	}
	```

- Servidor envía actualizaciones (60fps):
	```json
	{
		"type": "update",
		"ball": {
			"x": "number",
			"y": "number"
		},
		"paddles": [
			{ "x": "number", "y": "number" },
			{ "x": "number", "y": "number" }
		],
		"score": ["number", "number"]
	}
	```

5. **Servidor envía resultado final:**
	```json
	{
		"type": "endGame",
		"gameUID": "number",
		"giveUp": "boolean",
		"player1UID": "number",
		"player2UID": "number",
		"winnerUID": "number",
		"score": ["number", "number"]
	}
	```

---

*   **Endpoints HTTP:**
	*   SECCION PENDIENTE DE MATCHMAKING

---

*   **Dependencias:** Este servicio necesitara al servicio de matchmaking para el multijugador online (no implementado aun).
*   **Variables de Entorno:**
	*   Nombre del container: **serverpong**
	*   Archivo **.env**:
		*   **SPONG_BUILD_PATH**: Ruta hasta la carpeta del servicio.
	
*   **Notas Adicionales:**
	*   Pendiente de implementar el multiplayer online, necesita del servicio de matchmaking.

`¡Mantén esta documentación actualizada a medida que el servicio evoluciona!` Una buena documentación es clave para el éxito del proyecto y la colaboración en equipo.



