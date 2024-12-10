"use strict";
/* eslint-disable max-len */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var metadataUtils_1 = require("../../../../FlowHelpers/1.0.0/local/metadataUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Rename Files',
    description: "\n    Renames the primary video file and optionally any associated files in the same directory which use the same root \n    name but different extensions. This can be useful for updating your file name(s) to match codecs, resolutions, etc \n    after running through tdarr and potentially changing those values. \n    ",
    style: {
        borderColor: 'green',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Replace Video Codec',
            name: 'replaceVideoCodec',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to replace the video codec name in the file(s). \n        \n\n\n        For example, if you've re-encoded from h264/AVC to h265/HEVC then 'h264', 'x264', or 'AVC' in the file name(s) \n        will be replaced with 'H265' or 'x265' depending on if we can determine which encoder was used. New metadata \n        will be retrieved from the first video stream if multiple are present. \n        \n\n\n        Credit to [schadis's Tdarr_Plugin_rename_based_on_codec_schadi plugin](https://github.com/schadis/Tdarr_Plugins/blob/master/Community/Tdarr_Plugin_scha_rename_based_on_codec_schadi.js)\n        for influence and several of the regexes and maps used for renaming. I've extended it to support resolution and\n        channel layouts in the rename and to convert to a flow plugin. \n        ",
        },
        {
            label: 'Replace Video Resolution',
            name: 'replaceVideoRes',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to replace the video resolution in the file(s). \n        \n\n\n        For example, if you chose to encode a 1440p file to 1080p then references to '1440p' in the file name(s) will \n        be replaced with '1080p'. New metadata will be retrieved from the first video stream if multiple are present.\n        ",
        },
        {
            label: 'Replace Audio Codec',
            name: 'replaceAudioCodec',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to replace the audio codec name in the file(s). \n        \n\n\n        For example, if you re-encoded a TrueHD audio stream down to AAC then the reference to 'TrueHD' in the file \n        name(s) will be replaced with 'AAC'. New metadata will be retrieved from the first audio stream if multiple are \n        present, so this rename can be helpful even if you only re-ordered streams. \n        ",
        },
        {
            label: 'Replace Audio Channels',
            name: 'replaceAudioChannels',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to replace the audio channel reference in the file(s). \n        \n\n\n        For example, if you re-encoded a 7.1 stream to 5.1 then references to '7.1' in the file name(s) will be \n        replaced with '5.1'. New metadata will be retrieved from the first audio stream if multiple are present, so \n        this rename can be helpful even if you only re-ordered streams.\n        ",
        },
        {
            label: 'Rename Associated Files',
            name: 'renameOtherFiles',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to rename other files in the same directory. \n        \n\n\n        This will only apply to files using the same root name but with different extensions. This is mostly useful if\n        you have nfo or subtitle files which use the same file naming pattern but with different extensions. \n        ",
        },
        {
            label: 'Associated File Extensions',
            name: 'fileExtensions',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'renameOtherFiles',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Enter a comma-separated list of extensions for files you wish to be renamed. If left blank this will default to\n        all files matching the same naming pattern. \n        \\n\\n\n        This will treat srt files as a special case and support files like '{name}.en.srt' or '{name}.en.forced.srt'\n        ",
        },
        {
            label: 'Metadata Delimiter',
            name: 'metadataDelimiter',
            type: 'string',
            defaultValue: ' - ',
            inputUI: {
                type: 'text',
            },
            tooltip: "\n        Enter a string which is used as a delimiter between the name of the movie/show and the string containing any\n        metadata about the video and audio streams. This can help prevent any (rare) accidental issues with replacing\n        something that happened to be part of the actual file name.  \n        \\n\\n\n        For example, my standard naming scheme is:\n        \n\n\n        '{title stripped of special characters} - {file metadata}'\n        \n\n\n        'The Lord of the Rings The Return of the King (2003) - [x264 Remux-1080p][AAC 2.0]-FraMeSToR.mkv'\n        To avoid any accidents breaking the title I enter ' - ' and the rename operation will apply only to the portion \n        after that delimiter. This works best if the delimiter is the first instance of that string in the file name.\n        ",
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'One or more files were renamed',
        },
        {
            number: 2,
            tooltip: 'No files were renamed',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, replaceVideoCodec, replaceVideoRes, replaceAudioCodec, replaceAudioChannels, renameOtherFiles, supportedExtensions, metadataDelimiter, streams, mediaInfo, videoCodecRegex, videoResRegex, audioCodecRegex, audioChannelsRegex, filePath, fileFullName, fileBaseName, fileDir, files;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                replaceVideoCodec = Boolean(args.inputs.replaceVideoCodec);
                replaceVideoRes = Boolean(args.inputs.replaceVideoRes);
                replaceAudioCodec = Boolean(args.inputs.replaceAudioCodec);
                replaceAudioChannels = Boolean(args.inputs.replaceAudioChannels);
                renameOtherFiles = Boolean(args.inputs.renameOtherFiles);
                supportedExtensions = String(args.inputs.fileExtensions).split(',')
                    .filter(function (item) { return item; })
                    .map(function (item) { return item.trim(); })
                    .filter(function (item) { return item.length > 0; })
                    .filter(function (item, index, items) { return items.indexOf(item) === index; });
                metadataDelimiter = (_a = String(args.inputs.metadataDelimiter)) !== null && _a !== void 0 ? _a : undefined;
                streams = args.variables.ffmpegCommand.streams;
                return [4 /*yield*/, (0, metadataUtils_1.getMediaInfo)(args)];
            case 1:
                mediaInfo = _b.sent();
                // ToDo - remove
                args.jobLog("loaded media info:\n".concat(mediaInfo));
                videoCodecRegex = /(h264|h265|x264|x265|avc|hevc|mpeg2|av1)/gi;
                videoResRegex = /(480p|576p|720p|1080p|1440p|2160p|4320p)/gi;
                audioCodecRegex = /(aac|ac3|eac3|flac|mp2|mp3|truehd|dts[-. ]hd[-. ]ma|dts[-. ]hd[-. ]es|dts[-. ]hd[-. ]hra|dts[-. ]express|dts)/gi;
                audioChannelsRegex = /(1.0|2.0|2.1|3.0|3.1|5.1|6.1|7.1|)/gi;
                filePath = path_1.default.parse(args.inputFileObj._id);
                fileFullName = filePath.base;
                fileBaseName = filePath.name;
                fileDir = filePath.dir;
                args.jobLog("looking for files in [".concat(fileDir, "] with name like [").concat(fileBaseName, "] and extensions ").concat(JSON.stringify(supportedExtensions)));
                files = [fileFullName];
                // if enabled add other files in the directory
                if (renameOtherFiles) {
                    fs_1.default.readdirSync(fileDir).forEach(function (item) {
                        args.jobLog("checking if we should rename file [".concat(fileDir, "/").concat(item, "]"));
                        var otherPath = path_1.default.parse("".concat(fileDir, "/").concat(item));
                        args.jobLog("parsed path: ".concat(JSON.stringify(otherPath)));
                        if (otherPath // able to parse the path
                            && otherPath.base !== fileFullName // not our original video file
                            && otherPath.name.startsWith(fileBaseName) // matches input file pattern
                            && (supportedExtensions.length === 0 || supportedExtensions.includes(otherPath.ext)) // passes extension filter
                        ) {
                            files.push(otherPath.base);
                        }
                    });
                }
                // trim entries, remove empty, and ensure unique
                files.map(function (item) { return item === null || item === void 0 ? void 0 : item.trim(); }).filter(function (item) { return item; })
                    .filter(function (item, index, items) { return items.indexOf(item) === index; });
                args.jobLog("files to rename: ".concat(JSON.stringify(files)));
                // iterate files
                files.forEach(function (originalName) {
                    var _a, _b;
                    var newName = originalName;
                    var originalSuffix;
                    // if using the metadata delimiter parse only the end of the file
                    args.jobLog("checking if [".concat(originalName, "] contains delimiter [").concat(metadataDelimiter, "]"));
                    if (metadataDelimiter && originalName.includes(metadataDelimiter)) {
                        newName = originalName.substring(originalName.indexOf(metadataDelimiter));
                        originalSuffix = newName;
                        args.jobLog("executing rename on [".concat(newName, "], original suffix: [").concat(originalSuffix, "]"));
                    }
                    // if any video-based rename is enabled
                    if (replaceVideoCodec || replaceVideoRes) {
                        // first find the first video stream and get its media info
                        var videoStream_1 = streams.filter(function (stream) { return (0, metadataUtils_1.getCodecType)(stream) === 'video'; })[0];
                        // ToDo
                        var videoMediaInfo = (_b = (_a = mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.track) === null || _a === void 0 ? void 0 : _a.filter(function (infoTrack) {
                            args.jobLog("checking info track ".concat(JSON.stringify(infoTrack)));
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            return (infoTrack === null || infoTrack === void 0 ? void 0 : infoTrack.StreamOrder) === videoStream_1.index;
                        })) === null || _b === void 0 ? void 0 : _b[0];
                        // ToDo - remove logging
                        args.jobLog("using video media info:\n".concat(JSON.stringify(videoMediaInfo)));
                        // ToDo - remove logging
                        // handle video codec replacement if enabled
                        if (replaceVideoCodec) {
                            newName = newName.replace(videoCodecRegex, (0, metadataUtils_1.getCodecName)(videoStream_1, videoMediaInfo));
                            args.jobLog("name after video codec: [".concat(newName, "]"));
                        }
                        // handle video resolution replacement if enabled
                        if (replaceVideoRes) {
                            newName = newName.replace(videoResRegex, (0, metadataUtils_1.getResolutionName)(videoStream_1));
                            args.jobLog("name after video resolution: [".concat(newName, "]"));
                        }
                    }
                    if (replaceAudioCodec || replaceAudioChannels) {
                        var audioStream = streams.filter(function (stream) { return (0, metadataUtils_1.getCodecType)(stream) === 'video'; })[0];
                        var audioMediaInfo = (0, metadataUtils_1.getMediaInfoTrack)(audioStream, mediaInfo);
                        // ToDo - remove logging
                        args.jobLog("using audio media info:\n".concat(JSON.stringify(audioMediaInfo)));
                        // ToDo - remove logging
                        // handle audio codec replacement if enabled
                        if (replaceAudioCodec) {
                            newName = newName.replace(audioCodecRegex, (0, metadataUtils_1.getCodecName)(audioStream, audioMediaInfo));
                            args.jobLog("name after audio codec: [".concat(newName, "]"));
                        }
                        // handle audio channels replacement if enabled
                        if (replaceAudioChannels) {
                            newName = newName.replace(audioChannelsRegex, (0, metadataUtils_1.getChannelsName)(audioStream));
                            args.jobLog("name after audio channels: [".concat(newName, "]"));
                        }
                    }
                    // if using the metadata delimiter now replace the entire original suffix with the new one
                    if (metadataDelimiter && originalSuffix) {
                        args.jobLog("replacing original suffix [".concat(originalSuffix, "] with [").concat(newName, "]"));
                        newName = originalName.replace(originalSuffix, newName);
                    }
                    args.jobLog("renaming [".concat(originalName, "] to [").concat(newName, "]"));
                    // ToDo - actually rename
                });
                // if (fileBaseName === '') {
                //   await fileMoveOrCopy({
                //     operation: 'move',
                //     sourcePath: args.inputFileObj._id,
                //     destinationPath: `${fileDir}/${fileBaseName}`,
                //     args,
                //   });
                // }
                // let newName = String(args.inputs.fileRename).trim();
                // newName = newName.replace(/\${fileName}/g, fileName);
                // newName = newName.replace(/\${container}/g, getContainer(args.inputFileObj._id));
                //
                // const newPath = `${fileDir}/${newName}`;
                //
                // if (args.inputFileObj._id === newPath) {
                //   args.jobLog('Input and output path are the same, skipping rename.');
                //
                //   return {
                //     outputFileObj: {
                //       _id: args.inputFileObj._id,
                //     },
                //     outputNumber: 1,
                //     variables: args.variables,
                //   };
                // }
                //
                // await fileMoveOrCopy({
                //   operation: 'move',
                //   sourcePath: args.inputFileObj._id,
                //   destinationPath: newPath,
                //   args,
                // });
                //
                // return {
                //   outputFileObj: {
                //     _id: newPath,
                //   },
                //   outputNumber: 1,
                //   variables: args.variables,
                // };
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
