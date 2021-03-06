// ENV
var inputShutDownTime;
if(process.argv.length == 2) inputShutDownTime = Math.random()*3000;
else inputShutDownTime = process.argv[2];
// console.log("contract shut down in " + inputShutDownTime + " milli seconds...");

// Set up
var fs = require('fs');
var funcPoll = require("../function/funcPoll.js");
var Web3 = require('web3');
var web3 = new Web3();
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Get contract abi & bytecode
// Poll
//var Poll = require("./Poll.json");
// console.log(Poll.abi);
var abiPoll = JSON.parse( fs.readFileSync('../compile/Poll.abi', 'utf-8') );
var binaryPoll = fs.readFileSync('../compile/Poll.bytecode', 'utf-8');

// Contract constructor arguments
// Poll
var _id = 0xace;
var _owner = web3.eth.accounts[0];
var _expireTime = Math.floor( (new Date()).getTime()/1000 ) + 60*15;
var _totalNeeded = 2;
var _ifEncrypt = false;
var _encryptionKey = 0x0;
var _paymentLockTime = 60*5;
var _numberOfQuestions = 2;

console.log("I still have " + web3.fromWei( web3.eth.getBalance(web3.eth.accounts[0]), "ether" ) + " ether");

web3.eth.contract(abiPoll).new(_id, _owner, _expireTime, _totalNeeded, _ifEncrypt, _encryptionKey, _paymentLockTime, _numberOfQuestions, {from: web3.eth.accounts[0], data: binaryPoll, gas: 4700000},function(err, contract){
	if(err) console.log(err);
	else {
		if (typeof contract.address !== 'undefined') {
         	//console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
			//console.log("contract status: " + contract.contractStatus().toString());
			console.log( (contract.expireTime() - Math.floor( (new Date()).getTime()/1000 ) + " seconds left until contract close...");
			funcPoll.addQ(contract, web3.eth.accounts[0], 0, 3, "Q1: short answer", 0, [],function(tx_id){
				funcPoll.addQ(contract, web3.eth.accounts[0], 1, 1, "Q2: single answer", 3, ["A1", "A2", "A3"], function(tx_id){
					console.log("addQ done!");
					// funcPoll.shutP(contract,function(){
					// 	console.log("contract status: " + contract.contractStatus().toString());
					// 	// console.log("contract.shutDownTime(): " + contract.shutDownTime());
					// 	// console.log("current time: " + (new Date()).getTime() );
					// 	console.log("contract shutted down in " + ( (contract.shutDownTime()) - ((new Date()).getTime()/1000) ) + " seconds...");
					// });

					funcPoll.openP(contract, web3.eth.accounts[0], function(){
						console.log("contract status: " + contract.contractStatus().toString());
						funcPoll.addA(contract, web3.eth.accounts[1], 0, "blabla",[], function(tx_id){
							funcPoll.addA(contract, web3.eth.accounts[1], 1, "", [2], function(tx_id){
								console.log("addA done!");
								console.log("total answered: " + contract.totalAnswered());
								funcPoll.addA(contract, web3.eth.accounts[2], 1, "", [0], function(tx_id){
									funcPoll.addA(contract, web3.eth.accounts[2], 0, "asso",[], function(tx_id){
										console.log("addA2 done!");
										console.log("total answered: " + contract.totalAnswered());
										console.log("contract status: " + contract.contractStatus().toString());
									});
								});
							});
						});
					});	
					setTimeout( function (){
									funcPoll.shutP(contract, web3.eth.accounts[0], function(){
										console.log("contract status: " + contract.contractStatus().toString());
										console.log("contract shutted down in " + ( (contract.shutDownTime()) - ((new Date()).getTime()/1000) ) + " seconds...");
									}
									);
								}
								,inputShutDownTime);
				});
			});
    	}
	}
});
