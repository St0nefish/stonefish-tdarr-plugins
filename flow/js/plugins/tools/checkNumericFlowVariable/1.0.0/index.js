"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Check Numeric Flow Variable',
    description: "\n    Check Numeric Flow Variable \n\n    \n\n    Compared to the standard Check Flow Variable plugin this supports helpful numeric operations like less-than and \n    greater-than rather than just equal-to and not-equal-to. This is helpful for managing loops.\n    ",
    style: {
        borderColor: 'orange',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faQuestion',
    inputs: [
        {
            label: 'Variable',
            name: 'variable',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: "\n        Variable to check using templating\n        \\n\n        \\n\n        https://docs.tdarr.io/docs/plugins/flow-plugins/basics#plugin-variable-templating\n        \\n\n        \\n\n        Example\\n\n        {{{args.variables.user.transcode_attempts}}}\n        ",
        },
        {
            label: 'Condition',
            name: 'condition',
            type: 'string',
            defaultValue: '==',
            inputUI: {
                type: 'dropdown',
                options: [
                    '==',
                    '!=',
                    '<',
                    '<=',
                    '>',
                    '>=',
                ],
            },
            tooltip: 'Check condition',
        },
        {
            label: 'Value',
            name: 'value',
            type: 'number',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Value of variable to compare to',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'The variable matches the condition',
        },
        {
            number: 2,
            tooltip: 'The variable does not match the condition',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    var _a;
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // retrieve configuration
    var variable = String(args.inputs.variable).trim();
    var condition = String(args.inputs.condition);
    var expectedValue = Number(args.inputs.value);
    args.jobLog("retrieving value for numeric variable [".concat(JSON.stringify(variable), "]"));
    // function to get the value of a variable reference
    var getVariableValue = function (reference) {
        if (reference.startsWith('args.')) {
            // variable could be e.g. args.librarySettings._id or args.inputFileObj._id
            var variableParts = reference.split('.');
            switch (variableParts.length) {
                case 1:
                    return args;
                case 2:
                    // @ts-expect-error index
                    return args[variableParts[1]];
                case 3:
                    // @ts-expect-error index
                    return args[variableParts[1]][variableParts[2]];
                case 4:
                    // @ts-expect-error index
                    return args[variableParts[1]][variableParts[2]][variableParts[3]];
                case 5:
                    // @ts-expect-error index
                    return args[variableParts[1]][variableParts[2]][variableParts[3]][variableParts[4]];
                default:
                    throw new Error("invalid variable: [".concat(reference, "]"));
            }
        }
        else {
            // if it's not relative to args throw an error for invalid reference
            throw new Error("variable [".concat(reference, "] is not a valid reference. expecting 'args.{something}'"));
        }
    };
    // get current value
    var currentValue = Number((_a = getVariableValue(variable)) !== null && _a !== void 0 ? _a : 0);
    // evaluate condition
    args.jobLog("variable [".concat(variable, "] has current value [").concat(currentValue, "]"));
    args.jobLog("checking if [".concat(currentValue, "] [").concat(condition, "] [").concat(expectedValue, "]"));
    var outputNumber;
    switch (condition) {
        case '==':
            outputNumber = (currentValue === expectedValue) ? 1 : 2;
            break;
        case '!=':
            outputNumber = (currentValue !== expectedValue) ? 1 : 2;
            break;
        case '<':
            outputNumber = (currentValue < expectedValue) ? 1 : 2;
            break;
        case '<=':
            outputNumber = (currentValue <= expectedValue) ? 1 : 2;
            break;
        case '>':
            outputNumber = (currentValue > expectedValue) ? 1 : 2;
            break;
        case '>=':
            outputNumber = (currentValue >= expectedValue) ? 1 : 2;
            break;
        default:
            // assume false if condition is not supported (not sure how this happens using dropdown input)
            outputNumber = 2;
    }
    // standard return
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: outputNumber,
        variables: args.variables,
    };
};
exports.plugin = plugin;
