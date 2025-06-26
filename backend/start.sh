#!/bin/bash

# Lancer le script python en arrière-plan
python3 ./data/sync_to_google.py &

# Lancer le backend Node.js au premier plan
node server.js
