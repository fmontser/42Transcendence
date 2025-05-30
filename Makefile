COMPOSE_FILE	:= docker-compose.yml

# Instala y actualiza node.js npm, nvm, npx (necesario en los mac de 42)
toolchain:
	echo "Updating npm, nvm and node.js"
	@curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
	@export NVM_DIR="$$HOME/.nvm"; \
		[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
		nvm install --lts

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

.PHONY: all build up down clean re