import path from 'path';
import glob from 'glob';

export default (pattern: string = '**/entry.+(js|tsx)', root: string = 'src/pages') => {
  const cwd = path.resolve(root);
  const config = {};
  glob.sync(pattern, { cwd }).forEach((page: string) => {
    const key = path.dirname(page);
    config[key] = path.join(cwd, page);
  });
  return config;
}
