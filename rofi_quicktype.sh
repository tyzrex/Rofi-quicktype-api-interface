#!/bin/bash

# Prompt the user for the API URL using Rofi
apiUrl=$(rofi -dmenu -p "Enter API URL:")

# Run the Node.js script with the provided API URL and capture the output
output=$(node interface.js "$apiUrl")


# Copy the selected interface to the clipboard
node rofi_interface.js


