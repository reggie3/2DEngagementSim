/**
 * Created by regin_000 on 12/4/2014.
 */
//the current state of the sim
var simState = {
  time : 0,
  dt: 0,
  lastUpdateWallClock: undefined,
  finished: false,
  winner: undefined,
  runMode: "auto",
  Reset :function (){
    simState.winner=null;
    simState.finished=null;
    EmptyArray(simState.arrLocalUnits);
    EmptyArray(simState.arrRemoteUnits);
  },
  arrLocalUnits: [],
  arrRemoteUnits: []
};

var heartBeat = 2000;
var bolUnitsInitialized = false;
var iNumOfTotalFrames = 2000;
var iFrameCounter =0;
var canvas=null;
var context=null;
var selectedUnit=null;
var canvasToggleSwitch=null;
var contextToggleSwitch=null;

//data tables
var trafficabilityTable = {
  "inf":{"clear": 1.1, "slow":.8},
  "cav":{"clear": 1.5, "slow":.7},
  "art":{"clear": .8, "slow":.3}
};

var combatEffects = {
  "inf":{"inf": 1, "cav":.7, "art":1.2},
  "cav":{"inf":1.3, "cav":1, "art":1.5},
  "art":{"inf":.8, "cav":.5, "art":.7}
};


function init(){
  if ( ! webSocketConnected ) {
    setTimeout(init, 100);
    return;
  }

  //chlear out any winner messages from a previous game
  document.getElementById("winner").innerHTML = "";

  console.log("init detected connection");
  //send a test message to the other player
  SendTestMessage();

  //reset the sim state
  simState.Reset();

  //initialize the context and canvas variables
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  //initialize the toggle switches canvas and context variables
  canvasToggleSwitch = document.getElementById("toggleSwitchCanvas");
  contextToggleSwitch = canvasToggleSwitch.getContext("2d");
  DrawToggleSwitch();

  //create a variable to hold the current time
  simState.lastUpdateWallClock = new Date().getTime();

  //build the list of local units
  BuildUnitList(canvas);
  SendUnitList();

  //setInterval(SendUnitList, heartBeat);

  //connect the event listeners
  canvas.addEventListener("mousedown", mouseClick);
  canvasToggleSwitch.addEventListener("mousedown", mouseClickToggleSwitch);

  //start drawing to the canvas
  draw();
}


/****************
 * SendUnitList
 *   Send an array of the local units to the other player
 * @constructor
 */
function SendUnitList() {
  var networkMessage = new NetworkMessage("game", simState.arrLocalUnits);
  SendMessage(JSON.stringify(networkMessage));
}

/*******
 * BuildUnitList()
 *  Called when the page is first loaded
 *  *****************/
function BuildUnitList(canv){

  //add the units to the linked List
  FillUnitList();

  //initialize the units
  InitializeUnits();
}

/*******************
 * FillUnitList
 *  Add the units to the linked list
 *  parameters: the linked list to add the units to
 * *************************/
