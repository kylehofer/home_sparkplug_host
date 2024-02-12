# A simple Dockerfile that might be used to compile the project
# for running isolated tests

FROM debian:latest as builder

RUN apt update && apt install -y curl

COPY ./ /client/
WORKDIR /client

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && \
    export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" && \
    nvm install 20 && nvm use 20 && npm i && npm run build

# CMD ["/bin/bash"]

FROM busybox:1.35

# Create a non-root user to own the files and run our server
RUN adduser -D static
USER static
WORKDIR /home/static

# Copy the static website
# Use the .dockerignore file to control what ends up inside the image!
COPY --from=builder /client/build ./

# Run BusyBox httpd
CMD ["busybox", "httpd", "-f", "-v", "-p", "3000"]

