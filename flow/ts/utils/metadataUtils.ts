import { IffmpegCommandStream } from '../interfaces/interfaces';

// map of channel count to common user-friendly name
const channelMap: {
  [key: string]: string
} = {
  8: '7.1',
  7: '6.1',
  6: '5.1',
  2: '2.0',
  1: '1.0',
};

// function to get the user-friendly channel layout name from a stream
export const getChannelsName = (stream: IffmpegCommandStream): string => channelMap[Number(stream.channels)];

// map of resolution widths to standard resolution name
const resolutionMap: {
  [key: number]: string
} = {
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

// function to get the language from a stream
export const getLanguage = (stream: IffmpegCommandStream): string => {
  if (!stream.tags?.language || stream.tags.language === 'und') {
    return '';
  }
  return String(stream?.tags?.language);
};

// function to determine if a stream is commentary
export const isCommentary = (stream: IffmpegCommandStream): boolean => (
  stream.disposition?.comment
  || stream.tags?.title?.toLowerCase()?.includes('commentary'));

// function to determine if a stream is descriptive
export const isDescriptive = (stream: IffmpegCommandStream): boolean => (
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
        (isDescriptive(stream) ? 'descriptive' : undefined),
        (isCommentary(stream) ? 'commentary' : undefined),
      ].filter((item) => item);
      return [
        stream?.codec_name?.toUpperCase(),
        getChannelsName(stream),
        getBitrate(stream),
        ((stream.sample_rate) ? `${Math.floor(Number(stream.sample_rate) / 1000)}kHz` : undefined),
        ((stream.bits_per_raw_sample) ? `${stream.bits_per_raw_sample}-bit` : undefined),
        getLanguage(stream),
        (audioFlags.length > 0) ? `(${audioFlags.join(', ')})` : undefined,
      ].filter((item) => item !== undefined)
        .join(' ');
    case 'subtitle':
      const subtitleFlags = [
        (stream.disposition?.default ? 'default' : undefined),
        (stream.disposition?.forced ? 'forced' : undefined),
        (isDescriptive(stream) ? 'descriptive' : undefined),
        (isCommentary(stream) ? 'commentary' : undefined),
      ].filter((item) => item);
      return [
        getLanguage(stream),
        (subtitleFlags.length > 0) ? `(${subtitleFlags.join(', ')})` : undefined,
      ].filter((item) => item)
        .join(' ');
    default:
      return '';
  }
};

// function to get a function to sort streams. this is generally quality first
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
