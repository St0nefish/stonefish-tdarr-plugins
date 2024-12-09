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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var metadataUtils_1 = require("../../../../FlowHelpers/1.0.0/local/metadataUtils");
/* eslint-disable no-param-reassign */
var details = function () { return ({
    name: 'Tag Streams',
    description: "\n    Add missing tags. \n    \\n\\n\n    Checks all streams for missing titles, and optionally overwrites existing ones with new ones generated from current\n    title metadata. \n    ",
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
            tooltip: "\n        Specify whether to forcibly re-generate all video, audio, and subtitle stream titles. \n        \\n\\n\n        This may help if the existing tags include now-outdated info on codec, bitrate, etc. By default this will not be\n        applied to descriptive or commentary streams which already have a title. See the below flags to force those as \n        well. \n        ",
        },
        {
            label: 'Force New Titles for Commentary Streams',
            name: 'forceTitleCommentary',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to forcibly re-generate stream titles for streams that are commentary. \n        \\n\\n\n        Many commentary streams already have descriptive titles rather than codec/bitrate information. \n        ",
        },
        {
            label: 'Force New Titles for Descriptive Streams',
            name: 'forceTitleDescriptive',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to forcibly re-generate stream titles for streams that are descriptive. \n        \\n\\n\n        Many descriptive streams already have descriptive titles rather than codec/bitrate information. \n        ",
        },
        {
            label: 'Set Disposition Flags',
            name: 'setDisposition',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to set missing disposition flags. \n        \\n\\n\n        If a stream has 'commentary', 'descriptive', or 'sdh' in the title but is missing the appropriate disposition \n        flag then set these flags. Additionally, if a video or audio stream is the first one but it does not have the\n        'default' flag set then enable it. \n        ",
        },
        {
            label: 'Set Language Tag',
            name: 'setLangTag',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Specify whether to set language tags on streams where it is missing.',
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
            tooltip: 'Enter the language tag to use for untagged streams.',
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
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, forceTitle, forceTitleCommentary, forceTitleDescriptive, setDisposition, setTagLanguage, tagLanguage, streams, mediaInfo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                // ensure ffmpeg command has been initialized
                (0, flowUtils_1.checkFfmpegCommandInit)(args);
                forceTitle = Boolean(args.inputs.forceTitles);
                forceTitleCommentary = Boolean(args.inputs.forceTitleCommentary);
                forceTitleDescriptive = Boolean(args.inputs.forceTitleDescriptive);
                setDisposition = Boolean(args.inputs.setDisposition);
                setTagLanguage = Boolean(args.inputs.setLangTag);
                tagLanguage = setTagLanguage ? String(args.inputs.tagLanguage) : 'eng';
                streams = args.variables.ffmpegCommand.streams;
                // set type indexes, we'll use to manage default flags
                (0, metadataUtils_1.setTypeIndexes)(streams);
                return [4 /*yield*/, (0, metadataUtils_1.getMediaInfo)(args)];
            case 1:
                mediaInfo = _a.sent();
                // iterate streams to flag the ones to remove
                streams.forEach(function (stream) {
                    var _a, _b, _c, _d, _e;
                    var codecType = (0, metadataUtils_1.getCodecType)(stream);
                    // copy all streams
                    stream.outputArgs.push('-c:{outputIndex}', 'copy');
                    // add tags for video, audio, subtitle streams
                    if (['video', 'audio', 'subtitle'].includes(codecType)) {
                        // check if language tag is missing
                        if (setTagLanguage && (0, metadataUtils_1.isLanguageUndefined)(stream)) {
                            args.jobLog("found [".concat(codecType, "] stream missing language tag - setting to [").concat(tagLanguage, "]"));
                            // ensure tags object exists and set language tag
                            ((_a = stream.tags) !== null && _a !== void 0 ? _a : (stream.tags = {})).language = tagLanguage;
                            // set shouldProcess
                            args.variables.ffmpegCommand.shouldProcess = true;
                            // add ffmpeg args to tag the file
                            stream.outputArgs.push("-metadata:s:".concat((0, metadataUtils_1.getStreamTypeFlag)(stream), ":{outputTypeIndex}"), "language=".concat(tagLanguage));
                        }
                        // check if we should set a stream title
                        // true if title is missing or if one of the force new flags is on
                        if (!((_b = stream.tags) === null || _b === void 0 ? void 0 : _b.title) // title is missing
                            || (forceTitle && (0, metadataUtils_1.streamIsStandard)(stream)) // force new title for standard stream
                            || (forceTitleCommentary && (0, metadataUtils_1.streamIsCommentary)(stream)) // force new title for commentary
                            || (forceTitleDescriptive && (0, metadataUtils_1.streamIsDescriptive)(stream)) // force new title for descriptive
                        ) {
                            // generate a title for this stream
                            var title = (0, metadataUtils_1.generateTitleForStream)(stream, (0, metadataUtils_1.getMediaInfoTrack)(stream, mediaInfo));
                            args.jobLog("found [".concat(codecType, "] stream that requires a title - setting to [").concat(title, "]"));
                            // ensure tags object exists and set title tag
                            ((_c = stream.tags) !== null && _c !== void 0 ? _c : (stream.tags = {})).title = title;
                            // set shouldProcess
                            args.variables.ffmpegCommand.shouldProcess = true;
                            // add ffmpeg args to tag the file
                            stream.outputArgs.push("-metadata:s:".concat((0, metadataUtils_1.getStreamTypeFlag)(stream), ":{outputTypeIndex}"), "title=".concat(title));
                        }
                    }
                    // handle disposition flags if enabled
                    if (setDisposition) {
                        // array of flags to add or remove
                        var flags = [];
                        // ensure first video and audio streams have default flag set
                        if (stream.typeIndex === 0 && !stream.disposition.default) {
                            args.jobLog("found [".concat(codecType, "] stream that is first but not set as default"));
                            // add the default flag
                            flags.push('+default');
                        }
                        // handle commentary streams
                        if ((0, metadataUtils_1.streamHasCommentary)(stream) && !((_d = stream.disposition) === null || _d === void 0 ? void 0 : _d.comment)) {
                            args.jobLog("found [".concat(codecType, "] stream that requires the comment disposition flag"));
                            // add comment flag
                            flags.push('+comment');
                        }
                        // handle descriptive streams
                        if ((0, metadataUtils_1.streamHasDescriptive)(stream) && !((_e = stream.disposition) === null || _e === void 0 ? void 0 : _e.descriptions)) {
                            args.jobLog("found [".concat(codecType, "] stream that requires the descriptions disposition flag"));
                            // add descriptions tag
                            flags.push('+descriptions');
                        }
                        // remove default flag from non-standard streams
                        if (!(0, metadataUtils_1.streamIsStandard)(stream) && stream.disposition.default) {
                            flags.push('-default');
                        }
                        // if any flag alterations are required construct the command
                        if (flags.length > 0) {
                            // set shouldProcess
                            args.variables.ffmpegCommand.shouldProcess = true;
                            // add ffmpeg args to set the flag(s)
                            stream.outputArgs.push("-disposition:".concat((0, metadataUtils_1.getStreamTypeFlag)(stream), ":{outputTypeIndex}"), "".concat(flags.join('')));
                        }
                    }
                });
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
