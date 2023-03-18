const math = require('mathjs');

// Top left, Top right, Bottom right, Bottom left
const array = [[0,10,0], [10,10,0], [10,0,0], [0,0,0], [0,10,10], [10,10,10], [10,0,10], [0,0,10],[0,10,20], [10,10,20], [10,0,20], [0,0,20]];
// const array = [[0,10,0], [10,10,0], [10,0,0], [0,0,0], [0,10,10], [10,10,10], [10,0,10], [0,0,10]];
const speaker = [5,5,5];
const microfon = [5,5,5];

const Walls = gernerateWalls(array);

for(let i = 0; i<Walls.length; i++) {
    const imageSoundSource = getImageSoundSource(Walls[i], speaker);
    //console.log(getReflectionPoint(Walls[i], microfon, imageSoundSource));
    //console.log(getDistance(getImageSoundSource(Walls[i], speaker), microfon));
    console.log("Wall " + (i+1) + " min " + Walls[i][0] + " at: " + getReflectionPoint(Walls[i], microfon, imageSoundSource) + " max " + Walls[i][2] + " is " + checkReflectionPoint(getReflectionPoint(Walls[i], microfon, imageSoundSource), Walls[i]));
}
OutPut();

function gernerateWalls(corners = []) {
    if(corners.length % 4 != 0) {
        throw {name: "Invalid room geometry", message:"Number of corners must be divisable by 4( Corners: " + corners.length + ")"};
    }

    const backWall = [corners[0], corners[1], corners[2], corners[3]];
    const frontWall = [corners[corners.length-4], corners[corners.length-3], corners[corners.length-2], corners[corners.length-1]];

    const countOfRings = corners.length/4;
    let walls = [];
    let wall = [];

    walls[0] = backWall;
    for(let i = 0; i < (countOfRings - 1) * 4; i++) {
        // declaration of the following corners in the same directions

        // Floor (Corners are added counter clock wise(if watched from outside))
        if(i % 4 == 2) {
            wall = [corners[i], corners[i+4], corners[i+5], corners[i+1]];
        }
        // left Wall
        else if(i % 4 == 3) {
            wall = [corners[i], corners[i+4], corners[i+1], corners[i-3]];
        }
        // Ceiling and Floor
        else {
            wall = [corners[i], corners[i+1], corners[i+5], corners[i+4]];
        }
        walls[i+1] = wall;
    }
    walls[walls.length] = frontWall;
    
    return walls;
}

//lvec: location vector ist the first vector of each wall
//svec: support vector wall[3]-wall[0]
//dvec: direction vector wall[1]-wall[0]
//nvec: normalvector direction vector x support vector
function getImageSoundSource(wall = [], speaker = []) {
    let lvec = wall[0];
    let svec = math.subtract(wall[1], wall[0]);
    let dvec = math.subtract(wall[3], wall[0]);
    let nvec = math.cross(dvec, svec);
    nvec = math.divide(nvec, math.norm(nvec));
    let levToSpeaker = math.subtract(lvec, speaker);
    // calculating intersectionpoint of plane and speaker
    // let lambda = (nvec[0] * levToSpeaker[0] + nvec[1] * levToSpeaker[1] + nvec[2] * levToSpeaker[2]) / (nvec[0] + nvec[1] + nvec[2]);
    let lambda = math.dot(nvec, levToSpeaker) / (nvec[0] + nvec[1] + nvec[2]);
    return math.add(speaker, math.multiply(2*lambda, nvec));
}

// check if the reflectionpoint is valid
function getReflectionPoint(wall = [], microfon = [], ISS = []) {
    let lvec = wall[0];
    let svec = math.subtract(wall[1], wall[0]);
    let dvec = math.subtract(wall[3], wall[0]);
    let nvec = math.cross(dvec, svec);
    nvec = math.divide(nvec, math.norm(nvec));
    let tmp = math.subtract(lvec, microfon);
    //dvecLine: direction vector of line
    let dvecLine = math.subtract(microfon, ISS); 
    //calculating reflectionpoint
    let lambda = (nvec[0] * tmp[0] + nvec[1] * tmp[1] + nvec[2] * tmp[2]) / (dvecLine[0] + dvecLine[1] + dvecLine[2]);
    return math.add(microfon, math.multiply(lambda, math.subtract(microfon, ISS)));
}

function getDistance(ISS = [], microfon = []) {
   return math.norm(math.subtract(ISS, microfon));
}

//If this class will be upgraded
//Returns the Angle between two planes
function getAngleBetweenPlanes(plane1 = [], plane2 = []){
    //Get the Normal Vectors of two planes to calculate the angle between both
    //Plane 1:
    let svec1 = math.subtract(plane1[1], plane1[0]);
    let dvec1 = math.subtract(plane1[3], plane1[0]);
    let nvec1 = math.cross(dvec1, svec1);
    //Plane 2:
    let svec2 = math.subtract(plane2[1], plane2[0]);
    let dvec2 = math.subtract(plane2[3], plane2[0]);
    let nvec2 = math.cross(dvec2, svec2);

    //Calculate the angle:
    let angle = math.acos(math.multiply(nvec1, nvec2)/(math.norm(nvec1)*math.norm(nvec2)))

    return angle;
}

// Only works with quadratic rooms
function checkReflectionPoint(reflP, wall) {
    let xmin = math.min(wall[0][0], wall[2][0]);
    let ymin = math.min(wall[0][1], wall[2][1]);
    let zmin = math.min(wall[0][2], wall[2][2]);
    let xmax = math.max(wall[0][0], wall[2][0]);
    let ymax = math.max(wall[0][1], wall[2][1]);
    let zmax = math.max(wall[0][2], wall[2][2]);
    
    let result = false;
    if((xmin <= reflP[0] && reflP[0] <= xmax) && (ymin <= reflP[1] && reflP[1] <= ymax) && (zmin <= reflP[2] && reflP[2] <= zmax)){
        result = true;
    } else {
        result = false;
    }
    return result;
}

function OutPut() {
    for(let i = 0; i<Walls.length; i++) {
        let distance = getDistance(getImageSoundSource(Walls[i], speaker), microfon);

        if(checkReflectionPoint(getReflectionPoint(Walls[i], microfon, getImageSoundSource(Walls[i], speaker)), Walls[i])) {
            if(i == 0) {
                console.log("back wall.\tReflection distance = " + distance )
            }
            if(i == Walls.length-1) {
                console.log("front wall.\tReflection distance = " + distance)
            }
            if(i%4 == 1 && i!= Walls.length-1) {
                console.log((parseInt(i/5)+1) + ". ceiling.\tReflection distance = " + distance)
            }
            if(i%4 == 2) {
                console.log((parseInt(i/5)+1) + ". right wall.\tReflection distance = " + distance)
            }
            if(i%4 == 3) {
                console.log((parseInt(i/5)+1) + ". floor.\tReflection distance = " + distance)
            }
            if(i%4 == 0 && i != 0) {
                console.log((parseInt(i/5)+1) + ". left wall.\tReflection distance = " + distance)
            }
        }
    }
}
        