function FillUnitList(){

  var iCounter =0;
  var iNumUnits = 5;
  var type;

  if(simState.runMode==="auto") {
    for (iCounter = 0; iCounter < iNumUnits; iCounter++) {

      if (Math.floor(Math.random() * 100) % 3 === 0) {
        type = "inf"
      }
      else if (Math.floor(Math.random() * 100) % 3 === 1) {
        type = "cav"
      }
      else {
        type = "art";
      }

      var y = Math.floor((Math.random() * canvas.height));

      if (sideOfThisPlayer === "red") {
        //var x = Math.floor((Math.random() * canvas.width)-100);
        var x = 30;
      }
      else {
        var x = canvas.width - 30;
      }

      var unit = new Unit(x, y, sideOfThisPlayer, type);

      //set a goal for the until on the opposite side of the canvas
      if (sideOfThisPlayer === "blue") {
        //var x = Math.floor((Math.random() * canvas.width)-100);
        unit.goalPos.x = unit.iconSize.width / 2;
        unit.winPos.x = unit.goalPos.x;
      }
      else {
        unit.goalPos.x = canvas.width - unit.iconSize.width / 2;
        unit.winPos.x = unit.goalPos.x;
      }
      unit.goalPos.y = Math.floor((Math.random() * canvas.height));
      unit.winPos.y = unit.goalPos.y;
      unit.iUnitID = sideOfThisPlayer + ":" + iCounter;
      simState.arrLocalUnits.push(unit);
    }
  }
  else {
    //fill with standard units
    if (sideOfThisPlayer === "blue") {
      var unit = new Unit(180, 20, "blue", "cav");
      unit.iUnitID = sideOfThisPlayer + ":0";
      simState.arrLocalUnits.push(unit);
      unit = new Unit(20, 20, "blue", "art");
      unit.iUnitID = sideOfThisPlayer + ":1";
      simState.arrLocalUnits.push(unit);
      unit = new Unit(20, 180, "blue", "inf");
      unit.iUnitID = sideOfThisPlayer + ":2";
      simState.arrLocalUnits.push(unit);
    }
    else {
      unit = new Unit(180, 180, "red", "inf");
      unit.iUnitID = sideOfThisPlayer + ":0";
      simState.arrLocalUnits.push(unit);
    }
  }
}

//initialize each unit's current position to the starting position
function InitializeUnits(){
  //console.log("Initializing Units");
  for(var i=0; i< simState.arrLocalUnits.length; i++){
    simState.arrLocalUnits[i].currentPos.x =simState.arrLocalUnits[i].startPos.x;
    simState.arrLocalUnits[i].currentPos.y = simState.arrLocalUnits[i].startPos.y;
  }
}

/***********************
 * draw
 *  Draws everything to the canvas
 * @constructor
 */
function draw(){
  var canvasWidth = canvas.width;
  var canvasHeight = canvas.height;

  //fill the canvas with white
  WipeTheBackground(context, canvasWidth, canvasHeight);

  //Alter the unit's movement speed if needed
  //check the color of the background at each unit's location
  for(var i=0; i< simState.arrLocalUnits.length; i++){
    if(!simState.arrLocalUnits[i].goalReached) {
      ChangeUnitMovementSpeedBasedOnTerrainType(simState.arrLocalUnits[i]);
    }
  }

  // draw the friendly units on the canvas
  //draw each unit on the canvas as a blue square
  // with a width of 11 pixels centered at its current position in the simState
  for(var i=0; i< simState.arrLocalUnits.length; i++){
    if(simState.arrLocalUnits[i].state!=="dead") { //don't draw dead units
      simState.arrLocalUnits[i].DrawUnit(context);
    }
  }
  // draw the enemy units on the canvas
  for(var i=0; i< simState.arrRemoteUnits.length; i++){
    if(simState.arrRemoteUnits[i].state!=="dead") { //don't draw dead units
      simState.arrRemoteUnits[i].DrawUnit(context);
    }
  }

  //draw the arrows depicting engagements by looping through the local and remote
  // unit arrays
  for(var i=0; i< simState.arrLocalUnits.length; i++){
    simState.arrLocalUnits[i].visualizeFires(context);
  }
  for(var i=0; i< simState.arrRemoteUnits.length; i++){
    simState.arrRemoteUnits[i].visualizeFires(context);
  }

  var now = new Date().getTime();
  simState.dt = (now - simState.lastUpdateWallClock)/1000; // seconds
  //console.log("delta time = " + simState.dt);
  updateSimState(simState.dt);
  if(!simState.finished) {
    requestAnimationFrame(draw);
  }
  else{
    console.log("sim finished");
  }
  simState.lastUpdateWallClock = now;
  //}

  if(simState.runMode==="auto") {    //if the sim is in auto mode then end the simulation when a unit reaches the goal
    //check to see if any units have reached the goal yet

    for(var i=0; i< simState.arrLocalUnits.length; i++){
      switch(sideOfThisPlayer){
        case "red":
          if (simState.arrLocalUnits[i].currentPos.x >= simState.arrLocalUnits[i].winPos.x) {
            simState.winner = simState.arrLocalUnits[i].side;
            simState.finished = true;
          }
        break;
        case "blue":
          if (simState.arrLocalUnits[i].currentPos.x <= simState.arrLocalUnits[i].winPos.x) {
            simState.winner = simState.arrLocalUnits[i].side;
            simState.finished = true;
          }
        break;
      }
    }
  }

  //increment the number of frames we've drawn
  iNumOfTotalFrames++;
  //console.log("Frame " + iNumOfTotalFrames);
  if(simState.finished===true){

    var endStateMessage = new NetworkMessage("simStateUpdate", simState);
    SendMessage(JSON.stringify(endStateMessage));
    EndSim();
  }
}

