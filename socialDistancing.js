const PROBABILITY_OF_KEEPING_DIRECTION = 0.6;
const SEGMENT_LENGTH = 50;
const PERSON_SIZE = SEGMENT_LENGTH/5;
const ANIMATION_SPEED = 30;

const NUMBER_OF_STREETS = 50;

let currentSreetLength = 0;
const MAX_STREET_LENGTH = 10;

let actors = [];
let enableMoveActors = true;
const NUMBER_OF_ACTORS = 1;
const ACTOR_STEP_LENGTH = 1;
const CHANCE_OF_CONTRACTING_DISEASE = 1;
let nextActorDestination = "";

const SHOW_STREET_COORDINATES = true;


const opposite = {
  "left": "right",
  "right": "left",
  "up": "down",
  "down": "up",
}

let points = {};

function generateStreets(numberOfStreets){
  for(i = 0; i<numberOfStreets; i++){
    generateNewStreet();
  }
}

function generateNewStreet(){
  currentSreetLength = 0;

  let seedPoint = pickRandomPoint();
  let seedDirection = pickRandomDirection();
  let secondPoint = findConnectedPoint(seedDirection, seedPoint);

  getNextPoint(secondPoint, seedPoint);
}



function getNextPoint(currentPoint, prevPoint){  
  let gotCorrectPoint = false;

  const currentDirection = determineCurrentDirection(prevPoint, currentPoint);
  let nextDirection = currentDirection;
  let tries = 0;

  while(!gotCorrectPoint && tries < 50){ 
    if(Math.random() > PROBABILITY_OF_KEEPING_DIRECTION){
      nextDirection = pickNewDirection(currentDirection);
//      console.log(`${nextDirection} SWITCH `);
    } else {
//      console.log(`${nextDirection}`);
    }
  
    nextPoint = findConnectedPoint(nextDirection, currentPoint);

    if(pointIsInBounds(nextPoint)) { 
      gotCorrectPoint = true; 
    }
    /* TODO: figure this out!! why are we still drawing on the edges? */
//    if(tries == 49) { console.log(currentPoint) }
    tries++;
  }

  recordPoints(currentPoint, nextPoint);
  currentSreetLength++;

  if(currentSreetLength < MAX_STREET_LENGTH){
    getNextPoint(nextPoint, currentPoint);
  }
}

function pickRandomPoint(){
  let x = SEGMENT_LENGTH + SEGMENT_LENGTH * Math.floor((Math.random() * Math.floor(WIDTH/SEGMENT_LENGTH - 2)));
  let y = SEGMENT_LENGTH + SEGMENT_LENGTH * Math.floor((Math.random() * Math.floor(HEIGHT/SEGMENT_LENGTH - 2)));

  return `${x},${y}`
}

function pickRandomDirection(){
  const seedValue = Math.random();
  if(seedValue <= 0.25){
    return "up";
  } else if(seedValue <= 0.5){
    return "right";
  } else if(seedValue <= 0.75){
    return "down";
  } else {
    return "left";
  }
}

function pickNewDirection(currentDirection){
  const seedValue = Math.random();
  
  if(currentDirection == "up" || currentDirection == "down"){
    return seedValue <= 0.5 ? "right" : "left";
  } else {
    return seedValue <= 0.5 ? "up" : "down";
  }
}

function determineCurrentDirection(pointOne, pointTwo){
    let [x1, y1] = pointStringToArray(pointOne);
    let [x2, y2] = pointStringToArray(pointTwo); 

    if(x1 == x2){
      return (y2 - y1) > 0 ? "down" : "up";
    } else {
      return (x2 - x1) > 0 ? "right" : "left";
    }
}

function findConnectedPoint(direction, currentPoint){
  let [x1, y1] = pointStringToArray(currentPoint);

  if(direction == "up"){
    return `${x1},${y1 - SEGMENT_LENGTH}`;
  } else if (direction == "down"){
    return `${x1},${y1 + SEGMENT_LENGTH}`;
  } else if (direction == "left"){
    return `${x1 - SEGMENT_LENGTH},${y1}`;
  } else {
    return `${x1 + SEGMENT_LENGTH},${y1}`;
  }
}

function pointIsInBounds(point){
  const [x, y] = pointStringToArray(point);
  return (x > 0 && x < WIDTH && y > 0 && y < HEIGHT) ? true : false;
}

