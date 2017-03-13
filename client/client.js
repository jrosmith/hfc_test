var grpc = require('grpc');
var test_proto = grpc.load('./proto/test.proto').test;

function main() {
  var client = new test_proto.Test(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  var streamRequest = client.streamRequest({details: 'streamRequestCall'});

  streamRequest.on('error', function(err) {
    console.log("Server responded with error: " + err);
  });

  streamRequest.on('data', function(response) {
    console.log("Server responsed with response: " + JSON.stringify(response.details));
  });

  streamRequest.on('end', function() {
    console.log("Server has ended stream. Calling unaryRequest");

    var unaryRequest = client.unaryRequest({details: 'unaryRequestCall'}, function(err, response) {

        if (err) {
          console.log("Server responded with error: " + err);
        } else {
          console.log("Server responsed with response: " + JSON.stringify(response.details));
        }

      });

  });
}

main();
