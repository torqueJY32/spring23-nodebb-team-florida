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
const db = require('../database');
const plugins = require('../plugins');
module.exports = function (Posts) {
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
            if (isEndorsing && hasEndorsed) {
                throw new Error('[[error:already-endorsed]]');
            }
            if (!isEndorsing && !hasEndorsed) {
                throw new Error('[[error:already-unendorsed]]');
            }
            if (isEndorsing) {
                yield db.sortedSetAdd(`uid:${uid}:endorses`, Date.now(), pid);
            }
            else {
                yield db.sortedSetRemove(`uid:${uid}:endorses`, pid);
            }
            yield db[isEndorsing ? 'setAdd' : 'setRemove'](`pid:${pid}:users_endorsed`, uid);
            postData.endorses = yield db.setCount(`pid:${pid}:users_endorsed`);
            yield Posts.setPostField(pid, 'endorses', postData.endorses);
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
        });
    }
    Posts.hasEndorsed = function (pid, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(uid, 10) <= 0) {
                return Array.isArray(pid) ? pid.map(() => false) : false;
            }
            if (Array.isArray(pid)) {
                const sets = pid.map(pid => `pid:${pid}:users_endorsed`);
                return yield db.isMemberOfSets(sets, uid);
            }
            return yield db.isSetMember(`pid:${pid}:users_endorsed`, uid);
        });
    };
};
