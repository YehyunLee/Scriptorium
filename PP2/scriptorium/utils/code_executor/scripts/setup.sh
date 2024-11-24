#!/bin/bash

cd ../Docker

echo "Building python image..."
docker build -t python_executor ./langs/python

#echo "Building language-specific images..."
#docker-compose build