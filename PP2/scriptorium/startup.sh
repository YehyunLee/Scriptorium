#!/bin/bash
# Above line is needed to run the script with bash

echo "Installing npm packages:"
npm install











echo "Install Node & SQLite if not installed and upgrade to latest version:"
# From here to next long ####### hashtag, the code is generated by the o1-mini github copilot.
# ########################################################################################
# Detect Operating System
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32"* ]]; then
  OS="windows"
fi

echo "Detected Operating System: $OS"

# Function to install Node.js on different OS
function install_node {
  echo "Installing Node.js..."

  if [ "$OS" == "linux" ]; then
    # For Linux, use NodeSource PPA
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - || exit 1 "Failed to add NodeSource repository."
    sudo apt-get install -y nodejs || exit 1 "Failed to install Node.js."
  elif [ "$OS" == "macos" ]; then
    # For macOS, use Homebrew
    if ! command -v brew &> /dev/null; then
      echo "Homebrew not found. Installing Homebrew..."
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || exit 1 "Failed to install Homebrew."
    fi
    brew install node || exit 1 "Failed to install Node.js via Homebrew."
  elif [ "$OS" == "windows" ]; then
    # For Windows, use Chocolatey
    if ! command -v choco &> /dev/null; then
      echo "Chocolatey not found. Please install Chocolatey and re-run the script."
      echo "Visit https://chocolatey.org/install for installation instructions."
      exit 1
    fi
    choco install nodejs-lts -y || exit 1 "Failed to install Node.js via Chocolatey."
  else
    exit 1 "Unsupported Operating System."
  fi

  echo "Node.js installed successfully."
}

# Function to install SQLite3 on different OS
function install_sqlite {
  echo "Installing SQLite3..."

  if [ "$OS" == "linux" ]; then
    sudo apt-get install -y sqlite3 || exit 1 "Failed to install SQLite3."
  elif [ "$OS" == "macos" ]; then
    brew install sqlite || exit 1 "Failed to install SQLite3 via Homebrew."
  elif [ "$OS" == "windows" ]; then
    echo "Please download SQLite3 from https://www.sqlite.org/download.html and add it to your PATH."
    echo "Alternatively, you can install it via Chocolatey:"
    echo "choco install sqlite -y"
    exit 1
  else
    exit 1 "Unsupported Operating System."
  fi

  echo "SQLite3 installed successfully."
}

# Check and Install Node.js
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed."
  install_node
