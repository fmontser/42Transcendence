import os
import sys
import json
import subprocess

def create_project_structure(base_path):
	project_name = os.path.basename(base_path)
	service_title_name = project_name.replace('-', ' ').replace('_', ' ').title()
	file_base_name = project_name.replace(' ', '_').lower()

	paths = [
		os.path.join(base_path, "src"),
	]

	for path in paths:
		if not os.path.exists(path):
			 os.makedirs(path, exist_ok=True)

	ts_file_path = os.path.join(base_path, "src", f"{file_base_name}.ts")
	with open(ts_file_path, "w", encoding='utf-8') as f:
		f.write(f"""import Fastify from 'fastify';

const server = Fastify({{
	logger: true 
}});

async function start() {{
	try {{
		await server.listen({{ port: 3000, host: '0.0.0.0' }});
	}} catch (err) {{
		server.log.error(err);
		process.exit(1);
	}}
}}

start();
""")

	tsconfig_content = {
		"compilerOptions": {
			"target": "ES2020",
			"module": "commonjs",
			"sourceMap": True,
			"outDir": "./dist",
			"rootDir": "./src",
			"strict": True,
			"esModuleInterop": True,
			"skipLibCheck": True,
			"forceConsistentCasingInFileNames": True
		},
		"include": ["src/**/*"],
		"exclude": ["node_modules"]
	}
	with open(os.path.join(base_path, "tsconfig.json"), "w", encoding='utf-8') as f:
		json.dump(tsconfig_content, f, indent=2)

	js_main_file = f"dist/{file_base_name}.js"
	package_json_content = {
		"name": file_base_name,
		"version": "1.0.0",
		"description": f"Servicio {service_title_name} para el proyecto Trascendence",
		"main": js_main_file,
		"scripts": {
			"build": "tsc",
			"start": f"node {js_main_file}",
			"dev": f"tsc -w & nodemon {js_main_file}"
		},
		"keywords": ["fastify", "nodejs", "typescript", file_base_name],
		"author": "",
		"license": "ISC",
		"dependencies": {
			"fastify": "latest"
		},
		"devDependencies": {
			"@types/node": "latest",
			"nodemon": "latest",
			"typescript": "latest"
		}
	}
	with open(os.path.join(base_path, "package.json"), "w", encoding='utf-8') as f:
		json.dump(package_json_content, f, indent=2)

	with open(os.path.join(base_path, ".gitignore"), "w", encoding='utf-8') as f:
		f.write("node_modules/\ndist/\n.env\n*.log\n")

	dockerfile_content = f"""FROM node:20-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM debian:bullseye-slim
ARG NODE_MAJOR_LTS=20

RUN apt-get update && \\
	apt-get install -y curl ca-certificates gnupg --no-install-recommends && \\
	mkdir -p /etc/apt/keyrings && \\
	curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \\
	echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR_LTS.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \\
	apt-get update && \\
	apt-get install nodejs -y --no-install-recommends && \\
	rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
COPY --from=builder /usr/src/app/dist ./dist/

CMD ["node", "{js_main_file}"]
"""
	with open(os.path.join(base_path, "Dockerfile"), "w", encoding='utf-8') as f:
		f.write(dockerfile_content.strip())


	# README.md para el servicio
	readme_service_content = f"""# Servicio: {service_title_name}

*   Autor: nombre
*   Contacto: @user en *Slack*

Este directorio contiene el código fuente y la configuración para el servicio **{service_title_name}** del proyecto Trascendence.

`src/{file_base_name}.ts`: Archivo main.

`src/other.ts`: Otros archivos.

## Documentación del Servicio

*   **Propósito del Servicio:** Descripcion...

---

*   **API:**
    *   Explicacion de uso del servicio. Ejemplos de codigo de ser necesario.

    ```typescript
    function sampleFunction(): void {{ 

        let text: string = "text";
        let number: number = 1;
    }}
    ```
---
*   **API (Endpoints):**
    *   Para cada endpoint expuesto para el servicio intentar dar la informacion mas completa posible:
        *   Método HTTP (GET, POST, PUT, DELETE, etc.).
        *   Ruta (path).
        *   Descripción de lo que hace el endpoint.
        *   Parámetros de ruta (si los hay).
        *   Parámetros de consulta (query parameters, si los hay).
        *   Cuerpo de la petición esperado (request body), incluyendo formato y campos obligatorios/opcionales.
        *   Ejemplos de peticiones.
        *   Respuestas posibles (códigos de estado HTTP y cuerpo de la respuesta esperado para cada caso, incluyendo errores).
        *   Ejemplos de respuestas.
---

*   **Dependencias:** Descripcion de dependencias inter-servicios.
*   **Variables de Entorno:**
    *   Nombre del container: **{file_base_name}**
    *   Archivo **.env**:
        *   **SAMPLE_ENV_VAR**: Descricion de variables **.env**
    
*   **Notas Adicionales:**
    *   Notas

`¡Mantén esta documentación actualizada a medida que el servicio evoluciona!` Una buena documentación es clave para el éxito del proyecto y la colaboración en equipo.

"""
	with open(os.path.join(base_path, "README.md"), "w", encoding='utf-8') as f:
		f.write(readme_service_content)


	makefile_content = f"""SRC_DIR		:= src/
DIST_DIR	:= dist/
NAME		:= {file_base_name}.js
NODES_DIR	:= node_modules/
TSC			:= $(NODES_DIR)/.bin/tsc

all: run

build:
	@echo "Instalando dependencias..."
	@npm install
	@echo "Compilando TypeScript..."
	@$(TSC)

run: build
	@echo "Ejecutando servicio Fastify {service_title_name}..."
	@node $(DIST_DIR)$(NAME)

clean:
	@echo "Limpiando proyecto {service_title_name}..."
	@rm -rf $(DIST_DIR) $(NODES_DIR)

re: clean build

.PHONY: all build run clean re
"""
	with open(os.path.join(base_path, "Makefile"), "w", encoding='utf-8') as f:
		f.write(makefile_content)


	print(f"Ejecutando 'npm install' en {base_path} para desarrollo local...")
	try:
		use_shell = sys.platform == "win32"
		subprocess.run(["npm", "install"], cwd=base_path, check=True, shell=use_shell)
		print("'npm install' completado exitosamente para desarrollo local.")
	except subprocess.CalledProcessError as e:
		print(f"Error durante 'npm install': {e}")
	except FileNotFoundError:
		print("Error: Comando 'npm' no encontrado.")


if __name__ == "__main__":
	if len(sys.argv) < 2:
		print("Uso: python nombre_script.py <ruta_del_proyecto>")
		sys.exit(1)
	
	project_path_arg = sys.argv[1]
	create_project_structure(project_path_arg)
	print(f"Estructura del proyecto creada en: {project_path_arg}")
	
	RED_START = "\033[91m"
	COLOR_END = "\033[0m"

	print(f"\n{RED_START}RECORDATORIO IMPORTANTE:{COLOR_END}")
	print(f"{RED_START}1. Revisa y personaliza los archivos generados (Dockerfile, README.md, Makefile) si es necesario.{COLOR_END}")
	print(f"{RED_START}   (El CMD del Dockerfile está fijado a 'dist/database.js' según tu última petición. Si necesitas que sea dinámico, ajusta el script o el Dockerfile).{COLOR_END}")
	print(f"{RED_START}2. Deberás configurar tu archivo 'docker-compose.yml' para construir (build) y ejecutar (run) este nuevo servicio usando el Dockerfile.{COLOR_END}")
