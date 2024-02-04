# A simple Dockerfile that might be used to compile the project
# for running isolated tests

FROM debian:latest as builder

RUN apt update && apt install -y curl

# RUN mkdir -p /install/usr/include/ /install/usr/lib/ && \
#     git clone https://github.com/eclipse/paho.mqtt.c.git && \
#     cd paho.mqtt.c && git checkout v1.3.8 && \
#     cmake -Bbuild -H. -DPAHO_ENABLE_TESTING=OFF -DPAHO_BUILD_STATIC=ON -DPAHO_WITH_SSL=ON -DPAHO_HIGH_PERFORMANCE=ON && \
#     cmake --build build/ --target package && \
#     tar -xf build/*.tar.gz -C /install/usr --strip-components=1

# RUN cd / && git clone https://github.com/eclipse/tahu.git && cd tahu/c/core && make -j4 && \
#     cp lib/* /install/usr/lib/ && cp include/* /install/usr/include/

# RUN cd /usr/src/gtest && cmake CMakeLists.txt && make && cp lib/*.a /install/usr/lib/ && cp -r include/* /install/usr/include/ && \
#     cd /usr/src/googletest/googlemock/ &&  mkdir build && cmake .. && make && cp lib/*.a /usr/lib/ && cp -r include/* /install/usr/include/


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

