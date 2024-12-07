"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.getStreamSort = exports.getTitle = exports.isStreamDescriptive = exports.isStreamCommentary = exports.streamMatchesLanguage = exports.getLanguageName = exports.getLanguageTag = exports.isLanguageUndefined = exports.getEncoder = exports.getChannelCount = exports.getChannelsName = exports.getBitrate = exports.getResolutionName = exports.getTypeCountsMap = exports.getStreamsByType = exports.generateTypeIndexes = void 0;
// function to set a typeIndex field on each stream in the input array
var generateTypeIndexes = function (streams) { return (streams.map(function (stream) { return stream.codec_type; })
    .filter(function (value, index, array) { return array.indexOf(value) === index; })
    .forEach(function (codecType) {
    // for each unique codec type set type index
    streams.filter(function (stream) { return stream.codec_type === codecType; })
        .forEach(function (stream, index) {
        // eslint-disable-next-line no-param-reassign
        stream.typeIndex = index;
    });
})); };
exports.generateTypeIndexes = generateTypeIndexes;
// function to get a map of streams keyed on codec type
var getStreamsByType = function (streams) { return (streams.reduce(function (map, stream) {
    var _a;
    return (__assign(__assign({}, map), (_a = {}, _a[stream.codec_type] = __spreadArray(__spreadArray([], (map[stream.codec_type] || []), true), [stream], false), _a)));
}, {})); };
exports.getStreamsByType = getStreamsByType;
// function to get a map of how many streams of each type are present
var getTypeCountsMap = function (streams) { return (streams
    .reduce(function (counts, stream) {
    var _a;
    // eslint-disable-next-line no-param-reassign
    counts[stream.codec_type] = ((_a = counts[stream.codec_type]) !== null && _a !== void 0 ? _a : 0) + 1;
    return counts;
}, {})); };
exports.getTypeCountsMap = getTypeCountsMap;
// map of resolution widths to standard resolution name
var resolutionMap = {
    640: '480p',
    1280: '720p',
    1920: '1080p',
    2560: '1440p',
    3840: '4k',
};
// function to get the resolution name from a stream
var getResolutionName = function (stream) { return (resolutionMap[Number(stream.width)]); };
exports.getResolutionName = getResolutionName;
// function to get bitrate from stream
var getBitrate = function (stream) {
    var _a;
    if ((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.BPS) {
        var kbps = Math.floor(Number(stream.tags.BPS) / 1000);
        if (String(kbps).length > 3) {
            return "".concat((kbps / 1000).toFixed(1), "Mbps");
        }
        return "".concat(kbps, "kbps");
    }
    return '';
};
exports.getBitrate = getBitrate;
// map of channel count to common user-friendly name
var channelMap = {
    8: '7.1',
    7: '6.1',
    6: '5.1',
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
var streamMatchesLanguage = function (stream, languageTags, defaultLanguage) {
    // grab the language value with support for optional default
    var streamLanguage = (0, exports.getLanguageTag)(stream, defaultLanguage);
    // create an array with all input tags and all configured alternates
    var allValidTags = __spreadArray(__spreadArray([], languageTags, true), languageTags.flatMap(function (tag) { return (languageTagAlternates[tag]); }), true).filter(function (item) { return item; })
        .filter(function (item, index, items) { return items.indexOf(item) === index; });
    // if unable to determine stream language assume no match
    // if able to check for tag equivalents in our map, if none configured check for equality against input
    return Boolean(streamLanguage && allValidTags.includes(streamLanguage));
};
exports.streamMatchesLanguage = streamMatchesLanguage;
// function to determine if a stream is commentary
var isStreamCommentary = function (stream) {
    var _a, _b, _c, _d;
    return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.comment)
        || ((_d = (_c = (_b = stream.tags) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === null || _d === void 0 ? void 0 : _d.includes('commentary')));
};
exports.isStreamCommentary = isStreamCommentary;
// function to determine if a stream is descriptive
var isStreamDescriptive = function (stream) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.descriptions)
        || ((_d = (_c = (_b = stream.tags) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === null || _d === void 0 ? void 0 : _d.includes('description'))
        || ((_g = (_f = (_e = stream.tags) === null || _e === void 0 ? void 0 : _e.title) === null || _f === void 0 ? void 0 : _f.toLowerCase()) === null || _g === void 0 ? void 0 : _g.includes('descriptive'))
        || ((_h = stream.disposition) === null || _h === void 0 ? void 0 : _h.visual_impaired)
        || ((_l = (_k = (_j = stream.tags) === null || _j === void 0 ? void 0 : _j.title) === null || _k === void 0 ? void 0 : _k.toLowerCase()) === null || _l === void 0 ? void 0 : _l.includes('sdh')));
};
exports.isStreamDescriptive = isStreamDescriptive;
// function to get the title of a stream
var getTitle = function (stream) {
    var _a, _b, _c, _d, _e, _f, _g;
    if ((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title) {
        return stream.tags.title;
    }
    var codecType = stream.codec_type.toLowerCase();
    switch (codecType) {
        case 'video':
            return [(_b = stream === null || stream === void 0 ? void 0 : stream.codec_name) === null || _b === void 0 ? void 0 : _b.toUpperCase(), (0, exports.getResolutionName)(stream), (0, exports.getBitrate)(stream)]
                .filter(function (item) { return item; })
                .join(' ');
        case 'audio':
            var audioFlags = [
                (((_c = stream.disposition) === null || _c === void 0 ? void 0 : _c.default) ? 'default' : undefined),
                (((_d = stream.disposition) === null || _d === void 0 ? void 0 : _d.dub) ? 'dub' : undefined),
                ((0, exports.isStreamDescriptive)(stream) ? 'descriptive' : undefined),
                ((0, exports.isStreamCommentary)(stream) ? 'commentary' : undefined),
            ].filter(function (item) { return item; });
            return [
                (_e = stream === null || stream === void 0 ? void 0 : stream.codec_name) === null || _e === void 0 ? void 0 : _e.toUpperCase(),
                (0, exports.getChannelsName)(stream),
                (0, exports.getBitrate)(stream),
                ((stream.sample_rate) ? "".concat(Math.floor(Number(stream.sample_rate) / 1000), "kHz") : undefined),
                ((stream.bits_per_raw_sample) ? "".concat(stream.bits_per_raw_sample, "-bit") : undefined),
                (0, exports.getLanguageName)((0, exports.getLanguageTag)(stream)),
                (audioFlags.length > 0) ? "(".concat(audioFlags.join(', '), ")") : undefined,
            ].filter(function (item) { return item !== undefined; })
                .join(' ');
        case 'subtitle':
            var subtitleFlags = [
                (((_f = stream.disposition) === null || _f === void 0 ? void 0 : _f.default) ? 'default' : undefined),
                (((_g = stream.disposition) === null || _g === void 0 ? void 0 : _g.forced) ? 'forced' : undefined),
                ((0, exports.isStreamDescriptive)(stream) ? 'descriptive' : undefined),
                ((0, exports.isStreamCommentary)(stream) ? 'commentary' : undefined),
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
exports.getTitle = getTitle;
// function to get a function to sort streams
// general concept here is non-descriptive/non-commentary, commentary, descriptive
// sub-sorting tends to favor quality first (higher resolution, more channels, higher bitrate)
// subtitle sorting puts default/forced over others
var getStreamSort = function (codecType) {
    switch (codecType) {
        case 'video':
            // sort by resolution (desc) then bitrate (desc)
            return function (s1, s2) {
                var _a, _b;
                // resolution descending
                var w1 = Number((s1 === null || s1 === void 0 ? void 0 : s1.width) || 0);
                var w2 = Number((s2 === null || s2 === void 0 ? void 0 : s2.width) || 0);
                if (w1 > w2)
                    return -1;
                if (w1 < w2)
                    return 1;
                // then bitrate descending
                var br1 = Number(((_a = s1 === null || s1 === void 0 ? void 0 : s1.tags) === null || _a === void 0 ? void 0 : _a.BPS) || 0);
                var br2 = Number(((_b = s2 === null || s2 === void 0 ? void 0 : s2.tags) === null || _b === void 0 ? void 0 : _b.BPS) || 0);
                if (br1 > br2)
                    return -1;
                if (br1 < br2)
                    return 1;
                // tie
                return 0;
            };
        case 'audio':
            // sort by commentary, descriptive, bitrate (desc)
            return function (s1, s2) {
                var _a, _b;
                // regular streams come before commentary/descriptive
                if (!(0, exports.isStreamCommentary)(s1) && ((0, exports.isStreamCommentary)(s2) || (0, exports.isStreamDescriptive)(s2)))
                    return -1;
                if (((0, exports.isStreamCommentary)(s1) || (0, exports.isStreamDescriptive)(s1)) && !(0, exports.isStreamCommentary)(s2))
                    return 1;
                // commentary comes before descriptive
                if ((0, exports.isStreamCommentary)(s1) && (0, exports.isStreamDescriptive)(s2))
                    return -1;
                if ((0, exports.isStreamDescriptive)(s1) && (0, exports.isStreamCommentary)(s2))
                    return 1;
                // channels descending
                var c1 = Number((s1 === null || s1 === void 0 ? void 0 : s1.channels) || 0);
                var c2 = Number((s2 === null || s2 === void 0 ? void 0 : s2.channels) || 0);
                if (c1 > c2)
                    return -1;
                if (c1 < c2)
                    return 1;
                // then bitrate descending
                var br1 = Number(((_a = s1 === null || s1 === void 0 ? void 0 : s1.tags) === null || _a === void 0 ? void 0 : _a.BPS) || 0);
                var br2 = Number(((_b = s2 === null || s2 === void 0 ? void 0 : s2.tags) === null || _b === void 0 ? void 0 : _b.BPS) || 0);
                if (br1 > br2)
                    return -1;
                if (br1 < br2)
                    return 1;
                // tie
                return 0;
            };
        case 'subtitle':
            // sort by commentary/descriptive/default/forced
            return function (s1, s2) {
                var _a, _b, _c, _d;
                // regular streams come before commentary/descriptive
                if (!(0, exports.isStreamCommentary)(s1) && ((0, exports.isStreamCommentary)(s2) || (0, exports.isStreamDescriptive)(s2)))
                    return -1;
                if (((0, exports.isStreamCommentary)(s1) || (0, exports.isStreamDescriptive)(s1)) && !(0, exports.isStreamCommentary)(s2))
                    return 1;
                // commentary comes before descriptive
                if ((0, exports.isStreamCommentary)(s1) && (0, exports.isStreamDescriptive)(s2))
                    return -1;
                if ((0, exports.isStreamDescriptive)(s1) && (0, exports.isStreamCommentary)(s2))
                    return 1;
                // forced flag descending
                var f1 = Number(((_a = s1 === null || s1 === void 0 ? void 0 : s1.disposition) === null || _a === void 0 ? void 0 : _a.forced) || 0);
                var f2 = Number(((_b = s2 === null || s2 === void 0 ? void 0 : s2.disposition) === null || _b === void 0 ? void 0 : _b.forced) || 0);
                if (f1 > f2)
                    return -1;
                if (f1 < f2)
                    return 1;
                // then default flag descending
                var d1 = Number(((_c = s1 === null || s1 === void 0 ? void 0 : s1.disposition) === null || _c === void 0 ? void 0 : _c.default) || 0);
                var d2 = Number(((_d = s2 === null || s2 === void 0 ? void 0 : s2.disposition) === null || _d === void 0 ? void 0 : _d.default) || 0);
                if (d1 > d2)
                    return -1;
                if (d1 < d2)
                    return 1;
                // if all else is equal lower index comes first
                if (s1.typeIndex < s2.typeIndex)
                    return -1;
                if (s1.typeIndex > s2.typeIndex)
                    return 1;
                // tie
                return 0;
            };
        default:
            // don't sort
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return function (o1, o2) { return 0; };
    }
};
exports.getStreamSort = getStreamSort;
