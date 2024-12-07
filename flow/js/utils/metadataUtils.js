"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreamSort = exports.getTitle = exports.isDescriptive = exports.isCommentary = exports.getLanguage = exports.getBitrate = exports.getResolutionName = exports.getChannelsName = void 0;
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
// function to get the language from a stream
var getLanguage = function (stream) {
    var _a, _b;
    if (!((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language) || stream.tags.language === 'und') {
        return '';
    }
    return String((_b = stream === null || stream === void 0 ? void 0 : stream.tags) === null || _b === void 0 ? void 0 : _b.language);
};
exports.getLanguage = getLanguage;
// function to determine if a stream is commentary
var isCommentary = function (stream) {
    var _a, _b, _c, _d;
    return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.comment)
        || ((_d = (_c = (_b = stream.tags) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === null || _d === void 0 ? void 0 : _d.includes('commentary')));
};
exports.isCommentary = isCommentary;
// function to determine if a stream is descriptive
var isDescriptive = function (stream) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.descriptions)
        || ((_d = (_c = (_b = stream.tags) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === null || _d === void 0 ? void 0 : _d.includes('description'))
        || ((_g = (_f = (_e = stream.tags) === null || _e === void 0 ? void 0 : _e.title) === null || _f === void 0 ? void 0 : _f.toLowerCase()) === null || _g === void 0 ? void 0 : _g.includes('descriptive'))
        || ((_h = stream.disposition) === null || _h === void 0 ? void 0 : _h.visual_impaired)
        || ((_l = (_k = (_j = stream.tags) === null || _j === void 0 ? void 0 : _j.title) === null || _k === void 0 ? void 0 : _k.toLowerCase()) === null || _l === void 0 ? void 0 : _l.includes('sdh')));
};
exports.isDescriptive = isDescriptive;
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
                ((0, exports.isDescriptive)(stream) ? 'descriptive' : undefined),
                ((0, exports.isCommentary)(stream) ? 'commentary' : undefined),
            ].filter(function (item) { return item; });
            return [
                (_e = stream === null || stream === void 0 ? void 0 : stream.codec_name) === null || _e === void 0 ? void 0 : _e.toUpperCase(),
                (0, exports.getChannelsName)(stream),
                (0, exports.getBitrate)(stream),
                ((stream.sample_rate) ? "".concat(Math.floor(Number(stream.sample_rate) / 1000), "kHz") : undefined),
                ((stream.bits_per_raw_sample) ? "".concat(stream.bits_per_raw_sample, "-bit") : undefined),
                (0, exports.getLanguage)(stream),
                (audioFlags.length > 0) ? "(".concat(audioFlags.join(', '), ")") : undefined,
            ].filter(function (item) { return item !== undefined; })
                .join(' ');
        case 'subtitle':
            var subtitleFlags = [
                (((_f = stream.disposition) === null || _f === void 0 ? void 0 : _f.default) ? 'default' : undefined),
                (((_g = stream.disposition) === null || _g === void 0 ? void 0 : _g.forced) ? 'forced' : undefined),
                ((0, exports.isDescriptive)(stream) ? 'descriptive' : undefined),
                ((0, exports.isCommentary)(stream) ? 'commentary' : undefined),
            ].filter(function (item) { return item; });
            return [
                (0, exports.getLanguage)(stream),
                (subtitleFlags.length > 0) ? "(".concat(subtitleFlags.join(', '), ")") : undefined,
            ].filter(function (item) { return item; })
                .join(' ');
        default:
            return '';
    }
};
exports.getTitle = getTitle;
// function to get a function to sort streams. this is generally quality first
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
                if (!(0, exports.isCommentary)(s1) && ((0, exports.isCommentary)(s2) || (0, exports.isDescriptive)(s2)))
                    return -1;
                if (((0, exports.isCommentary)(s1) || (0, exports.isDescriptive)(s1)) && !(0, exports.isCommentary)(s2))
                    return 1;
                // commentary comes before descriptive
                if ((0, exports.isCommentary)(s1) && (0, exports.isDescriptive)(s2))
                    return -1;
                if ((0, exports.isDescriptive)(s1) && (0, exports.isCommentary)(s2))
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
                if (!(0, exports.isCommentary)(s1) && ((0, exports.isCommentary)(s2) || (0, exports.isDescriptive)(s2)))
                    return -1;
                if (((0, exports.isCommentary)(s1) || (0, exports.isDescriptive)(s1)) && !(0, exports.isCommentary)(s2))
                    return 1;
                // commentary comes before descriptive
                if ((0, exports.isCommentary)(s1) && (0, exports.isDescriptive)(s2))
                    return -1;
                if ((0, exports.isDescriptive)(s1) && (0, exports.isCommentary)(s2))
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
