const q2j = require('../index')

let q = "(a != 1 || (b == 2 && c <= 3)) && (d != 4)"

let json = q2j(q, { brackets: ['()'] });
let rule = q2j(json);
console.log("original: ", q, "generated:", rule, "same?:", q === rule)

