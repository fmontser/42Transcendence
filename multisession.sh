#!/bin/bash

FIREFOX_CMD="firefox"
URL="https://localhost:8443/login"
PROFILE_BASE="./misc/ffprofile"

mkdir -p "$PROFILE_BASE"

for i in {1..4}; do
  PROFILE_DIR="$PROFILE_BASE/user$i"
  ABS_PROFILE_DIR="$(readlink -f "$PROFILE_DIR")"
  if [ ! -d "$ABS_PROFILE_DIR" ]; then
    echo "Creando carpeta para perfil user$i en $ABS_PROFILE_DIR"
    mkdir -p "$ABS_PROFILE_DIR"
    echo "Registrando perfil user$i en Firefox"
    $FIREFOX_CMD -CreateProfile "user$i $ABS_PROFILE_DIR"
    echo "Inicializando perfil user$i (esto puede tardar unos segundos)..."
    $FIREFOX_CMD --no-remote -profile "$ABS_PROFILE_DIR" -headless &
    sleep 3
    pkill -f "$FIREFOX_CMD.*$ABS_PROFILE_DIR"
  else
    echo "Perfil user$i ya existe en $ABS_PROFILE_DIR"
  fi
done

for i in {1..4}; do
  PROFILE_DIR="$PROFILE_BASE/user$i"
  ABS_PROFILE_DIR="$(readlink -f "$PROFILE_DIR")"
  if [ -d "$ABS_PROFILE_DIR" ]; then
    echo "Lanzando Firefox con perfil user$i"
	# Forzar barra de marcadores visible
    echo 'user_pref("browser.toolbars.bookmarks.visibility", "always");' >> "$ABS_PROFILE_DIR/user.js"
    $FIREFOX_CMD --no-remote -profile "$ABS_PROFILE_DIR" -new-instance "$URL" &
  else
    echo "ERROR: No se encontró el perfil $ABS_PROFILE_DIR"
  fi
done

wait