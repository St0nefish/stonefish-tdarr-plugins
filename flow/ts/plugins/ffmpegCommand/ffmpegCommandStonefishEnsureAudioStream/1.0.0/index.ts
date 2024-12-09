import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IffmpegCommandStream,
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { getFfType } from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  getChannelCount,
  getCodecType,
  getEncoder,
  isLanguageUndefined,
  streamMatchesLanguage,
} from '../../../../FlowHelpers/1.0.0/local/metadataUtils';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Ensure Audio Stream',
  description:
    `
    Ensure that the file has an audio stream matching the configured values. 
    \\n\\n
    If a stream already exists matching the configured language, codec, and channel count then nothing will happen. If 
    no stream matches these then one will be created using default ffmpeg settings, or if specified the optional 
    bitrate and/or samplerate values. This can be used to ensure there is an audio stream with maximum compatibility 
    for your typical players. 
    \\n\\n
    Credit to the standard ffmpegCommandEnsureAudioStream plugin for the starting code. I tweaked some things add a few
    additional options to control the title of the resulting stream and ensure I never accidentally used a commentary or
    descriptive stream as the encoding source. 
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
      label: 'Audio Codec',
      name: 'audioCodec',
      type: 'string',
      defaultValue: 'aac',
      inputUI: {
        type: 'dropdown',
        options: [
          'aac',
          'ac3',
          'eac3',
          'dts',
          'flac',
          'opus',
          'mp2',
          'mp3',
          'truehd',
        ],
      },
      tooltip: 'Enter the desired audio codec',
    },
    {
      label: 'Channels',
      name: 'channels',
      type: 'string',
      defaultValue: '2.0',
      inputUI: {
        type: 'dropdown',
        options: [
          '1.0',
          '2.0',
          '5.1',
          '7.1',
        ],
      },
      tooltip:
        'Enter the desired channel configuration',
    },
    {
      label: 'Language',
      name: 'language',
      type: 'string',
      defaultValue: 'eng',
      inputUI: {
        type: 'text',
      },
      tooltip:
        `
        Enter the desired audio language tag 
        \\n\\n
        This specifies the language tag of the desired audio stream. If at least one stream is found matching this 
        language then it will be used as the source to generate a new track matching the desired codec and channels. 
        If no audio stream is found matching this language tag then this plugin will fail.
        `,
    },
    {
      label: 'Enable Bitrate',
      name: 'enableBitrate',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        'Toggle whether to enable setting audio bitrate',
    },
    {
      label: 'Bitrate',
      name: 'bitrate',
      type: 'string',
      defaultValue: '128k',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'enableBitrate',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        'Specify the audio bitrate for newly added channels',
    },
    {
      label: 'Enable Samplerate',
      name: 'enableSamplerate',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        'Toggle whether to enable setting audio samplerate',
    },
    {
      label: 'Samplerate',
      name: 'samplerate',
      type: 'string',
      defaultValue: '48k',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'enableSamplerate',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        'Specify the audio samplerate for newly added channels',
    },
    {
      label: 'Title Behavior',
      name: 'titleMode',
      type: 'string',
      defaultValue: 'clear',
      inputUI: {
        type: 'dropdown',
        options: [
          'default',
          'clear',
          'generate',
        ],
      },
      tooltip:
        `
        Stream Title Behavior
        \\n\\n
        Choose how to handle the title tag for the generated stream (if required):
        \\n\\n
        - clear : Leave the stream title empty. This can be useful if you are using another plugin later to generate 
          titles. Tagging after the encode completes can make it easier to include some desired metadata in the 
          title. 
        \\n\\n
        - generate : Generate a title for this stream using input encode settings. Default pattern is {codec channels 
          language}
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
  // store inputs
  const targetCodec = String(args.inputs.audioCodec);
  const targetLang = String(args.inputs.language).toLowerCase();
  const targetChannels = String(args.inputs.channels);
  const titleMode = String(args.inputs.titleMode);
  const bitrate = (args.inputs.enableBitrate) ? Number(args.inputs.bitrate) : null;
  const samplerate = (args.inputs.enableSamplerate) ? Number(args.inputs.samplerate) : null;
  // store streams
  const { streams } = args.variables.ffmpegCommand;
  // first find audio streams
  const audioStreams = streams.filter((stream) => (getCodecType(stream) === 'audio'));
  // if no audio streams found return false
  if (audioStreams.length === 0) {
    throw new Error('No audio streams found in input file');
  }
  // log stream to create
  args.jobLog(`attempting to create audio stream [${targetCodec} ${targetChannels} ${targetLang}] `);
  // filter streams to only include audio streams with the specified language tag
  let sourceStreams = audioStreams.filter((stream) => streamMatchesLanguage(stream, targetLang));
  // if no streams exist with desired language try again with undefined language
  if (sourceStreams.length === 0) {
    args.jobLog(`No streams with language tag ${targetLang} found. Retrying with undefined `);
    sourceStreams = audioStreams.filter((stream: IffmpegCommandStream) => (
      isLanguageUndefined(stream)
    ));
  }
  // if still unable to find a source stream then fail
  if (sourceStreams.length < 1) {
    throw new Error(`unable to find a suitable source stream with language ${targetLang} or undefined`);
  }
  // function to determine the best of two input streams - determined by channel count and bitrate
  const getBestStream = (first: IffmpegCommandStream, second: IffmpegCommandStream) => {
    const s1c = first.channels || 0;
    const s2c = second.channels || 0;
    // use the one with higher channel count
    if (s1c > s2c) {
      return first;
    }
    // if channels are equal use the one with better bitrate
    if (s1c === s2c) {
      if ((first?.bit_rate || 0) > (second?.bit_rate || 0)) {
        // if channel count is equal return highest bitrate
        return first;
      }
    }
    // otherwise return second - it is either higher channel count or higher bitrate
    return second;
  };
  // locate the best available source stream
  const sourceStream = sourceStreams.reduce(getBestStream);
  // if requested stream has more channels than available in best source default to source channels
  const highestChannelCount = Number(sourceStream.channels);
  const wantedChannelCount = getChannelCount(targetChannels);
  let generateChannels = 0;
  if (wantedChannelCount <= highestChannelCount) {
    generateChannels = wantedChannelCount;
    args.jobLog(`The wanted channel count [${wantedChannelCount}] is <= the`
      + ` best source channel count [${sourceStream.channels}]. `);
  } else {
    generateChannels = highestChannelCount;
    args.jobLog(`The wanted channel count [${wantedChannelCount}] is > the`
      + ` best source channel count [${sourceStream.channels}]. `);
  }
  // log source stream to use
  args.jobLog('using source stream:'
    + ` [lang:${sourceStream.tags?.language}, codec:${sourceStream.codec_name},`
    + ` channels:${sourceStream.channels}, bitrate:${sourceStream.bit_rate}] `);
  // if desired stream already exists then exit
  if (audioStreams.filter((stream) => (streamMatchesLanguage(stream, targetLang)
    && stream.codec_name === targetCodec
    && stream.channels === generateChannels)).length > 0) {
    args.jobLog(`File already has stream matching: [${targetCodec}, ${targetChannels}, ${targetLang}] `);
  } else {
    // setup ffmpeg command to generate desired stream
    args.jobLog(`Creating stream: [${targetCodec}, ${generateChannels}, ${targetLang}] `);
    // create output stream starting with a copy of our source
    const streamCopy: IffmpegCommandStream = JSON.parse(JSON.stringify(sourceStream));
    streamCopy.removed = false;
    // add to the end of existing streams
    streamCopy.index = streams.length;
    // set encoder and channels
    streamCopy.outputArgs.push('-c:{outputIndex}', getEncoder(targetCodec));
    streamCopy.outputArgs.push('-ac', `${generateChannels}`);
    // configure bitrate if enabled
    if (bitrate) {
      streamCopy.outputArgs.push(`-b:${getFfType(getCodecType(streamCopy))}:{outputTypeIndex}`, `${bitrate}`);
    }
    // configure samplerate if enabled
    if (samplerate) {
      streamCopy.outputArgs.push('-ar', `${samplerate}`);
    }
    // handle title
    if (titleMode === 'clear') {
      // remove title metadata
      streamCopy.outputArgs.push('-metadata:s:{outputIndex}', 'title=');
    } else if (titleMode === 'generate') {
      // generate a basic title for this stream
      const title = `${targetCodec.toUpperCase()} ${targetChannels} ${targetLang.toUpperCase()}`;
      streamCopy.outputArgs.push('-metadata:s:{outputIndex}', `title=${title}`);
    }
    // enable processing from this plugin
    // eslint-disable-next-line no-param-reassign
    args.variables.ffmpegCommand.shouldProcess = true;
    // add our new stream ust after its source
    streams.splice(streams.indexOf(sourceStream) + 1, 0, streamCopy);
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
