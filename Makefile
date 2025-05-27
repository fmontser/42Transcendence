COMPOSE_FILE	:= docker-compose.yml

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