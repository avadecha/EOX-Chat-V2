#!/bin/bash

source_dir="./eoxplugins/"
destination_dir="./plugins/"

[ ! -d "$source_dir" ] && { echo "Source directory not found: $source_dir"; exit 1; }
mkdir -p "$destination_dir"
find "$source_dir" -name "*.tar.gz" -exec tar -xzf {} -C "$destination_dir" \;
echo "Extraction completed."
