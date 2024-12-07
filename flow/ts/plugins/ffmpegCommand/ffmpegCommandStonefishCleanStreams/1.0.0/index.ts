import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IffmpegCommandStream,
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import {
  getChannelsName,
  getResolutionName,
  getBitrate,
  getLanguage,
  isCommentary,
  isDescriptive,
  getTitle,
  getStreamSort,
} from '../../../../FlowHelpers/1.0.0/local/metadataUtils';

/* eslint-disable no-param-reassign */
const details = (): IpluginDetails => ({
  name: 'Cleanup Streams',
  description:
    `
    Remove unwanted streams \\n
    \\n
    This plugin will iterate through all streams that are present and remove ones which are detected as unwanted after
    applying the various configuration options below. \\n
    \\n
    I use this to purge anything not in my native language, remove duplicates if present, remove data & image streams,
    and anything flagged as descriptive. There are additional options to remove commentary as well. \\n
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
  inputs: [
    {
      label: 'Remove Video',
      name: 'removeVideo',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
         Toggle whether to remove video streams \\n
         \\n
         This will remove streams which are flagged as an unwanted language. \\n
         \\n
         If doing so would remove all present video streams then the plugin will fail. \\n
         `,
    },
    {
      label: 'Remove Audio',
      name: 'removeAudio',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to remove audio streams \\n
        \\n
        This will remove a stream if the it is an unwanted language, a duplicate combo of language+channels, or flagged 
        as unwanted commentary or descriptions. \\n
        \\n
        If the configured criteria would cause this plugin to remove all present audio streams then it will fail. \\n
        `,
    },
    {
      label: 'Remove Subtitles',
      name: 'removeSubtitles',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to remove subtitle streams \\n
        \\n
        This will remove a stream if it is an unwanted language, is a duplicate combo of language+default+forced, or is 
        flagged as unwanted commentary or descriptions. \\n
        \\n
        This will *not* fail if it is going to remove all present subtitle streams. Unlike video and audio I consider 
        the subtitles to be nice-to-have and often manage them as external srt files anyway. \\n
        `,
    },
    {
      label: 'Languages to Keep',
      name: 'keepLanguages',
      type: 'string',
      defaultValue: 'eng,en',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'OR',
          sets: [
            {
              logic: 'OR',
              inputs: [
                {
                  name: 'removeVideo',
                  value: 'true',
                  condition: '===',
                },
                {
                  name: 'removeAudio',
                  value: 'true',
                  condition: '===',
                },
                {
                  name: 'removeSubtitles',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        `
        Enter a comma-separated list of language tags to keep \\n
        \\n
        This will only apply to stream types with their remove flags enabled. \\n
        Any video, audio, or subtitle stream tagged as a language not in this list will be flagged for removal. \\n
        Any stream without a language tag present will be treated as matching the first entry in this list. \\n
        `,
    },
    {
      label: 'Remove Duplicates',
      name: 'removeDuplicates',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
        displayConditions: {
          logic: 'OR',
          sets: [
            {
              logic: 'OR',
              inputs: [
                {
                  name: 'removeVideo',
                  value: 'true',
                  condition: '===',
                },
                {
                  name: 'removeAudio',
                  value: 'true',
                  condition: '===',
                },
                {
                  name: 'removeSubtitles',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        `
        Toggle whether to remove streams which appear to be duplicates of others\\n
        \\n
        For video streams it will keep the highest resolution+bitrate grouped by language \\n
        For audio it will keep the one with the highest bitrate grouped by language+channels+commentary+descriptive \\n
        For subtitles it will keep the first entry grouped by language+default+forced flags \\n
        \\n
        All streams which appear to be commentary will be kept if the relevant "Remove Commentary" setting is disabled 
        \\n
        `,
    },
    {
      label: 'Remove Other Streams',
      name: 'removeOther',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Toggle whether to remove streams that are not video, audio, or subtitle',
    },
    {
      label: 'Remove Audio Commentary',
      name: 'removeCommentaryAudio',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'removeAudio',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        `
        Toggle whether to remove audio streams tagged as commentary \\n
        \\n
        This is detected by checking if the 'comment' disposition flag is set or if the title contains 'commentary' 
        (case insensitive). \\n
        `,
    },
    {
      label: 'Remove Audio Descriptions',
      name: 'removeDescriptiveAudio',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'removeAudio',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        `
        Toggle whether to remove audio streams tagged as descriptive \\n
        \\n
        This is detected by checking if the 'descriptions' disposition flag is set or if the title contains 
        'description', 'descriptive', or 'sdh' (case insensitive) \\n
        `,
    },
    {
      label: 'Remove Subtitle Commentary',
      name: 'removeCommentarySubs',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'removeSubtitles',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        `
        Toggle whether to remove subtitle streams tagged as commentary \\n
        \\n
        This is detected by checking if the 'comment' disposition flag is set or if the title contains 'commentary' 
        (case insensitive). \\n
        `,
    },
    {
      label: 'Remove Subtitle Descriptions',
      name: 'removeDescriptiveSubs',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'removeAudio',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        `
        Toggle whether to remove subtitle streams tagged as descriptive \\n
        \\n
        This is detected by checking if the 'descriptions' disposition flag is set or if the title contains 
        'description', 'descriptive', or 'sdh' (case insensitive) \\n
        `,
    },
  ],
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
  // ensure ffmpeg command has been initialized
  checkFfmpegCommandInit(args);
  // flags for what should be removed
  const removeVideo = Boolean(args.inputs.removeVideo);
  const removeAudio = Boolean(args.inputs.removeAudio);
  const removeSubtitles = Boolean(args.inputs.removeSubtitles);
  const removeDuplicates = Boolean(args.inputs.removeDuplicates);
  const removeOther = Boolean(args.inputs.removeOther);
  const removeCommentaryAudio = Boolean(args.inputs.removeCommentaryAudio);
  const removeCommentarySubs = Boolean(args.inputs.removeCommentarySubs);
  const removeDescriptiveAudio = Boolean(args.inputs.removeDescriptiveAudio);
  const removeDescriptiveSubs = Boolean(args.inputs.removeDescriptiveSubs);
  const keepLanguages: string[] = String(args.inputs.keepLanguages).split(',').map((langTag: string) => langTag.trim());
  const defaultLanguage = keepLanguages[0] ?? 'eng';
  // grab a handle to streams
  const { streams } = args.variables.ffmpegCommand;
  // generate type indexes for logging
  streams.map((stream) => stream.codec_type)
    .filter((value, index, array) => array.indexOf(value) === index)
    .forEach((codecType) => {
      // for each unique codec type set type index
      streams.filter((stream) => stream.codec_type === codecType)
        .forEach((stream, index) => {
          stream.typeIndex = index;
        });
    });
  // function to get de-duplication grouping key
  const getGroupByKey = (stream: IffmpegCommandStream): string => {
    const codecType = stream.codec_type.toLowerCase();
    if (codecType === 'video') {
      return getLanguage(stream) || defaultLanguage;
    }
    if (codecType === 'audio') {
      const flags = [
        isCommentary(stream) ? 'commentary' : undefined,
        isDescriptive(stream) ? 'descriptive' : undefined,
      ].filter((item) => item);
      return `${getLanguage(stream)} ${getChannelsName(stream)}${flags.length > 0 ? `(${flags.join(', ')})` : ''}`;
    }
    if (codecType === 'subtitle') {
      return [
        stream.disposition.default ? 'default' : undefined,
        stream.disposition.forced ? 'forced' : undefined,
        isCommentary(stream) ? 'commentary' : undefined,
        isDescriptive(stream) ? 'descriptive' : undefined,
      ].filter((item) => item).join(', ');
    }
    return `index:${stream.typeIndex}`;
  };
  // function to get sort info from a stream (used for logging)
  const getSortInfo = (stream: IffmpegCommandStream): string => {
    switch (stream.codec_type.toLowerCase()) {
      case 'video':
        return `${getResolutionName(stream)} ${getBitrate(stream)}`;
      case 'audio':
        return `${getBitrate(stream)}`;
      case 'subtitle':
        return `index:${stream.typeIndex}`;
      default:
        return '';
    }
  };
  // determine number of input streams of each type
  const inputStreamCounts: { [key: string]: number } = streams
    .reduce((counts: { [key: string]: number }, val: IffmpegCommandStream) => {
      counts[val.codec_type] = (counts[val.codec_type] ?? 0) + 1;
      return counts;
    }, {});
  args.jobLog(`input stream counts: ${JSON.stringify(inputStreamCounts)}`);
  // track number of removed streams of each type
  const streamRemovedMap: { [key: string]: number } = {
    video: 0,
    audio: 0,
    subtitle: 0,
  };
  const countRemoved = (stream: IffmpegCommandStream) => {
    const codecType = stream.codec_type.toLowerCase();
    if (streamRemovedMap[codecType] === undefined) {
      streamRemovedMap[codecType] = 0;
    }
    streamRemovedMap[codecType] += 1;
  };
  // create a map to hold streams for de-duplicating later if enabled
  const dedupeMap: { [key: string]: { [key: string]: IffmpegCommandStream[] } } = {
    video: {},
    audio: {},
    subtitle: {},
  };
  // function to add streams to de-dupe map
  const addToDedupeMap = (stream: IffmpegCommandStream) => {
    const codecType = stream.codec_type.toLowerCase();
    ((dedupeMap[codecType] ??= {})[getGroupByKey(stream)] ??= []).push(stream);
  };
  // iterate streams to flag the ones to remove
  args.variables.ffmpegCommand.streams.forEach((stream) => {
    const codecType = stream.codec_type.toLowerCase();
    args.jobLog(`checking [${codecType}] stream [${getTitle(stream)}]`);
    switch (codecType) {
      case 'video':
        if (removeVideo) {
          if (!keepLanguages.includes(getLanguage(stream))) {
            // language is unwanted
            args.jobLog(`flagging stream s:${stream.index}:a:${stream.typeIndex} [${getTitle(stream)}] for removal - `
              + `language [${stream.tags?.language}] is unwanted`);
            stream.removed = true;
          }
        }
        break;
      case 'audio':
        // determine if we should remove this audio stream
        if (removeAudio) {
          // audio cleanup is enabled
          if (!keepLanguages.includes(getLanguage(stream))) {
            // language is unwanted
            args.jobLog(`flagging stream s:${stream.index}:a:${stream.typeIndex} [${getTitle(stream)}] for removal - `
              + `language [${stream.tags?.language}] is unwanted`);
            stream.removed = true;
          } else if (removeCommentaryAudio && isCommentary(stream)) {
            // unwanted commentary
            args.jobLog(`flagging stream s:${stream.index}:a:${stream.typeIndex} [${getTitle(stream)}] for removal - `
              + 'marked as commentary');
            stream.removed = true;
          } else if (removeDescriptiveAudio && isDescriptive(stream)) {
            // unwanted descriptive
            args.jobLog(`flagging stream s:${stream.index}:a:${stream.typeIndex} [${getTitle(stream)}] for removal - `
              + 'marked as descriptive');
            stream.removed = true;
          }
        }
        break;
      case 'subtitle':
        if (removeSubtitles) {
          // subtitle cleanup is enabled
          if (!keepLanguages.includes(getLanguage(stream))) {
            // language is unwanted
            args.jobLog(`flagging stream s:${stream.index}:s:${stream.typeIndex} [${getTitle(stream)}] for removal - `
              + `language [${stream.tags?.language}] is unwanted`);
            stream.removed = true;
          } else if (removeCommentarySubs && isCommentary(stream)) {
            // unwanted commentary
            args.jobLog(`flagging stream s:${stream.index}:s:${stream.typeIndex} [${getTitle(stream)}] for removal - `
              + 'marked as commentary');
            stream.removed = true;
          } else if (removeDescriptiveSubs && isDescriptive(stream)) {
            // unwanted descriptive
            args.jobLog(`flagging stream s:${stream.index}:s:${stream.typeIndex} [${getTitle(stream)}] for removal - `
              + 'marked as descriptive');
          }
        }
        break;
      default:
        // if not video, audio, or subtitle
        if (removeOther) {
          args.jobLog(`flagging stream s:${stream.index} [${getTitle(stream)}] for removal - `
            + `stream type [${codecType}] is unwanted`);
          // mark stream for removal
          stream.removed = true;
        }
    }
    // handle counting and de-dupe map
    if (stream.removed) {
      countRemoved(stream);
    } else {
      addToDedupeMap(stream);
    }
  });
  // handle de-duplication if enabled
  if (removeDuplicates) {
    // iterate codec types in duplicate-tracking map
    Object.keys(dedupeMap)
      .forEach((codecType) => {
        // for each codec type
        args.jobLog(`checking for duplicate [${codecType}] streams`);
        Object.keys(dedupeMap[codecType])
          .forEach((groupByKey) => {
            const groupedStreams: IffmpegCommandStream[] = dedupeMap[codecType][groupByKey];
            if (groupedStreams.length > 1) {
              args.jobLog(`found duplicate [${codecType}] streams for group-by key [${groupByKey}]`);
              groupedStreams.sort(getStreamSort(codecType))
                .forEach((stream: IffmpegCommandStream, index: number) => {
                  // keep the first entry, discard the rest
                  if (index === 0) {
                    // first item we keep
                    args.jobLog(
                      `keeping [${codecType}] stream [${getTitle(stream)}] with group-by key [${groupByKey}] and `
                      + `sort info [${getSortInfo(stream)}]`,
                    );
                  } else {
                    // remove the rest
                    args.jobLog(
                      `removing [${codecType}] stream [${getTitle(stream)}] with group-by key [${groupByKey}] and `
                      + ` sort info [${getSortInfo(stream)}]`,
                    );
                    stream.removed = true;
                    countRemoved(stream);
                  }
                });
            }
          });
      });
  }
  // log removal summary
  args.jobLog(`attempting to remove streams: ${JSON.stringify(streamRemovedMap)}`);
  // safety check to avoid removing all video streams
  if (streamRemovedMap.video >= (inputStreamCounts.video || 0)) {
    // trying to remove all audio streams
    throw new Error(`Error: attempting to remove all ${inputStreamCounts.video} video streams`);
  }
  // safety check to avoid removing all audio streams
  if (streamRemovedMap.audio >= (inputStreamCounts.audio || 0)) {
    // trying to remove all audio streams
    throw new Error(`Error: attempting to remove all ${inputStreamCounts.audio} audio streams`);
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
