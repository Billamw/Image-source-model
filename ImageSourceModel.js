const math = require('mathjs');

// Corners will be inserted in order: Top left, Top right, Bottom right, Bottom left
const corners = [[0,10,0], [10,10,0], [10,0,0], [0,0,0], [0,10,10], [10,10,10], [10,0,10], [0,0,10],[0,10,20], [10,10,20], [10,0,20], [0,0,20]];
// const corners = [[0,10,0], [10,10,0], [10,0,0], [0,0,0], [0,10,10], [10,10,10], [10,0,10], [0,0,10]];
const speaker = [5,5,15];
const microfon = [5,5,5];

const Walls = gernerateWalls(corners);

for(let i = 0; i<Walls.length; i++) {
    // const imageSoundSource = getImageSoundSource(Walls[i], speaker);

    // console.log(i + " ISS-mic: " + math.subtract(microfon, imageSoundSource))
    // console.log(i + " ISS: " + imageSoundSource)
    // console.log(i + "Wall:" + Walls[i][0] + " " + Walls[i][1] + " " + Walls[i][2])
    // console.log(i + "refl:" + getReflectionPoint(Walls[i], microfon, imageSoundSource))
    // console.log(checkValidReflection(getReflectionPoint(Walls[i], microfon, imageSoundSource), Walls[i]))
    // console.log("///////////////////////////////////////////////////////////////////////")
    // ////////////////////////////////////
    // console.log("Wall " + (i+1) + " min y" + Walls[i][0] + " reflection at: " + math.round(getReflectionPoint(Walls[i], microfon, imageSoundSource)) + " max " + Walls[i][2] + " is " + checkReflectionPoint(getReflectionPoint(Walls[i], microfon, imageSoundSource), Walls[i]));
    ////////////////////////////////////
}
///////////
OutPut();//
///////////

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

        // Floor (Corners are added counter clock wise(watched from outside))
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
    let lvecToMic = math.subtract(lvec, microfon);
    //dvecLine: direction vector of line
    let dvecLine = math.subtract(microfon, ISS); 
    //calculating reflectionpoint
    let lambda = (nvec[0] * lvecToMic[0] + nvec[1] * lvecToMic[1] + nvec[2] * lvecToMic[2]) / (dvecLine[0] + dvecLine[1] + dvecLine[2]);
    return math.add(microfon, math.multiply(lambda, math.subtract(microfon, ISS)));
}

function calculateIntersection(wall=[], microphone=[], ISS=[]) {
    // Die gegebene Gerade als Vektor
    const lineVector = math.subtract(microphone, ISS);
  
    // Die gegebene Ebene als Vektor
    const planeNormal = math.cross(
      math.subtract(wall[1], wall[0]),
      math.subtract(wall[2], wall[0])
    );
  
    // Der Punkt auf der Geraden, der den Schnittpunkt mit der Ebene bildet
    const t = math.dot(planeNormal, math.subtract(wall[0], ISS)) / math.dot(planeNormal, lineVector);
    const intersectionPoint = math.add(ISS, math.multiply(t, lineVector));
  
    return intersectionPoint;
  }

function getDistance(ISS = [], microfon = []) {
   return math.norm(math.subtract(ISS, microfon));
}

// If this class will be upgraded
// Returns the Angle between two planes
function getAngleBetweenPlanes(plane1 = [], plane2 = []){
    // Get the Normal Vectors of two planes to calculate the angle between both
    // Plane 1:
    let svec1 = math.subtract(plane1[1], plane1[0]);
    let dvec1 = math.subtract(plane1[3], plane1[0]);
    let nvec1 = math.cross(dvec1, svec1);
    // Plane 2:
    let svec2 = math.subtract(plane2[1], plane2[0]);
    let dvec2 = math.subtract(plane2[3], plane2[0]);
    let nvec2 = math.cross(dvec2, svec2);

    // Calculate the angle:
    let angle = math.acos(math.multiply(nvec1, nvec2)/(math.norm(nvec1)*math.norm(nvec2)))

    return angle;
}

function checkValidReflection(reflP=[], wall=[]) {
    let area1 = 1/2 * math.norm(math.cross(math.subtract(wall[1], wall[0]), math.subtract(wall[3], wall[0])));
    let area2 = 1/2 * math.norm(math.cross(math.subtract(wall[1], wall[2]), math.subtract(wall[3], wall[2])));
    let area = area1 + area2;
    // console.log(reflP)

    let triangleArea = 0;
    for(let i=0; i<wall.length; i++) {
        triangleArea += 1/2 * math.norm(math.cross(math.subtract(wall[i], reflP), math.subtract(wall[(i+1)%wall.length], reflP)));
        // console.log(math.subtract(wall[i], reflP) + " " + math.subtract(wall[(i+1)%wall.length], reflP))
        // console.log("cross: " + math.cross(math.subtract(wall[i], reflP), math.subtract(wall[(i+1)%wall.length], reflP)));
    }
    // console.log("CheckValidRelf(): triangleAre: " + triangleArea)
    return math.norm(triangleArea - area) < 0.1//math.norm(math.subtract(speaker, microfon))
}

function CheckWithBaryzentrical(reflP=[], wall=[]) {
    let triangle1 = [wall[0], wall[1], wall[2]];
    let triangle2 = [wall[0], wall[3], wall[2]];

    const normal1 = math.cross(math.subtract(triangle1[1], triangle1[0]), math.subtract(triangle1[2], triangle1[0]));
    const normal2 = math.cross(math.subtract(triangle2[1], triangle2[0]), math.subtract(triangle2[2], triangle1[0]));

    // Berechne die Baryzentrischen Koordinaten des Punktes im Dreieck
    const bc1 = [
      math.dot(math.cross(math.subtract(triangle1[1], reflP), math.subtract(triangle1[2], reflP)), normal1) / math.dot(normal1, normal1),
      math.dot(math.cross(math.subtract(triangle1[2], reflP), math.subtract(triangle1[0], reflP)), normal1) / math.dot(normal1, normal1),
      math.dot(math.cross(math.subtract(triangle1[0], reflP), math.subtract(triangle1[1], reflP)), normal1) / math.dot(normal1, normal1),
    ];
    const bc2 = [
        math.dot(math.cross(math.subtract(triangle2[1], reflP), math.subtract(triangle2[2], reflP)), normal2) / math.dot(normal2, normal2),
        math.dot(math.cross(math.subtract(triangle2[2], reflP), math.subtract(triangle2[0], reflP)), normal2) / math.dot(normal2, normal2),
        math.dot(math.cross(math.subtract(triangle2[0], reflP), math.subtract(triangle2[1], reflP)), normal2) / math.dot(normal2, normal2),
    ];
  
    // Überprüfe, ob der Punkt innerhalb des Dreiecks liegt
    return bc1.every(coord => coord >= 0 && coord <= 1) || bc2.every(coord => coord >= 0 && coord <= 1);
}

function OutPut() {
    for(let i = 0; i<Walls.length; i++) {
        let distance = getDistance(getImageSoundSource(Walls[i], speaker), microfon);
        // console.log("OutPut(): refl:  " + getReflectionPoint(Walls[i], microfon, getImageSoundSource(Walls[i], speaker)))
        if(CheckWithBaryzentrical(calculateIntersection(Walls[i], microfon, getImageSoundSource(Walls[i], speaker)), Walls[i])) {
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
        