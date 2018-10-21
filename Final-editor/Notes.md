# Process
electron open 'cover.html'
click 'init connection' > 'node server/websocket_server.js' > 'yarn run start1' 

click 'peer connection' > window popup to enter ip > 'yarn run start1'
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

Text.js (aceCallback) > Utils (awaitAndPrematurelyCall) > Text.js (yCallback) > Connector.js (broadcastOps) > Utils.js (awaitOps) > Connector.js (receiveMessage) > server.js

# Problem
## no sync
because treat two computer having same ip, so same user

## run miltiple editor sync
declare multiple sharing class in 

## electron cannot find module
under different directory, need to navigate back to target location





# TODO
1. stop switch page sync 
2. create home page to connect/host
3. auto copy all files from peer, and then prepare to go
4. add file, delete file function






