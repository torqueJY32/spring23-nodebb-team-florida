
'use strict';

const async = require('async');
const _ = require('lodash');

// const db = require('../database');
// const user = require('../user');
// const posts = require('../posts');
// const notifications = require('../notifications');
// const categories = require('../categories');
// const privileges = require('../privileges');
// const meta = require('../meta');
// const utils = require('../utils');
// const plugins = require('../plugins');

module.exports = function (Topics) {

    Topics.testFunctionInReadingListOfTopics = async function (tids) {
        console.log("Called here! At reading list of src/topics/readinglist.ts");
    };
};
