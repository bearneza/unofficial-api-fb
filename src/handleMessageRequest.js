"use strict";

const utils = require("../utils");
const log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
    return function handleMessageRequest(threadID, callback) {
        let resolveFunc = function () { };
        let rejectFunc = function () { };
        const returnPromise = new Promise(function (resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        if (!callback) {
            callback = function (err, friendList) {
                if (err) {
                    return rejectFunc(err);
                }
                resolveFunc(friendList);
            };
        }

        const form = {
            client: "mercury",
            inbox: threadID, // Set inbox to the threadID directly
        };

        defaultFuncs
            .post(
                "https://www.facebook.com/ajax/mercury/move_thread.php",
                ctx.jar,
                form
            )
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
            .then(function (resData) {
                if (resData.error) {
                    throw resData;
                }

                // Additional actions after accepting a message
                // Send an emoji after accepting the message
                const emoji = '👍';
                api.sendMessage(emoji, threadID[0]); // Assuming you want to send the emoji to the first thread in the list

                return callback();
            })
            .catch(function (err) {
                log.error("handleMessageRequest", err);
                return callback(err);
            });

        return returnPromise;
    };
};
