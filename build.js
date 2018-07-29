'use strict';

const load = require('prismjs/components/');
const marked = require('marked');
const prism = require('prismjs');
const yaml = require('js-yaml');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');

const incl = /^\[[^\]]+\]\(([^\s]+)\s['"]:include['"]\)$/gm;

const parse = file => {
  let conf;
  let raw = fs
    .readFileSync(file)
    .toString()
    .split(/---/g);

  if (raw.length !== 1) {
    conf = yaml.safeLoad(raw[1]);
    raw = raw.slice(2);
  }

  const dirname = path.dirname(file);

  raw = raw.join('');
  raw = raw.replace(incl, (_, p) => parse(path.resolve(dirname, p)).raw);

  return { conf, raw };
};

const highlight = (str, lang) => {
  if (!(lang in prism.languages)) load(lang);

  const language = prism.languages[lang];
  if (language) str = prism.highlight(str, language, lang);

  return str;
};

marked.setOptions({
  smartLists: true,
  sanitize: false,
  highlight
});

const toc = content =>
  marked(
    marked
      .lexer(content)
      .filter(t => t.type === 'heading')
      .map(
        ({ text, depth }) =>
          `${_.repeat(' ', depth * 2)}- [${text}](#${_.kebabCase(text)})`
      )
      .join('\n')
  );

const data = parse('./README.md');
data.content = marked(data.raw);
data.toc = toc(data.raw);

const tpl = fs.readFileSync('./src/index.html').toString();
const template = _.template(tpl)(data);

fs.writeFileSync('./index.html', template);
