const PROBABILITY_OF_KEEPING_DIRECTION = 0.6;
const SEGMENT_LENGTH = 50;
const ANIMATION_SPEED = 30;

const NUMBER_OF_STREETS = 50;

let currentSreetLength = 0;
const MAX_STREET_LENGTH = 10;

let actors = [];
const NUMBER_OF_ACTORS = 10;
const ACTOR_STEP_LENGTH = 1;

const SHOW_STREET_COORDINATES = false;


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

  if(points[nextPoint] && !points[nextPoint].includes(currentPoint)){
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

//

function init(){
    generateStreets(NUMBER_OF_STREETS);
    createActors(NUMBER_OF_ACTORS);
    draw();
    setInterval(draw, ANIMATION_SPEED);
}

function draw(){
    clear();
    moveActors();
    drawBackground();
    drawStreets();
    drawActors();
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

  line(x1, y1, x2, y2);
  circle(x1, y1, 3, "orange")

  if(SHOW_STREET_COORDINATES){
    text(`${x2}, ${y2}`, x2-20, y2-10, 10, "orange")  
  } 
}

function drawActors(){
  actors.forEach((actor) => {
    circle(actor.x, actor.y, 10, "#26ff6b");
  })
}

// actors

/* TODO: make this into its own class */


function createActors(numberOfActors){
  for(let i = 0; i < numberOfActors; i++){
    createNewActor();
  }
}

function createNewActor() {
  const [x, y] = pointStringToArray(pickRandomStartingPoint());
  actors.push({
    x: x,
    y: y,
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
  })
}

function moveActor(actor) {
  const allPoints = Object.keys(points);
  const currentLocation = `${actor.x},${actor.y}`;

  if(allPoints.includes(currentLocation) || (actor.destination.length == 0)){
    actor.destination = getRandomElement(points[currentLocation]);
  }

  let [nextX, nextY] = pointStringToArray(actor.destination);

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

function getRandomElement(array){
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

//

init();
