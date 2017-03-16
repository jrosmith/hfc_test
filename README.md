
# Must update IP's in blockchain/config/network_config.js
# Must reset fabric backend in order to flush memberservices
---

## Run all commands from test_grpc directory:

### Running without PM2 (which works)

1. `npm install`
2. `node server/server.js`
3. `node client/client.js`

### Running with PM2 (which breaks)

1. `npm install`
2. `pm2 start server/server.js`
3. `node client/client.js`
