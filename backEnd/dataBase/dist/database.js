"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fs_1 = require("fs");
const path_1 = require("path");
const server = (0, fastify_1.default)({
    logger: true
});
async function start() {
    const outputDir = '/usr/src/app/data'; // Ruta donde apunta tu volumen
    const fileName = 'test.txt';
    const filePath = (0, path_1.join)(outputDir, fileName);
    try {
        (0, fs_1.writeFileSync)(filePath, '¡Hola desde TypeScript en Docker!\n', 'utf-8');
        console.log(`Archivo guardado en ${filePath}`);
    }
    catch (err) {
        console.error('Error al guardar el archivo:', err);
    }
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=database.js.map