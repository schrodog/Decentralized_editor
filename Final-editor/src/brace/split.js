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

define(function (require, exports, module) {
  "use strict";

  var oop = require("./lib/oop");
  var lang = require("./lib/lang");
  var EventEmitter = require("./lib/event_emitter").EventEmitter;

  var Editor = require("./editor").Editor;
  var Renderer = require("./virtual_renderer").VirtualRenderer;
  var EditSession = require("./edit_session").EditSession;

  /** 
   * @class Split
   *
   **/


  var Split = function (container, theme, splits) {
    this.BELOW = 1;
    this.BESIDE = 0;

    this.$container = container;
    this.$theme = theme;
    this.$splits = 0;
    this.$headerHeight = 25;
    this.$headerStart = 41;
    this.$editorCSS = "";
    this.$editors = [];
    this.$headers = [];
    this.$frames = [];
    this.$orientation = this.BESIDE;

    this.setSplits(splits || 1);
    this.$cEditor = this.$editors[0];


    this.on("focus", function (editor) {
      this.$cEditor = editor;
    }.bind(this));
  };

  (function () {

    oop.implement(this, EventEmitter);

    this.$createEditor = function () {
      const frame = document.createElement("div")
      frame.className = "editor-frame"
      frame.style.cssText = "display: flex; flex-grow: 1; flex-direction: column;"
      // frame.style.cssText = "position: absolute; top:0px; bottom:0px";

      // create header
      const header = document.createElement("div")
      header.textContent = 'Untitled'
      header.className = 'editor-tab'
      // header.style.cssText = `position: absolute; top: 0px; height: ${this.$headerHeight}px; left: ${this.$headerStart}px; color: black;`
      header.style.cssText = `flex-grow: 0; flex-shrink: 0; flex-basis: ${this.$headerHeight}px; padding-left: ${this.$headerStart}px; font-size: 16px;`

      // create wrapper
      const wrapper = document.createElement("div")
      wrapper.style.cssText = 'flex-grow: 1;';

      // create editor
      var el = document.createElement("div");
      el.className = this.$editorCSS;
      // el.style.cssText = "position: absolute; top:0px; bottom:0px";
      // el.style.cssText = "width: 100%; height: 100%; flex-grow: 1;"
      el.style.cssText = "flex-grow: 1;"
      // wrapper.appendChild(el)
      frame.appendChild(header)
      frame.appendChild(el)

      this.$container.appendChild(frame);
      var editor = new Editor(new Renderer(el, this.$theme));

      // // set tab Name        
      // const handler = {
      //     set: function(obj, prop, value){
      //         if(prop === 'tabName'){
      //             obj[prop] = value
      //             obj.header.textContent = value
      //         }
      //         return true;
      //     }
      // }
      // let editor = new Proxy( _editor, handler)

      editor.on("focus", function () {
        this._emit("focus", editor);
      }.bind(this));

      editor.header = header;
      editor.frameContainer = frame
      editor.currentIndex = this.$editors.length

      this.$editors.push(editor);
      // this.$headers.push(header);
      editor.setFontSize(this.$fontSize);

      return editor;
    };

    // this.$createHeader = function(editor){
    //     const el = document.createElement("div")
    //     el.textContent = 'tab'
    //     el.style.cssText = "position: absolute; top: 0px; height: 15px; background-color: #AAAAAA"
    //     return editor
    // }

    this.setSplits = function (splits) {
      var editor;
      if (splits < 1) {
        throw "The number of splits have to be > 0!";
      }

      // this.$splits = number of splits currently
      if (splits == this.$splits) {
        return;
      } else if (splits > this.$splits) {
        // add extra editor
        while (this.$splits < this.$editors.length && this.$splits < splits) {
          editor = this.$editors[this.$splits];
          // add editor to container
          this.$container.appendChild(editor.container);
          editor.setFontSize(this.$fontSize);
          this.$splits++;
        }
        while (this.$splits < splits) {
          this.$createEditor();
          this.$splits++;
        }
      } else {
        // remove extra editor
        while (this.$splits > splits) {
          editor = this.$editors[this.$splits - 1];
          // console.log(this.$editors.indexOf(editor));
          this.$editors.splice(this.$splits - 1, 1)
          this.$container.removeChild(editor.frameContainer);
          this.$splits--;
        }
      }
      this.resize();
    };

    this.addEditor = function(){
      this.$createEditor()
      this.$splits++
      this.resize()
    }
    editor.addEditor = addEditor

    this.removeSelectedEditor = function () {
      const editor = this.getCurrentEditor();
      const index = editor.currentIndex;
      this.$container.removeChild(editor.frameContainer);
      this.$editors.splice(index, 1)
      this.$splits--;

      for (let i = index; i < this.$editors.length; i++) {
        this.$editors[i].currentIndex--;
      }
    }

    /**
     * 
     * Returns the number of splits.
     * @returns {Number}
     **/
    this.getSplits = function () {
      return this.$splits;
    };

    /**
     * @param {Number} idx The index of the editor you want
     *
     * Returns the editor identified by the index `idx`.
     *
     **/
    this.getEditor = function (idx) {
      return this.$editors[idx];
    };

    /**
     * 
     * Returns the current editor.
     * @returns {Editor}
     **/
    this.getCurrentEditor = function () {
      return this.$cEditor;
    };

    /** 
     * Focuses the current editor.
     * @related Editor.focus
     **/
    this.focus = function () {
      this.$cEditor.focus();
    };

    /** 
     * Blurs the current editor.
     * @related Editor.blur
     **/
    this.blur = function () {
      this.$cEditor.blur();
    };

    /** 
     * 
     * @param {String} theme The name of the theme to set
     * 
     * Sets a theme for each of the available editors.
     * @related Editor.setTheme
     **/
    this.setTheme = function (theme) {
      this.$editors.forEach(function (editor) {
        editor.setTheme(theme);
      });
    };

    /** 
     * 
     * @param {String} keybinding 
     * 
     * Sets the keyboard handler for the editor.
     * @related editor.setKeyboardHandler
     **/
    this.setKeyboardHandler = function (keybinding) {
      this.$editors.forEach(function (editor) {
        editor.setKeyboardHandler(keybinding);
      });
    };

    /** 
     * 
     * @param {Function} callback A callback function to execute
     * @param {String} scope The default scope for the callback
     * 
     * Executes `callback` on all of the available editors. 
     *
     **/
    this.forEach = function (callback, scope) {
      this.$editors.forEach(callback, scope);
    };


    this.$fontSize = "";
    /** 
     * @param {Number} size The new font size
     * 
     * Sets the font size, in pixels, for all the available editors.
     *
     **/
    this.setFontSize = function (size) {
      this.$fontSize = size;
      this.forEach(function (editor) {
        editor.setFontSize(size);
      });
    };

    this.$cloneSession = function (session) {
      var s = new EditSession(session.getDocument(), session.getMode());

      var undoManager = session.getUndoManager();
      s.setUndoManager(undoManager);

      // Copy over 'settings' from the session.
      s.setTabSize(session.getTabSize());
      s.setUseSoftTabs(session.getUseSoftTabs());
      s.setOverwrite(session.getOverwrite());
      s.setBreakpoints(session.getBreakpoints());
      s.setUseWrapMode(session.getUseWrapMode());
      s.setUseWorker(session.getUseWorker());
      s.setWrapLimitRange(session.$wrapLimitRange.min,
        session.$wrapLimitRange.max);
      s.$foldData = session.$cloneFoldData();

      return s;
    };

    /** 
     * 
     * @param {EditSession} session The new edit session
     * @param {Number} idx The editor's index you're interested in
     * 
     * Sets a new [[EditSession `EditSession`]] for the indicated editor.
     * @related Editor.setSession
     **/
    this.setSession = function (session, idx) {
      var editor;
      if (idx == null) {
        editor = this.$cEditor;
      } else {
        editor = this.$editors[idx];
      }

      // Check if the session is used already by any of the editors in the
      // split. If it is, we have to clone the session as two editors using
      // the same session can cause terrible side effects (e.g. UndoQueue goes
      // wrong). This also gives the user of Split the possibility to treat
      // each session on each split editor different.
      var isUsed = this.$editors.some(function (editor) {
        return editor.session === session;
      });

      if (isUsed) {
        session = this.$cloneSession(session);
      }
      editor.setSession(session);

      // Return the session set on the editor. This might be a cloned one.
      return session;
    };

    /** 
     * 
     * Returns the orientation.
     * @returns {Number}
     **/
    this.getOrientation = function () {
      return this.$orientation;
    };

    /** 
     * 
     * Sets the orientation.
     * @param {Number} orientation The new orientation value
     *
     *
     **/
    this.setOrientation = function (orientation) {
      if (this.$orientation == orientation) {
        return;
      }
      this.$orientation = orientation;
      this.resize();
    };

    /**  
     * Resizes the editor.
     **/
    this.resize = function () {
      var width = this.$container.clientWidth;
      var height = this.$container.clientHeight;
      var editor;

      if (this.$orientation == this.BESIDE) {
        // var editorWidth = width / this.$splits;
        this.$container.style.flexDirection = 'row'
        for (var i = 0; i < this.$splits; i++) {
          //     const header = this.$headers[i];
          editor = this.$editors[i];
          //     editor.container.style.width = editorWidth + "px";
          //     editor.container.style.top = this.$headerHeight + "px";
          //     editor.container.style.left = i * editorWidth + "px";
          //     editor.container.style.height = height - this.$headerHeight + "px";
          editor.resize();
          console.log('resize')
          //     header.style.top = '0px';
          //     header.style.left = i * editorWidth + this.$headerStart + 'px';
        }
      } else {
        // var editorHeight = height / this.$splits;
        this.$container.style.flexDirection = 'column'
        for (var i = 0; i < this.$splits; i++) {
          //     const header = this.$headers[i];
          editor = this.$editors[i];
          //     editor.container.style.width = width + "px";
          //     editor.container.style.top = i * editorHeight + this.$headerHeight + "px";
          //     editor.container.style.left = "0px";
          //     editor.container.style.height = editorHeight - this.$headerHeight + "px";
          editor.resize();
          console.log('resize')
          //     header.style.top = i * editorHeight + 'px';
          //     header.style.left = this.$headerStart + 'px';
        }
      }
    };

  }).call(Split.prototype);

  exports.Split = Split;
});
