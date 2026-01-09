# Node.js – Internals & Execution Model (Personal Notes)

This README documents everything I have learned and implemented so far about **Node.js internals**, execution flow, core modules, and how JavaScript runs outside the browser. These notes are written in a **handwritten-notes style** for revision and interview prep.

---

## 1. What is Node.js?

* Node.js is a **JavaScript runtime**, not a programming language.
* It allows JavaScript to run **outside the browser**.
* Node.js is built on:

  * **V8 JavaScript Engine** (written mainly in C++)
  * **libuv** (handles async operations)

> We write JavaScript, but internally Node.js uses C++ to talk to the OS.

---

## 2. JavaScript Engine vs Node.js

### V8 Engine

* Executes JavaScript code
* Manages:

  * Call Stack
  * Heap
  * Garbage Collection
* **Does NOT** know about:

  * `fs`
  * `setTimeout`
  * `http`
  * `global`

### Node.js Runtime

* Sits **around V8**
* Provides extra capabilities using **C++ bindings**
* Gives access to:

  * File system
  * Network
  * Timers
  * OS features

---

## 3. Global Objects (Browser vs Node.js)

### In Browser

* Global object names:

  * `window`
  * `this`
  * `self`
  * `frames`

### In Node.js

* Global object:

  * `global`

Important points:

* `global` is **NOT part of V8**
* It is provided by **Node.js**
* Node injects `global` into the V8 environment

### globalThis

* Because there were **multiple names** for global objects
* JavaScript introduced **one standard name**:

```js
globalThis
```

* Works in:

  * Browser
  * Node.js
  * Web workers

---

## 4. Node.js Core Modules

Node.js provides built-in modules (no installation needed).
They are written in **C++ + JavaScript**.

### Importing Core Modules

```js
const fs = require("node:fs");
const crypto = require("node:crypto");
```

---

## 5. Important Core Modules (Short Notes)

### fs (File System)

* Read/write files
* Sync and async APIs

```js
fs.readFileSync("file.txt", "utf8");
fs.readFile("file.txt", "utf8", cb);
```

---

### crypto

* Encryption, hashing, random values
* Used for:

  * Password hashing
  * Tokens
* **Async crypto operations are handled by libuv**

---

### zlib

* Used for **compression & decompression**
* Examples:

  * gzip
  * deflate
* Used internally for:

  * HTTP compression

---

### console

* Logging & debugging
* `console.log` is **not pure JS**
* It talks to **stdout** via Node.js internals

---

### https / http

* Used for network requests
* Uses libuv for non-blocking I/O

```js
https.get(url, cb);
```

---

## 6. Module System in Node.js (require)

### Steps when we use `require()`

1. **Resolving the module**

   * `./local/path`
   * `.json`
   * `node:module`

2. **Loading the module**

   * File content loaded based on file type

3. **Wrapping inside IIFE**

```js
(function (exports, require, module, __filename, __dirname) {
  // module code
})();
```

4. **Evaluation**

   * Code is executed
   * `module.exports` is returned

5. **Caching**

   * Module is cached
   * Next `require()` returns cached version

---

## 7. Synchronous vs Asynchronous Code

### Synchronous Code

* Blocks the call stack
* JS waits till execution finishes

```js
fs.readFileSync("./file.txt", "utf8");
console.log("This runs after file read");
```

Even though Node uses libuv internally, **sync code blocks JS execution**.

---

### Asynchronous Code

* Offloaded to **libuv**
* Non-blocking

```js
fs.readFile("./file.txt", "utf8", (err, data) => {
  console.log(data);
});
```

---

## 8. libuv (Very Important)

libuv handles:

* File system (async)
* Network I/O
* Timers (`setTimeout`)
* Crypto operations
* Thread pool

> libuv works in the background and pushes callbacks when ready.

---

## 9. setTimeout & Event Loop Behavior

```js
setTimeout(() => {
  console.log("call me right now");
}, 0);
```

