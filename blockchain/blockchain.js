'use strict';
var hfc = require('hfc');
var crypto = require('crypto');
var config = require('./config/network_config')
var chain;
var initialized = false;
var dir_peerKeyValStore = __dirname + '/data/keys/';

exports.init = function () {
    if (initialized) {
        return;
    }

    var ca = config.ca
    var peer = config.peer

    console.log("Initializing the blockchain on peer[" + peer.discovery_host + ":" + peer.discovery_port + "]");

    chain = hfc.newChain("chain-network");

    chain.setDeployWaitTime(60);
    chain.setInvokeWaitTime(10);

    chain.setKeyValStore(hfc.newFileKeyValStore(dir_peerKeyValStore));
    chain.setMemberServicesUrl("grpc://" + ca.url);
    chain.addPeer("grpc://" + peer.discovery_host + ":" + peer.discovery_port);

    console.log("Connected to member service and peer");

    initialized = true;

    console.log("Running in local mode");
};

exports.registerAdmin = function (_admin, cb) {
    console.log("Registered admin: ", _admin.enrollId + " " + _admin.enrollSecret + "]");

    // Never comes out of chain.enroll call
    chain.enroll(_admin.enrollId, _admin.enrollSecret, function (err, admin) {
        if (err) {
            console.log("Failed to register admin, ", err);
            console.log(err);
            console.log(admin);
            cb(err);
        } else {
            console.log("Successfully registered admin");
            chain.setRegistrar(admin);
            cb(null);
        }
    });
};

exports.registerUser = function (_user, cb) {

    console.log("Going to register user");

    chain.getUser(_user, function (err, userObject) {
        if (err) {
            console.log("Error getting user ", _user.username);
            console.log(err)
            cb(err);
        } else if (userObject.isEnrolled()) {
            console.log("User " + _user.username + " is already enrolled")
            cb();
        } else {
            var registrationRequest = {
                enrollmentID: _user.username,
                affiliation: "institution_a"
            };
            chain.registerAndEnroll(registrationRequest, function (err) {
                if (err) {
                    console.log("Error registering and enrolling user", _user.username);
                    console.log(err)
                } else {
                    console.log("User " + _user.username + " successfully registered and enrolled")
                }
                cb(err);
            });
        }
    });
};
