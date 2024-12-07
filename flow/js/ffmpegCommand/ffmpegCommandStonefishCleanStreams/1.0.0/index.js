"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var metadataUtils_1 = require("../../../../FlowHelpers/1.0.0/local/metadataUtils");
/* eslint-disable no-param-reassign */
var details = function () { return ({
    name: 'Cleanup Streams',
    description: "\n    Remove unwanted streams \\n\n    \\n\n    This plugin will iterate through all streams that are present and remove ones which are detected as unwanted after\n    applying the various configuration options below. \\n\n    \\n\n    I use this to purge anything not in my native language, remove duplicates if present, remove data & image streams,\n    and anything flagged as descriptive. There are additional options to remove commentary as well. \\n\n    ",
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
            tooltip: "\n         Toggle whether to remove video streams \\n\n         \\n\n         This will remove streams which are flagged as an unwanted language. \\n\n         \\n\n         If doing so would remove all present video streams then the plugin will fail. \\n\n         ",
        },
        {
            label: 'Remove Audio',
            name: 'removeAudio',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to remove audio streams \\n\n        \\n\n        This will remove a stream if the it is an unwanted language, a duplicate combo of language+channels, or flagged \n        as unwanted commentary or descriptions. \\n\n        \\n\n        If the configured criteria would cause this plugin to remove all present audio streams then it will fail. \\n\n        ",
        },
        {
            label: 'Remove Subtitles',
            name: 'removeSubtitles',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to remove subtitle streams \\n\n        \\n\n        This will remove a stream if it is an unwanted language, is a duplicate combo of language+default+forced, or is \n        flagged as unwanted commentary or descriptions. \\n\n        \\n\n        This will *not* fail if it is going to remove all present subtitle streams. Unlike video and audio I consider \n        the subtitles to be nice-to-have and often manage them as external srt files anyway. \\n\n        ",
        },
        {
            label: 'Languages to Keep',
            name: 'keepLanguages',
            type: 'string',
            defaultValue: 'eng,en',
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
            tooltip: "\n        Enter a comma-separated list of language tags to keep \\n\n        \\n\n        This will only apply to stream types with their remove flags enabled. \\n\n        Any video, audio, or subtitle stream tagged as a language not in this list will be flagged for removal. \\n\n        Any stream without a language tag present will be treated as matching the first entry in this list. \\n\n        ",
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
            tooltip: "\n        Toggle whether to remove streams which appear to be duplicates of others\\n\n        \\n\n        For video streams it will keep the highest resolution+bitrate grouped by language \\n\n        For audio it will keep the one with the highest bitrate grouped by language+channels+commentary+descriptive \\n\n        For subtitles it will keep the first entry grouped by language+default+forced flags \\n\n        \\n\n        All streams which appear to be commentary will be kept if the relevant \"Remove Commentary\" setting is disabled \n        \\n\n        ",
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
            tooltip: "\n        Toggle whether to remove audio streams tagged as commentary \\n\n        \\n\n        This is detected by checking if the 'comment' disposition flag is set or if the title contains 'commentary' \n        (case insensitive). \\n\n        ",
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
            tooltip: "\n        Toggle whether to remove audio streams tagged as descriptive \\n\n        \\n\n        This is detected by checking if the 'descriptions' disposition flag is set or if the title contains \n        'description', 'descriptive', or 'sdh' (case insensitive) \\n\n        ",
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
            tooltip: "\n        Toggle whether to remove subtitle streams tagged as commentary \\n\n        \\n\n        This is detected by checking if the 'comment' disposition flag is set or if the title contains 'commentary' \n        (case insensitive). \\n\n        ",
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
            tooltip: "\n        Toggle whether to remove subtitle streams tagged as descriptive \\n\n        \\n\n        This is detected by checking if the 'descriptions' disposition flag is set or if the title contains \n        'description', 'descriptive', or 'sdh' (case insensitive) \\n\n        ",
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
    var keepLanguages = String(args.inputs.keepLanguages).split(',').map(function (langTag) { return langTag.trim(); });
    var defaultLanguage = (_a = keepLanguages[0]) !== null && _a !== void 0 ? _a : 'eng';
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
    // function to get de-duplication grouping key
    var getGroupByKey = function (stream) {
        var codecType = stream.codec_type.toLowerCase();
        if (codecType === 'video') {
            return (0, metadataUtils_1.getLanguage)(stream) || defaultLanguage;
        }
        if (codecType === 'audio') {
            var flags = [
                (0, metadataUtils_1.isCommentary)(stream) ? 'commentary' : undefined,
                (0, metadataUtils_1.isDescriptive)(stream) ? 'descriptive' : undefined,
            ].filter(function (item) { return item; });
            return "".concat((0, metadataUtils_1.getLanguage)(stream), " ").concat((0, metadataUtils_1.getChannelsName)(stream)).concat(flags.length > 0 ? "(".concat(flags.join(', '), ")") : '');
        }
        if (codecType === 'subtitle') {
            return [
                stream.disposition.default ? 'default' : undefined,
                stream.disposition.forced ? 'forced' : undefined,
                (0, metadataUtils_1.isCommentary)(stream) ? 'commentary' : undefined,
                (0, metadataUtils_1.isDescriptive)(stream) ? 'descriptive' : undefined,
            ].filter(function (item) { return item; }).join(', ');
        }
        return "index:".concat(stream.typeIndex);
    };
    // function to get sort info from a stream (used for logging)
    var getSortInfo = function (stream) {
        switch (stream.codec_type.toLowerCase()) {
            case 'video':
                return "".concat((0, metadataUtils_1.getResolutionName)(stream), " ").concat((0, metadataUtils_1.getBitrate)(stream));
            case 'audio':
                return "".concat((0, metadataUtils_1.getBitrate)(stream));
            case 'subtitle':
                return "index:".concat(stream.typeIndex);
            default:
                return '';
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
        var _a, _b;
        var _c, _d;
        var codecType = stream.codec_type.toLowerCase();
        ((_b = (_c = ((_a = dedupeMap[codecType]) !== null && _a !== void 0 ? _a : (dedupeMap[codecType] = {})))[_d = getGroupByKey(stream)]) !== null && _b !== void 0 ? _b : (_c[_d] = [])).push(stream);
    };
    // iterate streams to flag the ones to remove
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        var _a, _b, _c;
        var codecType = stream.codec_type.toLowerCase();
        args.jobLog("checking [".concat(codecType, "] stream [").concat((0, metadataUtils_1.getTitle)(stream), "]"));
        switch (codecType) {
            case 'video':
                if (removeVideo) {
                    if (!keepLanguages.includes((0, metadataUtils_1.getLanguage)(stream))) {
                        // language is unwanted
                        args.jobLog("flagging stream s:".concat(stream.index, ":a:").concat(stream.typeIndex, " [").concat((0, metadataUtils_1.getTitle)(stream), "] for removal - ")
                            + "language [".concat((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language, "] is unwanted"));
                        stream.removed = true;
                    }
                }
                break;
            case 'audio':
                // determine if we should remove this audio stream
                if (removeAudio) {
                    // audio cleanup is enabled
                    if (!keepLanguages.includes((0, metadataUtils_1.getLanguage)(stream))) {
                        // language is unwanted
                        args.jobLog("flagging stream s:".concat(stream.index, ":a:").concat(stream.typeIndex, " [").concat((0, metadataUtils_1.getTitle)(stream), "] for removal - ")
                            + "language [".concat((_b = stream.tags) === null || _b === void 0 ? void 0 : _b.language, "] is unwanted"));
                        stream.removed = true;
                    }
                    else if (removeCommentaryAudio && (0, metadataUtils_1.isCommentary)(stream)) {
                        // unwanted commentary
                        args.jobLog("flagging stream s:".concat(stream.index, ":a:").concat(stream.typeIndex, " [").concat((0, metadataUtils_1.getTitle)(stream), "] for removal - ")
                            + 'marked as commentary');
                        stream.removed = true;
                    }
                    else if (removeDescriptiveAudio && (0, metadataUtils_1.isDescriptive)(stream)) {
                        // unwanted descriptive
                        args.jobLog("flagging stream s:".concat(stream.index, ":a:").concat(stream.typeIndex, " [").concat((0, metadataUtils_1.getTitle)(stream), "] for removal - ")
                            + 'marked as descriptive');
                        stream.removed = true;
                    }
                }
                break;
            case 'subtitle':
                if (removeSubtitles) {
                    // subtitle cleanup is enabled
                    if (!keepLanguages.includes((0, metadataUtils_1.getLanguage)(stream))) {
                        // language is unwanted
                        args.jobLog("flagging stream s:".concat(stream.index, ":s:").concat(stream.typeIndex, " [").concat((0, metadataUtils_1.getTitle)(stream), "] for removal - ")
                            + "language [".concat((_c = stream.tags) === null || _c === void 0 ? void 0 : _c.language, "] is unwanted"));
                        stream.removed = true;
                    }
                    else if (removeCommentarySubs && (0, metadataUtils_1.isCommentary)(stream)) {
                        // unwanted commentary
                        args.jobLog("flagging stream s:".concat(stream.index, ":s:").concat(stream.typeIndex, " [").concat((0, metadataUtils_1.getTitle)(stream), "] for removal - ")
                            + 'marked as commentary');
                        stream.removed = true;
                    }
                    else if (removeDescriptiveSubs && (0, metadataUtils_1.isDescriptive)(stream)) {
                        // unwanted descriptive
                        args.jobLog("flagging stream s:".concat(stream.index, ":s:").concat(stream.typeIndex, " [").concat((0, metadataUtils_1.getTitle)(stream), "] for removal - ")
                            + 'marked as descriptive');
                    }
                }
                break;
            default:
                // if not video, audio, or subtitle
                if (removeOther) {
                    args.jobLog("flagging stream s:".concat(stream.index, " [").concat((0, metadataUtils_1.getTitle)(stream), "] for removal - ")
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
                    groupedStreams.sort((0, metadataUtils_1.getStreamSort)(codecType))
                        .forEach(function (stream, index) {
                        // keep the first entry, discard the rest
                        if (index === 0) {
                            // first item we keep
                            args.jobLog("keeping [".concat(codecType, "] stream [").concat((0, metadataUtils_1.getTitle)(stream), "] with group-by key [").concat(groupByKey, "] and ")
                                + "sort info [".concat(getSortInfo(stream), "]"));
                        }
                        else {
                            // remove the rest
                            args.jobLog("removing [".concat(codecType, "] stream [").concat((0, metadataUtils_1.getTitle)(stream), "] with group-by key [").concat(groupByKey, "] and ")
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
