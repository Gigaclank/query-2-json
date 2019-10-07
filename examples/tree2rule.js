const q2j = require('../index')
let q = "(tapid == 100) && (srcAddress > 1)"
let tree = q2j.rule2tree(q)
let rule = q2j.tree2rule(tree)
console.log("Incoming Rule:", q, "Resulting Rule: ", rule, "Matching: ", q === rule)