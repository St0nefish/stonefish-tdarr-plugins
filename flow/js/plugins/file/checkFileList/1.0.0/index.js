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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
// eslint-disable-next-line import/no-unresolved
var fs_1 = __importDefault(require("fs"));
// eslint-disable-next-line import/no-unresolved
var node_readline_1 = __importDefault(require("node:readline"));
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Check List File',
    description: "\n    Check the current file name against each entry in the specified list file \\n\n    \\n\n    My default media behavior is to start with the highest quality REMUX h.264 files that I can find and utilize Tdarr \n    to re-encode these to x265 using settings that meet my quality criteria while reducing file size. I use this plugin \n    to enable a 'blocklist' of files I wish to leave in the original REMUX quality. It loads a line-feed-delimited file\n    where each line will be evaluated against the current file name to fork the flow. \n    ",
    style: {
        borderColor: 'orange',
    },
    tags: 'video',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faQuestion',
    inputs: [
        {
            label: 'List File',
            name: 'listFilePath',
            type: 'string',
            defaultValue: '/path/to/list.txt',
            inputUI: {
                type: 'text',
            },
            tooltip: "\n        Specify the full path to a file containing a line-feed-delimited list of strings \\n\n        \\n\n        Each entry in the file will be evaluated against the current file name using the operation specified below \\n\n        ",
        },
        {
            label: 'Operation',
            name: 'operation',
            type: 'string',
            defaultValue: 'startsWith',
            inputUI: {
                type: 'dropdown',
                options: [
                    'startsWith',
                    'equals',
                    'contains',
                    'endsWith',
                ],
            },
            tooltip: 'The operation to apply against the file name for each line in the input file.',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'The file name matches an entry in the list file',
        },
        {
            number: 2,
            tooltip: 'The file name does not match any entry in the list file',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, listFilePath, currentFileName, operation, outputNumber, filestream, lineReader, _a, lineReader_1, lineReader_1_1, line, e_1_1;
    var _b, e_1, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                listFilePath = String(args.inputs.listFilePath);
                currentFileName = (0, fileUtils_1.getFileName)(args.inputFileObj._id);
                operation = String(args.inputs.operation);
                outputNumber = 2;
                // first check if list file exists
                args.jobLog("checking if file [".concat(listFilePath, "] exists"));
                return [4 /*yield*/, (0, fileUtils_1.fileExists)(listFilePath)];
            case 1:
                if (!_e.sent()) return [3 /*break*/, 13];
                filestream = fs_1.default.createReadStream(listFilePath);
                lineReader = node_readline_1.default.createInterface(filestream);
                _e.label = 2;
            case 2:
                _e.trys.push([2, 7, 8, 13]);
                _a = true, lineReader_1 = __asyncValues(lineReader);
                _e.label = 3;
            case 3: return [4 /*yield*/, lineReader_1.next()];
            case 4:
                if (!(lineReader_1_1 = _e.sent(), _b = lineReader_1_1.done, !_b)) return [3 /*break*/, 6];
                _d = lineReader_1_1.value;
                _a = false;
                line = _d;
                args.jobLog("checking if [".concat(currentFileName, "] [").concat(operation, "] [").concat(line, "]"));
                switch (operation) {
                    case 'startsWith':
                        if (currentFileName.startsWith(line)) {
                            args.jobLog("file [".concat(currentFileName, "] starts with [").concat(line, "]"));
                            outputNumber = 1;
                        }
                        break;
                    case 'equals':
                        if (currentFileName === line) {
                            args.jobLog("file [".concat(currentFileName, "] equals [").concat(line, "]"));
                            outputNumber = 1;
                        }
                        break;
                    case 'contains':
                        if (currentFileName.includes(line)) {
                            args.jobLog("file [".concat(currentFileName, "] includes [").concat(line, "]"));
                            outputNumber = 1;
                        }
                        break;
                    case 'endsWith':
                        if (currentFileName.endsWith(line)) {
                            args.jobLog("file [".concat(currentFileName, "] ends with [").concat(line, "]"));
                            outputNumber = 1;
                        }
                        break;
                    default:
                        // use default output
                        break;
                }
                // if we found a match break loop - no need to read any further
                if (outputNumber === 1) {
                    args.jobLog('match found - exiting file loop');
                    return [3 /*break*/, 6];
                }
                _e.label = 5;
            case 5:
                _a = true;
                return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 13];
            case 7:
                e_1_1 = _e.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 13];
            case 8:
                _e.trys.push([8, , 11, 12]);
                if (!(!_a && !_b && (_c = lineReader_1.return))) return [3 /*break*/, 10];
                return [4 /*yield*/, _c.call(lineReader_1)];
            case 9:
                _e.sent();
                _e.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                if (e_1) throw e_1.error;
                return [7 /*endfinally*/];
            case 12: return [7 /*endfinally*/];
            case 13:
                if (outputNumber === 2) {
                    args.jobLog("no match found in list:[".concat(listFilePath, "] for file:[").concat(currentFileName, "] operation:[").concat(operation, "]"));
                }
                // standard return
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: outputNumber,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
