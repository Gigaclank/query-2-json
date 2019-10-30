const q2j = require('../index')
let q = "General.tapid < 5 && TransportLayer.sourceAddress > 1 && ApplicationLayer.Objects[*].ObjectSize > 30"
let tree = q2j.rule2tree(q)
let rule = q2j.tree2rule(tree)
console.log("Incoming Rule:", q, "Resulting Rule: ", rule, "Matching: ", q === rule)