/**
 * Created by regin_000 on 12/3/2014.
 */
var SERVER_WEBSOCKET_URL = "ws://localhost:8282";
var CLIENT_ID = "Reginald Johnson"; // CHANGE THIS!
var webSocket = new WebSocket(SERVER_WEBSOCKET_URL);
var webSocketConnected = false;
webSocket.onopen = function(evt){
  console.log("Opened webSocket");
  webSocketConnected = true;
};
webSocket.onclose = function(evt){
  console.log("webSocket close", evt.data);
};
webSocket.onerror = function(evt){
  console.log("webSocket error", evt.data);
};
webSocket.onmessage = function(evt) {
  //console.log("Message from network:",  evt.data);
  ReceiveMessage(evt.data);
};

function SendTestMessage(){
  webSocket.send(sideOfThisPlayer + ": test");
}

function NetworkMessage(type, messageBody){
  this.type = type;
  this.messageBody = messageBody;

}


/************************
 * SendMessage
 *   Send a JSON messageBody over the websocket
 * @param JSONMessage
 * @constructor
 */
function SendMessage(JSONMessage){
  webSocket.send(JSONMessage);
}

/****************
 * Receive a message from the websocket
 *   Primarily to pass it on to the gameEngine
 * @param data
 * @constructor
 */
function ReceiveMessage(data){
  //console.log(data);
  var messageObject = JSON.parse(data);
  console.log(messageObject.type + " message received");
  switch (messageObject.type){
    case "game":

      EmptyArray(simState.arrRemoteUnits);

      //loop through the received message in order to fill the remote unit list
      for(var i=0; i< messageObject.messageBody.length; i++){
        var unit = CreateUnitFromMessage(messageObject.messageBody[i]);
        //get this unit's id
        var unitIDNumber = messageObject.messageBody[i].iUnitID.split(":")[1];
        simState.arrRemoteUnits[unitIDNumber]=unit;
      }
    break;
    case "simStateUpdate":
      //console.log(data);
      //console.log("simStateUpdate received");
      var messageObject = JSON.parse(data);
      if(simState.finished!=true){
        simState.finished = messageObject.messageBody.finished;
        simState.winner = messageObject.messageBody.winner;
        EndSim();
      }
      break;
    case "modeChange":
      simState.runMode = messageObject.messageBody.runMode;
      //restart the sim
      init();
      break;
  }
}

function CreateUnitFromMessage(messageUnit){
  var newUnit = new Unit(null, null, null, null);
  for (var key in messageUnit) {
    newUnit[key] = messageUnit[key];
  }

  return newUnit;
}

/*
var protoMyWebSocket = {

  Connect: function () {
    this.webSocket = new WebSocket("ws://" + this.address + ":" + this.port);
  },

  OnOpen: function (evt) {
    console.log("Opened webSocket");
    this.isConnected = true;
  },

  SendTestMessage: function (strMessage) {
    var message = strMessage;
    if (message === undefined) {
      message = "test";
    }
    this.webSocket.send(message);
  }
};*/

/*function MyWebSocket(address, port){
  this.isConnected = false;
  this.address = address;
  this.port = port;
  this.webSocket = new WebSocket("ws://" + this.address + ":" + this.port);

 // MyWebSocket.prototype = protoMyWebSocket;
  function OnOpen(evt) {
    console.log("Opened webSocket");
    this.isConnected = true;
  }

  this.webSocket.onopen = function(evt){
    this.OnOpen(evt)
  };
  this.webSocket.onclose = function(evt){
    console.log("webSocket close", evt.data);
  };
  this.webSocket.onerror = function(evt){
    console.log("webSocket error", evt.data);
  };
  this.webSocket.onmessage = function(evt) {
    console.log("Message from network:", evt.data);
  };
}*/

