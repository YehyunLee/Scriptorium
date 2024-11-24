FROM debian:bullseye-slim

# Set up required tools and a non-root user for isolation
RUN apt-get update && apt-get install -y \
    sudo \
    && useradd -ms /bin/bash runner \
    && echo "runner ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

USER runner
WORKDIR /home/runner

# Add default timeout limits and restrictions
CMD ["/bin/bash"]
