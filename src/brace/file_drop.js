const modelist = require('./ext/modelist_module.js')

/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

// let config, event, modelist;

// ace.define("ace/file_drop", ["require", "exports", "module"], function (require, exports, module) {

//   config = require("ace/config");
//   event = require("ace/lib/event");
//   modelist = require("ace/ext/modelist");

  
//   var Editor = require("ace/editor").Editor;
//   config.defineOptions(Editor.prototype, "editor", {
//     loadDroppedFile: {
//       set: function () {
//         module.exports(this);
//       },
//       value: true
//     }
//   });

// });


module.exports = function (editor) {
  console.log('file_drop[38]', 'add listener', editor);
  editor.container.addEventListener("dragover", function (e) {
    var types = e.dataTransfer.types;
    console.log('file_drop.js[40]')
    if (types && Array.prototype.indexOf.call(types, 'Files') !== -1)
      return event.preventDefault(e);
  });

  editor.container.addEventListener("drop", function (e) {
    var file;
    try {
      file = e.dataTransfer.files[0];
      if (window.FileReader) {
        var reader = new FileReader();
        reader.onload = function () {
          var mode = modelist.getModeForPath(file.name);
          console.log('file_drop.js[52]', file.name, reader.result, mode)

          editor.session.doc.setValue(reader.result);
          editor.session.setMode(mode.mode);
          editor.session.modeName = mode.name;
        };
        reader.readAsText(file);
      }
      return e.preventDefault();
    } catch (err) {
      return e.stopEvent();
    }
  });
};


