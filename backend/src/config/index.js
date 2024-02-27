/**
 * To guarantee that the Environment variables configuration runs before anything else
 * It is important that the first thing our app's entry point does is import this file.
 *
 * This will run DotenvFlow.config() before any other file is bundled, which will make
 * environment variables available to the entire app.
 */
const dotenv = require('dotenv');
const { expand: dotenvExpand } = require('dotenv-expand');

// Load and expand local environment variables
const envLocalConfig = dotenv.config({ path: '.env.local' });
dotenvExpand(envLocalConfig);

// Load and expand global environment variables
const envConfig = dotenv.config({ path: '.env' });
dotenvExpand(envConfig);

console.log('Added environment variables...');
