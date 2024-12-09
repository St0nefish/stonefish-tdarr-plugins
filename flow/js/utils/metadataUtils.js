"use strict";
// disable some eslint parsing - support 'any' arg type because mediaInfo track entries don't have a defined type
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreamSorter = exports.getTitleForStream = exports.generateTitleForStream = exports.streamIsDescriptiveCommentary = exports.streamIsDescriptive = exports.streamIsCommentary = exports.streamIsStandard = exports.streamHasDescriptive = exports.streamHasCommentary = exports.streamMatchesLanguage = exports.streamMatchesLanguages = exports.getLanguageName = exports.getLanguageTag = exports.isLanguageUndefined = exports.getEncoder = exports.getBitDepthText = exports.getBitDepth = exports.getSampleRateText = exports.getSampleRate = exports.getChannelCount = exports.getChannelsName = exports.isLosslessAudio = exports.getBitrateText = exports.getBitrate = exports.getResolutionName = exports.getTypeCountsMap = exports.setTypeIndexes = exports.getCodecName = exports.getStreamTypeFlag = exports.getCodecType = exports.getMediaInfoTrack = exports.getMediaInfo = void 0;
// function to execute a MediaInfo scan (if possible) and return a File object with embedded mediaInfo data
var getMediaInfo = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var file;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = args.inputFileObj;
                if (!(args.inputFileObj && args.scanIndividualFile)) return [3 /*break*/, 2];
                args.jobLog("scanning file: ".concat(args.inputFileObj._id));
                return [4 /*yield*/, args.scanIndividualFile(args.inputFileObj, {
                        exifToolScan: true,
                        mediaInfoScan: true,
                        closedCaptionScan: false,
                    })];
            case 1:
                file = _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/, file.mediaInfo];
        }
    });
}); };
exports.getMediaInfo = getMediaInfo;
// function to get the correct media info track for the input stream - assumes indexes are untouched
var getMediaInfoTrack = function (stream, mediaInfo) {
    var _a, _b;
    return ((_b = (_a = mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.track) === null || _a === void 0 ? void 0 : _a.filter(function (item) { return item.StreamOrder === stream.index; })) !== null && _b !== void 0 ? _b : undefined);
};
exports.getMediaInfoTrack = getMediaInfoTrack;
// function to get the codec type
var getCodecType = function (stream) { var _a; return ((_a = stream.codec_type.toLowerCase()) !== null && _a !== void 0 ? _a : ''); };
exports.getCodecType = getCodecType;
// function to get stream type flag for use in qualifiers
var getStreamTypeFlag = function (stream) { return (Array.from((0, exports.getCodecType)(stream))[0]); };
exports.getStreamTypeFlag = getStreamTypeFlag;
// function to get the codec friendly name
var getCodecName = function (stream, mediaInfo) {
    var _a, _b;
    return ((_b = (_a = mediaInfo.Format_Commercial_IfAny) !== null && _a !== void 0 ? _a : mediaInfo.Format) !== null && _b !== void 0 ? _b : stream === null || stream === void 0 ? void 0 : stream.codec_name.toUpperCase());
};
exports.getCodecName = getCodecName;
// function to set a typeIndex field on each stream in the input array
var setTypeIndexes = function (streams) { return (streams.map(function (stream) { return (0, exports.getCodecType)(stream); })
    .filter(function (value, index, array) { return array.indexOf(value) === index; })
    .forEach(function (codecType) {
    // for each unique codec type set type index
    streams.filter(function (stream) { return (0, exports.getCodecType)(stream) === codecType; })
        .forEach(function (stream, index) {
        // eslint-disable-next-line no-param-reassign
        stream.typeIndex = index;
    });
})); };
exports.setTypeIndexes = setTypeIndexes;
// function to get a map of how many streams of each type are present
var getTypeCountsMap = function (streams) { return (streams
    .reduce(function (counts, stream) {
    var _a;
    // eslint-disable-next-line no-param-reassign
    counts[(0, exports.getCodecType)(stream)] = ((_a = counts[(0, exports.getCodecType)(stream)]) !== null && _a !== void 0 ? _a : 0) + 1;
    return counts;
}, {})); };
exports.getTypeCountsMap = getTypeCountsMap;
// map of resolution widths to standard resolution name
var resolutionMap = {
    640: '480p',
    1024: '576p',
    1280: '720p',
    1920: '1080p',
    2560: '1440p',
    3840: '2160p',
    4096: '2160p',
    7680: '4320p',
    8192: '4320p',
};
// function to get the resolution name from a stream
var getResolutionName = function (stream) { return (resolutionMap[Number(stream.width)]); };
exports.getResolutionName = getResolutionName;
// function to get bitrate from stream
var getBitrate = function (stream, mediaInfo) {
    var _a;
    var bitrate = 0;
    if (mediaInfo && mediaInfo.BitRate) {
        // prefer bitrate from mediaInfo
        bitrate = Number(mediaInfo.BitRate);
    }
    else if ((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.BPS) {
        // otherwise fallback to stream data
        bitrate = Number(stream.tags.BPS);
    }
    return bitrate;
};
exports.getBitrate = getBitrate;
// function to get bitrate text from stream
var getBitrateText = function (stream, mediaInfo) {
    var bitrate = (0, exports.getBitrate)(stream, mediaInfo);
    if (bitrate > 0) {
        var kbps = Math.floor(bitrate / 1000);
        if (String(kbps).length > 3) {
            return "".concat((kbps / 1000).toFixed(1), "Mbps");
        }
        return "".concat(kbps, "kbps");
    }
    return undefined;
};
exports.getBitrateText = getBitrateText;
// function to determine if a track is lossless audio
var isLosslessAudio = function (stream, mediaInfo) {
    var _a;
    // if we have media info use it, otherwise assume false
    if ((0, exports.getCodecType)(stream) === 'audio' && mediaInfo) {
        return Boolean(((_a = mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.Compression_Mode) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'lossless');
    }
    return false;
};
exports.isLosslessAudio = isLosslessAudio;
// map of channel count to common user-friendly name
var channelMap = {
    8: '7.1',
    7: '6.1',
    6: '5.1',
    3: '2.1',
    2: '2.0',
    1: '1.0',
};
// function to get the user-friendly channel layout name from a stream
var getChannelsName = function (stream) { return channelMap[Number(stream.channels)]; };
exports.getChannelsName = getChannelsName;
// function to convert user-friendly channel layout to a number
var getChannelCount = function (channelName) {
    if (!channelName) {
        return 0;
    }
    return channelName.split('.')
        .map(Number)
        .reduce(function (last, current) { return last + current; });
};
exports.getChannelCount = getChannelCount;
// function to get the sample rate for a file
var getSampleRate = function (stream, mediaInfo) {
    // prefer from media info
    if (mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.SamplingRate) {
        return Number(mediaInfo.SamplingRate);
    }
    // if unavailable fall back to stream
    if (stream.sample_rate) {
        return Number(stream.sample_rate);
    }
    // if unable to determine return 0
    return 0;
};
exports.getSampleRate = getSampleRate;
// function to get sample rate as text - converted to kHz and returned with units
var getSampleRateText = function (stream, mediaInfo) {
    var sampleRate = (0, exports.getSampleRate)(stream, mediaInfo);
    if (sampleRate > 0) {
        return "".concat(Math.floor(Number(stream.sample_rate) / 1000), "kHz");
    }
    return undefined;
};
exports.getSampleRateText = getSampleRateText;
// function to get the bit depth
var getBitDepth = function (stream, mediaInfo) {
    if (mediaInfo.BitDepth) {
        return Number(mediaInfo.BitDepth);
    }
    if (stream.bits_per_raw_sample) {
        return Number(stream.bits_per_raw_sample);
    }
    return 0;
};
exports.getBitDepth = getBitDepth;
// function to get the bit depth as text
var getBitDepthText = function (stream, mediaInfo) {
    var bitDepth = (0, exports.getBitDepth)(stream, mediaInfo);
    if (bitDepth > 0) {
        return "".concat(bitDepth, "-bit");
    }
    return undefined;
};
exports.getBitDepthText = getBitDepthText;
// map of audio codecs to encoders
var encoderMap = {
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
var getEncoder = function (codec) { return encoderMap[String(codec)]; };
exports.getEncoder = getEncoder;
// function to check if a language is undefined
var isLanguageUndefined = function (stream) {
    var _a;
    return (!((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language) || stream.tags.language === 'und');
};
exports.isLanguageUndefined = isLanguageUndefined;
// function to get the language from a stream with optional support for default value
var getLanguageTag = function (stream, defaultLang) {
    var _a;
    if ((0, exports.isLanguageUndefined)(stream)) {
        return defaultLang !== null && defaultLang !== void 0 ? defaultLang : '';
    }
    return String((_a = stream === null || stream === void 0 ? void 0 : stream.tags) === null || _a === void 0 ? void 0 : _a.language);
};
exports.getLanguageTag = getLanguageTag;
// map language tags to language name
var languageMap = {
    eng: 'English',
};
// function to get language name from tag
var getLanguageName = function (langTag) { var _a; return ((_a = String(languageMap[langTag])) !== null && _a !== void 0 ? _a : ''); };
exports.getLanguageName = getLanguageName;
// map of language tag alternates
var languageTagAlternates = {
    eng: ['eng', 'en', 'en-us', 'en-gb', 'en-ca', 'en-au'],
};
// function to check if a stream language matches one of a list of tags with support for defaulting undefined
var streamMatchesLanguages = function (stream, languageTags, defaultLanguage) {
    // grab the language value with support for optional default
    var streamLanguage = (0, exports.getLanguageTag)(stream, defaultLanguage);
    // create an array with all input tags and all configured alternates
    var allValidTags = __spreadArray(__spreadArray([], languageTags, true), languageTags.flatMap(function (tag) { return (languageTagAlternates[tag]); }), true).filter(function (item) { return item; })
        .filter(function (item, index, items) { return items.indexOf(item) === index; });
    // if unable to determine stream language assume no match
    // if able to check for tag equivalents in our map, if none configured check for equality against input
    return Boolean(streamLanguage && allValidTags.includes(streamLanguage));
};
exports.streamMatchesLanguages = streamMatchesLanguages;
// function to check if a stream matches a single language tag
var streamMatchesLanguage = function (stream, languageTag, defaultLanguage) { return (0, exports.streamMatchesLanguages)(stream, [languageTag], defaultLanguage); };
exports.streamMatchesLanguage = streamMatchesLanguage;
// function to check if a stream appears to be commentary
var streamHasCommentary = function (stream) {
    var _a, _b, _c, _d;
    return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.comment)
        || ((_d = (_c = (_b = stream.tags) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === null || _d === void 0 ? void 0 : _d.includes('commentary')));
};
exports.streamHasCommentary = streamHasCommentary;
// function to check if a stream appears to be descriptive
var streamHasDescriptive = function (stream) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.descriptions)
        || ((_d = (_c = (_b = stream.tags) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === null || _d === void 0 ? void 0 : _d.includes('description'))
        || ((_g = (_f = (_e = stream.tags) === null || _e === void 0 ? void 0 : _e.title) === null || _f === void 0 ? void 0 : _f.toLowerCase()) === null || _g === void 0 ? void 0 : _g.includes('descriptive'))
        || ((_h = stream.disposition) === null || _h === void 0 ? void 0 : _h.visual_impaired)
        || ((_l = (_k = (_j = stream.tags) === null || _j === void 0 ? void 0 : _j.title) === null || _k === void 0 ? void 0 : _k.toLowerCase()) === null || _l === void 0 ? void 0 : _l.includes('sdh')));
};
exports.streamHasDescriptive = streamHasDescriptive;
// function to determine if a stream is standard (not commentary and not descriptive)
var streamIsStandard = function (stream) { return (!(0, exports.streamHasCommentary)(stream) && !(0, exports.streamHasDescriptive)(stream)); };
exports.streamIsStandard = streamIsStandard;
// function to determine if a stream is commentary but NOT descriptive
var streamIsCommentary = function (stream) { return ((0, exports.streamHasCommentary)(stream) && !(0, exports.streamHasDescriptive)(stream)); };
exports.streamIsCommentary = streamIsCommentary;
// function to determine if a stream is descriptive
var streamIsDescriptive = function (stream) { return ((0, exports.streamHasDescriptive)(stream) && !(0, exports.streamHasCommentary)(stream)); };
exports.streamIsDescriptive = streamIsDescriptive;
// function to determine if a stream appears to have both commentary and descriptive properties
var streamIsDescriptiveCommentary = function (stream) { return ((0, exports.streamHasCommentary)(stream) && (0, exports.streamHasDescriptive)(stream)); };
exports.streamIsDescriptiveCommentary = streamIsDescriptiveCommentary;
// function to generate the title for a stream
var generateTitleForStream = function (stream, mediaInfo) {
    var _a, _b, _c, _d;
    var codecType = (0, exports.getCodecType)(stream);
    switch (codecType) {
        case 'video':
            return [(_a = stream === null || stream === void 0 ? void 0 : stream.codec_name) === null || _a === void 0 ? void 0 : _a.toUpperCase(), (0, exports.getResolutionName)(stream), (0, exports.getBitrateText)(stream, mediaInfo)]
                .filter(function (item) { return item; })
                .join(' ');
        case 'audio':
            var audioFlags = [
                (((_b = stream.disposition) === null || _b === void 0 ? void 0 : _b.dub) ? 'dub' : undefined),
                ((0, exports.streamIsDescriptive)(stream) ? 'descriptive' : undefined),
                ((0, exports.streamIsCommentary)(stream) ? 'commentary' : undefined),
            ].filter(function (item) { return item; });
            return [
                (0, exports.getCodecName)(stream, mediaInfo),
                (0, exports.getChannelsName)(stream),
                (0, exports.getBitrateText)(stream, mediaInfo),
                (0, exports.getSampleRateText)(stream, mediaInfo),
                (0, exports.getBitDepthText)(stream, mediaInfo),
                (audioFlags.length > 0) ? "(".concat(audioFlags.join(', '), ")") : undefined,
            ].filter(function (item) { return item; }).join(' ');
        case 'subtitle':
            var subtitleFlags = [
                (((_c = stream.disposition) === null || _c === void 0 ? void 0 : _c.default) ? 'default' : undefined),
                (((_d = stream.disposition) === null || _d === void 0 ? void 0 : _d.forced) ? 'forced' : undefined),
                ((0, exports.streamIsDescriptive)(stream) ? 'descriptive' : undefined),
                ((0, exports.streamIsCommentary)(stream) ? 'commentary' : undefined),
            ].filter(function (item) { return item; });
            return [
                (0, exports.getLanguageName)((0, exports.getLanguageTag)(stream)),
                (subtitleFlags.length > 0) ? "(".concat(subtitleFlags.join(', '), ")") : undefined,
            ].filter(function (item) { return item; })
                .join(' ');
        default:
            return '';
    }
};
exports.generateTitleForStream = generateTitleForStream;
// function to get the title and if undefined generate one
var getTitleForStream = function (stream, mediaInfo) {
    var _a;
    if ((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title) {
        return stream.tags.title;
    }
    return (0, exports.generateTitleForStream)(stream, mediaInfo);
};
exports.getTitleForStream = getTitleForStream;
// function to sort streams
// sorts first by codec type - video, audio, subtitle, {other}
// sorts video by resolution (desc), bitrate (desc)
// sorts audio and subtitles by type (standard, commentary, then descriptive)
// sorts audio by then channels (desc), compression type (lossless, lossy), then bitrate (desc)
// sorts subtitles by default, forced, neither
// fallback for all ties and all non-standard codec types is to keep input order (sort by index)
var streamTypeOrder = ['video', 'audio', 'subtitle'];
var getStreamSorter = function (mediaInfo) { return (function (s1, s2) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    // ==== sort first by stream type ==== //
    // get codec type for both streams
    var s1Type = (0, exports.getCodecType)(s1);
    var s2Type = (0, exports.getCodecType)(s2);
    // get index of each, default to 99, we'll tiebreak non-video/audio/subtitle with alphabetic order
    var s1TypeIdx = (_a = streamTypeOrder.indexOf(s1Type)) !== null && _a !== void 0 ? _a : 99;
    var s2TypeIdx = (_b = streamTypeOrder.indexOf(s2Type)) !== null && _b !== void 0 ? _b : 99;
    if (s1TypeIdx < s2TypeIdx)
        return -1;
    if (s1TypeIdx > s2TypeIdx)
        return 1;
    // either codecs are of same type or both entirely unknown
    if (!streamTypeOrder.includes(s1Type) && !streamTypeOrder.includes(s2Type)) {
        // tiebreaker for nonstandard codecs is alphabetic order
        if (s1Type.localeCompare(s2Type) === -1)
            return -1;
        if (s1Type.localeCompare(s2Type) === 1)
            return 1;
    }
    // failsafe to validate type sorting
    if (s1Type !== s2Type) {
        throw new Error("failed to determine sort order for codec types [".concat(s1Type, "] and [").concat(s2Type, "]"));
    }
    // get media info for each track
    var s1MediaInfo = (0, exports.getMediaInfoTrack)(s1, mediaInfo);
    var s2MediaInfo = (0, exports.getMediaInfoTrack)(s2, mediaInfo);
    // ==== tiebreaker for same-type depends on the type ==== //
    if (s1Type === 'video') {
        // resolution descending
        var s1Resolution = Number((_c = s1 === null || s1 === void 0 ? void 0 : s1.width) !== null && _c !== void 0 ? _c : 0);
        var s2Resolution = Number((_d = s2 === null || s2 === void 0 ? void 0 : s2.width) !== null && _d !== void 0 ? _d : 0);
        if (s1Resolution > s2Resolution)
            return -1;
        if (s1Resolution < s2Resolution)
            return 1;
        // then bitrate descending
        var s1VideoBitrate = (0, exports.getBitrate)(s1, s1MediaInfo);
        var s2VideoBitrate = (0, exports.getBitrate)(s2, s2MediaInfo);
        if (s1VideoBitrate > s2VideoBitrate)
            return -1;
        if (s1VideoBitrate < s2VideoBitrate)
            return 1;
        // tie
        return 0;
    }
    if (s1Type === 'audio' || s1Type === 'subtitle') {
        // sort by stream flags -> standard, commentary, descriptive, then commentary+descriptive
        // standard streams (not commentary or descriptive) come before commentary or descriptive
        if ((0, exports.streamIsStandard)(s1) && !(0, exports.streamIsStandard)(s2))
            return -1;
        if ((0, exports.streamIsStandard)(s2) && !(0, exports.streamIsStandard)(s1))
            return 1;
        // commentary comes before anything with descriptive flags
        if ((0, exports.streamIsCommentary)(s1) && (0, exports.streamHasDescriptive)(s2))
            return -1;
        if ((0, exports.streamIsCommentary)(s2) && (0, exports.streamHasDescriptive)(s1))
            return 1;
        // descriptive comes before descriptive commentary
        if ((0, exports.streamIsDescriptive)(s1) && (0, exports.streamIsDescriptiveCommentary)(s2))
            return -1;
        if ((0, exports.streamIsDescriptive)(s2) && (0, exports.streamIsDescriptiveCommentary)(s1))
            return 1;
        // tiebreakers fork on type
        if (s1Type === 'audio') {
            // channels descending
            var s1Channels = Number((_e = s1 === null || s1 === void 0 ? void 0 : s1.channels) !== null && _e !== void 0 ? _e : 0);
            var s2Channels = Number((_f = s2 === null || s2 === void 0 ? void 0 : s2.channels) !== null && _f !== void 0 ? _f : 0);
            if (s1Channels > s2Channels)
                return -1;
            if (s1Channels < s2Channels)
                return 1;
            // lossless before lossy
            var s1Lossless = (0, exports.isLosslessAudio)(s1, s1MediaInfo);
            var s2Lossless = (0, exports.isLosslessAudio)(s2, s2MediaInfo);
            if (s1Lossless && !s2Lossless)
                return -1;
            if (s2Lossless && !s1Lossless)
                return 1;
            // bitrate descending
            var s1AudioBitrate = (0, exports.getBitrate)(s1, s1MediaInfo);
            var s2AudioBitrate = (0, exports.getBitrate)(s2, s2MediaInfo);
            if (s1AudioBitrate > s2AudioBitrate)
                return -1;
            if (s1AudioBitrate < s2AudioBitrate)
                return 1;
        }
        else if (s1Type === 'subtitle') {
            // default flag descending
            var s1Default = Number((_h = (_g = s1 === null || s1 === void 0 ? void 0 : s1.disposition) === null || _g === void 0 ? void 0 : _g.default) !== null && _h !== void 0 ? _h : 0);
            var s2Default = Number((_k = (_j = s2 === null || s2 === void 0 ? void 0 : s2.disposition) === null || _j === void 0 ? void 0 : _j.default) !== null && _k !== void 0 ? _k : 0);
            if (s1Default > s2Default)
                return -1;
            if (s1Default < s2Default)
                return 1;
            // forced flag descending
            var s1Forced = Number((_m = (_l = s1 === null || s1 === void 0 ? void 0 : s1.disposition) === null || _l === void 0 ? void 0 : _l.forced) !== null && _m !== void 0 ? _m : 0);
            var s2Forced = Number((_p = (_o = s2 === null || s2 === void 0 ? void 0 : s2.disposition) === null || _o === void 0 ? void 0 : _o.forced) !== null && _p !== void 0 ? _p : 0);
            if (s1Forced > s2Forced)
                return -1;
            if (s1Forced < s2Forced)
                return 1;
        }
    }
    // if all else is equal fall back input order
    return s1.index - s2.index;
}); };
exports.getStreamSorter = getStreamSorter;
