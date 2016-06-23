/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2013 Einar Lielmanis and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.


 CSS Beautifier
---------------

    Written by Harutyun Amirjanyan, (amirjanyan@gmail.com)

    Based on code initially developed by: Einar Lielmanis, <einar@jsbeautifier.org>
        http://jsbeautifier.org/

    Usage:
        css_beautify(source_text);
        css_beautify(source_text, options);

    The options are (default in brackets):
        indent_size (4)                         — indentation size,
        indent_char (space)                     — character to indent with,
        selector_separator_newline (true)       - separate selectors with newline or
                                                  not (e.g. "a,\nbr" or "a, br")
        end_with_newline (false)                - end with a newline
        newline_between_rules (true)            - add a new line after every css rule
        space_around_selector_separator (false) - ensure space around selector separators:
                                                  '>', '+', '~' (e.g. "a>b" -> "a > b")
    e.g

    css_beautify(css_source_text, {
      'indent_size': 1,
      'indent_char': '\t',
      'selector_separator': ' ',
      'end_with_newline': false,
      'newline_between_rules': true,
      'space_around_selector_separator': true
    });
*/

// http://www.w3.org/TR/CSS21/syndata.html#tokenization
// http://www.w3.org/TR/css3-syntax/

(function () {
    function css_beautify(source_text, options) {
        options = options || {};
        source_text = source_text || '';
        // HACK: newline parsing inconsistent. This brute force normalizes the input.
        source_text = source_text.replace(/\r\n|[\r\u2028\u2029]|\r/g, '\n');

        var indentSize = 4;
        var indentCharacter = ' ';
        var selectorSeparatorNewline = (options.selector_separator_newline === undefined) ? true : options.selector_separator_newline;
        var end_with_newline = (options.end_with_newline === undefined) ? false : options.end_with_newline;
        var newline_between_rules = (options.newline_between_rules === undefined) ? true : options.newline_between_rules;
        var spaceAroundSelectorSeparator = (options.space_around_selector_separator === undefined) ? false : options.space_around_selector_separator;
        var eol = options.eol ? options.eol : '\n';

        eol = eol.replace(/\\r/, '\r').replace(/\\n/, '\n');


        // tokenizer
        var whiteRe = /^\s+$/;

        var i = 0,
            ch,
            prev,
            output = '',
            isNewLine = true,
            isFirstCh = true,
            deep = 0,
            prevSym,
            prevCh,
            pass = 0,
            couple,
            sym;


        function append(ch) {
            if (isFirstCh && deep && ch != '\n') {
                output += " ".repeat((ch == '}' ? deep - 1 : deep) * indentSize)
            }
            output += ch;
            prev = ch;
            isFirstCh = false;
        }

        function newLine() {
            append(eol);
            isNewLine = true;
            isFirstCh = true;
        }

        function nextSym(contains) {
            var j = i + 1;
            var ch1;
            !contains && (contains = "{}");

            while (ch1 = source_text.charAt(j)) {
                if (contains.indexOf(ch1) != -1) {
                    return ch1;
                }
                j++;
            }
        }

        function next() {
            return source_text.charAt(i + 1);
        }

        function nextIs(re) {
            return typeof re == 'string' ? source_text.substr(i, re.length) == re : re.test(source_text.substr(i));
        }

        //console.log(source_text)

        for (; ;) {
            prevCh = ch;
            ch = source_text.charAt(i);

            if (!ch) {
                break;
            }

            if (couple && (couple.length == 2 ? prevCh + ch == couple : (ch === couple))) {

                if (ch == '\n')
                    newLine();
                else {
                    append(ch);

                    if ('*/' == couple)
                        newLine();
                }

                couple = false;


            } else if (couple) {
                append(ch);

            } else if (ch === ' ') {
                if (!isNewLine && prev !== ' ') {
                    append(ch);
                }

            } else if (ch === '\n') {
                if (!isNewLine && '{}'.indexOf(nextSym()) == -1 || prevCh == '\n') {
                    newLine();
                } else {
                    isNewLine = true;
                }

            } else {
                append(ch);

                if (ch == "(") {
                    couple = ')';

                } else if (ch == "/" && next() == '/' || ch == '@' && nextIs('import')) {
                    couple = '\n';

                } else if (ch == "/" && next() == '*') {
                    couple = '*/';

                } else if (ch == "'" || ch == "\"") {
                    couple = ch;

                } else if (ch == ':') {
                    prevSym = ch;
                    if (deep && (sym = nextSym('{};') == ';' || sym == '}')) {
                        append(' ');
                    }

                } else if (ch == ';') {
                    prevSym = ch;

                    if (nextSym('{};') == '{' || deep == 0) {
                        newLine();
                    } else {
                        append(' ');
                    }

                } else if (ch === "}") {
                    prevSym = ch;

                    deep--;
                    newLine();

                } else if (ch == '{') {
                    prevSym = ch;

                    if (nextSym() == '{') {
                        newLine();
                    } else {
                        append(' ');
                    }

                    deep++;

                } else {
                    isNewLine = false;
                }
            }
            i++;
        }

        var sweetCode = output.replace(/[\r\n\t ]+$/, '');

        // establish end_with_newline
        if (end_with_newline) {
            sweetCode += '\n';
        }

        if (eol !== '\n') {
            sweetCode = sweetCode.replace(/[\n]/g, eol);
        }

        return sweetCode;
    }

    // https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
    css_beautify.NESTED_AT_RULE = {
        "@page": true,
        "@font-face": true,
        "@keyframes": true,
        // also in CONDITIONAL_GROUP_RULE below
        "@media": true,
        "@supports": true,
        "@document": true
    };
    css_beautify.CONDITIONAL_GROUP_RULE = {
        "@media": true,
        "@supports": true,
        "@document": true
    };

    /*global define */
    if (typeof define === "function" && (define.amd || window.seajs)) {
        // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
        define([], function () {
            return {
                css_beautify: css_beautify
            };
        });
    } else if (typeof exports !== "undefined") {
        // Add support for CommonJS. Just put this file somewhere on your require.paths
        // and you will be able to `var html_beautify = require("beautify").html_beautify`.
        exports.css_beautify = css_beautify;
    } else if (typeof window !== "undefined") {
        // If we're running a web page and don't have either of the above, add our one global
        window.css_beautify = css_beautify;
    } else if (typeof global !== "undefined") {
        // If we don't even have window, try global.
        global.css_beautify = css_beautify;
    }

} ());