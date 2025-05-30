COMPOSE_FILE	:= docker-compose.yml

# Instala y actualiza node.js npm, nvm, npx (necesario en los mac de 42)
toolchain:
	echo "Updating npm, nvm and node.js"
	@curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
	@export NVM_DIR="$$HOME/.nvm"; \
		[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
		nvm install --lts

new:
	@if [ -z "$(word 2, $(MAKECMDGOALS))" ]; then \
		echo "Error: debes especificar un carpeta/nombre. Ejemplo: make new backEnd/newService"; \
		exit 1; \
	fi
	@python3 .misc/newService.py $(word 2, $(MAKECMDGOALS))
%:
	@:
# Instala y actualiza node.js npm, nvm, npx (necesario en los mac de 42)
toolchain:
	echo "Updating npm, nvm and node.js"
	@curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
	@export NVM_DIR="$$HOME/.nvm"; \
		[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
		nvm install --lts

# Crea una plantilla de servicio nueva
new:
	@if [ -z "$(word 2, $(MAKECMDGOALS))" ]; then \
		echo "Error: debes especificar un carpeta/nombre. Ejemplo: make new backEnd/newService"; \
		exit 1; \
	fi
	@python3 .misc/newService.py $(word 2, $(MAKECMDGOALS))
%:
	@:

# Visualiza por consola el output de un container
peek:
	@if [ -z "$(word 2, $(MAKECMDGOALS))" ]; then \
		echo "Error: debes especificar el nombre del servicio. Ejemplo: make peek service"; \
		exit 1; \
	fi
	@docker compose logs -f $(word 2, $(MAKECMDGOALS))
%:
	@:

all: build

build:
	@docker compose -f $(COMPOSE_FILE) build

up: build
	@docker compose -f $(COMPOSE_FILE) up -d

down:
	@docker compose -f $(COMPOSE_FILE) down

clean:
	@docker compose -f $(COMPOSE_FILE) down --volumes --remove-orphans

fclean: clean
	@docker system prune -a -f

re: fclean build up

.PHONY: all build up down clean re new