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
  div.ace_gutter

  div#aceContainer.ace_editor
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

# send to server msg
Connector.js:
  this.send(client, message)

Text.js (aceCallback) > Utils (awaitAndPrematurelyCall) > Text.js (yCallback) > Connector.js (broadcastOps) > Utils.js (awaitOps) > Connector.js (receiveMessage) > server.js

# Problem
## no sync
because treat two computer having same ip, so same user

















