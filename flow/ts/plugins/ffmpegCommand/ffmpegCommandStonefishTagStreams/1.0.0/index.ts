import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import {
  getTitle,
  isCommentary,
  isDescriptive,
  isLanguageUndefined,
} from '../../../../FlowHelpers/1.0.0/local/metadataUtils';

/* eslint-disable no-param-reassign */
const details = (): IpluginDetails => ({
  name: 'Tag Streams',
  description:
    `
    Add missing tags
    \\n\\n
    Checks all streams for missing titles, and optionally overwrites existing ones with new ones generated from current
    title metadata.
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
      label: 'Force New Titles',
      name: 'forceTitles',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Specify whether to forcibly re-generate all video, audio, and subtitle stream titles \\n
        \\n\\n
        This may help if the existing tags include now-outdated info on codec, bitrate, etc. By default this will not be
        applied to descriptive or commentary streams which already have a title. See the below flags to force those as 
        well.
        `,
    },
    {
      label: 'Force New Titles for Commentary Streams',
      name: 'forceTitleCommentary',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Specify whether to forcibly re-generate stream titles for streams that are commentary
        \\n\\n
        Many commentary streams already have descriptive titles rather than codec/bitrate information.
        `,
    },
    {
      label: 'Force New Titles for Descriptive Streams',
      name: 'forceTitleDescriptive',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Specify whether to forcibly re-generate stream titles for streams that are descriptive
        \\n\\n
        Many descriptive streams already have descriptive titles rather than codec/bitrate information.
        `,
    },
    {
      label: 'Set Disposition Flags',
      name: 'setDisposition',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Specify whether to set missing disposition flags for commentary and descriptive
        \\n\\n
        If a stream has 'commentary' or 'descriptive' in the title but is missing the appropriate disposition flag then
        set these flags. 
        `,
    },
    {
      label: 'Override Default Language Tag',
      name: 'setLangTag',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Specify whether to override the default language to use for untagged streams
        \\n\\n
        The default value is 'eng'
        `,
    },
    {
      label: 'Language Tag',
      name: 'tagLanguage',
      type: 'string',
      defaultValue: 'eng',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'setLangTag',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip: 'Enter the language tag to use where missing',
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
  // tag configuration
  const forceTitle = Boolean(args.inputs.forceTitles);
  const forceTitleCommentary = Boolean(args.inputs.forceTitleCommentary);
  const forceTitleDescriptive = Boolean(args.inputs.forceTitleDescriptive);
  const setDisposition = Boolean(args.inputs.setDisposition);
  const tagLanguage: string = (args.inputs.setLangTag) ? String(args.inputs.tagLanguage) : 'eng';
  // grab a handle to streams
  const { streams } = args.variables.ffmpegCommand;
  // iterate streams to flag the ones to remove
  streams.forEach((stream) => {
    const codecType = stream.codec_type.toLowerCase();
    args.jobLog(`checking [${codecType}] stream [${stream.tags?.title || getTitle(stream)}]`);
    // copy all streams
    stream.outputArgs.push('-c:{outputIndex}', 'copy');
    // add tags for video, audio, subtitle streams
    if (['video', 'audio', 'subtitle'].includes(codecType)) {
      // check if language tag is missing
      if (isLanguageUndefined(stream)) {
        args.jobLog(`found untagged [${codecType}] stream - setting language to [${tagLanguage}]`);
        // set shouldProcess
        args.variables.ffmpegCommand.shouldProcess = true;
        // ensure tags object exists and set language tag
        stream.tags ??= {};
        stream.tags.language = tagLanguage;
        // add ffmpeg args to tag the file
        stream.outputArgs.push(`-metadata:s:${Array.from(codecType)[0]}:{outputTypeIndex}`, `language=${tagLanguage}`);
      }
      // check if we should be force regenerating titles or if title is missing
      if (!stream.tags?.title // title is missing
        || (forceTitle && !isCommentary(stream) && !isDescriptive(stream)) // force for not commentary/descriptive
        || (forceTitleCommentary && isCommentary(stream)) // force for commentary
        || (forceTitleDescriptive && isDescriptive(stream)) // force for descriptive
      ) {
        const title = getTitle(stream);
        args.jobLog(`found untagged [${codecType}] stream - setting title to [${title}]`);
        // set shouldProcess
        args.variables.ffmpegCommand.shouldProcess = true;
        // ensure tags object exists and set title tag
        stream.tags ??= {};
        stream.tags.title = title;
        // add ffmpeg args to tag the file
        stream.outputArgs.push(`-metadata:s:${Array.from(codecType)[0]}:{outputTypeIndex}`, `title=${title}`);
      }
    }
    // add disposition flags for audio and subtitle streams if enabled
    if (setDisposition && ['audio', 'subtitle'].includes(codecType)) {
      // handle commentary streams
      if (isCommentary(stream) && !stream.disposition?.comment) {
        args.jobLog(`found [${codecType}] stream that appears to be commentary without the disposition flag set`);
        // set shouldProcess
        args.variables.ffmpegCommand.shouldProcess = true;
        // set comment flag
        stream.disposition ??= {};
        stream.disposition.comment = 1;
        // add ffmpeg args to set the flag
        stream.outputArgs.push(`-disposition:${Array.from(codecType)[0]}:{outputTypeIndex}`, 'comment');
      }
      // handle descriptive streams
      if (isDescriptive(stream) && !stream.disposition?.descriptions) {
        args.jobLog(`found [${codecType}] stream that appears to be descriptive without the disposition flag set`);
        // set shouldProcess
        args.variables.ffmpegCommand.shouldProcess = true;
        // set descriptions flag
        stream.disposition ??= {};
        stream.disposition.descriptions = 1;
        // add ffmpeg args to set the flag
        stream.outputArgs.push(`-disposition:${Array.from(codecType)[0]}:{outputTypeIndex}`, 'descriptions');
      }
    }
  });

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
