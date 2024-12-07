"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var metadataUtils_1 = require("../../../../FlowHelpers/1.0.0/local/metadataUtils");
/* eslint-disable no-param-reassign */
var details = function () { return ({
    name: 'Tag Streams',
    description: "\n    Add missing tags\n    \\n\\n\n    Checks all streams for missing titles, and optionally overwrites existing ones with new ones generated from current\n    title metadata.\n    ",
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
            tooltip: "\n        Specify whether to forcibly re-generate all video, audio, and subtitle stream titles \\n\n        \\n\\n\n        This may help if the existing tags include now-outdated info on codec, bitrate, etc. By default this will not be\n        applied to descriptive or commentary streams which already have a title. See the below flags to force those as \n        well.\n        ",
        },
        {
            label: 'Force New Titles for Commentary Streams',
            name: 'forceTitleCommentary',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to forcibly re-generate stream titles for streams that are commentary\n        \\n\\n\n        Many commentary streams already have descriptive titles rather than codec/bitrate information.\n        ",
        },
        {
            label: 'Force New Titles for Descriptive Streams',
            name: 'forceTitleDescriptive',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to forcibly re-generate stream titles for streams that are descriptive\n        \\n\\n\n        Many descriptive streams already have descriptive titles rather than codec/bitrate information.\n        ",
        },
        {
            label: 'Set Disposition Flags',
            name: 'setDisposition',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to set missing disposition flags for commentary and descriptive\n        \\n\\n\n        If a stream has 'commentary' or 'descriptive' in the title but is missing the appropriate disposition flag then\n        set these flags. \n        ",
        },
        {
            label: 'Override Default Language Tag',
            name: 'setLangTag',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to override the default language to use for untagged streams\n        \\n\\n\n        The default value is 'eng'\n        ",
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
    // grab a handle to streams
    var streams = args.variables.ffmpegCommand.streams;
    // iterate streams to flag the ones to remove
    streams.forEach(function (stream) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var codecType = stream.codec_type.toLowerCase();
        args.jobLog("checking [".concat(codecType, "] stream [").concat(((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title) || (0, metadataUtils_1.getTitle)(stream), "]"));
        // copy all streams
        stream.outputArgs.push('-c:{outputIndex}', 'copy');
        // add tags for video, audio, subtitle streams
        if (['video', 'audio', 'subtitle'].includes(codecType)) {
            // check if language tag is missing
            if ((0, metadataUtils_1.isLanguageUndefined)(stream)) {
                args.jobLog("found untagged [".concat(codecType, "] stream - setting language to [").concat(tagLanguage, "]"));
                // set shouldProcess
                args.variables.ffmpegCommand.shouldProcess = true;
                // ensure tags object exists and set language tag
                (_b = stream.tags) !== null && _b !== void 0 ? _b : (stream.tags = {});
                stream.tags.language = tagLanguage;
                // add ffmpeg args to tag the file
                stream.outputArgs.push("-metadata:s:".concat(Array.from(codecType)[0], ":{outputTypeIndex}"), "language=".concat(tagLanguage));
            }
            // check if we should be force regenerating titles or if title is missing
            if (!((_c = stream.tags) === null || _c === void 0 ? void 0 : _c.title) // title is missing
                || (forceTitle && !(0, metadataUtils_1.isCommentary)(stream) && !(0, metadataUtils_1.isDescriptive)(stream)) // force for not commentary/descriptive
                || (forceTitleCommentary && (0, metadataUtils_1.isCommentary)(stream)) // force for commentary
                || (forceTitleDescriptive && (0, metadataUtils_1.isDescriptive)(stream)) // force for descriptive
            ) {
                var title = (0, metadataUtils_1.getTitle)(stream);
                args.jobLog("found untagged [".concat(codecType, "] stream - setting title to [").concat(title, "]"));
                // set shouldProcess
                args.variables.ffmpegCommand.shouldProcess = true;
                // ensure tags object exists and set title tag
                (_d = stream.tags) !== null && _d !== void 0 ? _d : (stream.tags = {});
                stream.tags.title = title;
                // add ffmpeg args to tag the file
                stream.outputArgs.push("-metadata:s:".concat(Array.from(codecType)[0], ":{outputTypeIndex}"), "title=".concat(title));
            }
        }
        // add disposition flags for audio and subtitle streams if enabled
        if (setDisposition && ['audio', 'subtitle'].includes(codecType)) {
            // handle commentary streams
            if ((0, metadataUtils_1.isCommentary)(stream) && !((_e = stream.disposition) === null || _e === void 0 ? void 0 : _e.comment)) {
                args.jobLog("found [".concat(codecType, "] stream that appears to be commentary without the disposition flag set"));
                // set shouldProcess
                args.variables.ffmpegCommand.shouldProcess = true;
                // set comment flag
                (_f = stream.disposition) !== null && _f !== void 0 ? _f : (stream.disposition = {});
                stream.disposition.comment = 1;
                // add ffmpeg args to set the flag
                stream.outputArgs.push("-disposition:".concat(Array.from(codecType)[0], ":{outputTypeIndex}"), 'comment');
            }
            // handle descriptive streams
            if ((0, metadataUtils_1.isDescriptive)(stream) && !((_g = stream.disposition) === null || _g === void 0 ? void 0 : _g.descriptions)) {
                args.jobLog("found [".concat(codecType, "] stream that appears to be descriptive without the disposition flag set"));
                // set shouldProcess
                args.variables.ffmpegCommand.shouldProcess = true;
                // set descriptions flag
                (_h = stream.disposition) !== null && _h !== void 0 ? _h : (stream.disposition = {});
                stream.disposition.descriptions = 1;
                // add ffmpeg args to set the flag
                stream.outputArgs.push("-disposition:".concat(Array.from(codecType)[0], ":{outputTypeIndex}"), 'descriptions');
            }
        }
    });
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
