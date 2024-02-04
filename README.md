# Home Sparkplug Server
This project is a home project I have been working on to provide Sparkplug functionality at home. The project launches a Sparkplug Host with a Websocket Server in the back end, while hosting a Web Server that connects to the Sparkplug Host. This provides a simple web application that can both view and interact the data from a Sparkplug System.

# Sparkplug Web Client (client)
A React/TS project that loads Sparkplug data into a redux store and displays that data to the user.
See the Readme in the client folder for more information.

# Sparkplug Server
A c++ project that contains a Sparkplug Host with a Websocket server.
See the Readme in the server folder for more information.

# Docker Deployment
The stack can be deployed with the provided Docker Compose file. This will build the required docker images and then launch them together as a single stack.

## Docker Environment
The following environment variables are supported by the docker stack
| Flag  | Description |
| ------------- | ------------- |
| BROKER_ADDRESS | The address of the MQTT broker the Sparkplug Host will connect to |
| WEBSOCKET_PORT | The public websocket port that will be exposed for clients to connect to |
| WEB_PORT | The Web Server port that will be exposed |
