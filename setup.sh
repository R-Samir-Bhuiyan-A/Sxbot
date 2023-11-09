#!/bin/bash

# Check the current platform
PLATFORM="$(uname)"
if [ "$PLATFORM" == "Linux" ]; then
    # Linux
    INSTALL_COMMAND="apt-get"
elif [ "$PLATFORM" == "Darwin" ]; then
    # macOS
    INSTALL_COMMAND="brew"
elif [ "$PLATFORM" == "MINGW64_NT-10.0" ]; then
    # Windows (MinGW)
    echo "Windows platform detected. You need to install the following manually:"
    echo "1. Node.js and npm: Download and install from https://nodejs.org/en/download/"
    echo "2. Git: Download and install from https://git-scm.com/downloads"
    echo "3. Clone your code repository and navigate to the project directory."
    echo "4. Run 'npm install mineflayer mineflayer-pathfinder' to install required modules."
    echo "5. Make sure to set up 'sxbot' or any other start script accordingly."
    exit 1
else
    # Unsupported platform
    echo "Unsupported platform: $PLATFORM"
    exit 1
fi

# Install Node.js and npm
echo "Installing Node.js and npm..."
$INSTALL_COMMAND install nodejs npm

# Install Git
echo "Installing Git..."
$INSTALL_COMMAND install git



# Change to the code directory
cd bot

# Install required Node.js modules
echo "Installing required Node.js modules..."
npm install mineflayer
npm install mineflayer-pathfinder

# Provide instructions for running the code
echo "Your environment is set up. To run your code, use the following command:"
echo "run 'sxbot' to start the bot"

# Optionally, you can run your code
# node <your_script_name>.js

exit 0
