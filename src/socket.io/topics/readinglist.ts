import db from '../../database';
import user from '../../user';
import topics from '../../topics';

interface socket {
    uid: number
}
interface SocketTopics {
    readingForAll: (socket: socket, tids: number[]) => Promise<void>;
}

async function readingForAll(socket: socket, tids: number[]) {
    // TODO: Replace this function with the actual reading list for all func
    if (!Array.isArray(tids)) {
        throw new Error('[[error:invalid-tid]]');
    }

    if (socket.uid <= 0) {
        throw new Error('[[error:no-privileges]]');
    }
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const isAdmin: boolean = await user.isAdministrator(socket.uid);
    const now: number = Date.now();
    await Promise.all(tids.map(async (tid: number) => {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const topicData = await topics.getTopicFields(tid, ['tid', 'cid']);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (!topicData.tid) {
            throw new Error('[[error:no-topic]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const isMod = await user.isModerator(socket.uid, topicData.cid);
        if (!isAdmin && !isMod) {
            throw new Error('[[error:no-privileges]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await topics.markAsUnreadForAll(tid);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await topics.updateRecent(tid, now);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await db.sortedSetAdd(`cid:${String(topicData.cid)}:tids:lastposttime`, now, tid);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await topics.setTopicField(tid, 'lastposttime', now);
    }));
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    topics.pushUnreadCount(socket.uid);
}


export = function (SocketTopics: SocketTopics) {
    SocketTopics.readingForAll = readingForAll;
};
