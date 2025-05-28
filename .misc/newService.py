import os
import sys
import json
import subprocess

def create_project_structure(base_path):
	project_name = os.path.basename(base_path)

	paths = [
		os.path.join(base_path, "dist"),
		os.path.join(base_path, "src"),
	]

	for path in paths:
		os.makedirs(path, exist_ok=True)

	# src/main.ts
	with open(os.path.join(base_path, "src", "main.ts"), "w") as f:
		f.write(f"""import Fastify from 'fastify';

const server = Fastify({{
	logger: true 
}});

async function start() {{
	try {{
		await server.listen({{ port: 3000, host: '0.0.0.0' }});	// No cambiar el host, por que estamos usando la red docker!
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
	with open(os.path.join(base_path, "tsconfig.json"), "w") as f:
		json.dump(tsconfig_content, f, indent=2)

	# package.json
	package_json_content = {
		"name": project_name.lower().replace(" ", "-"),
		"version": "1.0.0",
		"description": "",
		"main": "dist/main.js",
		"scripts": {
			"build": "tsc",
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
			"typescript": "^5.3.0"
		}
	}
	with open(os.path.join(base_path, "package.json"), "w") as f:
		json.dump(package_json_content, f, indent=2)

	# .gitignore
	with open(os.path.join(base_path, ".gitignore"), "w") as f:
		f.write("node_modules/\ndist/\n.env\n*.log\n")

	# Run npm install
	print(f"Running 'npm install' in {base_path}...")
	try:
		subprocess.run(["npm", "install"], cwd=base_path, check=True, shell=sys.platform == "win32")
		print("'npm install' completed successfully.")
	except subprocess.CalledProcessError as e:
		print(f"Error during 'npm install': {e}")
	except FileNotFoundError:
		print("Error: 'npm' command not found. Please ensure Node.js and npm are installed and in your PATH.")


if __name__ == "__main__":
	if len(sys.argv) < 2:
		print("Usage: python script_name.py <project_path>")
		sys.exit(1)
	
	project_path_arg = sys.argv[1]
	create_project_structure(project_path_arg)
	print(f"Project structure created and dependencies installed at: {project_path_arg}")