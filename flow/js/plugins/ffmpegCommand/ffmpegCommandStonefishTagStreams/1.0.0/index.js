"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint-disable no-param-reassign */
var details = function () { return ({
    name: 'Tag Streams',
    description: "\n    Add missing tags \\n\n    \\n\n    Checks all streams for missing titles, and optionally overwrites existing ones with new ones generated from current\n    title metadata.\n    ",
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
            label: 'Force New Titles',
            name: 'forceTitles',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to forcibly re-generate all video, audio, and subtitle stream titles \\n\n        \\n\n        This may help if the existing tags include now-outdated info on codec, bitrate, etc. By default this will not be\n        applied to descriptive or commentary streams which already have a title. See the below flags to force those as \n        well.\n        ",
        },
        {
            label: 'Force New Titles for Commentary Streams',
            name: 'forceTitleCommentary',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to forcibly re-generate stream titles for streams that are commentary \\n\n        \\n\n        Many commentary streams already have descriptive titles rather than codec/bitrate information.\n        ",
        },
        {
            label: 'Force New Titles for Descriptive Streams',
            name: 'forceTitleDescriptive',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to forcibly re-generate stream titles for streams that are descriptive \\n\n        \\n\n        Many descriptive streams already have descriptive titles rather than codec/bitrate information.\n        ",
        },
        {
            label: 'Set Disposition Flags',
            name: 'setDisposition',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to set missing disposition flags for commentary and descriptive \\n\n        \\n\n        If a stream has 'commentary' or 'descriptive' in the title but is missing the appropriate disposition flag then\n        set these flags. \n        ",
        },
        {
            label: 'Override Default Language Tag',
            name: 'setLangTag',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to override the default language to use for untagged streams \\n\n        \\n\n        The default value is 'eng'\n        ",
        },
        {
            label: 'Language Tag',
            name: 'tagLanguage',
            type: 'string',
            defaultValue: 'eng',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'setLangTag',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Enter the language tag to use where missing',
        },
        {
            label: 'Override Language Map',
            name: 'setLangMap',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to override the mapping from language tag to friendly name \\n\n        \\n\n        The default map is: {'eng':'English'}\n        ",
        },
        {
            label: 'Language Map',
            name: 'languageMap',
            type: 'string',
            defaultValue: '{\'eng\':\'English\',\'en\':\'English\'}',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'setLangTag',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n       Enter a string JSON map to get friendly language names from the tag value \\n\n       \\n\n       If a value is not present in the map then the title will use the tag in all uppercase.\n       ",
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
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // ensure ffmpeg command has been initialized
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    // tag configuration
    var forceTitle = Boolean(args.inputs.forceTitles);
    var forceTitleCommentary = Boolean(args.inputs.forceTitleCommentary);
    var forceTitleDescriptive = Boolean(args.inputs.forceTitleDescriptive);
    var setDisposition = Boolean(args.inputs.setDisposition);
    var tagLanguage = (args.inputs.setLangTag) ? String(args.inputs.tagLanguage) : 'eng';
    var languageMap = (args.inputs.setLangMap) ? JSON.parse(String(args.inputs.languageMap)) : {
        en: 'English',
        eng: 'English',
    };
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
    // tools to get friendly channel names from count
    var channelMap = {
        8: '7.1',
        7: '6.1',
        6: '5.1',
        2: '2.0',
        1: '1.0',
    };
    var getChannels = function (stream) { return (channelMap[Number(stream.channels)] ? channelMap[Number(stream.channels)] : undefined); };
    // tools to get friendly resolution names from width
    var resolutionMap = {
        640: '480p',
        1280: '720p',
        1920: '1080p',
        2560: '1440p',
        3840: '4k',
    };
    var getResolution = function (stream) { return (resolutionMap[Number(stream.width)] ? resolutionMap[Number(stream.width)] : undefined); };
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
    // function to get the language for a stream
    var getLanguage = function (stream) {
        var _a;
        var langTag = String((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language).toLowerCase() || tagLanguage;
        return (languageMap[langTag] || langTag.toUpperCase());
    };
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
    // function to get the title of a stream
    var getTitle = function (stream) {
        var _a, _b, _c, _d, _e, _f;
        var codecType = stream.codec_type.toLowerCase();
        switch (codecType) {
            case 'video':
                return [(_a = stream === null || stream === void 0 ? void 0 : stream.codec_name) === null || _a === void 0 ? void 0 : _a.toUpperCase(), getResolution(stream), getBitrate(stream)]
                    .filter(function (item) { return item; })
                    .join(' ');
            case 'audio':
                var audioFlags = [
                    (((_b = stream.disposition) === null || _b === void 0 ? void 0 : _b.default) ? 'default' : undefined),
                    (((_c = stream.disposition) === null || _c === void 0 ? void 0 : _c.dub) ? 'dub' : undefined),
                    (isDescriptive(stream) ? 'descriptive' : undefined),
                    (isCommentary(stream) ? 'commentary' : undefined),
                ].filter(function (item) { return item; });
                return [
                    (_d = stream === null || stream === void 0 ? void 0 : stream.codec_name) === null || _d === void 0 ? void 0 : _d.toUpperCase(),
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
                    (((_e = stream.disposition) === null || _e === void 0 ? void 0 : _e.default) ? 'default' : undefined),
                    (((_f = stream.disposition) === null || _f === void 0 ? void 0 : _f.forced) ? 'forced' : undefined),
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
    // iterate streams to flag the ones to remove
    streams.forEach(function (stream) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var codecType = stream.codec_type.toLowerCase();
        args.jobLog("checking [".concat(codecType, "] stream [").concat(((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title) || getTitle(stream), "]"));
        // copy all streams
        stream.outputArgs.push('-c:{outputIndex}', 'copy');
        // add tags for video, audio, subtitle streams
        if (['video', 'audio', 'subtitle'].includes(codecType)) {
            // check if language tag is missing
            if (!((_b = stream.tags) === null || _b === void 0 ? void 0 : _b.language) || ((_d = (_c = stream.tags) === null || _c === void 0 ? void 0 : _c.language) === null || _d === void 0 ? void 0 : _d.toLowerCase()) === 'und') {
                args.jobLog("found untagged [".concat(codecType, "] stream - setting language to [").concat(tagLanguage, "]"));
                // set shouldProcess
                args.variables.ffmpegCommand.shouldProcess = true;
                // ensure tags object exists and set language tag
                (_e = stream.tags) !== null && _e !== void 0 ? _e : (stream.tags = {});
                stream.tags.language = tagLanguage;
                // add ffmpeg args to tag the file
                stream.outputArgs.push("-metadata:s:".concat(Array.from(codecType)[0], ":{outputTypeIndex}"), "language=".concat(tagLanguage));
            }
            // check if we should be force regenerating titles or if title is missing
            if (!((_f = stream.tags) === null || _f === void 0 ? void 0 : _f.title) // title is missing
                || (forceTitle && !isCommentary(stream) && !isDescriptive(stream)) // force for not commentary/descriptive
                || (forceTitleCommentary && isCommentary(stream)) // force for commentary
                || (forceTitleDescriptive && isDescriptive(stream)) // force for descriptive
            ) {
                var title = getTitle(stream);
                args.jobLog("found untagged [".concat(codecType, "] stream - setting title to [").concat(title, "]"));
                // set shouldProcess
                args.variables.ffmpegCommand.shouldProcess = true;
                // ensure tags object exists and set title tag
                (_g = stream.tags) !== null && _g !== void 0 ? _g : (stream.tags = {});
                stream.tags.title = title;
                // add ffmpeg args to tag the file
                stream.outputArgs.push("-metadata:s:".concat(Array.from(codecType)[0], ":{outputTypeIndex}"), "title=".concat(title));
            }
        }
        // add disposition flags for audio and subtitle streams if enabled
        if (setDisposition && ['audio', 'subtitle'].includes(codecType)) {
            // handle commentary streams
            if (isCommentary(stream) && !((_h = stream.disposition) === null || _h === void 0 ? void 0 : _h.comment)) {
                args.jobLog("found [".concat(codecType, "] stream that appears to be commentary without the disposition flag set"));
                // set shouldProcess
                args.variables.ffmpegCommand.shouldProcess = true;
                // set comment flag
                (_j = stream.disposition) !== null && _j !== void 0 ? _j : (stream.disposition = {});
                stream.disposition.comment = 1;
                // add ffmpeg args to set the flag
                stream.outputArgs.push("-disposition:".concat(Array.from(codecType)[0], ":{outputTypeIndex}"), 'comment');
            }
            // handle descriptive streams
            if (isDescriptive(stream) && !((_k = stream.disposition) === null || _k === void 0 ? void 0 : _k.descriptions)) {
                args.jobLog("found [".concat(codecType, "] stream that appears to be descriptive without the disposition flag set"));
                // set shouldProcess
                args.variables.ffmpegCommand.shouldProcess = true;
                // set descriptions flag
                (_l = stream.disposition) !== null && _l !== void 0 ? _l : (stream.disposition = {});
                stream.disposition.descriptions = 1;
                // add ffmpeg args to set the flag
                stream.outputArgs.push("-disposition:".concat(Array.from(codecType)[0], ":{outputTypeIndex}"), 'descriptions');
            }
        }
    });
    // standard return
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
