"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Set Numeric Flow Variable',
    description: "\n    Set a Numeric Flow Variable \\n \n    \\n\n    This supports additional operations compared to the basic 'Set Flow Variable' plugin that are helpful for dealing \n    with numeric types. This includes the ability to increment or decrement the value. If the specified variable does \n    not already have a value then it will be defaulted to 0. This makes it far easier to manage flow loops.\n    ",
    style: {
        borderColor: 'green',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: 1,
    icon: '',
    inputs: [
        {
            label: 'Variable',
            name: 'variable',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: "\n        Name of the variable to set \\n\n        \\n\n        Example:\\n\n        transcode_attempts \\n\n        \\n\n        Could be referenced in a 'Check Numeric Flow Variables' plugin using reference: \\n\n        {{{args.variables.user.transcode_attempts}}}\n        ",
        },
        {
            label: 'Operation',
            name: 'operation',
            type: 'string',
            defaultValue: 'increment',
            inputUI: {
                type: 'dropdown',
                options: [
                    'increment',
                    'decrement',
                    'equals',
                    'add',
                    'subtract',
                ],
            },
            tooltip: "\n        Operation to apply \\n\n        \\n\n        - 'increment' will add one to the current value (same as operation=add and value=1) \\n\n        - 'decrement' will subtract one to the current value (same as operation=subtract and value=1) \\n\n        - 'equals' will set the variable to the input value below \\n\n        - 'add' will add the value below to the current value  \\n\n        - 'subtract' will subtract the value below from the current value  \\n\n        ",
        },
        {
            label: 'Value',
            name: 'value',
            type: 'number',
            defaultValue: '1',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'OR',
                    sets: [
                        {
                            logic: 'OR',
                            inputs: [
                                {
                                    name: 'operation',
                                    value: 'equals',
                                    condition: '===',
                                },
                                {
                                    name: 'operation',
                                    value: 'add',
                                    condition: '===',
                                },
                                {
                                    name: 'operation',
                                    value: 'subtract',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: 'Value to use with the above operation',
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
    var _a, _b;
    var _c;
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // retrieve configuration
    var variable = String(args.inputs.variable).trim();
    var operation = String(args.inputs.operation);
    var inputVal = args.inputs.value ? Number(args.inputs.value) : 1;
    // ensure user variable object is initialized
    // eslint-disable-next-line no-param-reassign
    (_a = (_c = args.variables).user) !== null && _a !== void 0 ? _a : (_c.user = {});
    // retrieve current value
    var currentVal = Number((_b = args.variables.user[variable]) !== null && _b !== void 0 ? _b : 0);
    // switch on operation to determine new value
    var newVal;
    switch (operation) {
        case 'increment':
            newVal = currentVal + 1;
            break;
        case 'decrement':
            newVal = currentVal - 1;
            break;
        case 'equals':
            newVal = inputVal;
            break;
        case 'add':
            newVal = currentVal + inputVal;
            break;
        case 'subtract':
            newVal = currentVal - inputVal;
            break;
        default:
            newVal = currentVal;
    }
    // set new value
    args.jobLog("Setting variable ".concat(variable, " to ").concat(newVal));
    // eslint-disable-next-line no-param-reassign
    args.variables.user[variable] = String(currentVal + 1);
    // standard return
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
