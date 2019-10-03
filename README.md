# query-2-json
[![Build Status](https://travis-ci.com/Gigaclank/query-2-json.svg?branch=master)](https://travis-ci.com/Gigaclank/query-2-json)
[![npm version](https://badge.fury.io/js/query-2-json.svg)](https://badge.fury.io/js/query-2-json)

Inspired by [react-querybuilder](https://www.npmjs.com/package/react-querybuilder)

It is simple to use but would be easier to store the query string and convert it back to the json format from the string.

# Installation
``` bash
npm install query-2-json
```
# Usage
``` js
const q2j = require('query-2-json')

let q = "a != 1|| (b == 2 && c <= 3) && (d != 4)"

let json = q2j(q, { brackets: ['()'] });
console.log(JSON.stringify(json, null, 2))
let rule = q2j(json);
console.log(rule)
```
---
<p align="center" z-index = "-1">
  <img src="https://avatars2.githubusercontent.com/u/12459794?s=200&v=4"/>
</p>