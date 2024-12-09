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
var getStreamOrderStr = function (streams, mediaInfo) { return (streams.map(function (stream, index) {
    var _a;
    return ("'".concat(index, ":").concat((0, metadataUtils_1.getCodecType)(stream), ":").concat((0, metadataUtils_1.getTitleForStream)(stream, (_a = mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.track) === null || _a === void 0 ? void 0 : _a[stream.index]), "'"));
}).join(', ')); };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, streams, mediaInfo, originalStreams, sortedStreams;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                // check if ffmpeg command has been initialized
                (0, flowUtils_1.checkFfmpegCommandInit)(args);
                streams = args.variables.ffmpegCommand.streams;
                return [4 /*yield*/, (0, metadataUtils_1.getMediaInfo)(args)];
            case 1:
                mediaInfo = _a.sent();
                // generate type indexes
                (0, metadataUtils_1.setTypeIndexes)(streams);
                // log input state
                args.jobLog("input stream order: {".concat(getStreamOrderStr(streams, mediaInfo), "}"));
                originalStreams = JSON.stringify(streams);
                sortedStreams = streams.sort((0, metadataUtils_1.getStreamSorter)(mediaInfo));
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
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
