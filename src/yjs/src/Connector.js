const path = require('path')

function canRead (auth) { return auth === 'read' || auth === 'write' }
function canWrite (auth) { return auth === 'write' }

module.exports = function (Y/* :any */) {
  class AbstractConnector {
    /* ::
    y: YConfig;
    role: SyncRole;
    connections: Object;
    isSynced: boolean;
    userEventListeners: Array<Function>;
    whenSyncedListeners: Array<Function>;
    currentSyncTarget: ?UserId;
    syncingClients: Array<UserId>;
    forwardToSyncingClients: boolean;
    debug: boolean;
    syncStep2: Promise;
    userId: UserId;
    send: Function;
    broadcast: Function;
    broadcastOpBuffer: Array<Operation>;
    protocolVersion: number;
    */
    /*
      opts contains the following information:
       role : String Role of this client ("master" or "slave")
       userId : String Uniquely defines the user.
       debug: Boolean Whether to print debug messages (optional)
    */
    constructor (y, opts) {
      this.y = y
      if (opts == null) {
        opts = {}
      }
      // Prefer to receive untransformed operations. This does only work if
      // this client receives operations from only one other client.
      // In particular, this does not work with y-webrtc.
      // It will work with y-websockets-client
      if (opts.role == null || opts.role === 'master') {
        this.role = 'master'
      } else if (opts.role === 'slave') {
        this.role = 'slave'
      } else {
        throw new Error("Role must be either 'master' or 'slave'!")
      }
      this.log = Y.debug('y:connector')
      this.logMessage = Y.debug('y:connector-message')
      this.y.db.forwardAppliedOperations = opts.forwardAppliedOperations || false
      this.role = opts.role
      this.connections = {}
      this.isSynced = false
      this.userEventListeners = []
      this.whenSyncedListeners = []
      this.currentSyncTarget = null
      this.syncingClients = []
      // this.forwardToSyncingClients = opts.forwardToSyncingClients !== false
      this.forwardToSyncingClients = true
      this.debug = opts.debug === true
      this.syncStep2 = Promise.resolve()
      this.broadcastOpBuffer = []
      this.protocolVersion = 11
      this.authInfo = opts.auth || null
      this.checkAuth = opts.checkAuth || function () { return Promise.resolve('write') } // default is everyone has write access
      if (opts.generateUserId === true) {
        this.setUserId(Y.utils.generateGuid())
      }
    }
    resetAuth (auth) {
      if (this.authInfo !== auth) {
        this.authInfo = auth
        this.broadcast({
          type: 'auth',
          auth: this.authInfo
        })
      }
    }
    reconnect () {
      this.log('reconnecting..')
      return this.y.db.startGarbageCollector()
    }
    disconnect () {
      this.log('discronnecting..')
      this.connections = {}
      this.isSynced = false
      this.currentSyncTarget = null
      this.syncingClients = []
      this.whenSyncedListeners = []
      this.y.db.stopGarbageCollector()
      return this.y.db.whenTransactionsFinished()
    }
    repair () {
      this.log('Repairing the state of Yjs. This can happen if messages get lost, and Yjs detects that something is wrong. If this happens often, please report an issue here: https://github.com/y-js/yjs/issues')
      for (var name in this.connections) {
        this.connections[name].isSynced = false
      }
      this.isSynced = false
      this.currentSyncTarget = null
      this.findNextSyncTarget()
    }
    setUserId (userId) {
      if (this.userId == null) {
        this.log('Set userId to "%s"', userId)
        this.userId = userId
        return this.y.db.setUserId(userId)
      } else {
        return null
      }
    }
    onUserEvent (f) {
      this.userEventListeners.push(f)
    }
    removeUserEventListener (f) {
      this.userEventListeners = this.userEventListeners.filter(g => { f !== g })
    }
    userLeft (user) {
      if (this.connections[user] != null) {
        this.log('User left: %s', user)
        delete this.connections[user]
        if (user === this.currentSyncTarget) {
          this.currentSyncTarget = null
          this.findNextSyncTarget()
        }
        this.syncingClients = this.syncingClients.filter(function (cli) {
          return cli !== user
        })
        for (var f of this.userEventListeners) {
          f({
            action: 'userLeft',
            user: user
          })
        }
      }
    }
    userJoined (user, role) {
      if (role == null) {
        throw new Error('You must specify the role of the joined user!')
      }
      if (this.connections[user] != null) {
        throw new Error('This user already joined!')
      }
      console.log('Connector.js[143] User joined: ', user, this.connections)
      // if (! global.userlist){
      //   global.userlist = []
      // }
      // global.userlist.push(user)

      this.connections[user] = {
        isSynced: false,
        role: role
      }
      for (var f of this.userEventListeners) {
        f({
          action: 'userJoined',
          user: user,
          role: role
        })
      }
      if (this.currentSyncTarget == null) {
        this.findNextSyncTarget()
      }
    }
    // Execute a function _when_ we are connected.
    // If not connected, wait until connected
    whenSynced (f) {
      if (this.isSynced) {
        f()
      } else {
        this.whenSyncedListeners.push(f)
      }
    }
    findNextSyncTarget () {
      if (this.currentSyncTarget != null) {
        return // "The current sync has not finished!"
      }
      console.log('Connector.js[171]');

      var syncUser = null
      for (var uid in this.connections) {
        if (!this.connections[uid].isSynced) {
          syncUser = uid
          break
        }
      }
      var conn = this
      if (syncUser != null) {
        this.currentSyncTarget = syncUser
        this.y.db.requestTransaction(function *() {
          var stateSet = yield* this.getStateSet()
          var deleteSet = yield* this.getDeleteSet()
          var answer = {
            type: 'sync step 1',
            stateSet: stateSet,
            deleteSet: deleteSet,
            protocolVersion: conn.protocolVersion,
            auth: conn.authInfo
          }
          conn.send(syncUser, answer)
        })
      } else {
        if (!conn.isSynced) {
          this.y.db.requestTransaction(function *() {
            if (!conn.isSynced) {
              // it is crucial that isSynced is set at the time garbageCollectAfterSync is called
              conn.isSynced = true
              yield* this.garbageCollectAfterSync()
              // call whensynced listeners
              for (var f of conn.whenSyncedListeners) {
                f()
              }
              conn.whenSyncedListeners = []
            }
          })
        }
      }
    }
    send (uid, message) {
      console.log('Send \'%s\' to %s', message.type, uid)
      console.log('Message: %j', message)
      // to bypass the wierd slowness of server -> server communication
      if (uid === 'server' && (message.type === 'sync step 1' || message.type === 'sync step 2')){
        console.log('connector.js[216]')
        this.receiveMessage('server', message)
      }
    }

    broadcast (message) {
      console.log('Broadcast \'%s\'', message.type)
      console.log('Message: %j', message)
    }
    /*
      Buffer operations, and broadcast them when ready.
    */
    broadcastOps (ops) {
      console.log('Connector.js[221]','broadcast', ops);

      var self = this
    
      ops = ops.map(function (op) {
        return Y.Struct[op.struct].encode(op)
      })
      
      function broadcastOperations () {
        if (self.broadcastOpBuffer.length > 0) {
          self.broadcast({
            type: 'update',
            ops: self.broadcastOpBuffer
          })
          self.broadcastOpBuffer = []
        }
      }

      if (this.broadcastOpBuffer.length === 0) {
        this.broadcastOpBuffer = ops
        if (this.y.db.transactionInProgress) {
          this.y.db.whenTransactionsFinished().then(broadcastOperations)
        } else {
          setTimeout(broadcastOperations, 0)
        }
      } else {
        this.broadcastOpBuffer = this.broadcastOpBuffer.concat(ops)
      }
    }
    /*
      You received a raw message, and you know that it is intended for Yjs. Then call this function.
    */
    receiveMessage (sender/* :UserId */, message/* :Message */) {
      console.log('Connector.js[251]','sender',sender, message);

      const initOtherCursor = (editor, position) => {
        let marker = {}
        marker.cursors = [position]
        marker.update = function(html, markerLayer, session, config) {
          let start = config.firstRow, end = config.lastRow;
          let cursors = this.cursors
              for (var i = 0; i < cursors.length; i++) {
                  var pos = this.cursors[i];
                  if (pos.row < start) {
                      continue
                  } else if (pos.row > end) {
                      break
                  } else {
                      // compute cursor position on screen this code is based on ace/layer/marker.js
                      // let screenPos = session.documentToScreenPosition(pos)
                      let height = config.lineHeight;
                      let width = config.characterWidth;
                      // let top = markerLayer.$getTop(screenPos.row, config);
                      // let left = markerLayer.$padding + screenPos.column * width;
                      let left = markerLayer.$padding + 
                        (session.$bidiHandler.isBidiRow(pos.row, position.row)
                        ? session.$bidiHandler.getPosLeft(pos.column)
                        : pos.column * config.characterWidth);

                      let top = (pos.row - config.firstRowScreen) * config.lineHeight;
                      // can add any html here
                      html.push(
                          "<div class='MyCursorClass' style='",
                          "height:", height, "px;",
                          "top:", top, "px;",
                          "left:", left, "px; width:", width, "px'></div>"
                      );
                  }
              }
        }
        marker.redraw = function() {
            this.session._signal("changeFrontMarker");
        }
        marker.addCursor = function() {
            marker.redraw()
        }
        marker.session = editor.session;
        marker.session.addDynamicMarker(marker, true)
        return marker
      }

      // update other cursors || pass other message
      if (message.ops){
        if (message.ops[0].struct == 'Delete'){
          let target = message.ops[0].target
          let type = target[target.length-1]
          if (type === 'Cursor' || type === 'ChangeFile' ){
            if (global.yAce && target[0] !== this.userId){
              let data = target[target.length-2]
              if (type === 'Cursor'){
                setTimeout(() => {
                  // console.log('bingo[269]', this.userId)
                  const ref = window.env.split.$editors[data.editorIndex]
                  // if (global.cursorIndex && global.otherMarker) {
                  //   if (data.editorIndex !== global.cursorIndex){
                  //     let win = window.env.split.$editors[global.cursorIndex]
                  //     let elem = win.container.getElementsByClassName("MyCursorClass")[0].parentNode
                  //     win.renderer.session.removeMarker(global.otherMarker.id)
                  //     console.log('[334]', global.cursorIndex, data.editorIndex)
                  //     while (elem.firstChild){
                  //       console.log('[336]', elem)
                  //       elem.removeChild(elem.firstChild)
                  //     }
                  //   }
                  // }
                  if (! global.otherMarker) global.otherMarker = {}

                  if (!global.otherMarker[data.editorIndex]){
                    global.otherMarker[data.editorIndex] = initOtherCursor(ref, data.pos)
                  } else {
                    // console.log('Connector.js[329]', global.otherMarker);
                    global.otherMarker[data.editorIndex].cursors = [data.pos]
                    global.otherMarker[data.editorIndex].redraw()
                  }

                  // const Cursor = ref.renderer.$cursorLayer
                  // Cursor.updateOtherCursor(data.pos, Cursor.cursors[1], Cursor.config, ref)
                }, 10)
              } else {
                let editor = window.env.split.getEditor(data.index)
                let fullPath = path.join(window.currentDirectory, data.path)
                editor.header.textContent = data.filename
                editor.filePath = fullPath
              }
              return;
            } else {
              console.log('Connector.js[279]', message)
              target.unshift(sender, 0)
            }
          }
        }
      }

      if (sender === this.userId) {
        console.log('Connector[269]', 'promise resolve()')
        return Promise.resolve()
      }

      if (message.protocolVersion != null && message.protocolVersion !== this.protocolVersion) {
        console.log(
          `You tried to sync with a yjs instance that has a different protocol version
          (You: ${this.protocolVersion}, Client: ${message.protocolVersion}).
          The sync was stopped. You need to upgrade your dependencies (especially Yjs & the Connector)!
          `)
        this.send(sender, {
          type: 'sync stop',
          protocolVersion: this.protocolVersion
        })
        return Promise.reject('Incompatible protocol version')
      }

      if (message.auth != null && this.connections[sender] != null) {
        // authenticate using auth in message
        var auth = this.checkAuth(message.auth, this.y, sender)
        this.connections[sender].auth = auth
        auth.then(auth => {
          for (var f of this.userEventListeners) {
            f({
              action: 'userAuthenticated',
              user: sender,
              auth: auth
            })
          }
        })
      } else if (this.connections[sender] != null && this.connections[sender].auth == null) {
        // authenticate without otherwise
        this.connections[sender].auth = this.checkAuth(null, this.y, sender)
      }
      console.log('Connector.js[293]', message);


      if (this.connections[sender] != null && this.connections[sender].auth != null) {
        return this.connections[sender].auth.then((auth) => {
          if (message.type === 'sync step 1' && canRead(auth)) {
            console.log('Connector.js[320] sync 1')
            let conn = this
            let m = message

            this.y.db.requestTransaction(function *() {
              var currentStateSet = yield* this.getStateSet()
              if (canWrite(auth)) {
                yield* this.applyDeleteSet(m.deleteSet)
              }

              var ds = yield* this.getDeleteSet()
              var answer = {
                type: 'sync step 2',
                stateSet: currentStateSet,
                deleteSet: ds,
                protocolVersion: this.protocolVersion,
                auth: this.authInfo
              }
              answer.os = yield* this.getOperations(m.stateSet)
              conn.send(sender, answer)
              if (this.forwardToSyncingClients) {
                conn.syncingClients.push(sender)

                console.log('Connector.js[322]','sync clients', conn.syncingClients);

                setTimeout(function () {
                  conn.syncingClients = conn.syncingClients.filter(function (cli) {
                    return cli !== sender
                  })
                  conn.send(sender, {
                    type: 'sync done'
                  })
                }, 5000) // TODO: conn.syncingClientDuration)
              } else {
                conn.send(sender, {
                  type: 'sync done'
                })
              }
            })
          } else if (message.type === 'sync step 2' && canWrite(auth)) {
            console.log('Connector.js[359] sync 2')
            var db = this.y.db
            var defer = {}
            defer.promise = new Promise(function (resolve) {
              defer.resolve = resolve
            })
            this.syncStep2 = defer.promise
            let m /* :MessageSyncStep2 */ = message
            db.requestTransaction(function * () {
              yield* this.applyDeleteSet(m.deleteSet)
              if (m.osUntransformed != null) {
                yield* this.applyOperationsUntransformed(m.osUntransformed, m.stateSet)
              } else {
                this.store.apply(m.os)
              }
              /*
               * This just sends the complete hb after some time
               * Mostly for debugging..
               *
              db.requestTransaction(function * () {
                var ops = yield* this.getOperations(m.stateSet)
                if (ops.length > 0) {
                  if (!broadcastHB) { // TODO: consider to broadcast here..
                    conn.send(sender, {
                      type: 'update',
                      ops: ops
                    })
                  } else {
                    // broadcast only once!
                    conn.broadcastOps(ops)
                  }
                }
              })
              */
              defer.resolve()
            })
          } else if (message.type === 'sync done') {
            console.log('Connector.js[395] sync done')
            var self = this
            this.syncStep2.then(function () {
              self._setSyncedWith(sender)
            })
          } else if (message.type === 'update' && canWrite(auth) && !message._str) {
            console.log('Connector.js[376]', auth, this.syncingClients);
            if (this.forwardToSyncingClients) {
              // only send opponent's cursor position
              // if (message.struct === 'Cursor') {
              //   for (var client of this.syncingClients) {
              //     if (sender !== client) {
              //       console.log('Connector.js[398]', sender)
              //       this.send(client, message)
              //     }
              //   }
              // } else {
              // }

              for (var client of this.syncingClients) {
                console.log('Connector.js[404]',client,message);
                this.send(client, message)
              }
            }
            if (this.y.db.forwardAppliedOperations){ //&& message.struct !== 'Cursor') {
              const delops = message.ops.filter(o => o.struct === 'Delete')
              if (delops.length > 0) {
                this.broadcastOps(delops)
              }
            }
            // apply received changes to text
            this.y.db.apply(message.ops)

          } 
          // else if (message._str){
          //   console.log('Connector.js[428]', message, this.userId)
          //   for (var client of this.syncingClients) {
          //     console.log('Connector.js[398]', sender)
          //     this.send(this.userId, message)
          //   }
          //   message.id = [this.userId, 0]
          //   this.y.db.apply([message])
          // }

        })
      } else {
        return Promise.reject('Unable to deliver message')
      }
    }
    _setSyncedWith (user) {
      var conn = this.connections[user]
      if (conn != null) {
        conn.isSynced = true
      }
      if (user === this.currentSyncTarget) {
        this.currentSyncTarget = null
        this.findNextSyncTarget()
      }
    }
    /*
      Currently, the HB encodes operations as JSON. For the moment I want to keep it
      that way. Maybe we support encoding in the HB as XML in the future, but for now I don't want
      too much overhead. Y is very likely to get changed a lot in the future

      Because we don't want to encode JSON as string (with character escaping, wich makes it pretty much unreadable)
      we encode the JSON as XML.

      When the HB support encoding as XML, the format should look pretty much like this.

      does not support primitive values as array elements
      expects an ltx (less than xml) object
    */
    parseMessageFromXml (m/* :any */) {
      function parseArray (node) {
        for (var n of node.children) {
          if (n.getAttribute('isArray') === 'true') {
            return parseArray(n)
          } else {
            return parseObject(n)
          }
        }
      }
      function parseObject (node/* :any */) {
        var json = {}
        for (var attrName in node.attrs) {
          var value = node.attrs[attrName]
          var int = parseInt(value, 10)
          if (isNaN(int) || ('' + int) !== value) {
            json[attrName] = value
          } else {
            json[attrName] = int
          }
        }
        for (var n/* :any */ in node.children) {
          var name = n.name
          if (n.getAttribute('isArray') === 'true') {
            json[name] = parseArray(n)
          } else {
            json[name] = parseObject(n)
          }
        }
        return json
      }
      parseObject(m)
    }
    /*
      encode message in xml
      we use string because Strophe only accepts an "xml-string"..
      So {a:4,b:{c:5}} will look like
      <y a="4">
        <b c="5"></b>
      </y>
      m - ltx element
      json - Object
    */
    encodeMessageToXml (msg, obj) {
      // attributes is optional
      function encodeObject (m, json) {
        for (var name in json) {
          var value = json[name]
          if (name == null) {
            // nop
          } else if (value.constructor === Object) {
            encodeObject(m.c(name), value)
          } else if (value.constructor === Array) {
            encodeArray(m.c(name), value)
          } else {
            m.setAttribute(name, value)
          }
        }
      }
      function encodeArray (m, array) {
        m.setAttribute('isArray', 'true')
        for (var e of array) {
          if (e.constructor === Object) {
            encodeObject(m.c('array-element'), e)
          } else {
            encodeArray(m.c('array-element'), e)
          }
        }
      }
      if (obj.constructor === Object) {
        encodeObject(msg.c('y', { xmlns: 'http://y.ninja/connector-stanza' }), obj)
      } else if (obj.constructor === Array) {
        encodeArray(msg.c('y', { xmlns: 'http://y.ninja/connector-stanza' }), obj)
      } else {
        throw new Error("I can't encode this json!")
      }
    }
  }
  Y.AbstractConnector = AbstractConnector
}
