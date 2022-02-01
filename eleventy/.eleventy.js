module.exports = config => {
    config.addPassthroughCopy('./svelte_src/');
    return {
        dir: {
            input: 'eleventy_src',
            output: 'eleventy_dist',
        }
    };
};