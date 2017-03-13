var fs = require('fs');
var grpc = require('grpc');
var test_proto = grpc.load('./proto/test.proto').test;

// HFC interaction requirements
var blockchain = require('../blockchain/blockchain')

var UNARY_COMPLETED = test_proto.UnaryResponse.UnaryResponseCode.COMPLETED
var STREAM_ACK = test_proto.StreamResponse.StreamResponseCode.ACK
var STREAM_COMPLETED = test_proto.StreamResponse.StreamResponseCode.COMPLETED

process.env.UV_THREADPOOL_SIZE = 10;

function unaryRequest(call, callback) {
  console.log("Received call " + call.request.details + " on test server, going to register user\n");

  var user_deets = {
        username: 'user0',
        secret: 'passw0rd',
        roles: [ 'user' ]
    }

  blockchain.registerUser(user_deets, function(err) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
      callback(err);
    } else {
      console.log("\nSuccessfully registered user with HFC\n");

      callback(null, {stat:UNARY_COMPLETED, details: "User registered with HFC"});
    }
  });
}

function streamRequest(call) {
  console.log("\nReceived call " + call.request.details + " on test server, writing ACK response...\n");
  call.write({stat:STREAM_ACK, details: "Server acknowledged streamRequest"});
  console.log("Going to register admin...\n");

  var admin_deets = {
    username: "admin0",
    secret: "secretString",
    enrollId: "admin0",
    enrollSecret: "secretString",
    registrar:
    {
        roles:["regAssets","user"]
    }
  }

  blockchain.registerAdmin(admin_deets, function(err) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      console.log("\nSuccessfully registered admin with HFC\n");

      call.write({stat: STREAM_COMPLETED, details: "Admin registered with HFC"});
      call.end();
    }
  });
}

function main() {
  var server = new grpc.Server();
  server.addProtoService(
    test_proto.Test.service,
    {
      unaryRequest: unaryRequest,
      streamRequest: streamRequest
    });

  server.bind(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure()
  );

  server.start();

  blockchain.init();
}

main();
