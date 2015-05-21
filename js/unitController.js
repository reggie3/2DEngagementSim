/**
 * Created by regin_000 on 12/2/2014.
 */

/********************
 * Classes and prototypes
 * ***********************/


/* //Linked list class
 function LinkedList(){
 this.tail = {next: null};
 this.head ={next : this.tail};
 }



 //linked list prototype
 var linkedListProto = {
 getSize: function(){
 var itemCounter = 0;

 var cc = this.head.next;
 while (cc.next !== null) {
 itemCounter ++;
 cc = cc.next;
 }

 return itemCounter;
 },

 addItem: function(item) {

 //create the new linked list item
 var newLinkedListItem = new LinkedListItem(item);
 //set the id of this linked list item to the unit ID
 newLinkedListItem.setID(item.iUnitID);

 //the list is empty
 if (this.getSize() === 0) {
 this.head.next = newLinkedListItem;
 newLinkedListItem.next = this.tail;
 }

 else {  //the list isn't empty so lets add the item in order according to id
 var currentCell = this.head.next;
 var previousCell = this.head;

 while (currentCell.messageBody !== undefined) {
 if(currentCell.id > newLinkedListItem.id){
 previousCell.next = newLinkedListItem;
 newLinkedListItem.next = currentCell;
 }

 previousCell = currentCell;
 currentCell = currentCell.next;
 }
 }

 if (newLinkedListItem.next === null) {  //we didn't add the item to the list
 previousCell.next = newLinkedListItem;
 newLinkedListItem.next = currentCell;
 }
 }
 }



 //linked list item class
 function LinkedListItem(messageBody){
 this.messageBody = messageBody;
 this.next = null;
 this.id = undefined;
 }

 //linked list item prototype
 var linkedListItemProto = {
 setID: function setID(ID){
 this.id = ID;
 },

 }
 */

var baseKillRate=2; //the base kill rate.  All unit kill rates are based on this
//Unit class
//Parmeters
//  x = initial x position
//  y = initial y position
//  speed = unit speed
function Unit(x, y, side, type){
  this.iUnitID = this.nextID;
  ++ unitProto.nextID;

  this.startPos = {x:x, y:y};
  this.currentPos = {x:0, y:0};
  this.goalPos = {x:x, y:y};
  this.winPos = {x:x, y:y};
  this.speed= undefined;
  this.iconSize= {width:30, height:20};
  this.goalReached= false;
  this.winGoalReached = false;
  this.isSelected = false;
  this.fillColor = "rgb(255,0,0)";
  this.strokeColor = "rgb(0,0,0)";
  this.firingColor = undefined;
  this.terrain = null;
  this.nextID ++;
  this.side = side;  //red or blue
  this.state = "idle";      //idle, moving, engaged, or dead
  this.indexOfTarget = undefined;  //index of the remote array list that contains the unit that is being targeted
  this.targetUnitID= undefined;
  this.range = 50;        //a number that we shall initialize to 50 for now
  this.combatEfficientcy = 5; //killing effectiveness of this unit
  this.eff = 100;         //combat effectiveness
  this.casualtyRate = 5;  //amount of combat eff lost per second of engagement
  this.deathEff = 70;     //eff at which unit reaches combat ineffectiveness
  this.type = type;   //can be "inf", "cav", or "art"

  //change unit colors based on what side it is on
  if(side==="blue"){
    this.fillColor= "rgb(0, 0, 255)";
    this.firingColor = "rgb(0, 153, 255)";
  }
  else if(side==="red"){
    this.fillColor="rgb(255, 0, 0)";
    this.firingColor="rgb(255, 153, 0)";
  }

  //set properties based on unit type
  switch (this.type){
    case "inf":
      this.range=50;
      this.speed=10;
      break;
    case "cav":
      this.range=50;
      this.speed=20;
      break;
    case "art":
      this.range=100;
      this.speed=10;
      break;
    default :
      this.range=250;
      this.speed=250;
      break;
  }
}

