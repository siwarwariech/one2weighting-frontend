@echo off
chcp 65001 > nul
title One2Weighting Frontend
echo [FRONTEND] Démarrage du serveur Vite + React...

REM Vérifier si node_modules existe
if not exist "node_modules" (
    echo Installation des dépendances npm...
    npm install
)

echo [FRONTEND] Serveur démarré sur: http://localhost:5173
npm run dev