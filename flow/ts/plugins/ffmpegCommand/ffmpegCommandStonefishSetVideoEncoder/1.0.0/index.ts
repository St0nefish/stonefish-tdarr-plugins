/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
import { getEncoder } from '../../../../FlowHelpers/1.0.0/hardwareUtils';
import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint-disable no-param-reassign */
const details = (): IpluginDetails => ({
  name: 'Set Video Encoder',
  description:
    `
     Configure the video encoder settings \\n
     \\n
     See the following resources for more details on what these settings do: \\n
     - https://trac.ffmpeg.org/wiki/Encode/H.264 \\n
     - https://trac.ffmpeg.org/wiki/Encode/H.265 \\n
     - https://trac.ffmpeg.org/wiki/Encode/AV1 \\n
     \\n
     Credit to the default ffmpegCommandSetVideoEncoder plugin. I forked it to add options to control the title 
     behavior and change default values to match my personal preference.
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
      label: 'Output Codec',
      name: 'outputCodec',
      type: 'string',
      defaultValue: 'hevc',
      inputUI: {
        type: 'dropdown',
        options: [
          'hevc',
          'h264',
          'av1',
        ],
      },
      tooltip: 'Specify codec of the output file',
    },
    {
      label: 'Enable FFmpeg Preset',
      name: 'ffmpegPresetEnabled',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to use an FFmpeg preset',
    },
    {
      label: 'FFmpeg Preset',
      name: 'ffmpegPreset',
      type: 'string',
      defaultValue: 'slow',
      inputUI: {
        type: 'dropdown',
        options: [
          'veryslow',
          'slower',
          'slow',
          'medium',
          'fast',
          'faster',
          'veryfast',
          'superfast',
          'ultrafast',
        ],
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'ffmpegPresetEnabled',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip: 'Specify ffmpeg preset',
    },
    {
      label: 'Enable FFmpeg Quality',
      name: 'ffmpegQualityEnabled',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to set crf (or qp for GPU encoding)',
    },
    {
      label: 'FFmpeg Quality',
      name: 'ffmpegQuality',
      type: 'number',
      defaultValue: '20',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'ffmpegQualityEnabled',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip: 'Specify ffmpeg quality crf (or qp for GPU encoding)',
    },
    {
      label: 'Hardware Encoding',
      name: 'hardwareEncoding',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to use hardware encoding if available',
    },
    {
      label: 'Hardware Type',
      name: 'hardwareType',
      type: 'string',
      defaultValue: 'auto',
      inputUI: {
        type: 'dropdown',
        options: [
          'auto',
          'nvenc',
          'qsv',
          'vaapi',
          'videotoolbox',
        ],
      },
      tooltip: 'Specify hardware encoder to use',
    },
    {
      label: 'Hardware Decoding',
      name: 'hardwareDecoding',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to use hardware decoding if available',
    },
    {
      label: 'Force Encoding',
      name: 'forceEncoding',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to force encoding if stream already has the target codec',
    },
    {
      label: 'Title Behavior',
      name: 'titleMode',
      type: 'string',
      defaultValue: 'true',
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
        Specify how to handle the title of the resulting stream \\n
        \\n
        - default : defer to the default ffmpeg behavior  \\n
        - clear : clear the title value \\n
        - generate : generate a title from {codec} \\n
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
  // ensure ffmpeg command was initiated
  checkFfmpegCommandInit(args);
  // grab config
  const hardwareDecoding = Boolean(args.inputs.hardwareDecoding);
  const targetCodec = String(args.inputs.outputCodec);
  const ffmpegPresetEnabled = Boolean(args.inputs.ffmpegPresetEnabled);
  const ffmpegQualityEnabled = Boolean(args.inputs.ffmpegQualityEnabled);
  const ffmpegPreset = String(args.inputs.ffmpegPreset);
  const ffmpegQuality = String(args.inputs.ffmpegQuality);
  const forceEncoding = Boolean(args.inputs.forceEncoding);
  const hardwareEncoding = Boolean(args.inputs.hardwareEncoding);
  const hardwareType = String(args.inputs.hardwareType);
  const titleMode = String(args.inputs.titleMode);
  // iterate streams
  for (let i = 0; i < args.variables.ffmpegCommand.streams.length; i += 1) {
    const stream = args.variables.ffmpegCommand.streams[i];
    // only process video streams
    if (stream.codec_type === 'video') {
      // only encode if forced or codec isn't already correct
      if (forceEncoding || stream.codec_name !== targetCodec) {
        // enable processing and set hardware decoding
        args.variables.ffmpegCommand.shouldProcess = true;
        args.variables.ffmpegCommand.hardwareDecoding = hardwareDecoding;
        // get encoder options
        // eslint-disable-next-line no-await-in-loop
        const encoderProperties = await getEncoder({
          targetCodec,
          hardwareEncoding,
          hardwareType,
          args,
        });
        // set output stream option
        stream.outputArgs.push('-c:{outputIndex}', encoderProperties.encoder);
        // handle quality settings
        if (ffmpegQualityEnabled) {
          if (encoderProperties.isGpu) {
            stream.outputArgs.push('-qp', ffmpegQuality);
          } else {
            stream.outputArgs.push('-crf', ffmpegQuality);
          }
        }
        // handle presets
        if (ffmpegPresetEnabled) {
          if (targetCodec !== 'av1' && ffmpegPreset) {
            stream.outputArgs.push('-preset', ffmpegPreset);
          }
        }
        // handle hardware decoding options
        if (hardwareDecoding) {
          stream.inputArgs.push(...encoderProperties.inputArgs);
        }
        // push remaining encoder output args
        if (encoderProperties.outputArgs) {
          stream.outputArgs.push(...encoderProperties.outputArgs);
        }
        // handle title removal
        if (titleMode === 'clear') {
          stream.outputArgs.push('-metadata:s:v:{outputTypeIndex}', 'title=');
        } else if (titleMode === 'generate') {
          stream.outputArgs.push('-metadata:s:v:{outputTypeIndex}', `title=${targetCodec}`);
        }
      }
    }
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
