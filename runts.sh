#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: Missing source file to be run."
  exit 1
fi

if [[ "$1" != src/* ]]; then  
  FILE="src/$1"
else 
  FILE="$1"
fi

if [ ! -f "$FILE" ]; then
  echo "Error: File $FILE does not exist."
  exist 1
fi

npx ts-node -r tsconfig-paths/register "$FILE"