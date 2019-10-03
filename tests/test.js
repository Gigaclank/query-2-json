var assert = require('assert');
const q2j = require('../index')

let q = "a != 1|| (b == 2 && c <= 3) && (d != 4)"

isObject = function (a) {
    return (!!a) && (a.constructor === Object);
};
describe('converts string to an object', function () {
    it('input is a string', function () {
        assert.strictEqual(typeof q, "string");
    });
    it('converts to an object', function () {
        let json = q2j(q, { brackets: ['()'] });
        assert.strictEqual(isObject(json), true);
    });

});
describe('converts object to a string', function () {
    it('output is a string', function () {
        let json = q2j(q, { brackets: ['()'] });
        let string = q2j(json)
        assert.strictEqual(typeof string, "string");
    });
    // it('matches input', function () {
    //     let json = q2j(q, { brackets: ['()'] });
    //     let string = q2j(json)
    //     assert.strictEqual(string === q, true);
    // });
});

describe('returns invalid when not a valid input', function () {
    it('input is a empty', function () {
        assert.strictEqual(q2j(), -1);
    });
    it('input is a null', function () {
        assert.strictEqual(q2j(null), -1);
    });
    it('input is a date', function () {
        assert.strictEqual(q2j(new Date), -1);
    });
    it('input is a boolean', function () {
        assert.strictEqual(q2j(true), -1);
    });
    it('input is a number', function () {
        assert.strictEqual(q2j(1), -1);
    });

    it('input is a array', function () {
        assert.strictEqual(q2j([]), -1);
    });

});