import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import dart from 'highlight.js/lib/languages/dart';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import markdown from 'highlight.js/lib/languages/markdown';
import php from 'highlight.js/lib/languages/php';
import plaintext from 'highlight.js/lib/languages/plaintext';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import scss from 'highlight.js/lib/languages/scss';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

/*
 * Syntax colouring for ``` fenced blocks. Only these grammars are bundled (the full
 * highlight.js set is ~1 MB); add one here to support another language. Colours are the
 * `.hljs-*` rules under `.code-block` in styles.css. Pure string work, so it runs during SSR.
 */
const LANGUAGES = {
  bash, c, cpp, csharp, css, dart, dockerfile, go, java, javascript, json, kotlin, markdown,
  php, plaintext, python, ruby, rust, scss, shell, sql, swift, typescript, xml, yaml,
};

for (const [name, grammar] of Object.entries(LANGUAGES)) hljs.registerLanguage(name, grammar);

// Names people actually type after ``` → the grammar that colours them.
hljs.registerAliases(['js', 'jsx', 'mjs', 'cjs', 'node', 'nodejs', 'react', 'express'], {
  languageName: 'javascript',
});
hljs.registerAliases(['ts', 'tsx', 'angular', 'nestjs'], { languageName: 'typescript' });
hljs.registerAliases(['html', 'htm', 'svg', 'vue', 'angular-html'], { languageName: 'xml' });
hljs.registerAliases(['py', 'python3'], { languageName: 'python' });
hljs.registerAliases(['c++', 'cc', 'hpp', 'h++'], { languageName: 'cpp' });
hljs.registerAliases(['c#', 'cs', 'dotnet'], { languageName: 'csharp' });
hljs.registerAliases(['sh', 'zsh', 'terminal', 'console'], { languageName: 'bash' });
hljs.registerAliases(['kt'], { languageName: 'kotlin' });
hljs.registerAliases(['yml'], { languageName: 'yaml' });
hljs.registerAliases(['text', 'txt'], { languageName: 'plaintext' });

/**
 * Coloured, HTML-escaped markup for `code`. A known language (or alias) is used directly;
 * an unknown or missing one is auto-detected among the bundled grammars.
 */
export const highlightCode = (code: string, lang: string): string => {
  const language = lang.trim().toLowerCase();

  return hljs.getLanguage(language)
    ? hljs.highlight(code, { language, ignoreIllegals: true }).value
    : hljs.highlightAuto(code).value;
};
