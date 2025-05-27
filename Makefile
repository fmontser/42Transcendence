COMPOSE_FILE	:= docker-compose.yml

build:

	@docker-compose -f $(COMPOSE_FILE) build

up:
	@docker-compose -f $(COMPOSE_FILE) up -d

down:
	@docker-compose -f $(COMPOSE_FILE) down

clean:
	@docker-compose -f $(COMPOSE_FILE) down --volumes --remove-orphans

fclean: clean
	@docker system prune -a -f

re: fclean build up

.PHONY: build up down clean re