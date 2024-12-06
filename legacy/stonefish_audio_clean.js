/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
    id: 'stonefish_audio_clean',
    Stage: 'Pre-processing',
    Name: 'Stonefish - Clean Audio Streams',
    Type: 'Audio',
    Operation: 'Transcode',
    Description: 'This plugin keeps only specified language tracks & can tags tracks with  an unknown language. \n\n',
    Version: '2.4',
    Tags: 'pre-processing,ffmpeg,audio only,configurable',
    Inputs: [{
        name: 'language', type: 'string', defaultValue: 'eng,und', inputUI: {
            type: 'text',
        }, tooltip: `Specify language tag/s here for the audio tracks you'd like to keep
                    \\nRecommended to keep "und" as this stands for undertermined
                    \\nSome files may not have the language specified.
                    \\nMust follow ISO-639-2 3 letter format. https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes
                    \\nExample:\\n
                    eng

                    \\nExample:\\n
                    eng,und

                    \\nExample:\\n
                    eng,und,jpn`,
    }, {
        name: 'commentary', type: 'boolean', defaultValue: false, inputUI: {
            type: 'dropdown', options: ['false', 'true',],
        }, tooltip: `Specify if audio tracks that contain commentary/description should be removed.
                    \\nExample:\\n
                    true

                    \\nExample:\\n
                    false`,
    }, {
        name: 'tag_language', type: 'string', defaultValue: '', inputUI: {
            type: 'text',
        }, tooltip: `Specify a single language for audio tracks with no language or unknown language to be tagged with.
                    \\nYou must have "und" in your list of languages to keep for this to function.
                    \\nMust follow ISO-639-2 3 letter format. https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes
                    \\nLeave empty to disable.
                    \\nExample:\\n
                    eng

                    \\nExample:\\n
                    por`,
    }, {
        name: 'tag_title', type: 'boolean', defaultValue: false, inputUI: {
            type: 'dropdown', options: ['false', 'true',],
        }, tooltip: `Specify audio tracks with no title to be tagged with the number of channels they contain.
                    \\nDo NOT use this with mp4, as mp4 does not support title tags.
                    \\nExample:\\n
                    true

                    \\nExample:\\n
                    false`,
    },],
});

