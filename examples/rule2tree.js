const q2j = require('../index')

let q = "General.protocol == \"DNP3\" && General.length >= 100 && ApplicationLayer.Objects[*].Group == 5"
let tree = q2j.rule2tree(q)
console.log(JSON.stringify(tree, null, 2))