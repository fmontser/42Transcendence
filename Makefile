MAKEFLAGS 		+= --silent

VOLUMES_DIR		:= volumes/
DB_DIR			:= backEnd/dataBase/
MM_DIR			:= backEnd/matchMaker/
SP_DIR			:= backEnd/serverPong/

COMPOSE_FILE	:= docker-compose.yml


# Instala y actualiza node.js npm, nvm, npx (necesario en los mac de 42)
toolchain:
	echo "Updating npm, nvm and node.js"
	@curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
	@export NVM_DIR="$$HOME/.nvm"; \
		[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
		nvm install --lts

# Crea una plantilla de servicio nueva
new:
	@if [ -z "$(word 2, $(MAKECMDGOALS))" ]; then \
		echo "Error: Use like: make new backEnd/newService"; \
		exit 1; \
	fi
	@python3 .misc/newService.py $(word 2, $(MAKECMDGOALS))
%:
	@:

# Visualiza por consola el output de un container
peek:
	@if [ -z "$(word 2, $(MAKECMDGOALS))" ]; then \
		echo "Error: Use like: make peek service"; \
		exit 1; \
	fi
	@docker compose logs -f $(word 2, $(MAKECMDGOALS))
%:
	@:

all: build

build:
	@echo "Building docker images..."
	@mkdir -p volumes/dataBase-volume/
	@docker compose -f $(COMPOSE_FILE) build

up: down build
	@echo "Setting services online..."
	@docker compose -f $(COMPOSE_FILE) up -d

down:
	@echo "Setting services offline..."
	@docker compose -f $(COMPOSE_FILE) down

clean:
	@echo "Cleaning docker..."
	@docker compose -f $(COMPOSE_FILE) down --volumes --remove-orphans
	@make -C $(DB_DIR) clean
	@make -C $(MM_DIR) clean
	@make -C $(SP_DIR) clean
	
fclean: clean
	@echo "Force cleaning whole project..."
	@docker system prune -a -f
	@rm -rf volumes


re: fclean build up

.PHONY: all build up down clean re new