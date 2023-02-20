/* eslint-disable */
const details = () => ({
        id: "stonefish_transcode_remove_letterbox",
        Stage: "Pre-processing",
        Name: "Stonefish - Transcode and Remove Letterbox with Handbrake",
        Type: "Video",
        Operation: "Transcode",
        Description: `[Contains built-in filter] specify settings for transcoding with HandBrake`,
        Version: "1.00",
        Tags: "pre-processing,handbrake,configurable",
        Inputs: [
            {
                name: 'output_container',
                type: 'string',
                defaultValue: 'mkv',
                inputUI: {
                    type: 'dropdown',
                    options: ['mkv', 'mp4'],
                },
                tooltip: `select the output container of the new file`,
            },
            {
                name: 'output_codec',
                type: 'string',
                defaultValue: 'h265',
                inputUI: {
                    type: 'dropdown',
                    options: ['h265', 'h264'],
                },
                tooltip:
                    `codec to convert output files to. h264 is more universally supported but h265 will create smaller 
                    files for a comparable visual quality level`,
            },
            {
                name: 'enable_nvenc',
                type: 'boolean',
                defaultValue: false,
                inputUI: {
                    type: 'dropdown',
                    options: ['true', 'false'],
                },
                tooltip: `enable nvenc (NVIDIA GPU) hardware encoder`,
            },
            {
                name: 'encoder_preset',
                type: 'string',
                defaultValue: 'slow',
                inputUI: {
                    type: 'dropdown',
                    options: ['slowest', 'slower', 'slow', 'medium', 'fast', 'faster', 'fastest'],
                },
                tooltip: `encoder preset level. slower typically means smaller files and higher quality`,
            },
            {
                name: 'standard_quality',
                type: 'number',
                defaultValue: 22,
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `the encoder quality (RF) setting to use for encoding standard (non-remux) files. lower numbers 
                    mean higher quality output. however, going too low is not recommended as it will result in massive 
                    files for no gain. 
                    \\n
                    \\nsuggested ranges: 
                    \\nSD: 18-22
                    \\n720p: 19-23
                    \\n1080p: 20-24
                    \\n4k: 22-28
                    \\n
                    \\nsee: https://handbrake.fr/docs/en/latest/workflow/adjust-quality.html for more details`,
            },
            {
                name: 'remux_quality',
                type: 'number',
                defaultValue: 20,
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `the encoder quality (RF) setting to use for encoding standard (non-remux) files. lower numbers 
                    mean higher quality output. however, going too low is not recommended as it will result in massive 
                    files for no gain. 
                    \\n
                    \\nsuggested ranges: 
                    \\nSD: 18-22
                    \\n720p: 19-23
                    \\n1080p: 20-24
                    \\n4k: 22-28
                    \\n
                    \\nsee: https://handbrake.fr/docs/en/latest/workflow/adjust-quality.html for more details`,
            },
            {
                name: 'remux_keyword',
                type: 'string',
                defaultValue: 'Remux',
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `keyword to check for in file names to determine if a file is a remux. if this keyword is not found 
                    then the file will be treated as a standard (non-remux) file for determining the quality`,
            },
            {
                name: 'crop_mode',
                type: 'string',
                defaultValue: 'conservative',
                inputUI: {
                    type: 'dropdown',
                    options: ['auto', 'conservative', 'none']
                },
                tooltip:
                    `mode to use when cropping the video. conservative and auto will both attempt to auto-detect the 
                    crop ratio and handle appropriately, with conservative being a little less aggressive. none will 
                    disable auto crop entirely`,
            },
            {
                name: 'preview_count',
                type: 'number',
                defaultValue: 32,
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `number of image previews to generate and scan when trying to detect the autocrop values. more 
                    previews will result in a more accurate autocrop value, but will take longer to generate and scan`
            },
            {
                name: 'minimum_bitrate',
                type: 'number',
                defaultValue: 8000,
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `minimum file bitrate (in Kbps) in order to consider transcoding this file. attempting to transcode 
                    a file that already has a low bitrate can result in unacceptable quality.`
            },
            {
                name: 'codecs_to_exclude',
                type: 'string',
                defaultValue: 'hevc',
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `comma-separated list of input codecs that should be excluded when processing.
                     \\nFor example, if transcoding into hevc (h265), then add a filter to block it from being 
                     repeatedly transcoded
                     \\n
                     \\nCommon video codecs:
                     \\nhevc
                     \\nh264
                     \\nmpeg4
                     \\nmpeg2video
                     \\nvp8
                     \\nvp9
                     \\nExample:
                     \\n
                     hevc
                     \\nExample:
                     \\n
                     mp3,aac,dts
                     `,
            },
            {
                name: 'block_keyword',
                type: 'string',
                defaultValue: '',
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `keyword or string of text to check for in the file name to prevent it from being transcoded. I use
                    this to prevent transcoding files I want to keep in Remux form or otherwise block from being 
                    transcoded without blocking them from going through the rest of the plugin stack (remove data 
                    streams, add stereo audio, re-order streams, etc)`
            },
        ],
    }
);

