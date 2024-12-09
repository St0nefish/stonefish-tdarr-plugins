import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IffmpegCommandStream,
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import {
  generateTypeIndexes, getCodecType,
  getStreamsByType,
  getStreamSort, getTitle, getStandardStreamSorter,
} from '../../../../FlowHelpers/1.0.0/local/metadataUtils';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Sort Streams',
  description:
    `
    Sort Streams. 
    \\n\\n
    Sorts first by type - video, audio, subtitle, other. 
    \\n\\n 
    Within type follows this logic: 
    \\n\\n
    Video: resolution (desc), then bitrate (desc). 
    \\n\\n
    Audio: sorted by type (standard, commentary, descriptive), then channels (desc), bitrate (desc). 
    \\n\\n
    Subtitle: sorted by type (standard, commentary, descriptive), then forced flag, then default flag. 
    \\n\\n
    Other: left in input order. 
    \\n\\n
    \\n\\n
    Influenced by the standard ffmpegCommandRorderStreams plugin. However, I wasn't getting quite the result I wanted, 
    so I learned how to build a flow plugin to build exactly what I was looking for. No configuration, this one is "my 
    way or the highway". 
    `,
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
});

// function to get string displaying stream order
const getStreamOrderStr = (streams: IffmpegCommandStream[]) => (
  streams.map((stream: IffmpegCommandStream, index: number) => (
    `'${index}:${getCodecType(stream)}:${getTitle(stream)}'`)).join(', '));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args: IpluginInputArgs): IpluginOutputArgs => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
  // check if ffmpeg command has been initialized
  checkFfmpegCommandInit(args);
  // get a copy of input streams so we can sort without changing the input
  const { streams } = args.variables.ffmpegCommand;
  // generate type indexes
  generateTypeIndexes(streams);
  // log input state
  args.jobLog(`input stream order: {${getStreamOrderStr(streams)}}`);
  // track input stream state to compare later
  const originalStreams: string = JSON.stringify(streams);
  // create array of post-sort streams
  const sortedStreams: IffmpegCommandStream[] = streams.sort(getStandardStreamSorter);
  // check if new order matches original
  if (JSON.stringify(sortedStreams) === originalStreams) {
    args.jobLog('file already sorted - no transcode required');
    // eslint-disable-next-line no-param-reassign
    args.variables.ffmpegCommand.shouldProcess = false;
  } else {
    args.jobLog('file requires sorting - transcode will commence');
    args.jobLog(`output stream order: {${getStreamOrderStr(sortedStreams)}}`);
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

export {
  details,
  plugin,
};
