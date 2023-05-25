const math = require('mathjs');

//lvec: location vector ist the first vector of each wall
//svec: support vector wall[3]-wall[0]
//dvec: direction vector wall[1]-wall[0]
function getImageSoundSource(polygon = [], speaker = []) {
    let lvec = polygon[0];
    let svec = math.subtract(polygon[0], polygon[parseInt((polygon.length-1) / 2)]);
    let dvec = math.subtract(polygon[0], polygon[polygon.length - parseInt((polygon.length-1) / 2)]);
    let normal = math.cross(dvec, svec);
    normal = math.divide(normal, math.norm(normal));
    let levToSpeaker = math.subtract(lvec, speaker);
    // calculating intersectionpoint of plane and speaker
    let lambda = math.dot(normal, levToSpeaker) / (normal[0] + normal[1] + normal[2]);
    return math.add(speaker, math.multiply(2*lambda, normal));
}

function calculateIntersection(polygon=[], microphone=[], ISS=[]) {

    let lineVector = math.subtract(microphone, ISS);

    let planeNormal = math.cross(
      math.subtract(polygon[0], polygon[parseInt((polygon.length-1) / 2)]),
      math.subtract(polygon[0], polygon[polygon.length - parseInt((polygon.length-1) / 2)])
    );
  
    let t = math.dot(planeNormal, math.subtract(polygon[0], ISS)) / math.dot(planeNormal, lineVector);
    let intersectionPoint = math.add(ISS, math.multiply(t, lineVector));
  
    return intersectionPoint;
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

function getDistance(ISS = [], microfon = []) {
   return math.norm(math.subtract(ISS, microfon));
}


const polygon = [[0,10,0], [10,10,0], [10,0,0], [0,0,0]];

const speaker = [5,2,4];
const microfon = [5,6,4];

if(isInTwoDimSpace(polygon)) {
  const iss = getImageSoundSource(polygon, speaker);
  const intersection = calculateIntersection(polygon, microfon, iss);
  const contains = containsPoint(intersection, polygon);
  console.log("is valid: " + contains)
} else {
  console.log("Not in two dim space!")
}



// Beispielanwendung
  // var polygon3D = [[0, 0, 0], [0, 5, 0], [5, 5, 0], [5, 0, 0]];
  // var point3D = [0, 0, 0];
  // // var isInside3D = pointInPolygon3D(point3D, polygon3D);
  // // var isInPolygon1 = isInPolygon(point3D, polygon3D);
  // var isInPolygon = containsPoint(point3D, polygon3D);
  // var isTwoDim = isInTwoDimSpace(polygon3D);
  // // console.log(isInPolygon1)
  // console.log("is inside: " + isInPolygon); // true
  // console.log("is two dim: " + isTwoDim);
        