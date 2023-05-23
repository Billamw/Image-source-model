const math = require('mathjs');

// Corners will be inserted in order: Top left, Top right, Bottom right, Bottom left
const corners = [[0,10,0], [10,10,0], [10,0,0], [0,0,0], [0,10,10], [10,10,10], [10,0,10], [0,0,10],[0,10,20], [10,10,20], [10,0,20], [0,0,20]];

const speaker = [5,5,3];
const microfon = [5,5,4];

const Walls = gernerateWalls(corners);

//////////////
// OutPut();//
//////////////

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
function getImageSoundSource(wall = [], speaker = []) {
    let lvec = wall[0];
    let svec = math.subtract(wall[1], wall[0]);
    let dvec = math.subtract(wall[3], wall[0]);
    let normal = math.cross(dvec, svec);
    normal = math.divide(normal, math.norm(normal));
    let levToSpeaker = math.subtract(lvec, speaker);
    // calculating intersectionpoint of plane and speaker
    let lambda = math.dot(normal, levToSpeaker) / (normal[0] + normal[1] + normal[2]);
    return math.add(speaker, math.multiply(2*lambda, normal));
}

function calculateIntersection(wall=[], microphone=[], ISS=[]) {

    let lineVector = math.subtract(microphone, ISS);

    let planeNormal = math.cross(
      math.subtract(wall[1], wall[0]),
      math.subtract(wall[2], wall[0])
    );
  
    let t = math.dot(planeNormal, math.subtract(wall[0], ISS)) / math.dot(planeNormal, lineVector);
    let intersectionPoint = math.add(ISS, math.multiply(t, lineVector));
  
    return intersectionPoint;
  }

function getDistance(ISS = [], microfon = []) {
   return math.norm(math.subtract(ISS, microfon));
}

function containsPoint(point=[], polygon=[]) {
  let toReturn = false;
  for (let i = 0; i < polygon.length-1; i++) {
    let triangle = [polygon[0], polygon[i], polygon[i+1]];
    const normal = math.cross(math.subtract(triangle[1], triangle[0]), math.subtract(triangle[2], triangle[0]));

    // calculate the barycentric coordinates of the point in the constructed triangle.
    const bc1 = [
      math.dot(math.cross(math.subtract(triangle[1], point), math.subtract(triangle[2], point)), normal) / math.dot(normal, normal),
      math.dot(math.cross(math.subtract(triangle[2], point), math.subtract(triangle[0], point)), normal) / math.dot(normal, normal),
      math.dot(math.cross(math.subtract(triangle[0], point), math.subtract(triangle[1], point)), normal) / math.dot(normal, normal),
    ];
    // check if the point is in any of the constructed triangles
    toReturn = toReturn || bc1.every(coord => coord >= 0 && coord <= 1);
  }
  return toReturn;
}
// check if the given polygon is in
function isInTwoDimSpace(polygon=[]) {
  let vec1 = math.subtract(polygon[0], polygon[parseInt((polygon.length-1) / 2)]);
  let vec2 = math.subtract(polygon[0], polygon[polygon.length - parseInt((polygon.length-1) / 2)]);
  let normal = math.cross(vec1, vec2);
  for (let i = 0; i < polygon.length; i++) {
    if (math.dot(normal, polygon[i]) > 0.005) {
      return false;
    }
  }
  return true;
}

// not working method of containsPoint
  
  // Beispielanwendung
  var polygon3D = [[0, 0, 0], [0, 5, 0], [5, 5, 0], [5, 0, 0]];
  var point3D = [0, 0, 0];
  // var isInside3D = pointInPolygon3D(point3D, polygon3D);
  // var isInPolygon1 = isInPolygon(point3D, polygon3D);
  var isInPolygon = containsPoint(point3D, polygon3D);
  var isTwoDim = isInTwoDimSpace(polygon3D);
  // console.log(isInPolygon1)
  console.log("is inside: " + isInPolygon); // true
  console.log("is two dim: " + isTwoDim);
  

// function OutPut() {
//     for(let i = 0; i<Walls.length; i++) {
//         let distance = getDistance(getImageSoundSource(Walls[i], speaker), microfon);
//         if(CheckWithBaryzentrical(calculateIntersection(Walls[i], microfon, getImageSoundSource(Walls[i], speaker)), Walls[i])) {
//             if(i == 0) {
//                 console.log("back wall.\tReflection distance = " + distance )
//             }
//             if(i == Walls.length-1) {
//                 console.log("front wall.\tReflection distance = " + distance)
//             }
//             if(i%4 == 1 && i!= Walls.length-1) {
//                 console.log((parseInt(i/5)+1) + ". ceiling.\tReflection distance = " + distance)
//             }
//             if(i%4 == 2) {
//                 console.log((parseInt(i/5)+1) + ". right wall.\tReflection distance = " + distance)
//             }
//             if(i%4 == 3) {
//                 console.log((parseInt(i/5)+1) + ". floor.\tReflection distance = " + distance)
//             }
//             if(i%4 == 0 && i != 0) {
//                 console.log((parseInt(i/5)+1) + ". left wall.\tReflection distance = " + distance)
//             }
//         }
//     }
// }
        