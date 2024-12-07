import { IffmpegCommandStream } from '../interfaces/interfaces';

// function to set a typeIndex field on each stream in the input array
export const generateTypeIndexes = (streams: IffmpegCommandStream[]): void => (
  streams.map((stream) => stream.codec_type)
    .filter((value, index, array) => array.indexOf(value) === index)
    .forEach((codecType) => {
      // for each unique codec type set type index
      streams.filter((stream) => stream.codec_type === codecType)
        .forEach((stream, index) => {
          // eslint-disable-next-line no-param-reassign
          stream.typeIndex = index;
        });
    }));

// function to get a map of streams keyed on codec type
export const getStreamsByType = (streams: IffmpegCommandStream[]): { [key: string]: IffmpegCommandStream[] } => (
  streams.reduce(
    (map: { [key: string]: IffmpegCommandStream[] }, stream) => ({
      ...map,
      [stream.codec_type]: [...(map[stream.codec_type] || []), stream],
    }),
    {},
  )
);

// function to get a map of how many streams of each type are present
export const getTypeCountsMap = (streams: IffmpegCommandStream[]): { [key: string]: number } => (
  streams
    .reduce((counts: { [key: string]: number }, stream: IffmpegCommandStream) => {
      // eslint-disable-next-line no-param-reassign
      counts[stream.codec_type] = (counts[stream.codec_type] ?? 0) + 1;
      return counts;
    }, {})
);

// map of resolution widths to standard resolution name
const resolutionMap: { [key: number]: string } = {
  640: '480p',
  1280: '720p',
  1920: '1080p',
  2560: '1440p',
  3840: '4k',
};

// function to get the resolution name from a stream
export const getResolutionName = (stream: IffmpegCommandStream): string => (resolutionMap[Number(stream.width)]);

// function to get bitrate from stream
export const getBitrate = (stream: IffmpegCommandStream): string => {
  if (stream.tags?.BPS) {
    const kbps: number = Math.floor(Number(stream.tags.BPS) / 1000);
    if (String(kbps).length > 3) {
      return `${(kbps / 1000).toFixed(1)}Mbps`;
    }
    return `${kbps}kbps`;
  }
  return '';
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
export const streamMatchesLanguage = (
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

// function to determine if a stream is commentary
export const isStreamCommentary = (stream: IffmpegCommandStream): boolean => (
  stream.disposition?.comment
  || stream.tags?.title?.toLowerCase()?.includes('commentary'));

// function to determine if a stream is descriptive
export const isStreamDescriptive = (stream: IffmpegCommandStream): boolean => (
  stream.disposition?.descriptions
  || stream.tags?.title?.toLowerCase()?.includes('description')
  || stream.tags?.title?.toLowerCase()?.includes('descriptive')
  || stream.disposition?.visual_impaired
  || stream.tags?.title?.toLowerCase()?.includes('sdh'));

// function to get the title of a stream
export const getTitle = (stream: IffmpegCommandStream): string => {
  if (stream.tags?.title) {
    return stream.tags.title;
  }
  const codecType = stream.codec_type.toLowerCase();
  switch (codecType) {
    case 'video':
      return [stream?.codec_name?.toUpperCase(), getResolutionName(stream), getBitrate(stream)]
        .filter((item) => item)
        .join(' ');
    case 'audio':
      const audioFlags = [
        (stream.disposition?.default ? 'default' : undefined),
        (stream.disposition?.dub ? 'dub' : undefined),
        (isStreamDescriptive(stream) ? 'descriptive' : undefined),
        (isStreamCommentary(stream) ? 'commentary' : undefined),
      ].filter((item) => item);
      return [
        stream?.codec_name?.toUpperCase(),
        getChannelsName(stream),
        getBitrate(stream),
        ((stream.sample_rate) ? `${Math.floor(Number(stream.sample_rate) / 1000)}kHz` : undefined),
        ((stream.bits_per_raw_sample) ? `${stream.bits_per_raw_sample}-bit` : undefined),
        getLanguageName(getLanguageTag(stream)),
        (audioFlags.length > 0) ? `(${audioFlags.join(', ')})` : undefined,
      ].filter((item) => item !== undefined)
        .join(' ');
    case 'subtitle':
      const subtitleFlags = [
        (stream.disposition?.default ? 'default' : undefined),
        (stream.disposition?.forced ? 'forced' : undefined),
        (isStreamDescriptive(stream) ? 'descriptive' : undefined),
        (isStreamCommentary(stream) ? 'commentary' : undefined),
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

// function to get a function to sort streams
// general concept here is non-descriptive/non-commentary, commentary, descriptive
// sub-sorting tends to favor quality first (higher resolution, more channels, higher bitrate)
// subtitle sorting puts default/forced over others
export const getStreamSort = (codecType: string): ((s1: IffmpegCommandStream, s2: IffmpegCommandStream) => number) => {
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
        if (!isStreamCommentary(s1) && (isStreamCommentary(s2) || isStreamDescriptive(s2))) return -1;
        if ((isStreamCommentary(s1) || isStreamDescriptive(s1)) && !isStreamCommentary(s2)) return 1;
        // commentary comes before descriptive
        if (isStreamCommentary(s1) && isStreamDescriptive(s2)) return -1;
        if (isStreamDescriptive(s1) && isStreamCommentary(s2)) return 1;
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
        if (!isStreamCommentary(s1) && (isStreamCommentary(s2) || isStreamDescriptive(s2))) return -1;
        if ((isStreamCommentary(s1) || isStreamDescriptive(s1)) && !isStreamCommentary(s2)) return 1;
        // commentary comes before descriptive
        if (isStreamCommentary(s1) && isStreamDescriptive(s2)) return -1;
        if (isStreamDescriptive(s1) && isStreamCommentary(s2)) return 1;
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
