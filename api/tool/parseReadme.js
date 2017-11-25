/**
 * Created by yanjd on 2017/11/24.
 */
const hljs = require('highlight.js') // https://highlightjs.org/
const MD = require('markdown-it')({
  html: false,        // Enable HTML tags in source
  xhtmlOut: false,        // Use '/' to close single tags (<br />).
                          // This is only for full CommonMark compatibility.
  breaks: false,        // Convert '\n' in paragraphs into <br>
  langPrefix: 'language-',  // CSS language prefix for fenced blocks. Can be
                            // useful for external highlighters.
  linkify: false,        // Autoconvert URL-like text to links

  typographer: false,
  quotes: '“”‘’',
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          '</code></pre>';
      } catch (__) {
      }
    }
    return '<pre class="hljs"><code>' + MD.utils.escapeHtml(str) + '</code></pre>';
  }
})
module.exports = function parseReadme (data) {
  let buf = Buffer.from(data, 'base64').toString()
  let str = buf.toString('utf-8')
  try {
    let arr = str.split('----------')
    if (arr.length !== 2) {
      return {err: '没有分隔符'}
    } else {
      return {
        person: MD.render(arr[0]),
        about: MD.render(arr[1])
      }
    }
  } catch (err) {
    return {err}
  }
}
