"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint-disable no-param-reassign */
var details = function () { return ({
    name: 'Cleanup Streams',
    description: "\n    Remove unwanted streams\n   \\n\\n\n    Credit:\n    \n\n\n    \n    \n    ",
    style: {
        borderColor: '#6efefc',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Remove Video',
            name: 'removeVideo',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n         Toggle whether to remove video streams \\n\n         \\n\n         This will only happen if there are multiple video streams present, otherwise it may fail the plugin \\n\n         If multiple streams are present it will remove unwanted language and de-dupe \\n\n         If only one stream is present and it is flagged as an unwanted language it will fail the plugin\n         ",
        },
        {
            label: 'Remove Audio',
            name: 'removeAudio',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to remove audio streams \\n\n        \\n\n        This will happen if the stream is an unwanted language or a duplicate combo of language+channels\n        ",
        },
        {
            label: 'Remove Subtitles',
            name: 'removeSubtitles',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to remove subtitle streams \\n\n        \\n\n        This will happen if the stream is an unwanted language or is a duplicate combo of language+default+forced\n        ",
        },
        {
            label: 'Languages to Keep',
            name: 'keepLanguages',
            type: 'string',
            defaultValue: 'eng',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'OR',
                    sets: [
                        {
                            logic: 'OR',
                            inputs: [
                                {
                                    name: 'removeVideo',
                                    value: 'true',
                                    condition: '===',
                                },
                                {
                                    name: 'removeAudio',
                                    value: 'true',
                                    condition: '===',
                                },
                                {
                                    name: 'removeSubtitles',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Enter a comma-separated list of language tags to keep \\n\n        \\n\n        This will only apply to stream types with their remove flags enabled \\n\n        Any video, audio, or subtitle stream tagged as a language not in this list will be flagged for removal \\n\n        Any stream without a language tag present will be treated as matching the first entry in this list \\n\n        ",
        },
        {
            label: 'Remove Duplicates',
            name: 'removeDuplicates',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
                displayConditions: {
                    logic: 'OR',
                    sets: [
                        {
                            logic: 'OR',
                            inputs: [
                                {
                                    name: 'removeVideo',
                                    value: 'true',
                                    condition: '===',
                                },
                                {
                                    name: 'removeAudio',
                                    value: 'true',
                                    condition: '===',
                                },
                                {
                                    name: 'removeSubtitles',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Toggle whether to remove streams which appear to be duplicates of others\\n\n        \\n\n        For video streams it will keep the highest resolution+bitrate grouped by language \\n\n        For audio it will keep the one with the highest bitrate grouped by language+channels \\n\n        For subtitles it will keep the first entry grouped by language+default+forced flags \\n\n        \\n\n        All streams which appear to be commentary will be kept if the relevant \"Remove Commentary\" setting is disabled\n        ",
        },
        {
            label: 'Remove Other Streams',
            name: 'removeOther',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Toggle whether to remove streams that are not video, audio, or subtitle',
        },
        {
            label: 'Remove Audio Commentary',
            name: 'removeCommentaryAudio',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'removeAudio',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Toggle whether to remove audio streams tagged as commentary \\n\n        \\n\n        This is detected by checking if the 'comment' flag is set or if the title contains (case insensitive) \n        'commentary'\n        ",
        },
        {
            label: 'Remove Audio Descriptions',
            name: 'removeDescriptiveAudio',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'removeAudio',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Toggle whether to remove audio streams tagged as descriptive \\n\n        \\n\n        This is detected by checking if the 'descriptions' flag is set or if the title contains (case insensitive) \n        'descriptive'\n        ",
        },
        {
            label: 'Remove Subtitle Commentary',
            name: 'removeCommentarySubs',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'removeSubtitles',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Toggle whether to remove subtitle streams tagged as commentary\\n\n        \\n\n        This is detected by checking if the title contains (case insensitive) 'commentary', 'description', or 'sdh'\n        ",
        },
        {
            label: 'Remove Subtitle Descriptions',
            name: 'removeDescriptiveSubs',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'removeAudio',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Toggle whether to remove subtitle streams tagged as descriptive \\n\n        \\n\n        This is detected by checking if the 'descriptions' flag is set or if the title contains (case insensitive) \n        'descriptive', 'description', or 'sdh'\n        ",
        },
    ],
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
    var _a;
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // ensure ffmpeg command has been initialized
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    // flags for what should be removed
    var removeVideo = Boolean(args.inputs.removeVideo);
    var removeAudio = Boolean(args.inputs.removeAudio);
    var removeSubtitles = Boolean(args.inputs.removeSubtitles);
    var removeDuplicates = Boolean(args.inputs.removeDuplicates);
    var removeOther = Boolean(args.inputs.removeOther);
    var removeCommentaryAudio = Boolean(args.inputs.removeCommentaryAudio);
    var removeCommentarySubs = Boolean(args.inputs.removeCommentarySubs);
    var removeDescriptiveAudio = Boolean(args.inputs.removeDescriptiveAudio);
    var removeDescriptiveSubs = Boolean(args.inputs.removeDescriptiveSubs);
    var keepLanguages = String(args.inputs.keepLanguages).split(',');
    var defaultLanguage = (_a = keepLanguages[0]) !== null && _a !== void 0 ? _a : 'en';
    // grab a handle to streams
    var streams = args.variables.ffmpegCommand.streams;
    // generate type indexes for logging
    streams.map(function (stream) { return stream.codec_type; })
        .filter(function (value, index, array) { return array.indexOf(value) === index; })
        .forEach(function (codecType) {
        // for each unique codec type set type index
        streams.filter(function (stream) { return stream.codec_type === codecType; })
            .forEach(function (stream, index) {
            stream.typeIndex = index;
        });
    });
    // tools to get friendly channel names from a stream
    var channelMap = {
        8: '7.1',
        7: '6.1',
        6: '5.1',
        2: '2.0',
        1: '1.0',
    };
    var getChannels = function (stream) { return (channelMap[Number(stream.channels)]); };
    // tools to get friendly resolution names from a stream
    var resolutionMap = {
        640: '480p',
        1280: '720p',
        1920: '1080p',
        2560: '1440p',
        3840: '4k',
    };
    var getResolution = function (stream) { return (resolutionMap[Number(stream.width)]); };
    // function to get bitrate from stream
    var getBitrate = function (stream) {
        var _a;
        if ((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.BPS) {
            var kbps = Math.floor(Number(stream.tags.BPS) / 1000);
            if (String(kbps).length > 3) {
                return "".concat((kbps / 1000).toFixed(1), "Mbps");
            }
            return "".concat(kbps, "kbps");
        }
        return undefined;
    };
    // function to retrieve the language for the input stream
    var getLanguage = function (stream) {
        var _a;
        if (!((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language) || stream.tags.language === 'und') {
            // default to first entry in keep list if undefined
            return defaultLanguage;
        }
        return stream.tags.language;
    };
    // function to determine if a stream is commentary
    var isCommentary = function (stream) {
        var _a, _b, _c;
        return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.comment)
            || ((_c = (_b = stream.tags) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes('commentary')));
    };
    // function to determine if a stream is descriptive
    var isDescriptive = function (stream) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.descriptions)
            || ((_c = (_b = stream.tags) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes('description'))
            || ((_e = (_d = stream.tags) === null || _d === void 0 ? void 0 : _d.title) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes('descriptive'))
            || ((_f = stream.disposition) === null || _f === void 0 ? void 0 : _f.visual_impaired)
            || ((_h = (_g = stream.tags) === null || _g === void 0 ? void 0 : _g.title) === null || _h === void 0 ? void 0 : _h.toLowerCase().includes('sdh')));
    };
    // function to get the title of a stream
    var getTitle = function (stream) {
        var _a, _b, _c, _d, _e, _f, _g;
        if ((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title) {
            return stream.tags.title;
        }
        var codecType = stream.codec_type.toLowerCase();
        switch (codecType) {
            case 'video':
                return [(_b = stream === null || stream === void 0 ? void 0 : stream.codec_name) === null || _b === void 0 ? void 0 : _b.toUpperCase(), getResolution(stream), getBitrate(stream)]
                    .filter(function (item) { return item; })
                    .join(' ');
            case 'audio':
                var audioFlags = [
                    (((_c = stream.disposition) === null || _c === void 0 ? void 0 : _c.default) ? 'default' : undefined),
                    (((_d = stream.disposition) === null || _d === void 0 ? void 0 : _d.dub) ? 'dub' : undefined),
                    (isDescriptive(stream) ? 'descriptive' : undefined),
                    (isCommentary(stream) ? 'commentary' : undefined),
                ].filter(function (item) { return item; });
                return [
                    (_e = stream === null || stream === void 0 ? void 0 : stream.codec_name) === null || _e === void 0 ? void 0 : _e.toUpperCase(),
                    getChannels(stream),
                    getBitrate(stream),
                    ((stream.sample_rate) ? "".concat(Math.floor(Number(stream.sample_rate) / 1000), "kHz") : undefined),
                    ((stream.bits_per_raw_sample) ? "".concat(stream.bits_per_raw_sample, "-bit") : undefined),
                    getLanguage(stream),
                    (audioFlags.length > 0) ? "(".concat(audioFlags.join(', '), ")") : undefined,
                ].filter(function (item) { return item !== undefined; })
                    .join(' ');
            case 'subtitle':
                var subtitleFlags = [
                    (((_f = stream.disposition) === null || _f === void 0 ? void 0 : _f.default) ? 'default' : undefined),
                    (((_g = stream.disposition) === null || _g === void 0 ? void 0 : _g.forced) ? 'forced' : undefined),
                    (isDescriptive(stream) ? 'descriptive' : undefined),
                    (isCommentary(stream) ? 'commentary' : undefined),
                ].filter(function (item) { return item; });
                return [
                    getLanguage(stream),
                    (subtitleFlags.length > 0) ? "(".concat(subtitleFlags.join(', '), ")") : undefined,
                ].filter(function (item) { return item; })
                    .join(' ');
            default:
                return '';
        }
    };
    // function to get sort info from a stream
    var getSortInfo = function (stream) {
        switch (stream.codec_type.toLowerCase()) {
            case 'video':
                return "".concat(getResolution(stream), " ").concat(getBitrate(stream));
            case 'audio':
                return "".concat(getBitrate(stream));
            case 'subtitle':
                return "index:".concat(stream.typeIndex);
            default:
                return '';
        }
    };
    // function to get de-duplication sorting function
    var getDedupeSort = function (codecType) {
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
                // sort by bitrate (desc)
                return function (s1, s2) {
                    var _a, _b;
                    // sort by bitrate descending
                    var br1 = Number(((_a = s1 === null || s1 === void 0 ? void 0 : s1.tags) === null || _a === void 0 ? void 0 : _a.BPS) || 0);
                    var br2 = Number(((_b = s2 === null || s2 === void 0 ? void 0 : s2.tags) === null || _b === void 0 ? void 0 : _b.BPS) || 0);
                    if (br1 > br2)
                        return -1;
                    if (br1 < br2)
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
    // determine number of input streams of each type
    var inputStreamCounts = streams
        .reduce(function (counts, val) {
        var _a;
        counts[val.codec_type] = ((_a = counts[val.codec_type]) !== null && _a !== void 0 ? _a : 0) + 1;
        return counts;
    }, {});
    args.jobLog("input stream counts: ".concat(JSON.stringify(inputStreamCounts)));
    // track number of removed streams of each type
    var streamRemovedMap = {
        video: 0,
        audio: 0,
        subtitle: 0,
    };
    var countRemoved = function (stream) {
        var codecType = stream.codec_type.toLowerCase();
        if (streamRemovedMap[codecType] === undefined) {
            streamRemovedMap[codecType] = 0;
        }
        streamRemovedMap[codecType] += 1;
    };
    // create a map to hold streams for de-duplicating later if enabled
    var dedupeMap = {
        video: {},
        audio: {},
        subtitle: {},
    };
    // function to add streams to de-dupe map
    var addToDedupeMap = function (stream) {
        var _a, _b, _c, _d;
        var codecType = stream.codec_type.toLowerCase();
        var groupByKey = "index:".concat(stream.typeIndex);
        if (codecType === 'video') {
            groupByKey = getLanguage(stream);
        }
        else if (codecType === 'audio') {
            groupByKey = "".concat(getLanguage(stream), " ").concat(getChannels(stream));
        }
        else if (codecType === 'subtitle') {
            groupByKey = "language:".concat(getLanguage(stream), ",")
                + "default:".concat((_b = (_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.default) !== null && _b !== void 0 ? _b : 0, ",")
                + "forced:".concat((_d = (_c = stream.disposition) === null || _c === void 0 ? void 0 : _c.forced) !== null && _d !== void 0 ? _d : 0);
        }
        if (!dedupeMap[codecType]) {
            dedupeMap[codecType] = {};
        }
        if (!dedupeMap[codecType][groupByKey]) {
            dedupeMap[codecType][groupByKey] = [];
        }
        dedupeMap[codecType][groupByKey].push(stream);
    };
    // iterate streams to flag the ones to remove
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        var _a, _b, _c;
        var codecType = stream.codec_type.toLowerCase();
        args.jobLog("checking [".concat(codecType, "] stream [").concat(getTitle(stream), "]"));
        switch (codecType) {
            case 'video':
                if (removeVideo) {
                    if (!keepLanguages.includes(getLanguage(stream))) {
                        // language is unwanted
                        args.jobLog("flagging stream s:".concat(stream.index, ":a:").concat(stream.typeIndex, " (").concat(getTitle(stream), ") for removal - ")
                            + "language [".concat((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language, "] is unwanted"));
                        stream.removed = true;
                    }
                }
                break;
            case 'audio':
                // determine if we should remove this audio stream
                if (removeAudio) {
                    // audio cleanup is enabled
                    if (!keepLanguages.includes(getLanguage(stream))) {
                        // language is unwanted
                        args.jobLog("flagging stream s:".concat(stream.index, ":a:").concat(stream.typeIndex, " (").concat(getTitle(stream), ") for removal - ")
                            + "language [".concat((_b = stream.tags) === null || _b === void 0 ? void 0 : _b.language, "] is unwanted"));
                        stream.removed = true;
                    }
                    else if (removeCommentaryAudio && isCommentary(stream)) {
                        // unwanted commentary
                        args.jobLog("flagging stream s:".concat(stream.index, ":a:").concat(stream.typeIndex, " (").concat(getTitle(stream), ") for removal - ")
                            + 'marked as commentary');
                        stream.removed = true;
                    }
                    else if (removeDescriptiveAudio && isDescriptive(stream)) {
                        // unwanted descriptive
                        args.jobLog("flagging stream s:".concat(stream.index, ":a:").concat(stream.typeIndex, " (").concat(getTitle(stream), ") for removal - ")
                            + 'marked as descriptive');
                        stream.removed = true;
                    }
                }
                break;
            case 'subtitle':
                if (removeSubtitles) {
                    // subtitle cleanup is enabled
                    if (!keepLanguages.includes(getLanguage(stream))) {
                        // language is unwanted
                        args.jobLog("flagging stream s:".concat(stream.index, ":s:").concat(stream.typeIndex, " (").concat(getTitle(stream), ") for removal - ")
                            + "language [".concat((_c = stream.tags) === null || _c === void 0 ? void 0 : _c.language, "] is unwanted"));
                        stream.removed = true;
                    }
                    else if (removeCommentarySubs && isCommentary(stream)) {
                        // unwanted commentary
                        args.jobLog("flagging stream s:".concat(stream.index, ":s:").concat(stream.typeIndex, " (").concat(getTitle(stream), ") for removal - ")
                            + 'marked as commentary');
                        stream.removed = true;
                    }
                    else if (removeDescriptiveSubs && isDescriptive(stream)) {
                        // unwanted descriptive
                        args.jobLog("flagging stream s:".concat(stream.index, ":s:").concat(stream.typeIndex, " (").concat(getTitle(stream), ") for removal - ")
                            + 'marked as descriptive');
                    }
                }
                break;
            default:
                // if not video, audio, or subtitle
                if (removeOther) {
                    args.jobLog("flagging stream s:".concat(stream.index, " (").concat(getTitle(stream), ") for removal - ")
                        + "stream type [".concat(codecType, "] is unwanted"));
                    // mark stream for removal
                    stream.removed = true;
                }
        }
        // handle counting and de-dupe map
        if (stream.removed) {
            countRemoved(stream);
        }
        else {
            addToDedupeMap(stream);
        }
    });
    // handle de-duplication if enabled
    if (removeDuplicates) {
        // iterate codec types in duplicate-tracking map
        Object.keys(dedupeMap)
            .forEach(function (codecType) {
            // for each codec type
            args.jobLog("checking for duplicate [".concat(codecType, "] streams"));
            Object.keys(dedupeMap[codecType])
                .forEach(function (groupByKey) {
                var groupedStreams = dedupeMap[codecType][groupByKey];
                if (groupedStreams.length > 1) {
                    args.jobLog("found duplicate [".concat(codecType, "] streams for group-by key [").concat(groupByKey, "]"));
                    groupedStreams.sort(getDedupeSort(codecType))
                        .forEach(function (stream, index) {
                        // keep the first entry, discard the rest
                        if (index === 0) {
                            // first item we keep
                            args.jobLog("keeping [".concat(codecType, "] stream [").concat(getTitle(stream), "] with group-by key [").concat(groupByKey, "] and ")
                                + "sort info [".concat(getSortInfo(stream), "]"));
                        }
                        else {
                            // remove the rest
                            args.jobLog("removing [".concat(codecType, "] stream [").concat(getTitle(stream), "] with group-by key [").concat(groupByKey, "] and ")
                                + " sort info [".concat(getSortInfo(stream), "]"));
                            stream.removed = true;
                            countRemoved(stream);
                        }
                    });
                }
            });
        });
    }
    // log removal summary
    args.jobLog("attempting to remove streams: ".concat(JSON.stringify(streamRemovedMap)));
    // safety check to avoid removing all video streams
    if (streamRemovedMap.video >= (inputStreamCounts.video || 0)) {
        // trying to remove all audio streams
        throw new Error("Error: attempting to remove all ".concat(inputStreamCounts.video, " video streams"));
    }
    // safety check to avoid removing all audio streams
    if (streamRemovedMap.audio >= (inputStreamCounts.audio || 0)) {
        // trying to remove all audio streams
        throw new Error("Error: attempting to remove all ".concat(inputStreamCounts.audio, " audio streams"));
    }
    // standard return
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
