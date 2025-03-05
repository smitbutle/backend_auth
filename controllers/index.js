const getAll = require('./getAll');
const getReport = require('./getReport');
const register = require('./register');
const startTest = require('./startTest');
const submitAttempt = require('./submitAttempt');
const verify = require('./verify')
const getPubKey = require('./getPubKey')

module.exports = {
    getAll,
    verify,
    register,
    startTest,
    submitAttempt,
    getReport,
    getPubKey
};