// eslint-disable-next-line no-unused-vars
const plugin = (file, librarySettings, inputs, otherArguments) => {
    const lib = require('../methods/lib')();
    // eslint-disable-next-line no-unused-vars,no-param-reassign
    inputs = lib.loadDefaultValues(inputs, details);
    const response = {
        processFile: false,
        preset: '',
        container: `.${file.container}`,
        handBrakeMode: false,
        FFmpegMode: true,
        reQueueAfter: false,
        infoLog: '',
    };

    // Check if file is a video. If it isn't then exit plugin.
    if (file.fileMedium !== 'video') {
        // eslint-disable-next-line no-console
        console.log('File is not video');
        response.infoLog += '☒ File is not video \n';
        response.processFile = false;
        return response;
    }

    // Check if inputs.language has been configured. If it hasn't then exit plugin.
    if (inputs.language === '') {
        response.infoLog += '☒ Language/s options not set, please configure required options. Skipping this plugin.  \n';
        response.processFile = false;
        return response;
    }

    // Set up required variables.
    const language = inputs.language.split(',');
    let ffmpegCommandInsert = '';
    let convert = false;
    let audioIdx = 0;
    let audioStreamsRemoved = 0;
    let map_channels_idx = new Map();
    let map_audio_idx = new Map();
    const audioStreamCount = file.ffProbeData.streams.filter((row) => row.codec_type.toLowerCase() === 'audio',).length;
    response.infoLog += `☑ Checking ${file.ffProbeData.streams.length} total streams (${audioStreamCount} audio) for unwanted languages and duplicates \n`;

    for (let i = 0; i < file.ffProbeData.streams.length; i++) {
        // Catch error here incase the language metadata is completely missing.
        try {
            // store index mapping from stream index to audio-stream index
            map_audio_idx.set(i, audioIdx);
            // only process audio streams
            if (file.ffProbeData.streams[i].codec_type.toLowerCase() === 'audio') {
                // checks if the tracks language code does not match any of the languages entered in inputs.language.
                try {
                    if (language.indexOf(file.ffProbeData.streams[i].tags.language.toLowerCase(),) === -1) {
                        audioStreamsRemoved += 1;
                        ffmpegCommandInsert += `-map -0:a:${audioIdx} `;
                        response.infoLog += `☒ Audio stream 0:a:${audioIdx} has unwanted language tag ${file.ffProbeData.streams[i].tags.language.toLowerCase()}, removing. \n`;
                        convert = true;
                        continue;
                    }
                } catch (err) {
                    // swallow
                }

                // remove commentary streams if configured to do so
                try {
                    // Check if inputs.commentary is set to true
                    // AND then checks for stream titles with the following "commentary, description, sdh".
                    // Removing any streams that are applicable.
                    let title = file.ffProbeData.streams[i].tags.title;
                    if (inputs.commentary === true && (title.toLowerCase().includes('commentary')
                        || title.toLowerCase().includes('description')
                        || title.toLowerCase().includes('sdh'))) {
                        audioStreamsRemoved += 1;
                        ffmpegCommandInsert += `-map -0:a:${audioIdx} `;
                        response.infoLog += `☒ Audio stream 0:a:${audioIdx} detected as being descriptive, removing. \n`;
                        convert = true;
                        continue;
                    }
                } catch (err) {
                    // Error
                }

                // if configured set language tag for untagged tracks
                try {
                    if (inputs.tag_language !== '') {
                        // Checks if the tags metadata is completely missing.
                        // If so this would cause playback to show language as "undefined".
                        // No catch error here otherwise it would never detect the metadata as missing.
                        if (typeof file.ffProbeData.streams[i].tags === 'undefined'
                            || typeof file.ffProbeData.streams[i].tags.language === 'undefined'
                            || file.ffProbeData.streams[i].tags.language.toLowerCase().includes('und')) {
                            ffmpegCommandInsert += `-metadata:s:a:${audioIdx} language=${inputs.tag_language} `;
                            response.infoLog += `☒ Audio stream 0:a:${audioIdx} detected as having no language, tagging as ${inputs.tag_language}. \n`;
                            convert = true;
                        }
                    }
                } catch (err) {
                    // Error
                }

                // set audio stream title if required
                try {
                    if (inputs.tag_title === true && typeof title === 'undefined') {
                        if (file.ffProbeData.streams[i].channels === 8) {
                            ffmpegCommandInsert += `-metadata:s:a:${audioIdx} title="7.1" `;
                            response.infoLog += `☒ Audio stream 0:a:${audioIdx} detected as 8 channel with no title, tagging. \n`;
                            convert = true;
                        }
                        if (file.ffProbeData.streams[i].channels === 6) {
                            ffmpegCommandInsert += `-metadata:s:a:${audioIdx} title="5.1" `;
                            response.infoLog += `☒ Audio stream 0:a:${audioIdx} detected as 6 channel with no title, tagging. \n`;
                            convert = true;
                        }
                        if (file.ffProbeData.streams[i].channels === 2) {
                            ffmpegCommandInsert += `-metadata:s:a:${audioIdx} title="2.0" `;
                            response.infoLog += `☒ Audio stream 0:a:${audioIdx} detected as 2 channel with no title, tagging. \n`;
                            convert = true;
                        }
                    }
                } catch (err) {
                    // Error
                }

                // group audio streams by language:channels to keep highest bitrate
                try {
                    // construct channel key using language + : + channels
                    let channelKey = file.ffProbeData.streams[i].tags.language.toLowerCase() + ":" + file.ffProbeData.streams[i].channels;
                    if (map_channels_idx.has(channelKey)) {
                        // add this index to array stored for this language:channel
                        map_channels_idx.get(channelKey).push(i);
                    } else {
                        // new combination, store it
                        let arr = [];
                        arr.push(i);
                        map_channels_idx.set(channelKey, arr);
                    }
                } catch (err) {
                    // swallow
                }

                // increment audio stream index
                audioIdx += 1;
            }
        } catch (err) {
            // Error
        }
    }

    // post-process our streams grouped by language:channel to remove duplicates keeping highest bitrate
    for (const key of map_channels_idx.keys()) {
        let idx_arr = map_channels_idx.get(key);
        if (idx_arr.length > 1) {
            // more than one audio stream for this language:channels combo - find highest and remove the rest
            response.infoLog += `☒ found multiple audio streams for [${key}] at indexes [${idx_arr}], checking for highest bitrate version to keep \n`;
            let highestBitrate = 0;
            let highestBitrateIdx = -1;
            for (const idx of idx_arr) {
                let thisBitrate = file.ffProbeData.streams[idx].sample_rate;
                if (thisBitrate > highestBitrate) {
                    highestBitrateIdx = idx;
                    highestBitrate = thisBitrate;
                }
            }
            // remove all but highest
            for (const idx of idx_arr) {
                if (idx != highestBitrateIdx) {
                    let audio_idx = map_audio_idx.get(idx);
                    audioStreamsRemoved += 1;
                    ffmpegCommandInsert += `-map -0:a:${audio_idx} `;
                    response.infoLog += `☒ Audio stream 0:a:${audio_idx} is a duplicate for language:channels [${key}], flagging for removal. \n`;
                    convert = true;
                }
            }
        }
    }

    // Failsafe to cancel processing if all streams would be removed following this plugin
    if (audioStreamsRemoved === audioStreamCount) {
        response.infoLog += '☒ Cancelling plugin otherwise all audio tracks would be removed. \n';
        response.processFile = false;
        return response;
    }

    // Convert file if convert variable is set to true.
    if (convert === true) {
        response.processFile = true;
        response.infoLog += `☑ Starting file transcode to remove unwanted streams and tag unlabled ones \n`;
        response.preset = `, -map 0 ${ffmpegCommandInsert} -c copy -max_muxing_queue_size 9999`;
        response.container = `.${file.container}`;
        response.reQueueAfter = true;
    } else {
        response.processFile = false;
        response.infoLog += "☑ File doesn't contain audio tracks which are unwanted or that require tagging.\n";
    }
    return response;
};

module.exports.details = details;
module.exports.plugin = plugin;