Key points:

* `0` does NOT mean immediate execution
* Callback is sent to **libuv timers queue**
* Runs only when:

  * Call stack is empty
  * Event loop allows it

This is why setTimeout has **trust issues** 😄

---

## 10. Execution Flow Example

```js
console.log("Hello World");

setTimeout(() => {
  console.log("call me right now");
}, 0);

function multiplyFn(x, y) {
  return x * y;
}

console.log("Result:", multiplyFn(10, 20));
```

### Step-by-step

1. `console.log` → Call stack
2. `setTimeout` → sent to libuv
3. `multiplyFn` → executed synchronously
4. Call stack becomes empty
5. Event loop pushes timer callback
6. `setTimeout` callback executes

---

## 11. Key Takeaways

* Node.js ≠ Browser JavaScript
* V8 runs JS, Node provides power
* libuv is the backbone of async
* Sync code blocks execution
* Async code waits for call stack to clear
* `global` is Node-specific
* `globalThis` is universal

# JavaScript Execution Inside Node.js – Big Picture

When JavaScript runs in **Node.js**, three major systems work together:

- **V8 Engine** → Executes JavaScript  
- **Node.js Core (C++)** → Provides APIs  
- **libuv** → Handles async operations & the event loop  

## 🏗️ Architecture Diagram

┌─────────────────────┐
│ Your JS Code │
└─────────┬───────────┘
│
▼
┌─────────────────────┐ ┌─────────────────────┐
│ V8 Engine │───▶│ Node.js Bindings │
│ ┌───────────────┐ │ │ (C++) │
│ │ Parsing │ │ │ - File System APIs │
│ │ Ignition │ │ │ - Network APIs │
│ │ TurboFan │ │ │ - Process APIs │
│ └───────────────┘ │ └─────────┬───────────┘
└─────────┬───────────┘ │
│ ▼
▼ ┌─────────────────────┐
┌─────────────────────┐ │ libuv │
│ Event Loop │◀───▶│ - Thread Pool (4) │
│ - Timers │ │ - Event Loop │
│ - Poll │ │ - Async I/O │
│ - Microtasks │ │ - DNS/Crypto │
└─────────────────────┘ └─────────────────────┘
│
▼
┌─────────────┐
│ OS │
│ (Linux/Mac) │
└─────────────┘

text

**Flow:** JS Code → V8 (execution) → Node.js APIs → libuv (async) → OS

---

## 13. V8 Engine – How JavaScript Actually Runs

V8 does **not** directly run JavaScript as machine code.  
It uses **Just-In-Time (JIT) Compilation**.

### Step 1: Parsing Phase

CODE
│
▼
PARSING

text

#### (a) Lexical Analysis
**Code → Tokens**

