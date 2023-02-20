# Tdarr Plugins
Custom Tdarr plugins 

## stonefish audio clean
removes audio tracks that are not in the preferred language and conditionally removes any tagged as commentary or descriptive. also detects duplicates by channel/language and keeps only the highest bitrate version

## stonefish transcode remove letterbox
configurable plugin to transcode using Handbrake with filters for minimum bitrate and codecs to ignore. if the file is already in the target codec it will still check for letterboxing and re-encode to remove said letterbox
