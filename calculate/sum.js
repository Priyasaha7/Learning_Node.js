// Modukes protect their variables and functions from leaking 

console.log("Print sum.js file");

const x = "Hello World"

// we can write export before it directly will be imported there
function calculateSum(a, b) {

    const sum = a+b;

    console.log(sum);
    
}

// we can also export multiple variables and functions
module.exports = {
    x: x,
    calculateSum : calculateSum};

// can be written as:

// 1.module.exports = { x,calculateSum};  

// 2. module.exports.x = x;
//    module.exports.calculateSum = calculateSum;