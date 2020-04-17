const { profile, PROFILE } = process.env;
process.env.PROFILE = profile || PROFILE;

if (!process.env.PROFILE) {
  console.error(`
The \`PROFILE\` environment variable is required but was not specified.
Please set PROFILE:
> PROFILE=local npm start
`);
  process.exit(1);
}
