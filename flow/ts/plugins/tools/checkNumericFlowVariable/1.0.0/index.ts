import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Check Numeric Flow Variable',
  description:
    `
    Check Numeric Flow Variable \n
    \n
    Compared to the standard Check Flow Variable plugin this supports helpful numeric operations like less-than and 
    greater-than rather than just equal-to and not-equal-to. This is helpful for managing loops.
    `,
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
      tooltip:
        `
        Variable to check using templating
        \\n
        \\n
        https://docs.tdarr.io/docs/plugins/flow-plugins/basics#plugin-variable-templating
        \\n
        \\n
        Example\\n
        {{{args.variables.user.transcode_attempts}}}
        `,
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
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args: IpluginInputArgs): IpluginOutputArgs => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
  // retrieve configuration
  const variable = String(args.inputs.variable).trim();
  const condition = String(args.inputs.condition);
  const expectedValue = Number(args.inputs.value);
  args.jobLog(`retrieving value for numeric variable [${JSON.stringify(variable)}]`);
  // function to get the value of a variable reference
  const getVariableValue = (reference: string) => {
    if (reference.startsWith('args.')) {
      // variable could be e.g. args.librarySettings._id or args.inputFileObj._id
      const variableParts = reference.split('.');
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
          throw new Error(`invalid variable: [${reference}]`);
      }
    } else {
      // if it's not relative to args throw an error for invalid reference
      throw new Error(`variable [${reference}] is not a valid reference. expecting 'args.{something}'`);
    }
  };
  // get current value
  const currentValue = Number(getVariableValue(variable) ?? 0);
  // evaluate condition
  args.jobLog(`variable [${variable}] has current value [${currentValue}]`);
  args.jobLog(`checking if [${currentValue}] [${condition}] [${expectedValue}]`);
  let outputNumber: number;
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
    outputNumber,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};