// eslint-disable-next-line no-unused-vars
const plugin = (file, librarySettings, inputs, otherArguments) => {
    // import dependencies
    const lib = require('../methods/lib')();
    const execSync = require("child_process").execSync;

    // eslint-disable-next-line no-unused-vars,no-param-reassign
    inputs = lib.loadDefaultValues(inputs, details);

    // must return this object
    const response = {
        processFile: false,
        preset: "",
        container: ".mkv",
        handBrakeMode: true,
        FFmpegMode: false,
        reQueueAfter: false,
        infoLog: "",
    };


    //// check to see if plugin can run on this file ////
    // check if file is a video
    if (file.fileMedium !== "video") {
        response.infoLog += "☒ File is not a video - skipping this plugin.\n";
        return response;
    }
    response.infoLog += '☑ File is a video \n';

    // check for block keyword in file name
    if (file._id.toLowerCase().includes(inputs.block_keyword.toLowerCase())) {
        response.infoLog += "☒ File contains block keyword - skipping this plugin.\n";
        return response;
    }

    // check if bitrate is high enough to process
    const thisBitrate = Math.floor(parseInt(file.bit_rate) / 1000); // convert to Kbps
    const minimumBitrate = parseInt(inputs.minimum_bitrate);
    if (thisBitrate < minimumBitrate) {
        response.infoLog +=
            `☒ File bitrate is ${thisBitrate.toLocaleString()} Kbps but minimum is set to ` +
            `${minimumBitrate.toLocaleString()} Kbps - skipping this plugin \n`;
        return response;
    } else {
        response.infoLog +=
            `☑ File bitrate ${thisBitrate.toLocaleString()} Kbps exceeds minimum of ` +
            `${minimumBitrate.toLocaleString()} Kbps \n`;
    }

    //// check for letterbox ////
    // set grep command depending on OS
    const os = require('os');
    let grep = 'grep -i';
    if (os.platform() === 'win32') {
        grep = 'findstr /i';
    }

    // get paths to source file and handbrake executable
    let source = (file.meta.SourceFile);
    let handbrake = (otherArguments.handbrakePath);

    // set autocrop settings
    let autocrop_settings = `--crop-mode ${inputs.crop_mode} --previews ${inputs.preview_count}:0`;

    // construct handbrake scan command
    let handbrake_scan = `"${handbrake}" -i "${source}" ${autocrop_settings} --scan  2>&1 | ${grep} "autocrop:"`;

    // execute handbrake scan to get autocrop values
    let autocrop_result = execSync(handbrake_scan).toString();

    // returns something like "+ autocrop: 132/132/0/0" - need to slice off the numbers for parsing
    let autocrop;
    if (autocrop_result) {
        try {
            // slice at the ':' and take the second half, then trim it
            autocrop = autocrop_result.split(':')[1].trim();
        } catch (err) {
            // unexpected return value - just swallow and assume no crop
        }
    }

    // check if crop is required
    let cropRequired = false;
    if (autocrop) {
        let crop_vals = autocrop.toString().split("/");
        try {
            if (crop_vals[0] > 10 || crop_vals[1] > 10 || crop_vals[2] > 10 || crop_vals[3] > 10) {
                cropRequired = true;
            }
        } catch (err) {
            // autocrop return value unexpected format - assume no cropping
        }
    }
    if (cropRequired) {
        response.infoLog += `☑ Handbrake determined autocrop is required: [${autocrop}] \n`;
    } else {
        response.infoLog += `☑ Handbrake determined autocrop is not required: [${autocrop}] \n`;
    }


    //// determine if we need to transcode ////
    const inputCodec = file.ffProbeData.streams[0].codec_name;
    const outputCodec = inputs.output_codec;

    // check if codec is in the skip list
    if (inputs.codecs_to_exclude.toLowerCase().includes(inputCodec.toLowerCase())) {
        if (!cropRequired) {
            response.infoLog += `☑ File is already ${inputCodec} and no crop is required - skipping transcode. \n`;
            return response;
        } else {
            response.infoLog += `☑ File is already ${inputCodec} but crop is required - starting transcode. \n`;
        }
    } else {
        response.infoLog += `☑ File is ${inputCodec} but target codec is ${outputCodec} - starting transcode. \n`;
    }


    //// transcode required - construct handbrake args ////
    // set output container format
    let format = `--format av_${inputs.output_container}`;

    // set encoder
    let encoder = '--encoder ';
    if (inputs.enable_nvenc) {
        encoder += `nvenc_${outputCodec} --encopts=\"rc-lookahead=10\"`;
    } else if (outputCodec === 'h264') {
        encoder += 'x264';
    } else if (outputCodec === 'h265') {
        encoder += 'x265';
    }

    // set encoder preset
    let encoder_preset = `--encoder-preset ${inputs.encoder_preset}`;

    // determine encoder quality depending on if this is a remux release
    let quality = '--quality ';
    if (file._id.toLowerCase().includes(inputs.remux_keyword.toLowerCase())) {
        quality += inputs.remux_quality;
    } else {
        quality += inputs.standard_quality;
    }

    // create handbrake command
    response.preset =
        `${format} ${encoder} ${encoder_preset} ${quality} ${autocrop_settings} --markers --align-av ` +
        `--audio-lang-list eng --all-audio --aencoder copy --audio-copy-mask aac,ac3,eac3,truehd,dts,dtshd,mp3,flac ` +
        `--audio-fallback aac --mixdown dp12 --arate auto --subtitle-lang-list eng --native-language eng --native-dub `;
    response.container = inputs.output_container;
    response.processFile = true;
    response.reQueueAfter = true;
    return response;
};

module.exports.details = details;
module.exports.plugin = plugin;