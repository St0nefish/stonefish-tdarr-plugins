import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IffmpegCommandStream,
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import {
  getBitrate,
  getChannelsName,
  getCodecType,
  getLanguageTag,
  getMediaInfo,
  getResolutionName,
  getStreamSorter,
  getTitleForStream,
  getTypeCountsMap,
  setTypeIndexes,
  streamIsCommentary,
  streamIsDescriptive,
  streamMatchesLanguages,
} from '../../../../FlowHelpers/1.0.0/local/metadataUtils';
import { ImediaInfo } from '../../../../FlowHelpers/1.0.0/interfaces/synced/IFileObject';

/* eslint-disable no-param-reassign */
const details = (): IpluginDetails => ({
  name: 'Cleanup Streams',
  description:
    `
    Remove unwanted streams. 
    \n\n
    This plugin will iterate through all streams that are present and remove ones which are detected as unwanted after
    applying the various configuration options below. 
    \n\n
    I use this to purge anything not in my native language, remove duplicates if present, remove data & image streams,
    and anything flagged as descriptive. There are additional options to remove commentary as well. 
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
         Toggle whether to remove video streams. 
         \\n\\n
         This will remove streams which are flagged as an unwanted language. 
         \\n\\n
         If doing so would remove all present video streams then the plugin will fail.
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
        Toggle whether to remove audio streams. 
        \\n\\n
        This will remove a stream if the it is an unwanted language, a duplicate combo of language+channels, or flagged 
        as unwanted commentary or descriptions. 
        \\n\\n
        If the configured criteria would cause this plugin to remove all present audio streams then it will fail. 
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
        Toggle whether to remove subtitle streams. 
        \\n\\n
        This will remove a stream if it is an unwanted language, is a duplicate combo of language+default+forced, or is 
        flagged as unwanted commentary or descriptions. 
        \\n\\n
        This will *not* fail if it is going to remove all present subtitle streams. Unlike video and audio I consider 
        the subtitles to be nice-to-have and often manage them as external srt files anyway. 
        `,
    },
    {
      label: 'Languages to Keep',
      name: 'keepLanguages',
      type: 'string',
      defaultValue: 'eng',
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
        Enter a comma-separated list of language tags to keep. 
        \\n\\n
        This will only apply to stream types with their remove flags enabled. 
        \\n\\n
        Any video, audio, or subtitle stream tagged as a language not in this list will be flagged for removal. 
        \\n\\n
        Any stream without a language tag present will be treated as matching the first entry in this list. 
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
        Toggle whether to remove streams which appear to be duplicates of others. 
        \\n\\n
        For video streams it will keep the highest resolution+bitrate grouped by language. 
        \\n\\n
        For audio it will keep the one with the highest bitrate grouped by language+channels+commentary+descriptive. 
        \\n\\n
        For subtitles it will keep the first entry grouped by language+default+forced flags. 
        \\n\\n
        All streams which appear to be commentary will be kept if the relevant "Remove Commentary" setting is disabled. 
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
        Toggle whether to remove audio streams tagged as commentary. 
        \\n\\n
        This is detected by checking if the 'comment' disposition flag is set or if the title contains 'commentary' 
        (case insensitive). 
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
        Toggle whether to remove audio streams tagged as descriptive. 
        \\n\\n
        This is detected by checking if the 'descriptions' disposition flag is set or if the title contains 
        'description', 'descriptive', or 'sdh' (case insensitive). 
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
        Toggle whether to remove subtitle streams tagged as commentary. 
        \\n\\n
        This is detected by checking if the 'comment' disposition flag is set or if the title contains 'commentary' 
        (case insensitive). 
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
        Toggle whether to remove subtitle streams tagged as descriptive. 
        \\n\\n
        This is detected by checking if the 'descriptions' disposition flag is set or if the title contains 
        'description', 'descriptive', or 'sdh' (case insensitive). 
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
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
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
  const keepLanguages: string[] = String(args.inputs.keepLanguages)
    .split(',').filter((langTag) => langTag).map((langTag: string) => langTag.trim());
  const defaultLanguage = keepLanguages[0] ?? 'eng';
  // execute a media info scan
  const mediaInfo: ImediaInfo | undefined = await getMediaInfo(args);
  // grab a handle to streams
  const { streams } = args.variables.ffmpegCommand;
  // generate type indexes
  setTypeIndexes(streams);
  // determine number of input streams of each type
  const inputStreamCounts: { [key: string]: number; } = getTypeCountsMap(streams);
  args.jobLog(`input stream counts: ${JSON.stringify(inputStreamCounts)}`);
  // track number of removed streams of each type for later validation
  const streamRemovedMap: { [key: string]: number } = {
    video: 0,
    audio: 0,
    subtitle: 0,
  };
  const countRemoved = (stream: IffmpegCommandStream) => {
    const codecType = getCodecType(stream);
    streamRemovedMap[codecType] = (streamRemovedMap[codecType] ?? 0) + 1;
  };
  // function to get de-duplication grouping key
  const getDedupeGroupKey = (stream: IffmpegCommandStream): string => {
    const codecType = getCodecType(stream);
    if (codecType === 'video') {
      return getLanguageTag(stream, defaultLanguage);
    }
    if (codecType === 'audio') {
      const flags = [
        streamIsCommentary(stream) ? 'commentary' : undefined,
        streamIsDescriptive(stream) ? 'descriptive' : undefined,
      ].filter((item) => item);
      return `${getLanguageTag(stream, defaultLanguage)} ${getChannelsName(stream)}`
        + `${flags.length > 0 ? `(${flags.join(', ')})` : ''}`;
    }
    if (codecType === 'subtitle') {
      return [
        stream.disposition.default ? 'default' : undefined,
        stream.disposition.forced ? 'forced' : undefined,
        streamIsCommentary(stream) ? 'commentary' : undefined,
        streamIsDescriptive(stream) ? 'descriptive' : undefined,
      ].filter((item) => item).join(', ');
    }
    return `index:${stream.typeIndex}`;
  };
  // function to get sort info from a stream (used for logging)
  const getSortInfo = (stream: IffmpegCommandStream): string => {
    switch (getCodecType(stream)) {
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
  // create a map to hold streams for de-duplicating later if enabled
  const dedupeMap: { [key: string]: { [key: string]: IffmpegCommandStream[] } } = {
    video: {},
    audio: {},
    subtitle: {},
  };
  // function to add streams to de-dupe map
  const addToDedupeMap = (stream: IffmpegCommandStream) => {
    const codecType = getCodecType(stream);
    ((dedupeMap[codecType] ??= {})[getDedupeGroupKey(stream)] ??= []).push(stream);
  };
  // iterate streams to flag the ones to remove
  args.variables.ffmpegCommand.streams.forEach((stream: IffmpegCommandStream) => {
    const codecType = getCodecType(stream);
    switch (codecType) {
      case 'video':
        if (removeVideo) {
          if (!streamMatchesLanguages(stream, keepLanguages, defaultLanguage)) {
            // language is unwanted
            stream.removed = true;
            stream.removeReason = `language [${stream.tags?.language}] is unwanted`;
          }
        }
        break;
      case 'audio':
        // determine if we should remove this audio stream
        if (removeAudio) {
          // audio cleanup is enabled
          if (!streamMatchesLanguages(stream, keepLanguages, defaultLanguage)) {
            // language is unwanted
            stream.removed = true;
            stream.removeReason = `language [${stream.tags?.language}] is unwanted`;
          } else if (removeCommentaryAudio && streamIsCommentary(stream)) {
            // unwanted commentary
            stream.removed = true;
            stream.removeReason = 'detected as unwanted commentary';
          } else if (removeDescriptiveAudio && streamIsDescriptive(stream)) {
            // unwanted descriptive
            stream.removed = true;
            stream.removeReason = 'detected as unwanted description';
          }
        }
        break;
      case 'subtitle':
        if (removeSubtitles) {
          // subtitle cleanup is enabled
          if (!streamMatchesLanguages(stream, keepLanguages, defaultLanguage)) {
            // language is unwanted
            stream.removed = true;
            stream.removeReason = `language [${stream.tags?.language}] is unwanted`;
          } else if (removeCommentarySubs && streamIsCommentary(stream)) {
            // unwanted commentary
            stream.removed = true;
            stream.removeReason = 'detected as unwanted commentary';
          } else if (removeDescriptiveSubs && streamIsDescriptive(stream)) {
            // unwanted descriptive
            stream.removed = true;
            stream.removeReason = 'detected as unwanted description';
          }
        }
        break;
      default:
        // if not video, audio, or subtitle
        if (removeOther) {
          // unwanted stream type
          stream.removed = true;
          stream.removeReason = `stream type [${codecType}] is unwanted`;
        }
    }
    // handle counting and de-dupe map
    if (stream.removed) {
      countRemoved(stream);
      args.jobLog(
        `removing [${codecType}] stream [s:${stream.index}:a:${stream.typeIndex}] 
        [${getTitleForStream(stream, mediaInfo?.track?.[stream.index])}] - ${stream.removeReason}`,
      );
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
        Object.keys(dedupeMap[codecType])
          .forEach((groupByKey) => {
            const groupedStreams: IffmpegCommandStream[] = dedupeMap[codecType][groupByKey];
            if (groupedStreams.length > 1) {
              groupedStreams.sort(getStreamSorter(mediaInfo))
                .forEach((stream: IffmpegCommandStream, index: number) => {
                  // keep the first entry, discard the rest
                  if (index > 0) {
                    args.jobLog(
                      `removing [${codecType}] stream [s:${stream.index}:a:${stream.typeIndex}] 
                      [${getTitleForStream(stream, mediaInfo?.track?.[stream.index])}] 
                      - stream is not best option for group-by-key:[${groupByKey}] sort info:[${getSortInfo(stream)}]`,
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
