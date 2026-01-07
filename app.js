require("./sample")

//const obj = require("./calculate/sum") 

// import { x, CalculateSum } from "./sum" -> ES module

// destructuring import
//const { x, calculateSum } = require("./sum")

var name = "Priya Saha"

var a = 10 
var b = 30

// console.log(a+b);
// console.log(name);

//obj.calculateSum(a, b);

//console.log(obj.x);


// console.log(global);
// console.log(globalThis);

console.log(global === globalThis);

// console.log(this);
// this will return empty 

//var x = 100 // we can use the same variable until an unless it is not in the same module

const { calculateMultiply, calculateSum } = require("./calculate")

calculateMultiply(a,b);
calculateSum(a,b)


//How to print json data 
const data = require("./data.json")
console.log(data);
