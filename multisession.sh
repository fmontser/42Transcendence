#!/bin/bash

# Ruta al ejecutable de Firefox (ajústala si es necesario)
FIREFOX_CMD="firefox"

# URL a abrir
URL="https://localhost:8443/login"

# Crear perfiles temporales (si no existen)
for i in {1..4}; do
  PROFILE_DIR="/tmp/firefox-user$i"
  if [ ! -d "$PROFILE_DIR" ]; then
    $FIREFOX_CMD -CreateProfile "user$i $PROFILE_DIR"
  fi
done

# Lanzar 4 instancias de Firefox con perfiles separados
$FIREFOX_CMD --no-remote -profile "/tmp/firefox-user1" -new-instance "$URL" &
$FIREFOX_CMD --no-remote -profile "/tmp/firefox-user2" -new-instance "$URL" &
$FIREFOX_CMD --no-remote -profile "/tmp/firefox-user3" -new-instance "$URL" &
$FIREFOX_CMD --no-remote -profile "/tmp/firefox-user4" -new-instance "$URL" &
