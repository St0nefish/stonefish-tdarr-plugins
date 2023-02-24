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
                name: 'force_crop',
                type: 'boolean',
                defaultValue: false,
                inputUI: {
                    type: 'dropdown',
                    options: ['true', 'false'],
                },
                tooltip:
                    `force re-encoding if letterboxing is detected even if the file is already in the desired output 
                    codec. this will use the 'crop_mode' and 'preview_count' settings below both while using HandBrake 
                    --scan to detect letterboxing and when running the final encode. typically this works fine but on 
                    occasion I have seen it get stuck in a loop when the encode fails to remove the letterbox.`,
            },
            {
                name: 'crop_min_pixels',
                type: 'number',
                defaultValue: 10,
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `minimum number of pixels detected as black bars on the top/bottom/left/right in order to force 
                    crop a video even if it's already in the desired output codec. this setting is only used if the 
                    force_crop option is enabled.`,
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
                    disable auto crop entirely. 
                    \\n
                    \\n
                    do not use crop mode 'none' and enable 'force_crop' or your transcodes will get stuck in an 
                    infinite loop. 'none' should only be used if you wish to keep the black bars on all content.`,
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
                defaultValue: 10000,
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
                defaultValue: 'hevc,h265,x265',
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `(optional) comma-separated list of input codecs that should be excluded when processing unless 
                    force_crop is enabled, in which case HandBrake will be used to detect for letterboxing and if 
                    found the file will be re-encoded anyway to remove that letterbox. Default value lists several 
                    variations of h265 to prevent infinite loops when using the default output codec. 
                     \\n
                     \\nExample:
                     \\n
                     hevc,h265,x265 `,
            },
            {
                name: 'block_keywords',
                type: 'string',
                defaultValue: '',
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `(optional) comma-separated list of keywords or strings of text to check for in the file name to 
                    prevent it from being transcoded. I use this to prevent transcoding files I want to keep in Remux 
                    form or otherwise block from being transcoded without blocking them from going through the rest of 
                    the plugin stack (remove data streams, add stereo audio, re-order streams, etc) which would happen 
                     if included in the scanner settings option on the library's source tab`
            },
            {
                name: 'dry_run',
                type: 'boolean',
                defaultValue: false,
                inputUI: {
                    type: 'dropdown',
                    options: ['true', 'false'],
                },
                tooltip:
                    `run this plugin in test mode - if enabled the plugin will run through all pre-transcode steps and 
                    log out the transcode command arguments, but will not actually start the transcode. useful for 
                    debugging and testing your plugin stack without actually waiting for the transcode process to 
                    complete.`,
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
    const fileName = file._id.toLowerCase();
    const blockKeywordsStr = inputs.block_keywords;
    if (blockKeywordsStr) {
        const blockKeywords = blockKeywordsStr.split(',');
        for (const blockKeyword of blockKeywords) {
            if (fileName.includes(blockKeyword.toLowerCase())) {
                response.infoLog +=
                    `☒ File name contains the block keyword '${blockKeyword}' - skipping this plugin.\n`;
                return response;
            }
        }
        response.infoLog +=
            `☑ File name does not include any of the block keywords: [${blockKeywords.join(',')}] \n`;
    }

    // check if bitrate is high enough to process
    const thisBitrate = Math.floor(parseInt(file.bit_rate) / 1000); // convert to Kbps
    const minimumBitrate = parseInt(inputs.minimum_bitrate); // input already in Kbps
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

    // check if file's current codec is in the blocked codec list
    const inputCodec = file.ffProbeData.streams[0].codec_name;
    const excludeCodecsStr = inputs.codecs_to_exclude;
    let isBlockedCodec = false;
    if (excludeCodecsStr) {
        const excludeCodecs = excludeCodecsStr.toLowerCase().split(',');
        isBlockedCodec = excludeCodecs.includes(inputCodec.toLowerCase());
        if (isBlockedCodec) {
            response.infoLog +=
                `☒ File codec '${inputCodec}' is in the blocked codec list: [${excludeCodecs.join(',')}] \n`;
        } else {
            response.infoLog +=
                `☑ File codec '${inputCodec}' is not in the blocked codec list: [${excludeCodecs.join(',')}] \n`;
        }
    } else {
        response.infoLog +=
            `☑ No codecs have been added to codecs_to_exclude - this may cause infinite loop errors \n`;
    }

    // set autocrop args - used by transcode even if force_crop is disabled
    const autocropArgs = `--crop-mode ${inputs.crop_mode} --previews ${inputs.preview_count}:0`;

    // detect letterbox if input codec is in the exclude list and force_crop enabled
    const forceCrop = inputs.force_crop;
    let cropRequired = false;
    if (isBlockedCodec && forceCrop) {
        // set grep command depending on OS
        const os = require('os');
        let grep = 'grep -i';
        if (os.platform() === 'win32') {
            grep = 'findstr /i';
        }

        // execute handbrake scan to get autocrop values
        const scanResult = execSync(
            `"${otherArguments.handbrakePath}" -i "${file.meta.SourceFile}" ${autocropArgs} --scan 2>&1 ` +
            `| ${grep} "autocrop:"`
        ).toString();

        // should return something like "+ autocrop: 132/132/0/0" - if not assume no crop required
        let cropdetect = [];
        if (scanResult) {
            try {
                // slice at the ':' and take the second half with the values. trim to remove whitespace
                const cropdetectStr = scanResult.split(':')[1].trim();
                if (cropdetectStr) {
                    // split on '/' to get individual top/bottom/left/right values
                    cropdetect = cropdetectStr.toString().split('/');
                    // if our array has 4 values and any one exceeds our min_pixels setting then crop is required
                    if (cropdetect.length === 4
                        && cropdetect.some((val) => parseInt(val) > parseInt(inputs.crop_min_pixels))) {
                        cropRequired = true;
                    }
                }
            } catch (err) {
                // unable to parse cropdetect return value - swallow the error and assume no crop is required
            }
        }

        // add info output with cropdetect details
        if (cropRequired) {
            response.infoLog +=
                `☒ Force Crop is enabled and letterboxing was detected: [${cropdetect.join('/')}] \n`;
        } else {
            response.infoLog +=
                `☑ Force Crop is enabled but letterboxing was not detected: [${cropdetect.join('/')}] \n`;
        }
    }


    //// determine if we should transcode ////
    const outputCodec = inputs.output_codec;
    if (isBlockedCodec) {
        if (forceCrop && cropRequired) {
            response.infoLog +=
                `☒ File is already ${inputCodec} but letterboxing was detected - starting transcode. \n`;
        } else if (forceCrop) {
            response.infoLog +=
                `☑ File is already ${inputCodec} but no letterboxing was detected - skipping transcode. \n`;
            return response;
        } else {
            response.infoLog += `☑ File is already ${inputCodec} - skipping transcode. \n`;
            return response;
        }
    } else {
        response.infoLog += `☒ File is ${inputCodec} but target codec is ${outputCodec} - starting transcode. \n`;
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
    let encoderPreset = `--encoder-preset ${inputs.encoder_preset}`;

    // determine encoder quality depending on if this is a remux release
    let quality = '--quality ';
    if (fileName.includes(inputs.remux_keyword.toLowerCase())) {
        quality += inputs.remux_quality;
    } else {
        quality += inputs.standard_quality;
    }

    // create handbrake command
    response.preset =
        `${format} ${encoder} ${encoderPreset} ${quality} ${autocropArgs} --markers --align-av ` +
        `--audio-lang-list eng --all-audio --aencoder copy --audio-copy-mask aac,ac3,eac3,truehd,dts,dtshd,mp3,flac ` +
        `--audio-fallback aac --mixdown dp12 --arate auto --subtitle-lang-list eng --native-language eng --native-dub `;
    response.container = inputs.output_container;

    // check for test mode - if so exit
    if (inputs.dry_run) {
        response.infoLog += `☒ Dry Run is enabled - skipping transcode \n`;
        return response;
    }

    response.processFile = true;
    response.reQueueAfter = true;
    return response;
};

module.exports.details = details;
module.exports.plugin = plugin;