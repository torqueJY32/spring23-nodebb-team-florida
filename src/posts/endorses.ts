/* eslint-disable */
import db from '../database';
import plugins from '../plugins';

export = function (Posts) {
    Posts.endorse = async function (pid: string, uid: string) {
        return await toggleEndorse('endorse', pid, uid);
    };

    Posts.unendorse = async function (pid: string, uid: string) {
        return await toggleEndorse('unendorse', pid, uid);
    };

    async function toggleEndorse(type: string, pid: string, uid: string) {
        if (parseInt(uid, 10) <= 0) {
            throw new Error('[[error:not-logged-in]]');
        }

        const isEndorsing: boolean = type === 'endorse';

        const [postData, hasEndorsed] = await Promise.all([
            Posts.getPostFields(pid, ['pid', 'uid']),
            Posts.hasEndorsed(pid, uid),
        ]);
        
        console.log('Current Status for endorse is');
        console.log(hasEndorsed);

        if (isEndorsing && hasEndorsed) {
            throw new Error('[[error:already-endorsed]]');
        }

        if (!isEndorsing && !hasEndorsed) {
            throw new Error('[[error:already-unendorsed]]');
        }


        postData.endorses = await db.setCount(`pid:${pid}:users_endorsed`);
        console.log('before that, num for endorse is');
        console.log(postData.endorses);

        // if (isEndorsing ) {
        //     await db.sortedSetAdd(`uid:${uid}:endorses`, Date.now(), pid);
        // } else {
        //     await db.sortedSetRemove(`uid:${uid}:endorses`, pid);
        // }

        await db[isEndorsing ? 'setAdd' : 'setRemove'](`pid:${pid}:users_endorsed`, 1);
        postData.endorses = await db.setCount(`pid:${pid}:users_endorsed`);

        console.log('after that, num for endorse is');
        console.log(postData.endorses);

        // if (isEndorsing ) {
        //     await db.sortedSetAdd(`uid:${uid}:endorses`, Date.now(), pid);
        // } else {
        //     await db.sortedSetRemove(`uid:${uid}:endorses`, pid);
        // }


        await Posts.setPostField(pid, 'endorses', postData.endorses);

        plugins.hooks.fire(`action:post.${type}`, {
            pid: pid,
            uid: uid,
            owner: postData.uid,
            current: hasEndorsed ? 'endorsed' : 'unendorsed',
        });

        return {
            post: postData,
            isEndorsed: isEndorsing,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Posts.hasEndorsed = async function (pid: string, uid: string): Promise<boolean | boolean[]> {
        if (parseInt(uid, 10) <= 0) {
            return Array.isArray(pid) ? pid.map(() => false) : false;
        }

        const size = await db.setCount(`pid:${pid}:users_endorsed`);
        return size > 0;

        // if (Array.isArray(pid)) {
        //     const sets = pid.map(pid => `pid:${pid}:users_endorsed`);
        //     return await db.isMemberOfSets(sets, uid);
        // }
        // return await db.isSetMember(`pid:${pid}:users_endorsed`, uid);
    };
};


