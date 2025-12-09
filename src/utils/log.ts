export const log = process.argv.includes("--silent") ? () => {} : console.log;
