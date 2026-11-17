// Preserve the existing first-lot export command.
process.argv[2]='1';
require('./export-batch.cjs');
