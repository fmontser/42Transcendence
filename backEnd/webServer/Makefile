SRC_DIR		:= src/
DIST_DIR	:= dist/
NAME		:= webserver.js
NODES_DIR	:= node_modules/
TSC			:= $(NODES_DIR)/.bin/tsc

all: run

build:
	@echo "Instalando dependencias..."
	@npm install
	@echo "Compilando TypeScript..."
	@$(TSC)

run: build
	@echo "Ejecutando servicio Fastify Webserver..."
	@node $(DIST_DIR)$(NAME)

clean:
	@echo "Limpiando proyecto Webserver..."
	@rm -rf $(DIST_DIR) $(NODES_DIR)

re: clean build

.PHONY: all build run clean re
