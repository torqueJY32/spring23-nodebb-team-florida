'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const db = require('../../database');
const user = require('../../user');
const topics = require('../../topics');
module.exports = function (SocketTopics) {
    SocketTopics.readingForAll = function (socket, tids) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Replace this function with the actual reading list for all func
            if (!Array.isArray(tids)) {
                throw new Error('[[error:invalid-tid]]');
            }
            if (socket.uid <= 0) {
                throw new Error('[[error:no-privileges]]');
            }
            const isAdmin = yield user.isAdministrator(socket.uid);
            const now = Date.now();
            yield Promise.all(tids.map((tid) => __awaiter(this, void 0, void 0, function* () {
                const topicData = yield topics.getTopicFields(tid, ['tid', 'cid']);
                if (!topicData.tid) {
                    throw new Error('[[error:no-topic]]');
                }
                const isMod = yield user.isModerator(socket.uid, topicData.cid);
                if (!isAdmin && !isMod) {
                    throw new Error('[[error:no-privileges]]');
                }
                console.log("Called here! At reading list of src/socket.io/topics/readinglist.ts");
                console.log("Next will go to src/topics/readinglist.js. NOte this is not translated yet");
                yield topics.testFunctionInReadingListOfTopics(tid);
                yield topics.markAsUnreadForAll(tid);
                yield topics.updateRecent(tid, now);
                yield db.sortedSetAdd(`cid:${topicData.cid}:tids:lastposttime`, now, tid);
                yield topics.setTopicField(tid, 'lastposttime', now);
            })));
            topics.pushUnreadCount(socket.uid);
        });
    };
};
