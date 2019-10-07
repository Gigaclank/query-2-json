
module.exports = query_2_json
query_2_json.query2json = query2json
query_2_json.query2json = query2json
query_2_json.json2tree = json2tree
query_2_json.rule2tree = rule2tree
query_2_json.tree2json = tree2json
query_2_json.tree2rule = tree2rule

function json2query(input) {

    var OperatorsFns = {
        equal: function (v) {
            if (typeof v[1] == 'string') {
                v[1] = v[1];
            }
            var getValue = parseFloat(v[1]);
            if (!isNaN(getValue)) {
                if (typeof getValue == 'number') {
                    v[1] = getValue;
                }
            }
            return v[0] + " == " + v[1];
        },
        not_equal: function (v) {
            if (typeof v[1] == 'string') {
                v[1] = v[1];
            }
            var getValue = parseFloat(v[1]);
            if (!isNaN(getValue)) {
                if (typeof getValue == 'number') {
                    v[1] = getValue;
                }
            }
            return v[0] + " != " + v[1];
        },
        less: function (v) {
            var getValue = parseFloat(v[1]);
            if (typeof getValue == 'number') {
                v[1] = parseFloat(getValue);
            }
            return v[0] + " < " + v[1];
        },
        less_or_equal: function (v) {
            var getValue = parseFloat(v[1]);
            if (typeof getValue == 'number') {
                v[1] = parseFloat(getValue);
            }
            return v[0] + " <= " + v[1];
        },
        greater: function (v) {
            var getValue = parseFloat(v[1]);
            if (typeof getValue == 'number') {
                v[1] = parseFloat(getValue);
            }
            return v[0] + " > " + v[1];
        },
        greater_or_equal: function (v) {
            var getValue = parseFloat(v[1]);
            if (typeof getValue == 'number') {
                v[1] = parseFloat(getValue);
            }
            return v[0] + " >= " + v[1];
        }
    }

    if (!input) {
        return null;
    }

    var self = this;

    return (function parse(group, level = 0) {

        if (!group.condition) {
            group.condition = group.combinator;
        }

        if (['AND', 'OR'].indexOf(group.condition.toUpperCase()) === -1) {
            throw new Error('Unable to build rule with condition ' + group.condition);
        }

        if (!group.rules) {
            return {};
        }

        var parts = [];

        group.rules.forEach(function (rule) {
            if (rule.rules && rule.rules.length > 0) {
                parts.push(parse(rule, level + 1));
            } else {
                let op = ""
                switch (rule.operator.toLowerCase()) {
                    case "=":
                    case "==":
                    case "eq":
                    case "eqeq":
                    case "equal":
                        op = "equal"
                        break;
                    case "!=":
                    case "not_eq":
                    case "not_equal":
                        op = "not_equal";
                        break;
                    case "<":
                    case "less":
                        op = "less";
                        break;
                    case ">":
                    case "greater":
                        op = "greater";
                        break;
                    case "<=":
                    case "less_or_equal":
                        op = "less_or_equal";
                        break;
                    case ">=":
                    case "greater_or_equal":
                        op = "greater_or_equal";
                        break;
                }
                var expFunction = OperatorsFns[op];
                var ruleExpression = {};
                if (expFunction === undefined) {
                    ruleExpression = ""
                } else {
                    ruleExpression = expFunction.call(self, [rule.field, rule.value]);
                }
                parts.push(ruleExpression);
            }
        });

        var output = '';
        for (var i = 0; i < parts.length; i++) {
            if (typeof parts[i + 1] != 'undefined') {
                if (parts[i] != "") {
                    let joiner = group.condition.toLowerCase() == 'and' ? ' && ' : ' || '
                    output += parts[i] + joiner
                }
            } else {
                if (parts[i] != "") {
                    output += parts[i];
                }
            }
        }
        if (level == 0) return output
        output = '(' + output + ')';

        return (output);

    })(input);
}

