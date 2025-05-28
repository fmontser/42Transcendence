import os
import sys
import json
import subprocess

def create_project_structure(base_path):
	project_name = os.path.basename(base_path)

	paths = [
		os.path.join(base_path, "src"),
	]

	for path in paths:
		# Solo crea 'src' si no existe, 'dist' se maneja en Docker
		if not os.path.exists(path) and os.path.basename(path) == "src":
			 os.makedirs(path, exist_ok=True)


	# src/main.ts
	with open(os.path.join(base_path, "src", "main.ts"), "w") as f:
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

	# tsconfig.json
	tsconfig_content = {
		"compilerOptions": {
			"target": "ES2020",
			"module": "commonjs",
			"outDir": "./dist", # TypeScript compila a 'dist' dentro de la etapa de build
			"rootDir": "./src",
			"strict": True,
			"esModuleInterop": True,
			"skipLibCheck": True,
			"forceConsistentCasingInFileNames": True
		},
		"include": ["src/**/*"],
		"exclude": ["node_modules"]
	}
	with open(os.path.join(base_path, "tsconfig.json"), "w") as f:
		json.dump(tsconfig_content, f, indent=2)

	# package.json
	package_json_content = {
		"name": project_name.lower().replace(" ", "-"),
		"version": "1.0.0",
		"description": "",
		"main": "dist/main.js", # Sigue siendo relevante para el CMD final
		"scripts": {
			"build": "tsc", # Este script se ejecutará en la etapa de build de Docker
			"start": "node dist/main.js",
			"dev": "tsc -w & nodemon dist/main.js"
		},
		"keywords": [],
		"author": "",
		"license": "ISC",
		"dependencies": {
			"fastify": "^4.26.0"
		},
		"devDependencies": {
			"@types/node": "^20.11.0",
			"nodemon": "^3.0.0",
			"typescript": "^5.3.0" # Necesario en la etapa de build
		}
	}
	with open(os.path.join(base_path, "package.json"), "w") as f:
		json.dump(package_json_content, f, indent=2)

	# .gitignore
	with open(os.path.join(base_path, ".gitignore"), "w") as f:
		f.write("node_modules/\ndist/\n.env\n*.log\n")

	# Dockerfile (multi-etapa)
	main_script_path = package_json_content.get('main', 'dist/main.js')
	dockerfile_content = f"""
# Builder
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Production
FROM debian:bullseye-slim

RUN apt-get update && \\
	apt-get install -y nodejs npm --no-install-recommends && \\
	rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=builder /usr/src/app/dist ./dist/

CMD ["node", "{main_script_path}"]
"""
	with open(os.path.join(base_path, "Dockerfile"), "w") as f:
		f.write(dockerfile_content.strip()) # .strip() para quitar líneas vacías al inicio/final

	# Run npm install
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

	print(f"\n{RED_START}¡IMPORTANTE!:{COLOR_END}")
	print(f"{RED_START}1. Revisa y personaliza el Dockerfile multi-etapa generado si es necesario.{COLOR_END}")
	print(f"{RED_START}2. Deberás configurar tu archivo 'docker-compose.yml' para construir (build) y ejecutar (run) este nuevo servicio usando el Dockerfile.{COLOR_END}")