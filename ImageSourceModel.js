const math = require('mathjs');

// math.norm = length of a vector
const wall = {TL:[0,0,0],TR:[0,0,0],BR:[0,0,0],BL:[0,0,0]};
let b = [wall, wall];
b[0].BL = [4,3,0];
console.log(b[0]);
console.log(b[0].BL);
let c = math.norm(b[0].BL)
console.log(c);
