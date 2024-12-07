"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
var metadataUtils_1 = require("../../../../FlowHelpers/1.0.0/local/metadataUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Ensure Audio Stream',
    description: "\n    Ensure that the file has an audio stream matching the configured values\n    \\n\\n\n    If a stream already exists matching the configured codec and channel count then nothing will happen. If no stream \n    matches these then one will be created using default ffmpeg settings, or if specified the optional bitrate and/or \n    samplerate values. This can be used to ensure there is an audio stream with maximum compatibility for your typical\n    players.\n    \\n\\n\n    Credit to the standard ffmpegCommandEnsureAudioStream plugin for the starting code. I tweaked some things add a few\n    additional options to control the title of the resulting stream and ensure I never accidentally used a commentary or\n    descriptive stream as the encoding source.\n    ",
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
            label: 'Audio Codec',
            name: 'audioCodec',
            type: 'string',
            defaultValue: 'aac',
            inputUI: {
                type: 'dropdown',
                options: [
                    'aac',
                    'ac3',
                    'eac3',
                    'dts',
                    'flac',
                    'opus',
                    'mp2',
                    'mp3',
                    'truehd',
                ],
            },
            tooltip: 'Enter the desired audio codec',
        },
        {
            label: 'Channels',
            name: 'channels',
            type: 'string',
            defaultValue: '2.0',
            inputUI: {
                type: 'dropdown',
                options: [
                    '1.0',
                    '2.0',
                    '5.1',
                    '7.1',
                ],
            },
            tooltip: 'Enter the desired channel configuration',
        },
        {
            label: 'Language',
            name: 'language',
            type: 'string',
            defaultValue: 'eng',
            inputUI: {
                type: 'text',
            },
            tooltip: "\n        Enter the desired audio language tag \n        \\n\\n\n        This specifies the language tag of the desired audio stream. If at least one stream is found matching this \n        language then it will be used as the source to generate a new track matching the desired codec and channels. \n        If no audio stream is found matching this language tag then this plugin will fail.\n        ",
        },
        {
            label: 'Enable Bitrate',
            name: 'enableBitrate',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Toggle whether to enable setting audio bitrate',
        },
        {
            label: 'Bitrate',
            name: 'bitrate',
            type: 'string',
            defaultValue: '128k',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'enableBitrate',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Specify the audio bitrate for newly added channels',
        },
        {
            label: 'Enable Samplerate',
            name: 'enableSamplerate',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Toggle whether to enable setting audio samplerate',
        },
        {
            label: 'Samplerate',
            name: 'samplerate',
            type: 'string',
            defaultValue: '48k',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'enableSamplerate',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Specify the audio samplerate for newly added channels',
        },
        {
            label: 'Title Behavior',
            name: 'titleMode',
            type: 'string',
            defaultValue: 'clear',
            inputUI: {
                type: 'dropdown',
                options: [
                    'default',
                    'clear',
                    'generate',
                ],
            },
            tooltip: "\n        Stream Title Behavior\n        \\n\\n\n        Choose how to handle the title tag for the generated stream (if required):\n        \\n\\n\n        - clear : Leave the stream title empty. This can be useful if you are using another plugin later to generate \n          titles. Tagging after the encode completes can make it easier to include some desired metadata in the \n          title. \n        \\n\\n\n        - generate : Generate a title for this stream using input encode settings. Default pattern is {codec channels \n          language}\n        ",
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
    // store inputs
    var targetCodec = String(args.inputs.audioCodec);
    var targetLang = String(args.inputs.language).toLowerCase();
    var targetChannels = String(args.inputs.channels);
    var titleMode = String(args.inputs.titleMode);
    var bitrate = (args.inputs.enableBitrate) ? Number(args.inputs.bitrate) : null;
    var samplerate = (args.inputs.enableSamplerate) ? Number(args.inputs.samplerate) : null;
    // store streams
    var streams = args.variables.ffmpegCommand.streams;
    // first find audio streams
    var audioStreams = streams.filter(function (stream) { return (stream.codec_type === 'audio'); });
    // if no audio streams found return false
    if (audioStreams.length === 0) {
        throw new Error('No audio streams found in input file');
    }
    // log stream to create
    args.jobLog("attempting to create audio stream [".concat(targetCodec, " ").concat(targetChannels, " ").concat(targetLang, "] "));
    // filter streams to only include audio streams with the specified language tag
    var sourceStreams = audioStreams.filter(function (stream) { return (0, metadataUtils_1.streamMatchesLanguage)(stream, [targetLang]); });
    // if no streams exist with desired language try again with undefined language
    if (sourceStreams.length === 0) {
        args.jobLog("No streams with language tag ".concat(targetLang, " found. Retrying with undefined "));
        sourceStreams = audioStreams.filter(function (stream) { return ((0, metadataUtils_1.isLanguageUndefined)(stream)); });
    }
    // if still unable to find a source stream then fail
    if (sourceStreams.length < 1) {
        throw new Error("unable to find a suitable source stream with language ".concat(targetLang, " or undefined"));
    }
    // function to determine the best of two input streams - determined by channel count and bitrate
    var getBestStream = function (first, second) {
        var s1c = first.channels || 0;
        var s2c = second.channels || 0;
        // use the one with higher channel count
        if (s1c > s2c) {
            return first;
        }
        // if channels are equal use the one with better bitrate
        if (s1c === s2c) {
            if (((first === null || first === void 0 ? void 0 : first.bit_rate) || 0) > ((second === null || second === void 0 ? void 0 : second.bit_rate) || 0)) {
                // if channel count is equal return highest bitrate
                return first;
            }
        }
        // otherwise return second - it is either higher channel count or higher bitrate
        return second;
    };
    // locate the best available source stream
    var sourceStream = sourceStreams.reduce(getBestStream);
    // if requested stream has more channels than available in best source default to source channels
    var highestChannelCount = Number(sourceStream.channels);
    var wantedChannelCount = (0, metadataUtils_1.getChannelCount)(targetChannels);
    var generateChannels = 0;
    if (wantedChannelCount <= highestChannelCount) {
        generateChannels = wantedChannelCount;
        args.jobLog("The wanted channel count [".concat(wantedChannelCount, "] is <= the")
            + " best source channel count [".concat(sourceStream.channels, "]. "));
    }
    else {
        generateChannels = highestChannelCount;
        args.jobLog("The wanted channel count [".concat(wantedChannelCount, "] is > the")
            + " best source channel count [".concat(sourceStream.channels, "]. "));
    }
    // log source stream to use
    args.jobLog('using source stream:'
        + " [lang:".concat((_a = sourceStream.tags) === null || _a === void 0 ? void 0 : _a.language, ", codec:").concat(sourceStream.codec_name, ",")
        + " channels:".concat(sourceStream.channels, ", bitrate:").concat(sourceStream.bit_rate, "] "));
    // if desired stream already exists then exit
    if (audioStreams.filter(function (stream) { return ((0, metadataUtils_1.streamMatchesLanguage)(stream, [targetLang])
        && stream.codec_name === targetCodec
        && stream.channels === generateChannels); }).length > 0) {
        args.jobLog("File already has stream matching: [".concat(targetCodec, ", ").concat(targetChannels, ", ").concat(targetLang, "] "));
    }
    else {
        // setup ffmpeg command to generate desired stream
        args.jobLog("Creating stream: [".concat(targetCodec, ", ").concat(generateChannels, ", ").concat(targetLang, "] "));
        // create output stream starting with a copy of our source
        var streamCopy = JSON.parse(JSON.stringify(sourceStream));
        streamCopy.removed = false;
        // add to the end of existing streams
        streamCopy.index = streams.length;
        // set encoder and channels
        streamCopy.outputArgs.push('-c:{outputIndex}', (0, metadataUtils_1.getEncoder)(targetCodec));
        streamCopy.outputArgs.push('-ac', "".concat(generateChannels));
        // configure bitrate if enabled
        if (bitrate) {
            var ffType = (0, fileUtils_1.getFfType)(streamCopy.codec_type);
            streamCopy.outputArgs.push("-b:".concat(ffType, ":{outputTypeIndex}"), "".concat(bitrate));
        }
        // configure samplerate if enabled
        if (samplerate) {
            streamCopy.outputArgs.push('-ar', "".concat(samplerate));
        }
        // handle title
        if (titleMode === 'clear') {
            // remove title metadata
            streamCopy.outputArgs.push('-metadata:s:{outputIndex}', 'title=');
        }
        else if (titleMode === 'generate') {
            // generate a basic title for this stream
            var title = "".concat(targetCodec.toUpperCase(), " ").concat(targetChannels, " ").concat(targetLang.toUpperCase());
            streamCopy.outputArgs.push('-metadata:s:{outputIndex}', "title=".concat(title));
        }
        // enable processing from this plugin
        // eslint-disable-next-line no-param-reassign
        args.variables.ffmpegCommand.shouldProcess = true;
        // add our new stream ust after its source
        streams.splice(streams.indexOf(sourceStream) + 1, 0, streamCopy);
    }
    // standard return
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
