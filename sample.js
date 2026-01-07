// console.log("very important file");

// when we writing require ("./path") it is exactly doing the same thing , wrap our code in an anonoumous function


// IIFE - immediately invoked function expression 
// (function (module , require) {
    // All the code of the module runs inside here
// })

console.log(__filename);

console.log(__dirname);


// let wrap = function (script) { // eslint-disable-line func-style
//   return Module.wrapper[0] + script + Module.wrapper[1];
// };

// const wrapper = [
//   '(function (exports, require, module, __filename, __dirname) { ',
//   '\n});',
// ];

// basically doing string concatenation