```js
var name = "Priya";
Tokens:

text
var | name | = | "Priya" | ;
(b) Syntax Analysis
Tokens → AST (Abstract Syntax Tree)

AST represents structure, not execution.

text
VariableDeclaration
 └── VariableDeclarator
      ├── Identifier (name)
      └── Literal ("Priya")
14. Ignition Interpreter (First Execution)
Once the AST is ready:

text
AST
 │
 ▼
Ignition Interpreter
Ignition:

Converts AST → Bytecode

Executes bytecode line-by-line

Provides fast startup, slower execution

Flow:
AST → Bytecode → Execution

15. Hot Code Optimization & TurboFan Compiler
What Is Hot Code?
Code that runs again and again:

Loops

Repeated function calls

Example:

js
function sum(a, b) {
  return a + b;
}
When V8 detects hot code, it sends it to the TurboFan Compiler.

text
Ignition
   │
   ▼
TurboFan
TurboFan Compiler
Converts bytecode → Optimized Machine Code

Assumes data types for speed

Executes very fast

text
Bytecode
 │
 ▼
TurboFan
 │
 ▼
Optimized Machine Code
 │
 ▼
Execution
16. Deoptimization (Very Important Concept)
JavaScript is dynamically typed.

Example:

js
sum(10, 20);   // numbers
sum(30, 40);   // numbers
sum("A", "B"); // strings
When TurboFan assumes:

a, b are Numbers
and the assumption breaks ❌,
the optimized code becomes invalid.

V8 deoptimizes and goes back to the Ignition Interpreter:

text
TurboFan ❌
   │
   ▼
Ignition Interpreter
✅ Correctness > Performance

17. Inline Caching (IC)
Problem:
obj.x — JS doesn’t know if:

obj always has the same structure (shape)

x is always the same property

Solution:
Inline Caching

V8 remembers previous lookups

If structure is same → fast access

If structure changes → cache breaks

✔ Helps TurboFan optimize better

18. Copy Elision (Optimization)
Avoids unnecessary copying of objects
Improves performance in memory & speed

Simple Idea:

“Don't copy if you don't need to.”

19. Just-In-Time (JIT) Compilation – Final Flow
text
CODE
 │
 ▼
PARSING → AST
 │
 ▼
Ignition Interpreter
 │
 ▼
Bytecode
 │
 ▼
Execution
 │
 ▼
TurboFan Compiler (Hot Code)
 │
 ▼
Optimized Machine Code
 │
 ▼
Execution
20. Event Loop (Node.js Specific)
The event loop is not inside V8 — it's managed by libuv.

Event Loop Phases (Simplified)
text
┌─────────────┐    ┌─────────────┐
│   Timers    │───▶│ I/O Callbacks│
│setTimeout() │    │ Network/FS   │
└─────────────┘    └─────────────┘
                       │
                       ▼
                 ┌─────────────┐
                 │    Poll     │
                 │ New I/O     │
                 └─────────────┘
                       │
                       ▼
                 ┌─────────────┐
                 │   Check     │
                 │setImmediate│
                 └─────────────┘
21. Microtasks vs Macrotasks
Type	Examples	Priority
Microtasks	process.nextTick(), Promise.then()	Highest – Executed before event loop continues
Macrotasks	setTimeout, setImmediate, I/O callbacks	Lower – Next event loop phase
22. Thread Pool (libuv)
Node.js is single-threaded, but libuv includes a thread pool (default size = 4).

text
┌─────────────┐
│ JS Thread   │
│ (Single)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   libuv     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Thread Pool │ ← File I/O, Crypto, DNS
│   (Size=4)  │
└─────────────┘
       │
       ▼
┌─────────────┐
│ Callback    │
│   Queue     │
└─────────────┘
23. Garbage Collection in V8
V8 automatically frees unused memory.

Major Components:
Scavenger → Handles young objects

Mark & Sweep → Removes unused memory

Mark Compact → Reduces fragmentation

Orinoco → Parallel & incremental GC

Oilpan → DOM memory management

24. Node.js vs Browser – Quick Compare
Feature	Browser	Node.js
Global Object	window	global
DOM	✅ Yes	❌ No
File System	❌ No	✅ Yes
Event Loop	Browser	libuv
V8 Engine	✅	✅
25. Final Mental Model
text
V8 Engine          Node.js Core      libuv
   │                   │              │
   │ JS Execution    │ C++ APIs     │ Async I/O
   │                   │              │ Event Loop
   └───────────────────┼──────────────┘
                       │
                       ▼
                  YOUR JS CODE RUNS HERE! 🚀
V8 runs JavaScript

Node.js gives it superpowers

libuv makes it non-blocking



## Status

✅ Node.js basics
✅ Runtime vs engine
✅ Global objects
✅ Core modules
✅ Module system
✅ Event loop & libuv
✅ JavaScript engine internals
✅ V8 parsing & JIT
✅ Ignition & TurboFan
✅ Deoptimization
✅ Inline caching
✅ Node.js runtime
✅ Core modules
✅ Event loop
✅ libuv & thread pool
✅ Garbage collection

> This README will keep growing as I learn more 🚀
