const q2j = require('../index')

let q = "(a != 1 || (b == 2 && c <= 3)) && (d != 4)"
let tree = q2j.query2json(q)
console.log(JSON.stringify(tree, null, 2))