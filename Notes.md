# Process
type "yarn run elec"
  > pass port arg '2998'
  > entry point defined in "package.json" => "main.js"
  > run "main.js"
  > load "cover.html", run "cover.js"
  > wait for event "load-editor"

click 'init connection' "cover.js"
  > 'yarn run dev 2998' => run "server.js"
    - start WebpackDevServer
    - start get file service [3002]
  > 'node server/websocket_server.js' 
    - start websocket server
    - open accept socket.io connection

loading editor, open "index.html"
  > start webpack compile all files from 'index.js' in "src/" => output file in 'dist/final.js'
  > run "render.js"



click 'peer connection' 
  > window popup to enter ip > 'yarn run start1'
  > if already has workspace chosen in host:
      if already has workspace prebuild (saved in cache):
        if can detect previous workspace:
          copy only changes in files
          (optional: backup previous version)
        else:
          ask to specify directory / create new
      else:
        open new directory specific for sharing
        copy all files under directory recursively to peers
    else:
      wait for any peer to choose directory (hint words)

Add editor
  - "brace/custom.js" > load "file_drop"
  <!-- - load "split.js" {manage editor splitting problem} -->
  - in index.js 
 

- other cases
if peer suddenly choose another directory:
  start new workpace in same window
  > repeat 'peer connection' steps
if exit certain directory:
  if homogeneous peer:
    pass
  elif heterogeneous peer (local host):
    switch host control


# identification
use special random key to denote workspace
store configuration in specific app location


#
assign Text.js to detect changes in text,
Array.js response to changes in text

# editor strucutre
```pug
head
  style#ace_editor.css
  style#ace-tm
  style(.error xxx)
  style#ace-chrome

body
  div#aceContainer
    div.editor-frame
    div.editor-frame
    ...
      div.editor-tab
      div.ace_editor
        div.ace_scroller
          div.ace_content
            div.ace_print-margin-layer
            div.ace_marker-layer

            div.ace_cursor-layer
              div.ace_cursor( style={ left,top,width,height })

            div.ace_text-layer
              div.ace_line
                span.ace_identifier
                span.ace_identifier
                ...
              div.ace_line
                span.ace_identifier
                ...
              ...
```

# Cursor
eg.
position: {row: 14, column: 3}
getPixelPosition(position)

## broadcast pos
only need to broadcast your current cursor pos {row, column}

## send to server msg
Connector.js:
  this.send(client, message)

y-text/src/Text.js (aceCallback) 
> yjs/src/Utils.js (awaitAndPrematurelyCall) 
> Text.js (yCallback) 
> Connector.js (broadcastOps) 
> Utils.js (awaitOps) 
> Connector.js (receiveMessage) 
> server.js

## sync process
'src/y-websockets-client/src/Websockets-client.js' -> constructor
  > this._onConnect => user joined (server)
  > "Connector.js" findNextSyncTarget
    - send msg 'sync step 1' (yjsEvent for socket.io)
    - "Websockets-client.js" this._onYjsEvent 
    - self.receiveMessage('server', msg)
    - "Connector.js" receiveMessage
    - trigger answer msg (sync step 2) -> send
    - send 'sync done'


# Problem
## no sync
because treat two computer having same ip, so same user

## run miltiple editor sync
declare multiple sharing class in 

## electron cannot find module
under different directory, need to navigate back to target location

## stuck in editor loading
becoz stuck in "Websockets-client.js" -> sync step 1






# TODO
1. stop switch page sync 
2. create home page to connect/host
3. auto copy all files from peer, and then prepare to go
4. add file, delete file function






