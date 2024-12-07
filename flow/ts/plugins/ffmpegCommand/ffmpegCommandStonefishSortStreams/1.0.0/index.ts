import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IffmpegCommandStream,
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Sort Streams',
  description:
    `
    Sort Streams \\n
    \\n
    Sorts first by type - video, audio, subtitle, other \\n
    \\n 
    Within type follows this logic: \\n
    Video: resolution (desc), then bitrate (desc)
    Audio: sorted by type (standard, commentary, descriptive), then channels (desc), bitrate (desc) \\n
    Subtitle: sorted by type (standard, commentary, descriptive), then forced flag, then default flag \\n
    Other: left in input order \\n
    \\n
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args: IpluginInputArgs): IpluginOutputArgs => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
  // check if ffmpeg command has been initialized
  checkFfmpegCommandInit(args);
  // get a copy of input streams so we can sort without changing the input
  const streams: IffmpegCommandStream[] = JSON.parse(JSON.stringify(args.variables.ffmpegCommand.streams));
  // create array of post-sort streams
  const sortedStreams: IffmpegCommandStream[] = [];
  // generate type indexes
  streams.map((stream) => stream.codec_type)
    .filter((value, index, array) => array.indexOf(value) === index)
    .forEach((codecType) => {
      // for each unique codec type set type index
      streams.filter((stream) => stream.codec_type === codecType)
        .forEach((stream, index) => {
          // eslint-disable-next-line no-param-reassign
          stream.typeIndex = index;
        });
    });
  // track input stream state to compare later
  const originalStreams = JSON.stringify(streams);
  // generate a map of streams grouped by codec type
  const mapByType: { [key: string]: IffmpegCommandStream[]; } = streams.reduce(
    (map: { [key: string]: IffmpegCommandStream[] }, stream) => ({
      ...map,
      [stream.codec_type]: [...(map[stream.codec_type] || []), stream],
    }),
    {},
  );
  // function to determine if a stream is commentary
  const isCommentary = (stream: IffmpegCommandStream): boolean => (
    stream.disposition?.comment
    || stream.tags?.title?.toLowerCase().includes('commentary'));
  // function to determine if a stream is descriptive
  const isDescriptive = (stream: IffmpegCommandStream): boolean => (
    stream.disposition?.descriptions
    || stream.disposition?.visual_impaired
    || stream.tags?.title?.toLowerCase().includes('description')
    || stream.tags?.title?.toLowerCase().includes('sdh'));
  // function to get de-duplication sorting function
  const getStreamSort = (codecType: string): ((s1: IffmpegCommandStream, s2: IffmpegCommandStream) => number) => {
    switch (codecType) {
      case 'video':
        // sort by resolution (desc) then bitrate (desc)
        return (s1: IffmpegCommandStream, s2: IffmpegCommandStream): number => {
          // resolution descending
          const w1 = Number(s1?.width || 0);
          const w2 = Number(s2?.width || 0);
          if (w1 > w2) return -1;
          if (w1 < w2) return 1;
          // then bitrate descending
          const br1 = Number(s1?.tags?.BPS || 0);
          const br2 = Number(s2?.tags?.BPS || 0);
          if (br1 > br2) return -1;
          if (br1 < br2) return 1;
          // tie
          return 0;
        };
      case 'audio':
        // sort by commentary, descriptive, bitrate (desc)
        return (s1: IffmpegCommandStream, s2: IffmpegCommandStream): number => {
          // regular streams come before commentary/descriptive
          if (!isCommentary(s1) && (isCommentary(s2) || isDescriptive(s2))) return -1;
          if ((isCommentary(s1) || isDescriptive(s1)) && !isCommentary(s2)) return 1;
          // commentary comes before descriptive
          if (isCommentary(s1) && isDescriptive(s2)) return -1;
          if (isDescriptive(s1) && isCommentary(s2)) return 1;
          // channels descending
          const c1 = Number(s1?.channels || 0);
          const c2 = Number(s2?.channels || 0);
          if (c1 > c2) return -1;
          if (c1 < c2) return 1;
          // then bitrate descending
          const br1 = Number(s1?.tags?.BPS || 0);
          const br2 = Number(s2?.tags?.BPS || 0);
          if (br1 > br2) return -1;
          if (br1 < br2) return 1;
          // tie
          return 0;
        };
      case 'subtitle':
        // sort by commentary/descriptive/default/forced
        return (s1: IffmpegCommandStream, s2: IffmpegCommandStream): number => {
          // regular streams come before commentary/descriptive
          if (!isCommentary(s1) && (isCommentary(s2) || isDescriptive(s2))) return -1;
          if ((isCommentary(s1) || isDescriptive(s1)) && !isCommentary(s2)) return 1;
          // commentary comes before descriptive
          if (isCommentary(s1) && isDescriptive(s2)) return -1;
          if (isDescriptive(s1) && isCommentary(s2)) return 1;
          // forced flag descending
          const f1 = Number(s1?.disposition?.forced || 0);
          const f2 = Number(s2?.disposition?.forced || 0);
          if (f1 > f2) return -1;
          if (f1 < f2) return 1;
          // then default flag descending
          const d1 = Number(s1?.disposition?.default || 0);
          const d2 = Number(s2?.disposition?.default || 0);
          if (d1 > d2) return -1;
          if (d1 < d2) return 1;
          // if all else is equal lower index comes first
          if (s1.typeIndex < s2.typeIndex) return -1;
          if (s1.typeIndex > s2.typeIndex) return 1;
          // tie
          return 0;
        };
      default:
        // don't sort
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return (o1: IffmpegCommandStream, o2: IffmpegCommandStream): number => 0;
    }
  };
  // iterate primary stream types (in order) to add back to sorted array
  ['video', 'audio', 'subtitle'].forEach((codecType) => {
    const codecStreams = mapByType[codecType];
    if (codecStreams && codecStreams.length > 0) {
      // at least one stream of this type - sort then iterate streams of this type
      codecStreams.sort(getStreamSort(codecType)).forEach((stream: IffmpegCommandStream, tIndex: number) => {
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
      // delete this type so we can handle remaining later
      delete mapByType[codecType];
    }
  });
  // handle any remaining stream types we may have missed (why are these still here?)
  Object.keys(mapByType)
    .filter((key) => mapByType[key] && mapByType[key].length > 0) // filter to types with streams
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
    // eslint-disable-next-line no-param-reassign
    args.variables.ffmpegCommand.shouldProcess = true;
    // eslint-disable-next-line no-param-reassign
    args.variables.ffmpegCommand.streams = sortedStreams;
  }
  // standard return
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
