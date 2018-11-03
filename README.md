# dragpad
Small, no dependencies HTML/JS component that can be used as a flipswitch, slider, bidimensional slider, progress bar, etc

## How To Use
1. Include the following files:<br>
**css/dragpad.structure.css**<br>
**css/dragpad.theme.css** _(you can customize or replace the theme file)_<br>
**js/dragpad.js**<br>

2. Call the function `dragpad` passing the parent element as the firt parameter (ID as string or the element itself) and
an options object as second parameter.
```javascript
dragpad('parent', {...});
//if you want a reference
var dp = new (parentElm, {...});
```
3. That's it. There's a _sample.html_ file include.

## Options
Name | Type | Description | Default
---- | ---- | ----------- | -------
**padWidth** | _String_ | Width of the pad. Any CSS value. | `'200px'`
**padHeight** | _String_ | Height of the pad. Any CSS value. | `'180px'`
**padCapture** | _Boolean_ | If clicking on the pad captures the handle. | `false`
**padHTML** | _String_ | HTML to be inserted inside the pad. | `undefined`
**padClass** | _String_ | Pad's CSS class. | `undefined`
**handleWidth** | _String_ | Width of the handle. Any CSS value. | `'40px'`
**handleHeight** | _String_ | Height of the handle. Any CSS value. | `'40px'`
**handleHTML** | _String_ | HTML to be inserted inside the handle. | `undefined`
**handleClass** | _String_ | Handle's CSS class | `undefined`
**wrapperClass** | _String_ | CSS class for the wrapper element (pad's parent) | `undefined`
**interactive** | _Boolean_ | If the component respondes to user actions. | `true`
**vertMargins** | _String_ | Pad's top and bottom margins. Left it as undefined to calculate it automatically.  | `undefined`
**horzMargins** | _String_ | Pad's left and right margins. Left it as undefined to calculate it automatically. | `undefined`
**autoDOMInsert** | _Boolean_ | Inserts elements into DOM as soon as the component is created, otherwise you'll have to call `DOMInsert` | `true`
**startX** | _Number_ \| _String_ | Starting position of the handle's X axis. If it's a string `startY` must be a string too. | `0`
**startY** | _Number_ \| _String_ | Starting position of the handle's y axis. If it's a string `startX` must be a string too. | `0`
**onBeforeMove** | _Function_ | Called before the handle moves. Receives an event object. Return `false` to cancel the action. | `undefined`
**onAfterMove** | _Function_ | Called after the handle moves. Receives an event object. | `undefined`
**onStartMove** | _Function_ | Called when the handle starts moving. Receives a reference to the component. | `undefined`
**onEndMove** | _Function_ | Called when the handle stops moving. Receives a reference to the component. | `undefined`
**onCreated** | _Function_ | Called after the elements have been inserted into DOM. Receives a reference to the component. | `undefined`
**onResized** | _Function_ | Called when the component is resized, generally due a window resize. Receives an event object. | `undefined`

## Event Object
Property | Type | Description
-------- | ---- | -----------
**x** | _Number_ | New (or user defined) X position.
**y** | _Number_ | New (or user defined) Y position.
**currentX** | _Number_ | Handle's X current position.
**currentY** | _Number_ | Handle's Y current position
**maxX** | _Number_ | Pad's width.
**maxY** | _Number_ | Pad's height.

## Properties
Name | Type | Description
---- | ---- | -----------
**handleX** | _Number_ | Gets or sets handle's current X position
**handleY** | _Number_ | Gets or sets handle's current Y position
**handleXPerc** | _Number_ | Gets or sets handle's current X position in percentage (0 <> 100)
**handleYPerc** | _Number_ | Gets or sets handle's current Y position in percentage (0 <> 100)
**padWidth** | _Number_ | Gets or sets the pad width
**pasHeight** | _Number_ | Gets or sets the pad height
**interactive** | _Boolean_ | Enables or disables user interaction

## Methods
Name | Description
---- | -----------
**moveHandleTo** | Moves the handle<br>_Params:_ `x: number, y: number`
**moveHandleToPerc** | Moves the handle using percentage<br>_Params:_ `x: number, y: number`
**refreshState** | Forces a refresh
**DOMInsert** | Call it to insert elements into DOM if `autoDOMInsert` was `false`
