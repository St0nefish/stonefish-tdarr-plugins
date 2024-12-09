// disable some eslint parsing - support 'any' arg type because mediaInfo track entries don't have a defined type
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IffmpegCommandStream, IpluginInputArgs } from '../interfaces/interfaces';
import { IFileObject, ImediaInfo } from '../interfaces/synced/IFileObject';

// function to execute a MediaInfo scan (if possible) and return a File object with embedded mediaInfo data
export const getMediaInfo = async (args: IpluginInputArgs): Promise<ImediaInfo | undefined> => {
  let file: IFileObject = args.inputFileObj;
  if (args.inputFileObj && args.scanIndividualFile) {
    args.jobLog(`scanning file: ${args.inputFileObj._id}`);
    file = await args.scanIndividualFile(args.inputFileObj, {
      exifToolScan: true,
      mediaInfoScan: true,
      closedCaptionScan: false,
    });
  }
  return file.mediaInfo;
};

// function to get the correct media info track for the input stream - assumes indexes are untouched
export const getMediaInfoTrack = (stream: IffmpegCommandStream, mediaInfo?: any) => (
  mediaInfo?.track?.filter((item: any) => item.StreamOrder === stream.index) ?? undefined
);

// function to get the codec type
export const getCodecType = (stream: IffmpegCommandStream): string => (stream.codec_type.toLowerCase() ?? '');

// function to get stream type flag for use in qualifiers
export const getStreamTypeFlag = (stream: IffmpegCommandStream): string => (Array.from(getCodecType(stream))[0]);

// function to get the codec friendly name
export const getCodecName = (stream: IffmpegCommandStream, mediaInfo?: any): string => (
  mediaInfo.Format_Commercial_IfAny ?? mediaInfo.Format ?? stream?.codec_name.toUpperCase()
);

// function to set a typeIndex field on each stream in the input array
export const setTypeIndexes = (streams: IffmpegCommandStream[]): void => (
  streams.map((stream) => getCodecType(stream))
    .filter((value, index, array) => array.indexOf(value) === index)
    .forEach((codecType) => {
      // for each unique codec type set type index
      streams.filter((stream) => getCodecType(stream) === codecType)
        .forEach((stream, index) => {
          // eslint-disable-next-line no-param-reassign
          stream.typeIndex = index;
        });
    }));

// function to get a map of how many streams of each type are present
export const getTypeCountsMap = (streams: IffmpegCommandStream[]): { [key: string]: number } => (
  streams
    .reduce((counts: { [key: string]: number }, stream: IffmpegCommandStream) => {
      // eslint-disable-next-line no-param-reassign
      counts[getCodecType(stream)] = (counts[getCodecType(stream)] ?? 0) + 1;
      return counts;
    }, {})
);

// map of resolution widths to standard resolution name
const resolutionMap: { [key: number]: string } = {
  640: '480p',
  1280: '720p',
  1920: '1080p',
  2560: '1440p',
  3840: '4k UHD',
  4096: 'DCI 4k',
  7680: '8k UHD',
  8192: '8k',
};

// function to get the resolution name from a stream
export const getResolutionName = (stream: IffmpegCommandStream): string => (resolutionMap[Number(stream.width)]);

// function to get bitrate from stream
export const getBitrate = (stream: IffmpegCommandStream, mediaInfo?: any): number => {
  let bitrate = 0;
  if (mediaInfo && mediaInfo.BitRate) {
    // prefer bitrate from mediaInfo
    bitrate = Number(mediaInfo.BitRate);
  } else if (stream.tags?.BPS) {
    // otherwise fallback to stream data
    bitrate = Number(stream.tags.BPS);
  }
  return bitrate;
};

// function to get bitrate text from stream
export const getBitrateText = (stream: IffmpegCommandStream, mediaInfo?: any): string | undefined => {
  const bitrate = getBitrate(stream, mediaInfo);
  if (bitrate > 0) {
    const kbps: number = Math.floor(bitrate / 1000);
    if (String(kbps).length > 3) {
      return `${(kbps / 1000).toFixed(1)}Mbps`;
    }
    return `${kbps}kbps`;
  }
  return undefined;
};

// function to determine if a track is lossless audio
export const isLosslessAudio = (stream: IffmpegCommandStream, mediaInfo: any): boolean => {
  // if we have media info use it, otherwise assume false
  if (getCodecType(stream) === 'audio' && mediaInfo) {
    return Boolean(mediaInfo?.Compression_Mode?.toLowerCase() === 'lossless');
  }
  return false;
};

