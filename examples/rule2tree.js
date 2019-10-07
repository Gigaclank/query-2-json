const q2j = require('../index')

let q = " tapid == 100 && srcAddress > 1"
let tree = q2j.rule2tree(q)
console.log(JSON.stringify(tree, null, 2))