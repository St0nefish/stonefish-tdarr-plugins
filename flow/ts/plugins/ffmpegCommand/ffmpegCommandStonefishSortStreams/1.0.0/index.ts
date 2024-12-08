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
  getStreamSort, getTitle,
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
    `${index}:${getCodecType(stream)}:${getTitle(stream)}`)).join(', '));

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
  // track input stream state to compare later
  const originalStreams = JSON.stringify(streams);
  // generate a map of streams grouped by codec type
  const mapByType: { [key: string]: IffmpegCommandStream[]; } = getStreamsByType(streams);
  // log input state
  args.jobLog(`input stream order: {${getStreamOrderStr(streams)}}`);
  // create array of post-sort streams
  const sortedStreams: IffmpegCommandStream[] = [];
  // iterate primary stream types (in order) to add back to sorted array
  ['video', 'audio', 'subtitle'].forEach((codecType: string) => {
    const typeStreams = mapByType[codecType];
    if (typeStreams && typeStreams.length > 0) {
      // at least one stream of this type - sort then iterate streams of this type
      typeStreams.sort(getStreamSort(codecType)).forEach((stream: IffmpegCommandStream, tIndex: number) => {
        // set new index of this stream
        // eslint-disable-next-line no-param-reassign
        stream.index = sortedStreams.length;
        // also set new type index
        // eslint-disable-next-line no-param-reassign
        stream.typeIndex = tIndex;
        // add to our sorted array
        sortedStreams.push(stream);
        args.jobLog(`added [${codecType}] stream:[${stream.tags?.title}]`);
      });
      // delete this type from the map so we can handle leftovers later
      delete mapByType[codecType];
    }
  });
  // handle any remaining stream types we may have missed (why are these still here?)
  Object.keys(mapByType)
    // filter to types with streams
    .filter((key) => mapByType[key] && mapByType[key].length > 0)
    // iterate to add to the end of our sorted map
    .forEach((codecType) => {
      // add all remaining streams, leave in existing sort order
      mapByType[codecType].forEach((stream: IffmpegCommandStream, tIndex: number) => {
        // set new index of this stream
        // eslint-disable-next-line no-param-reassign
        stream.index = sortedStreams.length;
        // also set new type index
        // eslint-disable-next-line no-param-reassign
        stream.typeIndex = tIndex;
        // add to our sorted array
        sortedStreams.push(stream);
        args.jobLog(`added [${codecType}] stream:[${stream?.tags?.title}]`);
      });
    });
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