// map of channel count to common user-friendly name
const channelMap: { [key: string]: string } = {
  8: '7.1',
  7: '6.1',
  6: '5.1',
  2: '2.0',
  1: '1.0',
};

// function to get the user-friendly channel layout name from a stream
export const getChannelsName = (stream: IffmpegCommandStream): string => channelMap[Number(stream.channels)];

// function to convert user-friendly channel layout to a number
export const getChannelCount = (channelName: string): number => {
  if (!channelName) {
    return 0;
  }
  return channelName.split('.')
    .map(Number)
    .reduce((last, current) => last + current);
};

// function to get the sample rate for a file
export const getSampleRate = (stream: IffmpegCommandStream, mediaInfo?: any): number => {
  // prefer from media info
  if (mediaInfo?.SamplingRate) {
    return Number(mediaInfo.SamplingRate);
  }
  // if unavailable fall back to stream
  if (stream.sample_rate) {
    return Number(stream.sample_rate);
  }
  // if unable to determine return 0
  return 0;
};

// function to get sample rate as text - converted to kHz and returned with units
export const getSampleRateText = (stream: IffmpegCommandStream, mediaInfo?: any): string | undefined => {
  const sampleRate = getSampleRate(stream, mediaInfo);
  if (sampleRate > 0) {
    return `${Math.floor(Number(stream.sample_rate) / 1000)}kHz`;
  }
  return undefined;
};

// function to get the bit depth
export const getBitDepth = (stream: IffmpegCommandStream, mediaInfo?: any): number => {
  if (mediaInfo.BitDepth) {
    return Number(mediaInfo.BitDepth);
  }
  if (stream.bits_per_raw_sample) {
    return Number(stream.bits_per_raw_sample);
  }
  return 0;
};

// function to get the bit depth as text
export const getBitDepthText = (stream: IffmpegCommandStream, mediaInfo?: any): string | undefined => {
  const bitDepth = getBitDepth(stream, mediaInfo);
  if (bitDepth > 0) {
    return `${bitDepth}-bit`;
  }
  return undefined;
};

// map of audio codecs to encoders
const encoderMap: { [key: string]: string } = {
  aac: 'aac',
  ac3: 'ac3',
  eac3: 'eac3',
  dts: 'dca',
  flac: 'flac',
  opus: 'libopus',
  mp2: 'mp2',
  mp3: 'libmp3lame',
  truehd: 'truehd',
};

// function to get the audio encoder for a codec
export const getEncoder = (codec: string): string => encoderMap[String(codec)];

// function to check if a language is undefined
export const isLanguageUndefined = (stream: IffmpegCommandStream): boolean => (
  !stream.tags?.language || stream.tags.language === 'und'
);

// function to get the language from a stream with optional support for default value
export const getLanguageTag = (stream: IffmpegCommandStream, defaultLang?: string): string => {
  if (isLanguageUndefined(stream)) {
    return defaultLang ?? '';
  }
  return String(stream?.tags?.language);
};

// map language tags to language name
const languageMap: { [key: string]: string } = {
  eng: 'English',
};

// function to get language name from tag
export const getLanguageName = (langTag: string): string => (String(languageMap[langTag]) ?? '');

// map of language tag alternates
const languageTagAlternates: { [key: string]: string[] } = {
  eng: ['eng', 'en', 'en-us', 'en-gb', 'en-ca', 'en-au'],
};

// function to check if a stream language matches one of a list of tags with support for defaulting undefined
export const streamMatchesLanguages = (
  stream: IffmpegCommandStream, languageTags: string[], defaultLanguage?: string,
): boolean => {
  // grab the language value with support for optional default
  const streamLanguage = getLanguageTag(stream, defaultLanguage);
  // create an array with all input tags and all configured alternates
  const allValidTags = [...languageTags, ...languageTags.flatMap((tag: string) => (languageTagAlternates[tag]))]
    .filter((item) => item)
    .filter((item: string, index: number, items: string[]) => items.indexOf(item) === index);
  // if unable to determine stream language assume no match
  // if able to check for tag equivalents in our map, if none configured check for equality against input
  return Boolean(streamLanguage && allValidTags.includes(streamLanguage));
};