else
  NODE_VERSION=$(node -v)
  REQUIRED_VERSION="v18.17.0"

  # Function to compare version numbers
  function version_ge {
    # returns 0 if $1 >= $2
    [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" == "$2" ]
  }

  if version_ge "$NODE_VERSION" "$REQUIRED_VERSION"; then
    echo "Node.js version $NODE_VERSION is sufficient."
  else
    echo "Node.js version $NODE_VERSION is below the required $REQUIRED_VERSION."
    echo "Upgrading Node.js..."
    install_node
  fi
fi

# Check and Install SQLite3
if ! command -v sqlite3 &> /dev/null; then
  echo "SQLite3 is not installed."
  install_sqlite
else
  echo "SQLite3 is already installed."
fi
# ########################################################################################

ins_docker="false"
ins_docker_compose="false"

# check if docker is installed
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed."
  ins_docker="true"
else
  echo "Docker is already installed."
fi

# check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "Docker Compose is not installed."
  ins_docker_compose="true"
  else
  echo "Docker Compose is already installed."
fi

# install docker and docker-compose if not installed
if [ "$ins_docker" == "true" ] || [ "$ins_docker_compose" == "true" ]; then
  echo "Installing Docker and Docker Compose..."
  if [ "$OS" == "linux" ]; then
    # For Linux, install Docker and Docker Compose
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose || { echo "Failed to install Docker and Docker Compose."; exit 1; }
    sudo usermod -aG docker $USER
    newgrp docker
  elif [ "$OS" == "macos" ]; then
    # For macOS, install Docker Desktop
    echo "Please download Docker Desktop from https://www.docker.com/products/docker-desktop and install it."
    echo "Docker Compose is included in Docker Desktop."
    echo "After installation, you may need to start Docker Desktop manually."
    exit 1
  elif [ "$OS" == "windows" ]; then
    # For Windows, install Docker Desktop
    echo "Please download Docker Desktop from https://www.docker.com/products/docker-desktop and install it."
    echo "Docker Compose is included in Docker Desktop."
    echo "After installation, you may need to start Docker Desktop manually."
    exit 1
  else
    echo "Unsupported Operating System."
    exit 1
  fi
  echo "Docker and Docker Compose installed successfully."
fi

echo "Starting Docker..."
sudo systemctl start docker || { echo "Failed to start Docker."; }
echo "Docker started successfully."

# Run docker setup script
echo "Running Docker setup script..."
cd ./utils/code_executor/scripts
./setup.sh || { echo "Failed to run Docker setup script."; exit 1; }
# Go back to root directory
cd ../../../

#
## For these functions, I worked manually with github copilot autocomplete
## Function to install Python
#function install_python {
#  echo "Installing Python..."
#  if [ "$OS" == "linux" ]; then
#    sudo apt-get update
#    sudo apt-get install -y python3 python3-pip || { echo "Failed to install Python."; exit 1; }
#  elif [ "$OS" == "macos" ]; then
#    brew install python || { echo "Failed to install Python via Homebrew."; exit 1; }
#  elif [ "$OS" == "windows" ]; then
#    echo "Please download Python from https://www.python.org/downloads/windows/ and install it."
#    echo "Alternatively, you can install it via Chocolatey:"
#    echo "choco install python -y"
#    exit 1
#  else
#    echo "Unsupported Operating System."
#    exit 1
#  fi
#  echo "Python installed successfully."
#}
#
## Function to install Java
#function install_java {
#  echo "Installing Java JDK..."
#  if [ "$OS" == "linux" ]; then
#    sudo apt-get update
#    sudo apt-get install -y default-jdk || { echo "Failed to install Java."; exit 1; }
#  elif [ "$OS" == "macos" ]; then
#    brew install openjdk || { echo "Failed to install Java via Homebrew."; exit 1; }
#    sudo ln -sfn $(brew --prefix openjdk)/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk
#  elif [ "$OS" == "windows" ]; then
#    echo "Please download Java JDK from https://www.oracle.com/java/technologies/javase-jdk11-downloads.html and install it."
#    echo "Alternatively, you can install it via Chocolatey:"
#    echo "choco install openjdk -y"
#    exit 1
#  else
#    echo "Unsupported Operating System."
#    exit 1
#  fi
#  echo "Java JDK installed successfully."
#}
#
## Function to install GCC (C and C++ Compiler)
#function install_gcc {
#  echo "Installing GCC (C and C++ Compiler)..."
#  if [ "$OS" == "linux" ]; then
#    sudo apt-get update
#    sudo apt-get install -y build-essential || { echo "Failed to install GCC."; exit 1; }
#  elif [ "$OS" == "macos" ]; then
#    if ! xcode-select -p &> /dev/null; then
#      echo "Installing Xcode Command Line Tools..."
#      xcode-select --install || { echo "Failed to install Xcode Command Line Tools."; exit 1; }
#    fi
#  elif [ "$OS" == "windows" ]; then
#    echo "Please install MinGW or Visual Studio Build Tools manually."
#    echo "Alternatively, you can install MinGW via Chocolatey:"
#    echo "choco install mingw -y"
#    exit 1
#  else
#    echo "Unsupported Operating System."
#    exit 1
#  fi
#  echo "GCC installed successfully."
#}
#
## Check and Install Python
#if ! command -v python3 &> /dev/null; then
#  echo "Python is not installed."
#  install_python
#else
#  PYTHON_VERSION=$(python3 -V 2>&1 | awk '{print $2}')
#  REQUIRED_PYTHON_VERSION="3.6.0"
#  function version_ge {
#    [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" == "$2" ]
#  }
#  if version_ge "$PYTHON_VERSION" "$REQUIRED_PYTHON_VERSION"; then
#    echo "Python version $PYTHON_VERSION is sufficient."
#  else
#    echo "Python version $PYTHON_VERSION is below the required $REQUIRED_PYTHON_VERSION."
#    echo "Upgrading Python..."
#    install_python
#  fi
#fi
#
## Check and Install Java
#if ! command -v java &> /dev/null; then
#  echo "Java is not installed."
#  install_java
#else
#  echo "Java is already installed."
#fi
#
## Check and Install GCC (C and C++)
#if ! command -v gcc &> /dev/null || ! command -v g++ &> /dev/null; then
#  echo "GCC is not installed."
#  install_gcc
#else
#  echo "GCC is already installed."
#fi








echo "Conducting Prisma migrations:"
npx prisma generate
npx prisma migrate dev --name init
npx prisma migrate deploy

echo "Creating admin user:"
npx prisma db seed

echo "Admin user created successfully."
echo "If error occurs, it means the admin user already exists."

cd ./utils/code_executor/scripts

# Personal note for myself (Yehyun)
# Converthing Line Endings from CRLF to LF
# sudo apt-get install dos2unix
# dos2unix startup.sh

# Perm change
# chmod +x startup.sh


# Full command
# dos2unix startup.sh && chmod +x startup.sh
# dos2unix run.sh && chmod +x run.sh
# dos2unix utils/code_executor/scripts/setup.sh && chmod +x utils/code_executor/scripts/setup.sh
