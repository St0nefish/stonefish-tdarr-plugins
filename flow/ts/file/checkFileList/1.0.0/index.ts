// eslint-disable-next-line import/no-unresolved
import fs from 'fs';
// eslint-disable-next-line import/no-unresolved
import readline from 'node:readline';
import {
  fileExists, getFileName,
} from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Check List File',
  description:
    `
    Check the current file name against each entry in the specified list file \\n
    \\n
    My default media behavior is to start with the highest quality REMUX h.264 files that I can find and utilize Tdarr 
    to re-encode these to x265 using settings that meet my quality criteria while reducing file size. I use this plugin 
    to enable a 'blocklist' of files I wish to leave in the original REMUX quality. It loads a line-feed-delimited file
    where each line will be evaluated against the current file name to fork the flow. 
    `,
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
      tooltip:
        `
        Specify the full path to a file containing a line-feed-delimited list of strings. Each entry in the file  will 
        be evaluated against the current file name.
        `,
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
      tooltip:
        `
        The operation to apply against the file name for each line in the input file. 
        `,
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
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
  // get path to list file
  const listFilePath = String(args.inputs.listFilePath);
  // grab current file name to compare
  const currentFileName = getFileName(args.inputFileObj._id);
  // grab compare operation
  const operation = String(args.inputs.operation);
  // return path
  let outputNumber = 2;
  // first check if list file exists
  args.jobLog(`checking if file [${listFilePath}] exists`);
  if (await fileExists(listFilePath)) {
    // create file stream
    const filestream = fs.createReadStream(listFilePath);
    const lineReader = readline.createInterface(filestream);
    // iterate lines
    // eslint-disable-next-line no-restricted-syntax
    for await (const line of lineReader) {
      args.jobLog(`checking if [${currentFileName}] [${operation}] [${line}]`);
      switch (operation) {
        case 'startsWith':
          if (currentFileName.startsWith(line)) {
            args.jobLog(`file [${currentFileName}] starts with [${line}]`);
            outputNumber = 1;
          }
          break;
        case 'equals':
          if (currentFileName === line) {
            args.jobLog(`file [${currentFileName}] equals [${line}]`);
            outputNumber = 1;
          }
          break;
        case 'contains':
          if (currentFileName.includes(line)) {
            args.jobLog(`file [${currentFileName}] includes [${line}]`);
            outputNumber = 1;
          }
          break;
        case 'endsWith':
          if (currentFileName.endsWith(line)) {
            args.jobLog(`file [${currentFileName}] ends with [${line}]`);
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
        break;
      }
    }
  }
  if (outputNumber === 2) {
    args.jobLog(`no match found in list:[${listFilePath}] for file:[${currentFileName}] operation:[${operation}]`);
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
