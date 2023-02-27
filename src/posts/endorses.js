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
const database_1 = __importDefault(require("../database"));
const plugins_1 = __importDefault(require("../plugins"));
module.exports = function (Posts) {
    function toggleEndorse(type, pid, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(uid, 10) <= 0) {
                throw new Error('[[error:not-logged-in]]');
            }
            const isEndorsing = type === 'endorse';
            const [postData, hasEndorsed] = yield Promise.all([
                Posts.getPostFields(pid, ['pid', 'uid']),
                Posts.hasEndorsed(pid, uid),
            ]);
            // console.log('Current Status for endorse is');
            // console.log(hasEndorsed);
            if (isEndorsing && hasEndorsed) {
                throw new Error('[[error:already-endorsed]]');
            }
            if (!isEndorsing && !hasEndorsed) {
                throw new Error('[[error:already-unendorsed]]');
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            postData.endorses = (yield database_1.default.setCount(`pid:${pid}:users_endorsed`));
            // console.log('before that, num for endorse is');
            // console.log(postData.endorses);
            // if (isEndorsing ) {
            //     await db.sortedSetAdd(`uid:${uid}:endorses`, Date.now(), pid);
            // } else {
            //     await db.sortedSetRemove(`uid:${uid}:endorses`, pid);
            // }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            yield database_1.default[isEndorsing ? 'setAdd' : 'setRemove'](`pid:${pid}:users_endorsed`, 1);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            postData.endorses = (yield database_1.default.setCount(`pid:${pid}:users_endorsed`));
            // console.log('after that, num for endorse is');
            // console.log(postData.endorses);
            // if (isEndorsing ) {
            //     await db.sortedSetAdd(`uid:${uid}:endorses`, Date.now(), pid);
            // } else {
            //     await db.sortedSetRemove(`uid:${uid}:endorses`, pid);
            // }
            yield Posts.setPostField(pid, 'endorses', postData.endorses);
            yield plugins_1.default.hooks.fire(`action:post.${type}`, {
                pid: pid,
                uid: uid,
                owner: postData.uid,
                current: hasEndorsed ? 'endorsed' : 'unendorsed',
            });
            return {
                post: postData,
                isEndorsed: isEndorsing,
            };
        });
    }
    Posts.endorse = function (pid, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield toggleEndorse('endorse', pid, uid);
        });
    };
    Posts.unendorse = function (pid, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield toggleEndorse('unendorse', pid, uid);
        });
    };
    Posts.hasEndorsed = function (pid, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(uid, 10) <= 0) {
                return Array.isArray(pid) ? pid.map(() => false) : false;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const size = yield database_1.default.setCount(`pid:${pid}:users_endorsed`);
            return size > 0;
            // if (Array.isArray(pid)) {
            //     const sets = pid.map(pid => `pid:${pid}:users_endorsed`);
            //     return await db.isMemberOfSets(sets, uid);
            // }
            // return await db.isSetMember(`pid:${pid}:users_endorsed`, uid);
        });
    };
};
