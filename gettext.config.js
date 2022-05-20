module.exports = {
  input: {
    path: './src', // only files in this directory are considered for extraction
    include: ['**/*.js', '**/*.ts', '**/*.vue'], // glob patterns to select files for extraction
    exclude: [], // glob patterns to exclude files from extraction
  },
  output: {
    path: './src/i18n', // output path of all created files
    potPath: './app.pot', // relative to output.path
    jsonPath: './translations.json', // relative to output.path
    locales: ['en', 'es_ES'],
    flat: false, // don't create subdirectories for locales
    linguas: true, // create a LINGUAS file
    splitJson: false, // create separate json files for each locale. If used, jsonPath must end with a directory, not a file
  },
}
