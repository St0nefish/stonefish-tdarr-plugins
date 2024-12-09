"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var metadataUtils_1 = require("../../../../FlowHelpers/1.0.0/local/metadataUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Sort Streams',
    description: "\n    Sort Streams. \n    \\n\\n\n    Sorts first by type - video, audio, subtitle, other. \n    \\n\\n \n    Within type follows this logic: \n    \\n\\n\n    Video: resolution (desc), then bitrate (desc). \n    \\n\\n\n    Audio: sorted by type (standard, commentary, descriptive), then channels (desc), bitrate (desc). \n    \\n\\n\n    Subtitle: sorted by type (standard, commentary, descriptive), then forced flag, then default flag. \n    \\n\\n\n    Other: left in input order. \n    \\n\\n\n    \\n\\n\n    Influenced by the standard ffmpegCommandRorderStreams plugin. However, I wasn't getting quite the result I wanted, \n    so I learned how to build a flow plugin to build exactly what I was looking for. No configuration, this one is \"my \n    way or the highway\". \n    ",
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
// function to get string displaying stream order
var getStreamOrderStr = function (streams) { return (streams.map(function (stream, index) { return ("'".concat(index, ":").concat((0, metadataUtils_1.getCodecType)(stream), ":").concat((0, metadataUtils_1.getTitle)(stream), "'")); }).join(', ')); };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // check if ffmpeg command has been initialized
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    // get a copy of input streams so we can sort without changing the input
    var streams = args.variables.ffmpegCommand.streams;
    // generate type indexes
    (0, metadataUtils_1.generateTypeIndexes)(streams);
    // log input state
    args.jobLog("input stream order: {".concat(getStreamOrderStr(streams), "}"));
    // track input stream state to compare later
    var originalStreams = JSON.stringify(streams);
    // create array of post-sort streams
    var sortedStreams = streams.sort(metadataUtils_1.getStandardStreamSorter);
    // check if new order matches original
    if (JSON.stringify(sortedStreams) === originalStreams) {
        args.jobLog('file already sorted - no transcode required');
        // eslint-disable-next-line no-param-reassign
        args.variables.ffmpegCommand.shouldProcess = false;
    }
    else {
        args.jobLog('file requires sorting - transcode will commence');
        args.jobLog("output stream order: {".concat(getStreamOrderStr(sortedStreams), "}"));
        // eslint-disable-next-line no-param-reassign
        args.variables.ffmpegCommand.shouldProcess = true;
        // eslint-disable-next-line no-param-reassign
        args.variables.ffmpegCommand.streams = sortedStreams;
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
