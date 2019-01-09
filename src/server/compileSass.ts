import sass from 'node-sass';
import resolve from 'resolve';

export interface SassOptions {
  includePaths?: Array<string>;
}

function buildIncludePaths(additonalIncludePaths) {
  const defaultIncludePaths = ['node_modules'];

  if (additonalIncludePaths) {
    return {
      includePaths: defaultIncludePaths.concat(additonalIncludePaths)
    };
  }

  return {
    includePaths: defaultIncludePaths
  };
}

function sassImporter(url) {
  if (url.indexOf('~') === 0) {
    const fragments = url.split('/');
    const pkg = resolve.sync(fragments[1]);

    return { file: pkg };
  }

  return { file: url };
};

export function compile(stylesheet, sassOptions: SassOptions = { includePaths: null }) {
  if (!stylesheet) {
    return '';
  }

  const compileOptions = {
    file: stylesheet,
    outputStyle: 'compressed',
    sassImporter
  };

  const includePaths = buildIncludePaths(sassOptions.includePaths);

  const rendered = sass.renderSync(Object.assign({}, compileOptions, sassOptions, includePaths));

  return rendered.css.toString();
}
