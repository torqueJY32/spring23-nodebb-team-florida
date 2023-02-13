"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const database_1 = __importDefault(require("../../database"));
const user_1 = __importDefault(require("../../user"));
const topics_1 = __importDefault(require("../../topics"));
function readingForAll(socket, tids) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: Replace this function with the actual reading list for all func
        if (!Array.isArray(tids)) {
            throw new Error('[[error:invalid-tid]]');
        }
        if (socket.uid <= 0) {
            throw new Error('[[error:no-privileges]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const isAdmin = yield user_1.default.isAdministrator(socket.uid);
        const now = Date.now();
        yield Promise.all(tids.map((tid) => __awaiter(this, void 0, void 0, function* () {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const topicData = yield topics_1.default.getTopicFields(tid, ['tid', 'cid']);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            if (!topicData.tid) {
                throw new Error('[[error:no-topic]]');
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const isMod = yield user_1.default.isModerator(socket.uid, topicData.cid);
            if (!isAdmin && !isMod) {
                throw new Error('[[error:no-privileges]]');
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            yield topics_1.default.markAsUnreadForAll(tid);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            yield topics_1.default.updateRecent(tid, now);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            yield database_1.default.sortedSetAdd(`cid:${String(topicData.cid)}:tids:lastposttime`, now, tid);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            yield topics_1.default.setTopicField(tid, 'lastposttime', now);
        })));
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        topics_1.default.pushUnreadCount(socket.uid);
    });
}
module.exports = function (SocketTopics) {
    SocketTopics.readingForAll = readingForAll;
};