// function to check if a stream matches a single language tag
export const streamMatchesLanguage = (
  stream: IffmpegCommandStream, languageTag: string, defaultLanguage?: string,
): boolean => streamMatchesLanguages(stream, [languageTag], defaultLanguage);

// function to check if a stream appears to be commentary
export const streamHasCommentary = (stream: IffmpegCommandStream): boolean => (
  stream.disposition?.comment
  || stream.tags?.title?.toLowerCase()?.includes('commentary')
);

// function to check if a stream appears to be descriptive
export const streamHasDescriptive = (stream: IffmpegCommandStream): boolean => (
  stream.disposition?.descriptions
  || stream.tags?.title?.toLowerCase()?.includes('description')
  || stream.tags?.title?.toLowerCase()?.includes('descriptive')
  || stream.disposition?.visual_impaired
  || stream.tags?.title?.toLowerCase()?.includes('sdh')
);

// function to determine if a stream is standard (not commentary and not descriptive)
export const streamIsStandard = (stream: IffmpegCommandStream): boolean => (
  !streamHasCommentary(stream) && !streamHasDescriptive(stream)
);

// function to determine if a stream is commentary but NOT descriptive
export const streamIsCommentary = (stream: IffmpegCommandStream): boolean => (
  streamHasCommentary(stream) && !streamHasDescriptive(stream)
);

// function to determine if a stream is descriptive
export const streamIsDescriptive = (stream: IffmpegCommandStream): boolean => (
  streamHasDescriptive(stream) && !streamHasCommentary(stream)
);

// function to determine if a stream appears to have both commentary and descriptive properties
export const streamIsDescriptiveCommentary = (stream: IffmpegCommandStream): boolean => (
  streamHasCommentary(stream) && streamHasDescriptive(stream)
);

// function to generate the title for a stream
export const generateTitleForStream = (stream: IffmpegCommandStream, mediaInfo: any): string => {
  const codecType = getCodecType(stream);
  switch (codecType) {
    case 'video':
      return [stream?.codec_name?.toUpperCase(), getResolutionName(stream), getBitrateText(stream, mediaInfo)]
        .filter((item) => item)
        .join(' ');
    case 'audio':
      const audioFlags = [
        (stream.disposition?.dub ? 'dub' : undefined),
        (streamIsDescriptive(stream) ? 'descriptive' : undefined),
        (streamIsCommentary(stream) ? 'commentary' : undefined),
      ].filter((item) => item);
      return [
        getCodecName(stream, mediaInfo),
        getChannelsName(stream),
        getBitrateText(stream, mediaInfo),
        getSampleRateText(stream, mediaInfo),
        getBitDepthText(stream, mediaInfo),
        (audioFlags.length > 0) ? `(${audioFlags.join(', ')})` : undefined,
      ].filter((item) => item).join(' ');
    case 'subtitle':
      const subtitleFlags = [
        (stream.disposition?.default ? 'default' : undefined),
        (stream.disposition?.forced ? 'forced' : undefined),
        (streamIsDescriptive(stream) ? 'descriptive' : undefined),
        (streamIsCommentary(stream) ? 'commentary' : undefined),
      ].filter((item) => item);
      return [
        getLanguageName(getLanguageTag(stream)),
        (subtitleFlags.length > 0) ? `(${subtitleFlags.join(', ')})` : undefined,
      ].filter((item) => item)
        .join(' ');
    default:
      return '';
  }
};

// function to get the title and if undefined generate one
export const getTitleForStream = (stream: IffmpegCommandStream, mediaInfo: any): string => {
  if (stream.tags?.title) {
    return stream.tags.title;
  }
  return generateTitleForStream(stream, mediaInfo);
};

