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
// Changing wall to an one dim array
function CheckWithBaryzentrical(reflP=[], wall=[]) {
    // Triangle 1
    // [wall[0], wall[1],wall[2],wall[3]]
    // [wall[4], wall[5],wall[6],wall[7]]
    // [wall[8], wall[9],wall[10],wall[11]]
    // Triangle 2
    // [wall[0], wall[1],wall[2],wall[3]]
    // [wall[12], wall[13], wall[14], wall[15]]
    // [wall[8], wall[9],wall[10],wall[11]]

    let triangle1 = [wall[0], wall[1], wall[2]];
    let triangle2 = [wall[0], wall[3], wall[2]];

    const normal1 = math.cross(math.subtract(triangle1[1], triangle1[0]), math.subtract(triangle1[2], triangle1[0]));
    const normal2 = math.cross(math.subtract(triangle2[1], triangle2[0]), math.subtract(triangle2[2], triangle1[0]));

    // calculate the baryzentrical coordinates of the refplectionpoint of each triangle
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
  
    // checking if the point is in one of the triangle
    return bc1.every(coord => coord >= 0 && coord <= 1) || bc2.every(coord => coord >= 0 && coord <= 1);
}

function calculateIntersection(point, polygon) {
  let P1 = [1000000, 0 , 0];
  let P2 = point;
  let intersections = 0;
  for(let i=0; i<polygon.length; i++) {
    let Q1 = polygon[i];
    let Q2 = polygon[(i + 1) % polygon.length];
    const numerator = math.cross(math.subtract(Q1, P1), math.subtract(Q2, Q1));
    const denominator = math.cross(math.subtract(P2, P1), math.subtract(Q2, Q1));
    
    const t1 = math.dot(numerator, denominator) / math.norm(denominator) * math.norm(denominator);
    const t2 = math.dot(math.cross(math.subtract(P2, P1), math.subtract(Q1, P1)), numerator) / math.norm(denominator) * math.norm(denominator);
    
    if (t1 > 0 && t1 < 1 && t2 > 0 && t2 < 1) {
      const intersection = math.add(P1, math.multiply(t1, math.subtract(P2, P1)));
      console.log(intersection)
      intersections++;
    }
  }
  console.log(intersections)
  return intersections%2 == 1
}

function isInPolygon(point, polygon) {
  let pointOutside = [-10000, 0, 0]
  let intersections = 0;
  for(let i=0; i<polygon.length; i++) {
    let vertex1 = polygon[i];
    let vertex2 = polygon[(i + 1) % polygon.length];

    let numerator = math.cross(math.subtract(vertex1, pointOutside), math.subtract(vertex2, point));
    let denominator = math.cross(math.subtract(vertex2, vertex1), math.subtract(point, pointOutside));
                                      //In Max die Norm ohne sqrt noch machen um es performanter zu machen                  
    let t1 = math.dot(numerator, denominator) / math.norm(denominator)*math.norm(denominator);
    let t2 = math.dot(math.cross(math.subtract(point, pointOutside), math.subtract(vertex1, pointOutside)), numerator) / math.norm(denominator)*math.norm(denominator);

    if ((0 <= t1 && t1 <= 1) && (0 <= t2 && t2 <= 1)) {
      intersections++;
    }
  }

  return intersections % 2 == 1;

}

function pointInPolygon3D(point, polygon) {
    // Extrahiere die Koordinaten des Punktes
    var pointX = point[0];
    var pointY = point[1];
    var pointZ = point[2];
  
    // Initialisiere eine Variable zur Zählung der Schnittpunkte
    var intersections = 0;
  
    // Iteriere über die Kanten des Polygons
    for (var i = 0; i < polygon.length; i++) {
      var vertex1 = polygon[i];
      var vertex2 = polygon[(i + 1) % polygon.length];
  
      // Extrahiere die Koordinaten der Eckpunkte der Kante
      var x1 = vertex1[0];
      var y1 = vertex1[1];
      var z1 = vertex1[2];
      var x2 = vertex2[0];
      var y2 = vertex2[1];
      var z2 = vertex2[2];
  
    //   // Überprüfe, ob die horizontale Linie den Rand der Kante schneidet
    //   if (((y1 <= pointY && pointY < y2) || (y2 <= pointY && pointY < y1)) &&
    //     (pointX < (x2 - x1) * (pointY - y1) / (y2 - y1) + x1) &&
    //     (pointZ < (z2 - z1) * (pointY - y1) / (y2 - y1) + z1)) {
    //     // Inkrementiere die Anzahl der Schnittpunkte
    //     intersections++;
      // Überprüfe, ob die horizontale Linie den Rand der Kante schneidet
      if (((y1 <= pointY && pointY < y2) || (y2 <= pointY && pointY < y1)) &&
        (pointX < (x2 - x1) * (pointY - y1) / (y2 - y1) + x1)) {
        // Inkrementiere die Anzahl der Schnittpunkte
        intersections++;
  }
    }
    console.log(intersections)
  
    // Wenn die Anzahl der Schnittpunkte ungerade ist, liegt der Punkt im Polygon
    return intersections % 2 == 1;
  }
  
  // Beispielanwendung
  var polygon3D = [[0, 0, 0], [0, 5, 0], [5, 5, 0], [5, 0, 0]];
  var point3D = [0, 3, 0];
  // var isInside3D = pointInPolygon3D(point3D, polygon3D);
  // var isInPolygon1 = isInPolygon(point3D, polygon3D);
  var tst = calculateIntersection(point3D, polygon3D);
  // console.log(isInPolygon1)
  console.log(tst); // true
  

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
        