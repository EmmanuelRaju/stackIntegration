module.exports = config => {
    config.addPassthroughCopy('./svelte_src/');
    // config.addWatchTarget('./svelte_src/');
    return {
        markdownTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        dir: {
            input: 'eleventy_src',
            output: 'eleventy_dist',
        }
    };
};