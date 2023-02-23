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
                defaultValue: '',
                inputUI: {
                    type: 'text',
                },
                tooltip:
                    `comma-separated list of input codecs that should be excluded when processing. unless force_crop is 
                    enabled this list will always include the specified output codec. 
                     \\nFor example, if transcoding into hevc (h265), then add a filter to block it from being 
                     repeatedly transcoded
                     \\n
                     \\nExample:
                     \\n
                     hevc
                     \\nExample:
                     \\n
                     hevc,vp9 `,
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
    const blockKeyword = inputs.block_keyword;
    if (blockKeyword) {
        if (fileName.includes(blockKeyword.toLowerCase())) {
            response.infoLog +=
                `☒ Filename contains the configured block keyword '${blockKeyword}' - skipping this plugin.\n`;
            return response;
        }
        response.infoLog += `☑ Filename does not include the configured block keyword '${blockKeyword}' \n`;
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

    // check if file is already target codec or is in the blocked codec list
    const inputCodec = file.ffProbeData.streams[0].codec_name;
    const outputCodec = inputs.output_codec;
    const isBlockedCodec = inputCodec === outputCodec // already specified output codec
        || (inputs.codecs_to_exclude && inputs.codecs_to_exclude.includes(inputCodec)); // codec in exclude list

    // set autocrop settings - used by transcode even if force_crop is disabled
    const autocropSettings = `--crop-mode ${inputs.crop_mode} --previews ${inputs.preview_count}:0`;

    //// check for letterbox if force_crop enabled ////
    // if input codec is blocked but force_crop enabled then detect letterbox
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
            `"${otherArguments.handbrakePath}" -i "${file.meta.SourceFile}" ${autocropSettings} --scan  2>&1 ` +
            `| ${grep} "autocrop:"`
        ).toString();

        // returns something like "+ autocrop: 132/132/0/0" - need to slice off the numbers for parsing
        let cropdetectStr;
        if (scanResult) {
            try {
                // slice at the ':' and take the second half, then trim it
                cropdetectStr = scanResult.split(':')[1].trim();
            } catch (err) {
                // unexpected return value - just swallow and assume no crop
            }
            // check if crop is required
            if (cropdetectStr) {
                const cropArr = cropdetectStr.toString().split("/");
                try {
                    // parse crop_min_pixels setting to int
                    const cropMinPixels = parseInt(inputs.crop_min_pixels);
                    // if our array has 4 values (top/bottom/left/right) and any one exceeds our min_pixels
                    if (cropArr.length === 4 && cropArr.some((val) => val > cropMinPixels)) {
                        cropRequired = true;
                    }
                } catch (err) {
                    // autocrop return value unexpected format - assume no cropping
                }
            }
        }

        // add info output with cropdetect details
        if (cropRequired) {
            response.infoLog +=
                `☑ Plugin force_crop is enabled and Handbrake found autocrop is required: [${cropdetectStr}] \n`;
        } else {
            response.infoLog +=
                `☑ Plugin force_crop is enabled but Handbrake found autocrop is not required: [${cropdetectStr}] \n`;
        }
    }


    //// determine if we should transcode ////
    // check if codec is in the skip list
    if (isBlockedCodec) {
        if (forceCrop && cropRequired) {
            response.infoLog += `☑ File is ${inputCodec} but crop is required - starting transcode. \n`;
        } else if (forceCrop) {
            response.infoLog += `☑ File is ${inputCodec} and no crop is required - skipping transcode. \n`;
            return response;
        } else {
            response.infoLog += `☑ File is ${inputCodec} and force_crop is not enabled - skipping transcode. \n`;
            return response;
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
        `${format} ${encoder} ${encoderPreset} ${quality} ${autocropSettings} --markers --align-av ` +
        `--audio-lang-list eng --all-audio --aencoder copy --audio-copy-mask aac,ac3,eac3,truehd,dts,dtshd,mp3,flac ` +
        `--audio-fallback aac --mixdown dp12 --arate auto --subtitle-lang-list eng --native-language eng --native-dub `;
    response.container = inputs.output_container;

    // check for test mode - if so exit
    if (inputs.dry_run) {
        return response;
    }

    response.processFile = true;
    response.reQueueAfter = true;
    return response;
};

module.exports.details = details;
module.exports.plugin = plugin;