FROM debian:latest as builder

RUN apt update && apt install -y build-essential git cmake libssl-dev libboost-dev libpthread-stubs0-dev

COPY ./ /server/
WORKDIR /server

RUN mkdir -p build && rm -rf build/* && cd build && cmake .. -DFETCH_REMOTE=TRUE -DBUILD_TARGET=LINUX -DPAHO_WITH_MQTT_C=TRUE -DCMAKE_BUILD_TYPE=Release && make -j

ENTRYPOINT ["./build/home_sparkplug_host"]
