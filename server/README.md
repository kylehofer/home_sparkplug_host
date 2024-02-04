# Sparkplug Websocket Server
This project builds an application that starts a Sparkplug Host alongside a Websocket Server and passes data between this applications to provide Sparkplug Data to a Web Client Front-End

## Building
This library uses cmake for building and dependency management.
The following build flags are supported:
| Flag  | Default | Description |
| ------------- | ------------- |  ------------- |
| FETCH_REMOTE | ON | Whether to fetch remote dependencies through cmake. If disabled, the remote dependencies can be put within {PROJECT_ROOT}/external. |

## Dependencies
The following dependencies will be pulled and built by cmake:
- https://github.com/kylehofer/cpp_sparkplug_host.git
- https://github.com/zaphoyd/websocketpp.git
