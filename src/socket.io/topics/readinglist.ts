'use strict';

const db = require('../../database');
const user = require('../../user');
const topics = require('../../topics');


module.exports = function (SocketTopics) {
    SocketTopics.readingForAll = async function (socket, tids) {

        // TODO: Replace this function with the actual reading list for all func

        if (!Array.isArray(tids)) {
            throw new Error('[[error:invalid-tid]]');
        }

        if (socket.uid <= 0) {
            throw new Error('[[error:no-privileges]]');
        }
        const isAdmin = await user.isAdministrator(socket.uid);
        const now = Date.now();
        await Promise.all(tids.map(async (tid) => {
            const topicData = await topics.getTopicFields(tid, ['tid', 'cid']);
            if (!topicData.tid) {
                throw new Error('[[error:no-topic]]');
            }
            const isMod = await user.isModerator(socket.uid, topicData.cid);
            if (!isAdmin && !isMod) {
                throw new Error('[[error:no-privileges]]');
            }
            console.log("Called here! At reading list of src/socket.io/topics/readinglist.ts");
            await topics.testFunctionInReadingListOfTopics(tid);
            await topics.markAsUnreadForAll(tid);
            await topics.updateRecent(tid, now);
            await db.sortedSetAdd(`cid:${topicData.cid}:tids:lastposttime`, now, tid);
            await topics.setTopicField(tid, 'lastposttime', now);
        }));
        topics.pushUnreadCount(socket.uid);

    };
};
