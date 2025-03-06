const getAll = require('./getAll');
const getReport = require('./getReport');
const register = require('./register');
const startTest = require('./startTest');
const submitAttempt = require('./submitAttempt');
const verify = require('./verify')
const getPubKey = require('./getpubkey')    

module.exports = {
    getAll,
    getReport,
    register,
    startTest,
    submitAttempt,
    verify, 
    getPubKey,
};