/*****************************
 Create a function called updateSimState that takes arguments state and dt.
 State will be a simState messageBody as described above,
 dt the sim time that has elapsed since the last update.
 Each unit's position should be updated so that they move towards the goal at their current speed the appropriate amount.
 */
function updateSimState(dt) {
  simState.time =  simState.time + dt;


  for(var i=0; i< simState.arrLocalUnits.length; i++){
    simState.arrLocalUnits[i].update(dt); //actually move the unit
  }
  for(var i=0; i< simState.arrRemoteUnits.length; i++){
    simState.arrRemoteUnits[i].update(dt); //actually move the unit
  }
}

/******************************************************
 * ChangeUnitMovementSpeedBasedOnTerrainType(messageBody)
 *  Checks the color of the pixel the unit is at, and changes the terrain type variable of that unit
 *  parameters:
 *    messageBody - the unit being checked
 * *********************/
function ChangeUnitMovementSpeedBasedOnTerrainType(object) {
  var pixel = context.getImageData(object.currentPos.x, object.currentPos.y, 1, 1);
  /*console.log("pixel red",pixel.data[0]);
   console.log("pixel green",pixel.data[1]);
   console.log("pixel blue",pixel.data[2]);
   console.log("pixel alpha",pixel.data[3]);*/
  var currentTerrainType = object.terrain;

  if((pixel.data[0]===255)&&(pixel.data[1]===255)&&(pixel.data[2]===255)){
    object.terrain = "clear";
    if(currentTerrainType!="clear"){
      SendUnitList();
    }
    //console.log("clear set");
  }
  else{
    object.terrain = "slow";
    if(currentTerrainType!="slow"){
      SendUnitList();
    }
    //console.log("slow set");
  }
}

/*****************
 * Erase the background
 * *****************/
function WipeTheBackground(ctx, canvasWidth, canvasHeight){
  var img = document.getElementById("terrain");
  context.fillStyle = "rgb(255, 255, 255)";
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

  /*var imgFlag =  new Image();
   //imgFlag = document.getElementById("flag");
   var flagWidth = 15;
   var flagHeight =30;

   ctx.drawImage(imgFlag, canvasWidth/2, canvasHeight/2-flagHeight, flagWidth, flagHeight );*/
}


/*********************
 * EndSim
 *   End the sim and state the winner if one of the units has reached its goal
 * @constructor
 */
function EndSim(){
  document.getElementById("winner").innerHTML = CapitalizeFirstLetter(simState.winner) + " team wins.";
  if(simState.winner === "red") {
    document.getElementById("winner").style.color = "red";
  }
  else{
    document.getElementById("winner").style.color = "blue";
  }

    //do some things
    setTimeout(init, 3000);
}

/******************
 * Capatalize the first letter in a string
 * @param string - the string to be altered
 * @returns {string} - the original string with the first letter capitalized
 * @constructor
 */
function CapitalizeFirstLetter(string)
{
  return string.charAt(0).toUpperCase() + string.slice(1);
}


/*******************
 //check to see if all units have reached their goal
 *******************/

function AreAllUnitsFinished(){
  var bolAllUnitsFinished=true;

  for(var i=0; i< simState.arrLocalUnits.length; i++){
    if(simState.arrLocalUnits[i].goalReached===false) {
      bolAllUnitsFinished = false;
      break;

    }
  }

  return bolAllUnitsFinished;

}

