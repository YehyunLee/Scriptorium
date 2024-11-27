#!/bin/bash

cd ../Docker

echo "Building python image..."
docker build -t python_executor ./langs/python

echo "Building Java image..."
docker build -t java_executor ./langs/java

echo "Building JavaScript image..."
docker build -t javascript_executor ./langs/js

echo "Building C++ image..."
docker build -t cpp_executor ./langs/cpp

echo "Building C image..."
docker build -t c_executor ./langs/c

echo "Building Ruby image..."
docker build -t ruby_executor ./langs/ruby

echo "Building C# image..."
docker build -t csharp_executor ./langs/csharp

echo "Building PHP image..."
docker build -t php_executor ./langs/php

echo "Building Go image..."
docker build -t go_executor ./langs/go

echo "Building Swift image..."
docker build -t swift_executor ./langs/swift

echo "Building Assembly image..."
docker build -t assembly_executor ./langs/assembly