"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Reorder Streams',
    description: 'Reorder Streams',
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
            label: 'Process Order',
            name: 'processOrder',
            type: 'string',
            defaultValue: 'codecs,channels,languages,streamTypes',
            inputUI: {
                type: 'text',
            },
            tooltip: "Specify the process order.\n        For example, if 'languages' is first, the streams will be ordered based on that first.\n        So put the most important properties last.\n        The default order is suitable for most people.\n        \\nExample:\\n\n        codecs,channels,languages,streamTypes\n        ",
        },
        {
            label: 'Languages',
            name: 'languages',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: "Specify the language tags order, separated by commas. Leave blank to disable.\n        \\nExample:\\n\n        eng,fre\n        ",
        },
        {
            label: 'Channels',
            name: 'channels',
            type: 'string',
            defaultValue: '7.1,5.1,2,1',
            inputUI: {
                type: 'text',
            },
            tooltip: "Specify the channels order, separated by commas. Leave blank to disable.\n        \\nExample:\\n\n        7.1,5.1,2,1",
        },
        {
            label: 'Codecs',
            name: 'codecs',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: "Specify the codec order, separated by commas. Leave blank to disable.\n        \\nExample:\\n\n        aac,ac3",
        },
        {
            label: 'Stream Types',
            name: 'streamTypes',
            type: 'string',
            defaultValue: 'video,audio,subtitle',
            inputUI: {
                type: 'text',
            },
            tooltip: "Specify the streamTypes order, separated by commas. Leave blank to disable.\n        \\nExample:\\n\n        video,audio,subtitle\n        ",
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
    // check if ffmpeg command has been initialized
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    // get a copy of input streams
    var streams = JSON.parse(JSON.stringify(args.variables.ffmpegCommand.streams));
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
    args.jobLog("input streams: ".concat(originalStreams));
    // define function to sort streams
    var sortStreams = function (sortType) {
        var items = sortType.inputs.split(',');
        items.reverse();
        for (var i = 0; i < items.length; i += 1) {
            var matchedStreams = [];
            for (var j = 0; j < streams.length; j += 1) {
                if (String(sortType.getValue(streams[j])) === String(items[i])) {
                    if (streams[j].codec_long_name
                        && (streams[j].codec_long_name.includes('image')
                            || streams[j].codec_name.includes('png'))) {
                        // do nothing, ffmpeg bug, doesn't move image streams
                    }
                    else {
                        matchedStreams.push(streams[j]);
                        streams.splice(j, 1);
                        j -= 1;
                    }
                }
            }
            streams = matchedStreams.concat(streams);
        }
    };
    // string of process order
    var processOrderStr = String(args.inputs.processOrder);
    args.jobLog("process order string: ".concat(processOrderStr));
    // build array of sort type functions
    var _a = args.inputs, languages = _a.languages, codecs = _a.codecs, channels = _a.channels, streamTypes = _a.streamTypes;
    var sortTypes = {
        languages: {
            getValue: function (stream) {
                var _a;
                if ((_a = stream === null || stream === void 0 ? void 0 : stream.tags) === null || _a === void 0 ? void 0 : _a.language) {
                    return stream.tags.language;
                }
                return '';
            },
            inputs: languages,
        },
        codecs: {
            getValue: function (stream) {
                try {
                    return stream.codec_name;
                }
                catch (err) {
                    // err
                }
                return '';
            },
            inputs: codecs,
        },
        channels: {
            getValue: function (stream) {
                var chanMap = {
                    8: '7.1',
                    7: '6.1',
                    6: '5.1',
                    2: '2',
                    1: '1',
                };
                if ((stream === null || stream === void 0 ? void 0 : stream.channels) && chanMap[stream.channels]) {
                    return chanMap[stream.channels];
                }
                return '';
            },
            inputs: channels,
        },
        streamTypes: {
            getValue: function (stream) {
                if (stream.codec_type) {
                    return stream.codec_type;
                }
                return '';
            },
            inputs: streamTypes,
        },
    };
    // split process order to array
    var processOrderArr = processOrderStr.split(',');
    // iterate process order to sort
    for (var k = 0; k < processOrderArr.length; k += 1) {
        if (sortTypes[processOrderArr[k]] && sortTypes[processOrderArr[k]].inputs) {
            sortStreams(sortTypes[processOrderArr[k]]);
        }
    }
    // ToDo - log new order
    args.jobLog("output streams: ".concat(JSON.stringify(streams)));
    // check if new order matches original
    if (JSON.stringify(streams) !== originalStreams) {
        // eslint-disable-next-line no-param-reassign
        args.variables.ffmpegCommand.shouldProcess = true;
        // eslint-disable-next-line no-param-reassign
        args.variables.ffmpegCommand.streams = streams;
    }
    // return
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