/****
 * BuildToggleSwitch
 *  build the toggle switch that switches between auto mode and manual mode for the sim
 *  "manual" is on the left side of the switch
 *  "auto" is on the right side
 * */
function DrawToggleSwitch(){
  var width = canvasToggleSwitch.width;
  var height = canvasToggleSwitch.height;
  var drawPosX;
  var drawPosY;

  //wipe the background of the toggle switch
  contextToggleSwitch.fillStyle = "rgb(105,105,105)";
  contextToggleSwitch.fillRect(0, 0, width, height);

  //console.log("drawing unit");
  if(simState.runMode==="manual") {
    drawPosX = 0;
    drawPosY = 0;
  }
  else {
    drawPosX = width/2;
    drawPosY = 0;
  }

  //draw the toggle switch
  contextToggleSwitch.fillStyle = "rgb(255,255,0)";
  contextToggleSwitch.fillRect(drawPosX, drawPosY, width/2, height);


  //draw the border
  contextToggleSwitch.strokeStyle = "rgb(0,0,0)";
  contextToggleSwitch.lineWidth=2;
  contextToggleSwitch.strokeRect(drawPosX, drawPosY, width/2, height);
}


/***********************
 * mouseClickToggleSwitch
 *  handle toggle switch click events
 * ************************/
function mouseClickToggleSwitch(event){
  console.log("toggle switch clicked");
  if(simState.runMode==="auto"){
    simState.runMode="manual";
  }
  else{
    simState.runMode="auto";

  }
  DrawToggleSwitch();
  var endStateMessage = new NetworkMessage("modeChange", simState);
  SendMessage(JSON.stringify(endStateMessage));
  init();
}
/***************
 * mouseClick
 *  a mouse button was clicked on the main canvas
 * ******************/
function mouseClick(event){

  var eventCaught = false;

  //get the event number
  if(event.which===1){  //left-click
    var canvasClickX = event.pageX - canvas.offsetLeft;
    var canvasClickY = event.pageY - canvas.offsetTop;

    console.log("mouse click at " + canvasClickX + ", " + canvasClickY);
    //check to see if a local unit was clicked
    for(var i=0; i< simState.arrLocalUnits.length; i++){
      if(simState.arrLocalUnits[i].BolIsClickedOn(canvasClickX,  canvasClickY)){
        ChangeMovementSelectionState( simState.arrLocalUnits[i]);
        eventCaught = true;
      }
    }
  }
  if(!eventCaught){ //the event was not caught by a unit, so set a new indexOfTarget for selected units
    SetUnitMovementGoal(canvasClickX, canvasClickY);
    SendUnitList();
  }
}

/**********************
 * SetUnitMovementGoal
 *  change the goal of any selected unit to the passed x and y coordinates
 *  ************************/
function SetUnitMovementGoal(x,y){
  for(var i=0; i< simState.arrLocalUnits.length; i++){
    if(simState.arrLocalUnits[i].isSelected){
      simState.arrLocalUnits[i].goalPos.x=x;
      simState.arrLocalUnits[i].goalPos.y=y;
      simState.arrLocalUnits[i].goalReached=false;
    }
  }
}
/*****************
 * ChangeMovementSelectionState(unit)
 *   changes the selection state of a unit
 * *********************/
function ChangeMovementSelectionState(unit){
  if(unit.isSelected===true){
    unit.isSelected=false;
  }
  else{
    DeselectAllUnits();
    unit.isSelected=true;
    selectedUnit = unit.iUnitID;
  }
}


/*****************
 * DeselectAllUnits
 *   deselects all units so that there is only one unit selected at a time
 * *****************/
function DeselectAllUnits(){
  for(var i=0; i< simState.arrLocalUnits.length; i++){
    simState.arrLocalUnits[i].isSelected=false;
  }
}

/***************
 * Empty the passed array
 * @param array
 * @constructor
 */
function EmptyArray(array){
  while(array.length > 0) {
    array.pop();
  }
}