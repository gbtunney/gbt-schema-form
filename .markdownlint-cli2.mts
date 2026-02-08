import { markdownlint, merge } from '@snailicide/build-config'
const mdlint = { config: markdownlint.config({}) }
// @ts-check
/* eslint sort/object-properties:off */
const options = {
    config: {
        // 'MD001/heading-increment'
        'MD001': false,
        'MD036': false, // Disable MD036/emphasis-as-heading
        'MD013': {
            // Number of characters for code blocks
            // code_block_line_length: markdownlint.getScaledWidth('comments'),
            //heading_line_length: 100, //markdownlint.getScaledWidth('markdown'),
            // General line length for non-table content
            line_length: 120, // Adjust as needed
            // Specific line length for tables
            tables: false, //140, // Set a specific line length for tables
            // Include code blocks
            code_blocks: true,
            code_blocks_line_length: 120,

            // Number of characters for headings
            //heading_line_length: 100,
            // Include headings
            //headings: true,
            // Stern length checking
            stern: false,
            // Strict length checking
            strict: false,
        },
        //'MD024/no-duplicate-heading'
        'MD024': false,
        // 'MD025/single-title/single-h1'
        'MD025': false,
        //todo: temporarily dosabled. pls try to fix later, also how can i include the
        'MD032': true,
        'no-multiple-blanks': false,
    },
}

export default merge(mdlint, options)
