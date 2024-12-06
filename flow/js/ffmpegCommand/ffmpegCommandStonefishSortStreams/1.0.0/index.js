"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Sort Streams',
    description: "\n    Sort Streams \\n\n    \\n\n    Sorts first by type - video, audio, subtitle, other \\n\n    \\n \n    Within type follows this logic: \\n\n    Video: resolution (desc), then bitrate (desc)\n    Audio: sorted by type (standard, commentary, descriptive), then channels (desc), bitrate (desc) \\n\n    Subtitle: sorted by type (standard, commentary, descriptive), then forced flag, then default flag \\n\n    Other: left in input order \\n\n    \\n\n    Influenced by the standard ffmpegCommandRorderStreams plugin. However, I wasn't getting quite the result I wanted, \n    so I learned how to build a flow plugin to build exactly what I was looking for. No configuration, this one is \"my \n    way or the highway\". \n    ",
    style: {
        borderColor: '#6efefc',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // check if ffmpeg command has been initialized
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    // get a copy of input streams so we can sort without changing the input
    var streams = JSON.parse(JSON.stringify(args.variables.ffmpegCommand.streams));
    // create array of post-sort streams
    var sortedStreams = [];
    // generate type indexes
    streams.map(function (stream) { return stream.codec_type; })
        .filter(function (value, index, array) { return array.indexOf(value) === index; })
        .forEach(function (codecType) {
        // for each unique codec type set type index
        streams.filter(function (stream) { return stream.codec_type === codecType; })
            .forEach(function (stream, index) {
            // eslint-disable-next-line no-param-reassign
            stream.typeIndex = index;
        });
    });
    // track input stream state to compare later
    var originalStreams = JSON.stringify(streams);
    // generate a map of streams grouped by codec type
    var mapByType = streams.reduce(function (map, stream) {
        var _a;
        return (__assign(__assign({}, map), (_a = {}, _a[stream.codec_type] = __spreadArray(__spreadArray([], (map[stream.codec_type] || []), true), [stream], false), _a)));
    }, {});
    // function to determine if a stream is commentary
    var isCommentary = function (stream) {
        var _a, _b, _c;
        return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.comment)
            || ((_c = (_b = stream.tags) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes('commentary')));
    };
    // function to determine if a stream is descriptive
    var isDescriptive = function (stream) {
        var _a, _b, _c, _d, _e, _f;
        return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.descriptions)
            || ((_b = stream.disposition) === null || _b === void 0 ? void 0 : _b.visual_impaired)
            || ((_d = (_c = stream.tags) === null || _c === void 0 ? void 0 : _c.title) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes('description'))
            || ((_f = (_e = stream.tags) === null || _e === void 0 ? void 0 : _e.title) === null || _f === void 0 ? void 0 : _f.toLowerCase().includes('sdh')));
    };
    // function to get de-duplication sorting function
    var getStreamSort = function (codecType) {
        switch (codecType) {
            case 'video':
                // sort by resolution (desc) then bitrate (desc)
                return function (s1, s2) {
                    var _a, _b;
                    // resolution descending
                    var w1 = Number((s1 === null || s1 === void 0 ? void 0 : s1.width) || 0);
                    var w2 = Number((s2 === null || s2 === void 0 ? void 0 : s2.width) || 0);
                    if (w1 > w2)
                        return -1;
                    if (w1 < w2)
                        return 1;
                    // then bitrate descending
                    var br1 = Number(((_a = s1 === null || s1 === void 0 ? void 0 : s1.tags) === null || _a === void 0 ? void 0 : _a.BPS) || 0);
                    var br2 = Number(((_b = s2 === null || s2 === void 0 ? void 0 : s2.tags) === null || _b === void 0 ? void 0 : _b.BPS) || 0);
                    if (br1 > br2)
                        return -1;
                    if (br1 < br2)
                        return 1;
                    // tie
                    return 0;
                };
            case 'audio':
                // sort by commentary, descriptive, bitrate (desc)
                return function (s1, s2) {
                    var _a, _b;
                    // regular streams come before commentary/descriptive
                    if (!isCommentary(s1) && (isCommentary(s2) || isDescriptive(s2)))
                        return -1;
                    if ((isCommentary(s1) || isDescriptive(s1)) && !isCommentary(s2))
                        return 1;
                    // commentary comes before descriptive
                    if (isCommentary(s1) && isDescriptive(s2))
                        return -1;
                    if (isDescriptive(s1) && isCommentary(s2))
                        return 1;
                    // channels descending
                    var c1 = Number((s1 === null || s1 === void 0 ? void 0 : s1.channels) || 0);
                    var c2 = Number((s2 === null || s2 === void 0 ? void 0 : s2.channels) || 0);
                    if (c1 > c2)
                        return -1;
                    if (c1 < c2)
                        return 1;
                    // then bitrate descending
                    var br1 = Number(((_a = s1 === null || s1 === void 0 ? void 0 : s1.tags) === null || _a === void 0 ? void 0 : _a.BPS) || 0);
                    var br2 = Number(((_b = s2 === null || s2 === void 0 ? void 0 : s2.tags) === null || _b === void 0 ? void 0 : _b.BPS) || 0);
                    if (br1 > br2)
                        return -1;
                    if (br1 < br2)
                        return 1;
                    // tie
                    return 0;
                };
            case 'subtitle':
                // sort by commentary/descriptive/default/forced
                return function (s1, s2) {
                    var _a, _b, _c, _d;
                    // regular streams come before commentary/descriptive
                    if (!isCommentary(s1) && (isCommentary(s2) || isDescriptive(s2)))
                        return -1;
                    if ((isCommentary(s1) || isDescriptive(s1)) && !isCommentary(s2))
                        return 1;
                    // commentary comes before descriptive
                    if (isCommentary(s1) && isDescriptive(s2))
                        return -1;
                    if (isDescriptive(s1) && isCommentary(s2))
                        return 1;
                    // forced flag descending
                    var f1 = Number(((_a = s1 === null || s1 === void 0 ? void 0 : s1.disposition) === null || _a === void 0 ? void 0 : _a.forced) || 0);
                    var f2 = Number(((_b = s2 === null || s2 === void 0 ? void 0 : s2.disposition) === null || _b === void 0 ? void 0 : _b.forced) || 0);
                    if (f1 > f2)
                        return -1;
                    if (f1 < f2)
                        return 1;
                    // then default flag descending
                    var d1 = Number(((_c = s1 === null || s1 === void 0 ? void 0 : s1.disposition) === null || _c === void 0 ? void 0 : _c.default) || 0);
                    var d2 = Number(((_d = s2 === null || s2 === void 0 ? void 0 : s2.disposition) === null || _d === void 0 ? void 0 : _d.default) || 0);
                    if (d1 > d2)
                        return -1;
                    if (d1 < d2)
                        return 1;
                    // if all else is equal lower index comes first
                    if (s1.typeIndex < s2.typeIndex)
                        return -1;
                    if (s1.typeIndex > s2.typeIndex)
                        return 1;
                    // tie
                    return 0;
                };
            default:
                // don't sort
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return function (o1, o2) { return 0; };
        }
    };
    // iterate primary stream types (in order) to add back to sorted array
    ['video', 'audio', 'subtitle'].forEach(function (codecType) {
        var codecStreams = mapByType[codecType];
        if (codecStreams && codecStreams.length > 0) {
            // at least one stream of this type - sort then iterate streams of this type
            codecStreams.sort(getStreamSort(codecType)).forEach(function (stream, tIndex) {
                var _a;
                // set new index of this stream
                // eslint-disable-next-line no-param-reassign
                stream.index = sortedStreams.length;
                // also set new type index
                // eslint-disable-next-line no-param-reassign
                stream.typeIndex = tIndex;
                // add to our sorted array
                sortedStreams.push(stream);
                args.jobLog("added [".concat(codecType, "] stream:[").concat((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title, "]"));
            });
            // delete this type so we can handle remaining later
            delete mapByType[codecType];
        }
    });
    // handle any remaining stream types we may have missed (why are these still here?)
    Object.keys(mapByType)
        .filter(function (key) { return mapByType[key] && mapByType[key].length > 0; }) // filter to types with streams
        .forEach(function (codecType) {
        // add all remaining streams, leave in existing sort order
        mapByType[codecType].forEach(function (stream, tIndex) {
            var _a;
            // set new index of this stream
            // eslint-disable-next-line no-param-reassign
            stream.index = sortedStreams.length;
            // also set new type index
            // eslint-disable-next-line no-param-reassign
            stream.typeIndex = tIndex;
            // add to our sorted array
            sortedStreams.push(stream);
            args.jobLog("added [".concat(codecType, "] stream:[").concat((_a = stream === null || stream === void 0 ? void 0 : stream.tags) === null || _a === void 0 ? void 0 : _a.title, "]"));
        });
    });
    // check if new order matches original
    if (JSON.stringify(sortedStreams) === originalStreams) {
        args.jobLog('file already sorted - no transcode required');
        // eslint-disable-next-line no-param-reassign
        args.variables.ffmpegCommand.shouldProcess = false;
    }
    else {
        args.jobLog('file requires sorting - transcode will commence');
        // eslint-disable-next-line no-param-reassign
        args.variables.ffmpegCommand.shouldProcess = true;
        // eslint-disable-next-line no-param-reassign
        args.variables.ffmpegCommand.streams = sortedStreams;
    }
    // standard return
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
