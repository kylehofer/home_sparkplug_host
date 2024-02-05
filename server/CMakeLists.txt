cmake_minimum_required(VERSION 3.17)

include(FetchContent)
include(ExternalProject)

project(home_sparkplug_host C CXX ASM)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 20)

set(BUILD_TARGET LINUX)
set(PAHO_WITH_MQTT_C TRUE)

# Finding all of our source files
file(GLOB_RECURSE SOURCES RELATIVE ${CMAKE_CURRENT_SOURCE_DIR} "src/*.cpp")

add_executable(home_sparkplug_host ${SOURCES})

if(CMAKE_BUILD_TYPE STREQUAL Release)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -O3 -fPIC")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -O3 -fPIC")
else()
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -fPIC")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -fPIC")
endif()

IF(FETCH_REMOTE)
    FetchContent_Declare(
        cpp_sparkplug_host
        GIT_REPOSITORY https://github.com/kylehofer/cpp_sparkplug_host.git
        GIT_TAG nestedPropertySets
    )
    FetchContent_MakeAvailable(cpp_sparkplug_host)

    # Grabbing paho MQTT
    FetchContent_Declare(
        websocketpp
        GIT_REPOSITORY https://github.com/zaphoyd/websocketpp.git
        GIT_TAG develop
    )

    FetchContent_MakeAvailable(websocketpp)

    target_include_directories(home_sparkplug_host PRIVATE "${websocketpp_SOURCE_DIR}")
    target_include_directories(home_sparkplug_host PRIVATE "${cpp_sparkplug_host_SOURCE_DIR}/src")
ELSE()
    add_subdirectory(./external/cpp_sparkplug_host)
    add_subdirectory(./external/websocketpp)

    target_include_directories(home_sparkplug_host PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}/external/cpp_sparkplug_host/src")
    target_include_directories(home_sparkplug_host PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}/external/websocketpp")
ENDIF()

# target_include_directories(cpp_sparkplug_host PUBLIC paho_mqtt_cpp)

# Finding all of our source files
file(GLOB_RECURSE SOURCES RELATIVE ${CMAKE_CURRENT_SOURCE_DIR} "./src/*.cpp")

# Main library compiling
target_include_directories(home_sparkplug_host PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}/src")

# Linking libraries
target_link_libraries(
    home_sparkplug_host
    cpp_sparkplug_host
)
