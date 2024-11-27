FROM ubuntu:22.04

RUN apt-get update && apt-get install -y nasm gcc && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

CMD ["sh", "-c", "nasm -f elf64 temp.asm && ld -o temp temp.o && ./temp"]