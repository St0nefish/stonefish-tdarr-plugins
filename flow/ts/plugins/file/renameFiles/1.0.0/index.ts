/* eslint-disable max-len */

import path, { ParsedPath } from 'path';
import fs from 'fs';
import fileMoveOrCopy from '../../../../FlowHelpers/1.0.0/fileMoveOrCopy';
import {
  IffmpegCommandStream,
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import {
  getChannelsName,
  getCodecName,
  getCodecType,
  getMediaInfo, getMediaInfoTrack,
  getResolutionName,
} from '../../../../FlowHelpers/1.0.0/local/metadataUtils';
import { ImediaInfo } from '../../../../FlowHelpers/1.0.0/interfaces/synced/IFileObject';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Rename Files',
  description:
    `
    Renames the primary video file and optionally any associated files in the same directory which use the same root 
    name but different extensions. This can be useful for updating your file name(s) to match codecs, resolutions, etc 
    after running through tdarr and potentially changing those values. 
    `,
  style: {
    borderColor: 'green',
  },
  tags: 'video',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [
    {
      label: 'Replace Video Codec',
      name: 'replaceVideoCodec',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to replace the video codec name in the file(s). 
        \n\n
        For example, if you've re-encoded from h264/AVC to h265/HEVC then 'h264', 'x264', or 'AVC' in the file name(s) 
        will be replaced with 'H265' or 'x265' depending on if we can determine which encoder was used. New metadata 
        will be retrieved from the first video stream if multiple are present. 
        \n\n
        Credit to [schadis's Tdarr_Plugin_rename_based_on_codec_schadi plugin](https://github.com/schadis/Tdarr_Plugins/blob/master/Community/Tdarr_Plugin_scha_rename_based_on_codec_schadi.js)
        for influence and several of the regexes and maps used for renaming. I've extended it to support resolution and
        channel layouts in the rename and to convert to a flow plugin. 
        `,
    },
    {
      label: 'Replace Video Resolution',
      name: 'replaceVideoRes',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to replace the video resolution in the file(s). 
        \n\n
        For example, if you chose to encode a 1440p file to 1080p then references to '1440p' in the file name(s) will 
        be replaced with '1080p'. New metadata will be retrieved from the first video stream if multiple are present.
        `,
    },
    {
      label: 'Replace Audio Codec',
      name: 'replaceAudioCodec',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to replace the audio codec name in the file(s). 
        \n\n
        For example, if you re-encoded a TrueHD audio stream down to AAC then the reference to 'TrueHD' in the file 
        name(s) will be replaced with 'AAC'. New metadata will be retrieved from the first audio stream if multiple are 
        present, so this rename can be helpful even if you only re-ordered streams. 
        `,
    },
    {
      label: 'Replace Audio Channels',
      name: 'replaceAudioChannels',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to replace the audio channel reference in the file(s). 
        \n\n
        For example, if you re-encoded a 7.1 stream to 5.1 then references to '7.1' in the file name(s) will be 
        replaced with '5.1'. New metadata will be retrieved from the first audio stream if multiple are present, so 
        this rename can be helpful even if you only re-ordered streams.
        `,
    },
    {
      label: 'Rename Associated Files',
      name: 'renameOtherFiles',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to rename other files in the same directory. 
        \n\n
        This will only apply to files using the same root name but with different extensions. This is mostly useful if
        you have nfo or subtitle files which use the same file naming pattern but with different extensions. 
        `,
    },
    {
      label: 'Associated File Extensions',
      name: 'fileExtensions',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'renameOtherFiles',
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
        Enter a comma-separated list of extensions for files you wish to be renamed. If left blank this will default to
        all files matching the same naming pattern. 
        \\n\\n
        This will treat srt files as a special case and support files like '{name}.en.srt' or '{name}.en.forced.srt'
        `,
    },
    {
      label: 'Metadata Delimiter',
      name: 'metadataDelimiter',
      type: 'string',
      defaultValue: ' - ',
      inputUI: {
        type: 'text',
      },
      tooltip:
        `
        Enter a string which is used as a delimiter between the name of the movie/show and the string containing any
        metadata about the video and audio streams. This can help prevent any (rare) accidental issues with replacing
        something that happened to be part of the actual file name.  
        \\n\\n
        For example, my standard naming scheme is:
        \n\n
        '{title stripped of special characters} - {file metadata}'
        \n\n
        'The Lord of the Rings The Return of the King (2003) - [x264 Remux-1080p][AAC 2.0]-FraMeSToR.mkv'
        To avoid any accidents breaking the title I enter ' - ' and the rename operation will apply only to the portion 
        after that delimiter. This works best if the delimiter is the first instance of that string in the file name.
        `,
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'One or more files were renamed',
    },
    {
      number: 2,
      tooltip: 'No files were renamed',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
  // get input config
  const replaceVideoCodec = Boolean(args.inputs.replaceVideoCodec);
  const replaceVideoRes = Boolean(args.inputs.replaceVideoRes);
  const replaceAudioCodec = Boolean(args.inputs.replaceAudioCodec);
  const replaceAudioChannels = Boolean(args.inputs.replaceAudioChannels);
  const renameOtherFiles = Boolean(args.inputs.renameOtherFiles);
  const supportedExtensions: string[] = String(args.inputs.fileExtensions).split(',')
    .filter((item) => item)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .filter((item, index, items) => items.indexOf(item) === index);
  const metadataDelimiter = String(args.inputs.metadataDelimiter) ?? undefined;
  // grab a handle to streams
  const { streams } = args.variables.ffmpegCommand;
  // execute a media info scan
  const mediaInfo: ImediaInfo | undefined = await getMediaInfo(args);
  // regexes for replacing
  const videoCodecRegex = /(h264|h265|x264|x265|avc|hevc|mpeg2|av1)/gi;
  const videoResRegex = /(480p|576p|720p|1080p|1440p|2160p|4320p)/gi;
  const audioCodecRegex = /(aac|ac3|eac3|flac|mp2|mp3|truehd|dts[-. ]hd[-. ]ma|dts[-. ]hd[-. ]es|dts[-. ]hd[-. ]hra|dts[-. ]express|dts)/gi;
  const audioChannelsRegex = /(1.0|2.0|2.1|3.0|3.1|5.1|6.1|7.1|)/gi;
  // get file name and path from input object
  const filePath: ParsedPath = path.parse(args.inputFileObj._id);
  const fileFullName: string = filePath.base;
  const fileBaseName: string = filePath.name;
  const fileDir: string = filePath.dir;

  args.jobLog(`looking for files in [${fileDir}] with name like [${fileBaseName}] and extensions ${JSON.stringify(supportedExtensions)}`);

  // build a list of other files in the directory - start with our video file
  const files: string[] = [fileFullName];
  // if enabled add other files in the directory
  if (renameOtherFiles) {
    fs.readdirSync(fileDir).forEach((item: string) => {
      args.jobLog(`checking if we should rename file [${fileDir}/${item}]`);
      const otherPath: ParsedPath = path.parse(`${fileDir}/${item}`);
      args.jobLog(`parsed path: ${JSON.stringify(otherPath)}`);
      if (otherPath // able to parse the path
        && otherPath.base !== fileFullName // not our original video file
        && (supportedExtensions.length === 0 || supportedExtensions.includes(otherPath.ext)) // passes extension filter
      ) {
        files.push(otherPath.base);
      }
    });
  }
  // trim entries, remove empty, and ensure unique
  files.map((item) => item?.trim()).filter((item) => item)
    .filter((item, index, items) => items.indexOf(item) === index);
  args.jobLog(`files to rename: ${JSON.stringify(files)}`);
  // iterate files
  files.forEach((originalName) => {
    let newName: string = originalName;
    let originalSuffix: string | undefined;
    // if using the metadata delimiter parse only the end of the file
    args.jobLog(`checking if [${originalName}] contains delimiter [${metadataDelimiter}]`);
    if (metadataDelimiter && originalName.includes(metadataDelimiter)) {
      newName = originalName.substring(originalName.indexOf(metadataDelimiter));
      originalSuffix = newName;
      args.jobLog(`executing rename on [${newName}], original suffix: [${originalSuffix}]`);
    }
    // if any video-based rename is enabled
    if (replaceVideoCodec || replaceVideoRes) {
      // first find the first video stream and get its media info
      const videoStream: IffmpegCommandStream = streams.filter((stream) => getCodecType(stream) === 'video')[0];
      // ToDo
      const videoMediaInfo = mediaInfo?.track?.filter((infoTrack) => {
        args.jobLog(`checking info track ${JSON.stringify(infoTrack)}`);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return infoTrack && infoTrack.StreamOrder === videoStream.index;
      })?.[0];

      // ToDo - remove logging
      args.jobLog(`using video media info:\n${JSON.stringify(videoMediaInfo)}`);
      // ToDo - remove logging
      // handle video codec replacement if enabled
      if (replaceVideoCodec) {
        newName = newName.replace(videoCodecRegex, getCodecName(videoStream, videoMediaInfo));

        args.jobLog(`name after video codec: [${newName}]`);
      }
      // handle video resolution replacement if enabled
      if (replaceVideoRes) {
        newName = newName.replace(videoResRegex, getResolutionName(videoStream));

        args.jobLog(`name after video resolution: [${newName}]`);
      }
    }
    if (replaceAudioCodec || replaceAudioChannels) {
      const audioStream: IffmpegCommandStream = streams.filter((stream) => getCodecType(stream) === 'video')[0];
      const audioMediaInfo = getMediaInfoTrack(audioStream, mediaInfo);

      // ToDo - remove logging
      args.jobLog(`using audio media info:\n${JSON.stringify(audioMediaInfo)}`);
      // ToDo - remove logging

      // handle audio codec replacement if enabled
      if (replaceAudioCodec) {
        newName = newName.replace(audioCodecRegex, getCodecName(audioStream, audioMediaInfo));

        args.jobLog(`name after audio codec: [${newName}]`);
      }
      // handle audio channels replacement if enabled
      if (replaceAudioChannels) {
        newName = newName.replace(audioChannelsRegex, getChannelsName(audioStream));

        args.jobLog(`name after audio channels: [${newName}]`);
      }
    }
    // if using the metadata delimiter now replace the entire original suffix with the new one
    if (metadataDelimiter && originalSuffix) {
      args.jobLog(`replacing original suffix [${originalSuffix}] with [${newName}]`);
      newName = originalName.replace(originalSuffix, newName);
    }
    args.jobLog(`renaming [${originalName}] to [${newName}]`);
    // ToDo - actually rename
  });

  // if (fileBaseName === '') {
  //   await fileMoveOrCopy({
  //     operation: 'move',
  //     sourcePath: args.inputFileObj._id,
  //     destinationPath: `${fileDir}/${fileBaseName}`,
  //     args,
  //   });
  // }

  // let newName = String(args.inputs.fileRename).trim();
  // newName = newName.replace(/\${fileName}/g, fileName);
  // newName = newName.replace(/\${container}/g, getContainer(args.inputFileObj._id));
  //
  // const newPath = `${fileDir}/${newName}`;
  //
  // if (args.inputFileObj._id === newPath) {
  //   args.jobLog('Input and output path are the same, skipping rename.');
  //
  //   return {
  //     outputFileObj: {
  //       _id: args.inputFileObj._id,
  //     },
  //     outputNumber: 1,
  //     variables: args.variables,
  //   };
  // }
  //
  // await fileMoveOrCopy({
  //   operation: 'move',
  //   sourcePath: args.inputFileObj._id,
  //   destinationPath: newPath,
  //   args,
  // });
  //
  // return {
  //   outputFileObj: {
  //     _id: newPath,
  //   },
  //   outputNumber: 1,
  //   variables: args.variables,
  // };

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