function query2json(str, opts) {
    if (typeof str !== 'string') return [str]
    var res = [str]

    if (typeof opts === 'string' || Array.isArray(opts)) {
        opts = { brackets: opts }
    }
    else if (!opts) opts = {}

    var brackets = opts.brackets ? (Array.isArray(opts.brackets) ? opts.brackets : [opts.brackets]) : ['{}', '[]', '()']

    var escape = opts.escape || '___'


    brackets.forEach(function (bracket) {
        // create parenthesis regex
        var pRE = new RegExp(['\\', bracket[0], '[^\\', bracket[0], '\\', bracket[1], ']*\\', bracket[1]].join(''))

        var ids = []

        function replaceToken(token, idx, str) {
            // save token to res
            var refId = res.push(token.slice(bracket[0].length, -bracket[1].length)) - 1

            ids.push(refId)

            return escape + refId + escape
        }

        res.forEach(function (str, i) {
            var prevStr

            // replace paren tokens till there’s none
            var a = 0
            while (str != prevStr) {
                prevStr = str
                str = str.replace(pRE, replaceToken)
                if (a++ > 10e3) throw Error('References have circular dependency. Please, check them.')
            }

            res[i] = str
        })

        // wrap found refs to brackets

        ids = ids.reverse()
        res = res.map(function (str) {
            ids.forEach(function (id) {
                str = str.replace(new RegExp('(\\' + escape + id + '\\' + escape + ')', 'g'), bracket[0] + '$1' + bracket[1])
            })
            return str
        })
    })

    var re = new RegExp('\\' + escape + '([0-9]+)' + '\\' + escape)
    return function nest({ str, refs, level = 0 }) {
        var res = [], match
        let condition = "and"
        let rules = str.trim().replace(" ", "").split(/[\|\&]{2}/g)//split by ||, && 
        if (str.trim().replace(" ", "").indexOf("||") != -1) condition = "or"
        var a = 0
        rules.forEach(r => {
            while (match = re.exec(r)) {
                if (a++ > 10e3) throw Error('Circular references in parenthesis')
                let s = refs[match[1]]
                if (s != '') {
                    let OR = s.trim().replace(" ", "").split("||")
                    let AND = s.trim().replace(" ", "").split("&&")
                    OR = OR.filter((i) => i.indexOf("&&") == -1 && i != "")
                    AND = AND.filter((i) => i.indexOf("||") == -1 && i != "")
                    OR = OR.map(o => o.trim())
                    AND = AND.map(a => a.trim())
                    if (AND.length > 0 || OR.length > 0) {
                        res.push({ ...nest({ str: s, refs, level: level + 1 }) })
                    }
                }
                r = r.slice(match.index + (match[0].length + 1))//skips the next bracket
            }
            if (r != '') {
                let rules = r.trim().replace(" ", "");
                let fields = rules.trim().split(/[\*\=\!\/\%\<\>]{1,3}/g)//split into left and right
                let operator = rules.trim().replace(fields[0], "").replace(fields[1], "").trim()
                let obj = {
                    id: "r-" + Math.random().toString(36).substr(2, 9),
                    field: fields[0] ? fields[0].trim() : "",
                    operator,
                    value: fields[1] ? fields[1].trim() : ""
                }
                res.push(obj)
            }
        })
        return { id: "g-" + Math.random().toString(36).substr(2, 9), condition, rules: res }
    }({ str: res[0], refs: res })
}
function json2tree(obj) {
    let treeObj = {
        key: "",
        title: "",
        children: []
    }
    if (obj.id !== "" && obj.id !== undefined) {
        if (obj.id.indexOf("g-") != -1) {
            treeObj.key = obj.id
            treeObj.title = obj.condition.toUpperCase()
            obj.rules.forEach(r => {
                let ch = json2tree(r)
                if (ch != null)
                    treeObj.children.push(ch)
            })

        } else if (obj.id.indexOf("r-") != -1) {
            treeObj.key = obj.id
            treeObj.title = (obj.field || "") + " " + (obj.operator || "") + " " + (obj.value || "")
            delete treeObj.children
        }
        return treeObj
    }
    return
}

function tree2json(obj) {
    let treeObj = {
        id: "",
        condition: "",
        rules: []
    }
    if (obj.key !== "" && obj.key !== undefined) {
        if (obj.key.indexOf("g-") != -1) {
            treeObj.id = obj.key
            treeObj.condition = obj.title.trim().toLowerCase()
            obj.children.forEach(r => {
                let ch = tree2json(r)
                if (ch != null)
                    treeObj.rules.push(ch)
            })

        } else if (obj.key.indexOf("r-") != -1) {
            treeObj.id = obj.key
            let rules = obj.title.trim().replace(" ", "");
            let fields = rules.trim().split(/[\*\=\!\/\%\<\>]{1,3}/g)//split into left and right
            let operator = rules.trim().replace(fields[0], "").replace(fields[1], "").trim()
            treeObj.field = fields[0] ? fields[0].trim() : ""
            treeObj.operator = operator
            treeObj.value = fields[1] ? fields[1].trim() : ""
            delete treeObj.condition
            delete treeObj.rules
        }
        return treeObj
    }
    return
}

function rule2tree(str) {
    return json2tree(query_2_json(str, { brackets: ['()'] }))
}
function tree2rule(tree) {
    let json = tree2json(tree)
    return json2query(json)
}

function query_2_json(arg, opts) {
    isObject = function (a) {
        return (!!a) && (a.constructor === Object);
    };
    if (typeof arg === "string") {
        return query2json(arg, opts)
    } else if (isObject(arg)) {
        return json2query(arg)
    } else {
        return -1
    }
}
