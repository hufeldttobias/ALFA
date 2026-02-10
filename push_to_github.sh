#!/bin/bash

# Script til at pushe projektet til GitHub
# Kør dette script efter at have installeret Xcode Command Line Tools

cd "/Users/tobiashufeldt/Desktop/Nimastay - Living Flex"

# Initialiser git repository (hvis det ikke allerede er gjort)
if [ ! -d .git ]; then
    git init
fi

# Tilføj alle filer
git add .

# Lav commit
git commit -m "Initial commit"

# Tilføj remote repository
git remote add origin https://github.com/hufeldttobias/NIMASTAY-LIVINGFLEX.git 2>/dev/null || git remote set-url origin https://github.com/hufeldttobias/NIMASTAY-LIVINGFLEX.git

# Push til GitHub
git branch -M main
git push -u origin main

echo "Projektet er nu pushet til GitHub!"