function recordPoints(currentPoint, nextPoint){
  if(points[currentPoint]){
    if(!points[currentPoint].includes(nextPoint)){
      points[currentPoint].push(nextPoint)
    }
  } else {
    points[currentPoint] = [nextPoint];
  }

  if(points[nextPoint]){
    if(!points[nextPoint].includes(currentPoint)){
      points[nextPoint].push(currentPoint)
    }
  } else {
    points[nextPoint] = [currentPoint];
  }
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pointStringToArray(str){
  const coords = str.split(',');
  return [Number(coords[0]), Number(coords[1])];
}


function init(){
    registerEventListeners();
    generateStreets(NUMBER_OF_STREETS);
    createAllActors(NUMBER_OF_ACTORS);
    draw();
    setInterval(draw, ANIMATION_SPEED);
}

function draw(){
    clear();
    if(enableMoveActors){
      moveActors();
    }
    drawBackground();
    drawStreets();
    drawActors();
    infect();
}

function registerEventListeners() {
  window.addEventListener('keydown', (e) => {
    if(event.which == 32){
      enableMoveActors = !enableMoveActors;
    }
  });

  document.getElementById("canvas").addEventListener('click', (e) => {
    checkDestinationSelect(e.clientX, e.clientY);
    checkActorSelect(e.clientX, e.clientY);
  });
}

function checkDestinationSelect(clickedX, clickedY){
  Object.keys(points).forEach((point) => {
    let [x,y] = pointStringToArray(point);

    if(distanceBetween(clickedX, clickedY, x, y) < SEGMENT_LENGTH/3){
      console.log(`clicked on ${point}`);
      nextActorDestination = point;

      actors.forEach((actor) => {
        if(actor.selected){
          actor.destination = nextActorDestination;
          nextActorDestination = "";
        }
      });
    }
  });
}

function checkActorSelect(clickedX, clickedY){
  actors.forEach((actor) => {
    if(distanceBetween(clickedX, clickedY, actor.x, actor.y) < SEGMENT_LENGTH/3){
      actor.selected = true;
      nextActorDestination = "";
    } else {
      actor.selected = false;
    }
  });
}

function unselectAllActors(){
  actors.forEach((actor) => {
    actor.selected = false;
  });
}

function drawStreets(){
  for(startPoint in points){
    points[startPoint].forEach((endPoint) => {
      drawOneStreet(startPoint, endPoint)
    })
    
  }
}

function drawOneStreet(startPoint, endPoint){
  const [x1, y1] = pointStringToArray(startPoint)
  const [x2, y2] = pointStringToArray(endPoint)

  line(x1, y1, x2, y2, "#d1d097");
  circle(x1, y1, 3, "orange")

  if(SHOW_STREET_COORDINATES){
    text(`${x2}, ${y2}`, x2-20, y2-10, 10, "orange"); 
  } 
}

function drawActors(){
  actors.forEach((actor) => {
    drawActor(actor);
  })
}

function drawActor(actor){
  if(actor.selected){
    actor.color = "#2f24ff";
  } else {
    actor.color = actor.infected ? "#ff0f2f" : "#26ff6b";
  }

  if(actor.nextPoint){
    const [x, y] = pointStringToArray(actor.nextPoint);
    line(actor.x, actor.y, x, y, actor.color);
  }

  circle(actor.x, actor.y, PERSON_SIZE, actor.color);
}

function infect(){
  let checked = {}; // keep track of which pairs we've checked already;

  actors.forEach((actor1) => {
    actors.forEach((actor2) => {

      if(actor1.id !== actor2.id && typeof(checked[`${actor1.id},${actor2.id}`]) == 'undefined'){
        checked[`${actor1.id},${actor2.id}`] = true;

        if(distanceBetween(actor1.x, actor1.y, actor2.x, actor2.y) < PERSON_SIZE){
          if(actor1.infected || actor2.infected) {
            if(Math.random() <= CHANCE_OF_CONTRACTING_DISEASE){
              actor1.infected = true;
              actor2.infected = true;
            }
          }
        }
      }
    });
  });

}

// actors

/* TODO: make this into its own class */


function createAllActors(numberOfActors){
  for(let i = 0; i < numberOfActors; i++){
    createActor();
  }
}

function createActor() {
  const [x, y] = pointStringToArray(pickRandomStartingPoint());
  actors.push({
    id: actors.length + 1,
    x: x,
    y: y,
    color: "#26ff6b",
    infected: (Math.random() < 0.1) ? true :false,
    selected: false,
    pointsToAvoid: [],
    nextPoint: "",
    destination: "",
  });
}

function pickRandomStartingPoint(){
  const allPoints = Object.keys(points);
  return getRandomElement(allPoints);
}

function moveActors(){
  actors.forEach((actor) => {
    moveActor(actor);
  });
}

function moveActor(actor) {
  const allPoints = Object.keys(points);
  const currentLocation = `${actor.x},${actor.y}`;
  let availablePoints = [];

  if(allPoints.includes(currentLocation) || (actor.nextPoint.length == 0)){
    
    /* TODO: this is a band aid! Need to figure out actual nextPoint */    

    availablePoints = points[currentLocation].filter((point) => {
      return !actor.pointsToAvoid.includes(point);
    });

    if(availablePoints.length <= 1){
      if(!actor.pointsToAvoid.includes(currentLocation)){
        actor.pointsToAvoid.push(currentLocation);  // if this is a point with only 1 option, avoid it
      }
    } 

    if(availablePoints.length == 0){ // worst case, this shouldn't happen;
      console.log(points[currentLocation]);
      availablePoints = points[currentLocation];
    }  

    if(allPoints.includes(currentLocation)){ 
      actor.lastVisitedPoint = currentLocation;
    }   

    actor.nextPoint = getRandomElement(availablePoints);
  }

  let [nextX, nextY] = pointStringToArray(actor.nextPoint);

  if(nextX == actor.x){
    if(nextY > actor.y) {
      actor.y += ACTOR_STEP_LENGTH
    } else {
      actor.y -= ACTOR_STEP_LENGTH
    }
  }

  if(nextY == actor.y){
    if(nextX > actor.x) {
      actor.x += ACTOR_STEP_LENGTH
    } else {
      actor.x -= ACTOR_STEP_LENGTH
    }
  }
}

function distanceBetween(x1, y1, x2, y2){
    return Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2));
}

function getRandomElement(array){
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

//

init();