// function to sort streams
// sorts first by codec type - video, audio, subtitle, {other}
// sorts video by resolution (desc), bitrate (desc)
// sorts audio and subtitles by type (standard, commentary, then descriptive)
// sorts audio by then channels (desc), compression type (lossless, lossy), then bitrate (desc)
// sorts subtitles by default, forced, neither
// fallback for all ties and all non-standard codec types is to keep input order (sort by index)
const streamTypeOrder: string[] = ['video', 'audio', 'subtitle'];
export const getStreamSorter = (mediaInfo?: ImediaInfo): (
  (s1: IffmpegCommandStream, s2: IffmpegCommandStream) => number) => (
  (s1: IffmpegCommandStream, s2: IffmpegCommandStream): number => {
    // ==== sort first by stream type ==== //
    // get codec type for both streams
    const s1Type: string = getCodecType(s1);
    const s2Type: string = getCodecType(s2);
    // get index of each, default to 99, we'll tiebreak non-video/audio/subtitle with alphabetic order
    const s1TypeIdx: number = streamTypeOrder.indexOf(s1Type) ?? 99;
    const s2TypeIdx: number = streamTypeOrder.indexOf(s2Type) ?? 99;
    if (s1TypeIdx < s2TypeIdx) return -1;
    if (s1TypeIdx > s2TypeIdx) return 1;
    // either codecs are of same type or both entirely unknown
    if (!streamTypeOrder.includes(s1Type) && !streamTypeOrder.includes(s2Type)) {
      // tiebreaker for nonstandard codecs is alphabetic order
      if (s1Type.localeCompare(s2Type) === -1) return -1;
      if (s1Type.localeCompare(s2Type) === 1) return 1;
    }
    // failsafe to validate type sorting
    if (s1Type !== s2Type) {
      throw new Error(`failed to determine sort order for codec types [${s1Type}] and [${s2Type}]`);
    }
    // get media info for each track
    const s1MediaInfo = getMediaInfoTrack(s1, mediaInfo);
    const s2MediaInfo = getMediaInfoTrack(s2, mediaInfo);
    // ==== tiebreaker for same-type depends on the type ==== //
    if (s1Type === 'video') {
      // resolution descending
      const s1Resolution = Number(s1?.width ?? 0);
      const s2Resolution = Number(s2?.width ?? 0);
      if (s1Resolution > s2Resolution) return -1;
      if (s1Resolution < s2Resolution) return 1;
      // then bitrate descending
      const s1VideoBitrate = getBitrate(s1, s1MediaInfo);
      const s2VideoBitrate = getBitrate(s2, s2MediaInfo);
      if (s1VideoBitrate > s2VideoBitrate) return -1;
      if (s1VideoBitrate < s2VideoBitrate) return 1;
      // tie
      return 0;
    }
    if (s1Type === 'audio' || s1Type === 'subtitle') {
      // sort by stream flags -> standard, commentary, descriptive, then commentary+descriptive
      // standard streams (not commentary or descriptive) come before commentary or descriptive
      if (streamIsStandard(s1) && !streamIsStandard(s2)) return -1;
      if (streamIsStandard(s2) && !streamIsStandard(s1)) return 1;
      // commentary comes before anything with descriptive flags
      if (streamIsCommentary(s1) && streamHasDescriptive(s2)) return -1;
      if (streamIsCommentary(s2) && streamHasDescriptive(s1)) return 1;
      // descriptive comes before descriptive commentary
      if (streamIsDescriptive(s1) && streamIsDescriptiveCommentary(s2)) return -1;
      if (streamIsDescriptive(s2) && streamIsDescriptiveCommentary(s1)) return 1;
      // tiebreakers fork on type
      if (s1Type === 'audio') {
        // channels descending
        const s1Channels = Number(s1?.channels ?? 0);
        const s2Channels = Number(s2?.channels ?? 0);
        if (s1Channels > s2Channels) return -1;
        if (s1Channels < s2Channels) return 1;
        // lossless before lossy
        const s1Lossless = isLosslessAudio(s1, s1MediaInfo);
        const s2Lossless = isLosslessAudio(s2, s2MediaInfo);
        if (s1Lossless && !s2Lossless) return -1;
        if (s2Lossless && !s1Lossless) return 1;
        // bitrate descending
        const s1AudioBitrate = getBitrate(s1, s1MediaInfo);
        const s2AudioBitrate = getBitrate(s2, s2MediaInfo);
        if (s1AudioBitrate > s2AudioBitrate) return -1;
        if (s1AudioBitrate < s2AudioBitrate) return 1;
      } else if (s1Type === 'subtitle') {
        // default flag descending
        const s1Default = Number(s1?.disposition?.default ?? 0);
        const s2Default = Number(s2?.disposition?.default ?? 0);
        if (s1Default > s2Default) return -1;
        if (s1Default < s2Default) return 1;
        // forced flag descending
        const s1Forced = Number(s1?.disposition?.forced ?? 0);
        const s2Forced = Number(s2?.disposition?.forced ?? 0);
        if (s1Forced > s2Forced) return -1;
        if (s1Forced < s2Forced) return 1;
      }
    }
    // if all else is equal fall back input order
    return s1.index - s2.index;
  }
);