var unitProto = {
  //unit id
  nextID:0,

  //******************
  // * draw the units
  //  * *****************/
  DrawUnit :function(ctx){

    //console.log("drawing unit");
    var drawPosX = this.currentPos.x - this.iconSize.width/2;
    var drawPosY =  this.currentPos.y - this.iconSize.height/2;

    //draw the unit box
    ctx.fillStyle = this.fillColor;
    ctx.fillRect(drawPosX, drawPosY, this.iconSize.width, this.iconSize.height);
    ctx.strokeStyle = this.strokeColor;

    //make the stroke thicker if the unit is selected
    if((this.isSelected)&&(this.side===sideOfThisPlayer)){
      ctx.lineWidth=2;
    }
    else{
      ctx.lineWidth=1;
    }

    //draw the border
    ctx.strokeRect(drawPosX, drawPosY,
      this.iconSize.width,this.iconSize.height);

    //draw the proper symbology inside the box
    switch(this.type){
      case "inf":
        ctx.beginPath();
        ctx.moveTo(this.currentPos.x - this.iconSize.width/2,this.currentPos.y - this.iconSize.height/2);
        ctx.lineTo(this.currentPos.x + this.iconSize.width/2, this.currentPos.y + this.iconSize.height/2);

        ctx.moveTo(this.currentPos.x - this.iconSize.width/2,this.currentPos.y + this.iconSize.height/2);
        ctx.lineTo(this.currentPos.x + this.iconSize.width/2, this.currentPos.y - this.iconSize.height/2);
        ctx.stroke();
        break;
      case "cav":
        ctx.beginPath();
        /*ctx.moveTo(this.currentPos.x - this.iconSize.width/2,this.currentPos.y - this.iconSize.height/2);
         ctx.lineTo(this.currentPos.x + this.iconSize.width/2, this.currentPos.y + this.iconSize.height/2);
         */
        ctx.moveTo(this.currentPos.x - this.iconSize.width/2,this.currentPos.y + this.iconSize.height/2);
        ctx.lineTo(this.currentPos.x + this.iconSize.width/2, this.currentPos.y - this.iconSize.height/2);
        ctx.stroke();
        break;
      case "art":
        //draw the unit box artillery
        var boxSize = this.iconSize.width *.25;

        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(this.currentPos.x-boxSize/2, this.currentPos.y-boxSize/2,
          boxSize, boxSize);
        ctx.strokeStyle = this.strokeColor;
        break;
      default :
        break;
    }
    //draw the X inside the rect

  },
  BolIsClickedOn: function(clickX, clickY){
    if((clickX > this.currentPos.x - + this.iconSize.width/2)&&
      (clickX < this.currentPos.x + this.iconSize.width/2)&&
      (clickY > this.currentPos.y - this.iconSize.height/2)&&
      (clickY < this.currentPos.y + this.iconSize.height/2)) {
      return true;
    }
    else{
      return false;
    }
  },
  /********************
   * Update each unit's current position
   * ******************/
  update : function (dt) {

    if(this.state!=="dead") {
      //There are some things that you only do for players on the local side
      if (this.side === sideOfThisPlayer) {
        var isAtGoal = this.goalReached; //((this.currentPos.x === this.goalPos.x)&&(this.currentPos.y === this.goalPos.y));
        var targetData = this.getIndexOfClosestTarget();{
          if (targetData!=null){
            var indexOfClosestHostile = targetData.targetIndex;
            var targetUnitID = targetData.targetID;
          }
        }
        var isDead = (this.eff < this.deathEff);
        this.AlterState(isAtGoal, indexOfClosestHostile, targetUnitID, isDead);
        //this.AlterState(isAtGoal, indexOfClosestHostile, isDead, isTargetDead);
      }

      switch (this.state) {
        case "idle":
          break;
        case "moving":
          this.MoveUnit(dt);
          break;
        case "engaged":
          //only decrement the efficiency of local units
          if (this.side === sideOfThisPlayer) {
            var arrOfUnitsShootingAtThisUnit = [];
            //loop through the array of remot units
            for (var j=0; j<simState.arrRemoteUnits.length; j++){
              //check to see if somebody is targeting this unit
              if(simState.arrRemoteUnits[j].targetUnitID===this.iUnitID){
                //if this remote unit is shooting at this local unit then add it to an array
                arrOfUnitsShootingAtThisUnit.push(simState.arrRemoteUnits[j].type);
              }
            }

            //total up the amount of attrition by all attackers
            var attritionAmount = 0;
            for(var j=0; j< arrOfUnitsShootingAtThisUnit.length; j++){
              attritionAmount += baseKillRate * combatEffects[this.type][arrOfUnitsShootingAtThisUnit[j]]
            }

            this.eff -=  attritionAmount * dt;
            //console.log("Unit: " + this.iUnitID + " at " + this.eff + " effectiveness")
          }
          break;
        default :
          break;
      }
    }
  },

  AlterState : function(isAtGoal, indexOfClosestHostile, targetUnitID, isDead){
    var bolStateChanged=false;

    if(isDead){
      if(this.state!=="dead") {
        this.state = "dead";
        //console.log("Unit " + this.iUnitID + " state changed to dead");
        bolStateChanged = true;  //state changed
      }
    }
    /*else if(isTargetDead){
     if(this.state!=="moving") {
     this.state = "moving";
     //console.log("Unit " + this.iUnitID + "'s indexOfTarget is dead; state changed to moving");
     bolStateChanged = true;  //state changed
     }
     }*/
    else if(indexOfClosestHostile!==null){
      if(this.state!=="engaged") {
        this.state = "engaged";
        this.indexOfTarget = indexOfClosestHostile;
        this.targetUnitID = targetUnitID;
        //console.log("Unit " + this.iUnitID + " state changed to engaged");
        bolStateChanged = true;  //state changed
      }
    }
    else if(indexOfClosestHostile===null){
      if(this.state!=="moving") {
        this.state = "moving";
        this.indexOfTarget = indexOfClosestHostile;
        bolStateChanged = true;  //state changed
      }
    }
    else if(!isAtGoal){
      if(this.state!=="moving") {
        this.state="moving";
        //console.log("Unit " + this.iUnitID + " state changed to moving");
        bolStateChanged =  true;  //state changed
      }
    }
    else{
      if(this.state!=="idle") {
        this.state = "idle";
        //console.log("Unit " + this.iUnitID + " state changed to idle");
        bolStateChanged =  true;  //state changed
      }
    }
    if(bolStateChanged){
      SendUnitList();
    }
    return bolStateChanged; //state did not change
  },

  MoveUnit: function (dt){
    //get the movement vector
    //console.log("Moving " + this.iUnitID + " to " +  this.goalPos.x + ", " + this.goalPos.y);
    var fMovX = this.goalPos.x - this.currentPos.x;
    var fMovY = this.goalPos.y - this.currentPos.y;

    //get movement vector length
    var fVectorLength = Math.sqrt(Math.pow(fMovX, 2) + Math.pow(fMovY, 2));


    //if the vector length is zero then the unit is already at the goal
    // there is no need to move it
    // this takes care of situations where the box is already at the starting point at the
    // beginning of the sim
    if (fVectorLength === 0) {
      this.goalReached = true;
    }
    else {
      /*console.log("fVectorLength = " + fVectorLength);
       console.log("dt = " + dt);*/

      //get unit vectors
      var fXU = fMovX / fVectorLength;
      var fYU = fMovY / fVectorLength;

      var fXDist;
      var fYDist;

      //get the movement distance
      fXDist = fXU * this.speed* trafficabilityTable[this.type][this.terrain] * dt;
      fYDist = fYU * this.speed* trafficabilityTable[this.type][this.terrain] * dt;

      //get the total expected travel distance
      var fTravelDistance = Math.sqrt((Math.pow(fXDist, 2) + Math.pow(fYDist, 2)));

      //get travel distance to goal
      var fXDistanceToGoal = this.goalPos.x - this.currentPos.x;
      var fYDistanceToGoal = this.goalPos.y - this.currentPos.y;
      var fDistanceToGoal = Math.sqrt((Math.pow(fXDistanceToGoal, 2) +
      Math.pow(fYDistanceToGoal, 2)));

      //if the current travel distance would put the unit beyond its goal, then put the unit at its goal
      if (fDistanceToGoal < fTravelDistance) {
        this.currentPos.x = this.goalPos.x;
        this.currentPos.y = this.goalPos.y;
        this.goalReached = true;

      }
      else {
        //update current position
        this.currentPos.x += fXDist;
        this.currentPos.y += fYDist;
        //console.log("Moving " + this.iUnitID + " to " +  this.currentPos.x + ", " + this.currentPos.y);
      }


    }
  },

  getIndexOfClosestTarget : function(){
    var closestTargetDistance = Infinity;
    var indexOfClosestHostile = null;
    var targetUnitID = null

    //figure out which array the target is in
    if(this.side === sideOfThisPlayer) {
      var arrTargets = simState.arrRemoteUnits;
    }
    else{
      var arrTargets = simState.arrLocalUnits;
    }

    //loop through the target array to look for potential targets
    for (var i = 0; i < arrTargets.length; i++) {

      //don't make this unit look at targeting itself or dead units or units on the same side
      if ((arrTargets[i].state !== "dead")&&
        (arrTargets[i].side !== this.side)&&
        (arrTargets[i].iUnitID !== this.iUnitID)){
        //get distance between this unit and the potential indexOfTarget
        var distX = this.currentPos.x - arrTargets[i].currentPos.x;
        var distY = this.currentPos.y - arrTargets[i].currentPos.y;

        //get movement vector length
        var distToTarget = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
        //check to see if this is the closest indexOfTarget
        if ((distToTarget < this.range) && (closestTargetDistance)) {
          //indexOfClosestHostile=simState.arrRemoteUnits[i];
          indexOfClosestHostile = i;
          targetUnitID = arrTargets[i].iUnitID;
          closestTargetDistance = distToTarget;
          //console.log("closet indexOfTarget change to: " + indexOfClosestHostile  + " at " + closestTargetDistance + " px")
        }
      }
    }
    var targetData= {
      "targetIndex": indexOfClosestHostile,
      "targetID": targetUnitID
    };
    return targetData;
  },


  /******************
   *Draw arrows from engaged units to their targets
   * ****************/
  visualizeFires : function(context){
    if((this.state==="engaged")) {
      //figure out which array the target is in
      if(this.side === sideOfThisPlayer) {
        var arrTargets = simState.arrRemoteUnits;

      }
      else{
        var arrTargets = simState.arrLocalUnits;
      }
      //console.log(this.iUnitID + " targeting " + this.targetUnitID);
      if (arrTargets[this.indexOfTarget].state !== "dead") {
        this.DrawArrow(context, this, arrTargets[this.indexOfTarget]);
      }
      else {
        this.indexOfTarget = null;
        this.state = "moving";
      }

    }
  },


  /***************
   * Draw an Arrow
   * firingUnit: unit firing the arrow
   * target: the unit's target
   */
  DrawArrow : function (context, firingUnit, target){
    var len = 10; // controls size of head
    var psi = Math.PI/6; // angle of head in radians

    var endY = target.currentPos.y;
    var endX = target.currentPos.x;
    var startY = firingUnit.currentPos.y;
    var startX = firingUnit.currentPos.x;

    var theta = Math.atan2(endY-startY,endX-startX);

    context.strokeStyle = this.firingColor;
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.lineTo(endX-len*Math.cos(theta-psi),
      endY-len*Math.sin(theta-psi));
    context.moveTo(endX, endY);
    context.lineTo(endX-len*Math.cos(theta+psi),
      endY-len*Math.sin(theta+psi));
    context.stroke();
  }
}
Unit.prototype = unitProto;
