De acuerdo, aquí tienes la guía de Gitflow aún más concisa, utilizando `git pull --rebase` y resumiendo las explicaciones:

---

**Guía Rápida de Gitflow para el Equipo Transcendence (GitHub)**

Nuestro flujo de trabajo en Git para mantener el proyecto organizado.

**Ramas Principales:**

1.  **`main`:**
	*   **PRODUCCIÓN.** Siempre estable, lista para "entregar".
	*   **NO TOCAR DIRECTAMENTE.** Actualizada desde `hotfix` o cuando `develop` esté lista.
	*   Commits importantes aquí = nueva versión (etiquetar `v1.0`).

2.  **`develop`:**
	*   **DESARROLLO ACTIVO.** Integra funcionalidades completas.
	*   Base para nuevas `feature`. Actualizada desde `feature` y `hotfix`.

**Ramas de Soporte (Temporales):**

3.  **`feature/<nombre-funcionalidad>` (Ej: `feature/pong-logic`, `feature/chat`):**
	*   **NUEVAS FUNCIONALIDADES / MÓDULOS.**
	*   **Creación (desde `develop` actualizado):**
		```bash
		git checkout develop
		git pull origin develop
		git checkout -b feature/mi-funcionalidad
		```
	*   **Trabajo:** Haz tus commits (`git add . && git commit -m "..."`).
	*   **Finalización (ANTES DE FUSIONAR A `develop`):**
		1.  **Actualiza tu `feature` con `develop` (usando rebase):**
			```bash
			# Estando en tu rama feature/mi-funcionalidad
			git pull --rebase origin develop
			# Si hay conflictos: edita, `git add <archivos>`, `git rebase --continue`. Repite.
			# Sube tu rama actualizada (puede requerir --force-with-lease):
			git push --force-with-lease origin feature/mi-funcionalidad
			```
		2.  Crea un **Pull Request (PR)** en GitHub: `feature/mi-funcionalidad` -> `develop`.
		3.  **Revisión de Código Obligatoria** por otro miembro.
	*   **Fusión:** Tras aprobar PR, fusionar a `develop` en GitHub.
	*   **Limpieza:** Eliminar rama `feature` (GitHub lo ofrece).

4.  **`hotfix/<descripcion-bug>` (Ej: `hotfix/login-crash-main`, `hotfix/stats-bug-develop`):**
	*   **BUGS CRÍTICOS en `main` o `develop`.**
	*   **Creación (desde la rama afectada actualizada):**
		*   Para `main`: `git checkout main && git pull origin main && git checkout -b hotfix/bug-en-main`
		*   Para `develop`: `git checkout develop && git pull origin develop && git checkout -b hotfix/bug-en-develop`
	*   **Trabajo:** Corrige el bug y haz commit.
	*   **Finalización:**
		1.  Crea PR: `hotfix/...` -> `main` (o `develop` según corresponda).
		2.  **Si el `hotfix` fue para `main`:** Una vez fusionado a `main` (y etiquetado `v1.0.1`), **FUSIONAR TAMBIÉN A `develop`** (ej. PR de `main` a `develop`, o fusionar la rama `hotfix` a `develop`).
	*   **Limpieza:** Eliminar rama `hotfix`.

**Flujo Feature:** `develop` -> `checkout -b feature/tarea` -> (desarrollar) -> `pull --rebase origin develop` -> PR a `develop` -> `develop`.

**Comunicación:** ¡Esencial! Sobre todo para tareas grandes o archivos compartidos.

---

Espero que esta versión más resumida sea aún más clara y directa para el equipo.