#!/usr/bin/env bash
source ./scripts/lib/sh-logger.sh

#TODO: reverse kabob like >>>>---- WORD ------<<< with styles on center  , someday maybe do a flexible padding
#TODO FULL WIDTH kabob  TERMINAL (((total width- length of word ) / 2 ) - padd*2 ) - length of word  OR width padd word padd width
#TODO: fill line Like "Section 1:Here --------------rest of line----------------------"
# TODO a text heading: with an $underline tht is automatic ( ie just a space )
echo ${RED}----${GREEN}------

printf '%b' ${ORANGE}
rule
printf '%b' ${REVERSE}
rule "="
echo ${RESET}

echo ${ORANGE}
rule "-" 25% 1 false
printf "  ${REVERSE} I AM A${BOLD} SECTION ${RESET}${ORANGE} "
rule "-" 25% 1

#PERCENT WIDTH HRULE
echo ${ORANGE}
rule "-" 25% 1 false
printf "  ${REVERSE} I AM A${BOLD} SECTION ${RESET}${ORANGE} "
rule "-" 25% 1
printf '%b' ${RESET}

#FIXED WIDTH HRULE
COLOR=$MAGENTA
WIDTH=20%
HEIGHT=1
INVERT=$REVERSE # can this be a boolean?
DELIMITER=" : "
PREFIX="SECTION"
CONTENT_TEXT="Colors and Stuff"
printf ${RESET}${COLOR}
rule "-" $WIDTH $HEIGHT false
printf "  ${INVERT}  ${PREFIX}${DELIMITER}${CONTENT_TEXT}  ${RESET}  ${COLOR}"
rule "-" $WIDTH $HEIGHT
printf '%b' ${RESET}

#FIXED WIDTH HRULE
COLOR=$GREEN
WIDTH=8
HEIGHT=1
INVERT=""
CONTENT_TEXT=" I AM A${BOLD} KITTEN "
printf ${RESET}${COLOR}
rule "-" $WIDTH $HEIGHT false
printf "  ${INVERT}${CONTENT_TEXT} ${RESET}${COLOR}"
rule "-" $WIDTH $HEIGHT
printf '%b' ${RESET}

# LR padding - hspacer
WIDTH=4
printf ${RESET}
rule " " ${WIDTH} 1 false
printf "PADDED:"

# this should become a spacer func, w height as param
#vspacer
HEIGHT=2
rule "${RESET}" 1 ${HEIGHT} true

#COLORED HRULE  (full width)  [width] [height]
COLOR=$GREY
WIDTH=auto
HEIGHT=1
INVERT="" #always true for these boxes
printf '%b' ${RESET}${COLOR}${INVERT}
rule " " $WIDTH $HEIGHT
printf '%b' ${RESET}
