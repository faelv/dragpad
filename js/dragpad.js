"use strict";

function dragpad(parentElement, options) {
  //PRIVATE
  var self = this;
  var props = {
    wrapper:    {element: null},
    pad:        {element: null, rect: null, offsetX: 0, offsetY: 0},
    handle:     {element: null, rect: null, offsetX: 0, offsetY: 0, capture: false, x: 0, y: 0, percX: 0, percY: 0},
    padHTMLDiv: {element: null},
    hdlHTMLDiv: {element: null}
  };
  var handleMoveEvent = {x: 0, y: 0, currentX: 0, currentY: 0, maxX: 0, maxY: 0};
  var padEventTgt = null;
  var pNode = null;
  var inserted = false;
  var calcSscrollOffset = false;
  
  function toInt(value) {
    return Math.round(value); //floor or ceil
  };
  
  function toRange(value, min, max) {
    return Math.max(min, Math.min(max, value));
  };
  
  function padEventListener(event) {
    event.preventDefault();
    
    if (!options.interactive) { return; }
    
    padEventTgt = event.target;
    while (padEventTgt !== props.handle.element && padEventTgt !== props.pad.element) {
      padEventTgt = padEventTgt.parentElement;
      if (padEventTgt === null || padEventTgt === undefined) { return; }
    }
    
    switch (event.type) {
      case "mousedown":   
        updateRects();
        props.handle.capture = options.padCapture || (padEventTgt === props.handle.element);
        if (props.handle.capture) {
          if (padEventTgt.setCapture) { padEventTgt.setCapture(); }
          if (callOnStartMove() === false) { props.handle.capture = false; }
        }
        break;  
      case "mouseup":  
        updateRects();
        props.handle.capture = false;
        if (document.releaseCapture) { document.releaseCapture(); }
        callOnEndMove();
        break;      
      case "mousemove":
        if (!props.handle.capture) { return; }        
        moveHandleTo(
          event.pageX - (props.pad.rect.left + props.pad.offsetX),
          event.pageY - (props.pad.rect.top + props.pad.offsetY)
        );         
        break;
      case "touchstart":
        updateRects();
        props.handle.capture = (
          event.targetTouches.length > 0 &&
          (options.padCapture || padEventTgt === props.handle.element)
        );
        if (props.handle.capture) {
          if (callOnStartMove() === false) { props.handle.capture = false; }
        }
        break;
      case "touchend":
      case "touchcancel":
        updateRects();
        props.handle.capture = event.targetTouches.length > 0;
        if (!props.handle.capture) {
          callOnEndMove();
        }
        break;
      case "touchmove":
        if (!props.handle.capture || (event.targetTouches.length === 0)) { return; }         
        moveHandleTo(
          event.targetTouches[0].pageX - (props.pad.rect.left + props.pad.offsetX),
          event.targetTouches[0].pageY - (props.pad.rect.top + props.pad.offsetY)
        );   
        break;      
    }
  };
  
  function resizeEventListener() {
    refreshState();
    callOnResized(handleMoveEvent);
  };
  
  function callOnBeforeMove(event) {
    if (options.onBeforeMove) {
      event.currentX = props.handle.x;
      event.currentY = props.handle.y;
      event.maxX = props.pad.rect.width;
      event.maxY = props.pad.rect.height;
      return options.onBeforeMove(event);
    } 
  };
  
  function callOnAfterMove(event) {
    if (options.onAfterMove) {
      event.x = event.currentX = props.handle.x;
      event.y = event.currentY = props.handle.y;
      event.maxX = props.pad.rect.width;
      event.maxY = props.pad.rect.height;
      options.onAfterMove(event);
    }
  };
  
  function callOnStartMove() {
    if (options.onStartMove) { return options.onStartMove(self); }
  };
  
  function callOnEndMove() {
    if (options.onEndMove) { options.onEndMove(self); }
  };
  
  function callOnCreated() {
    if (options.onCreated) { options.onCreated(self); }
  };
  
  function callOnResized(event) {
    if (options.onResized) {
      event.x = event.currentX = props.handle.x;
      event.y = event.currentY = props.handle.y;
      event.maxX = props.pad.rect.width;
      event.maxY = props.pad.rect.height;
      options.onResized(event);
    }
  }
  
  function updateRects() {
    props.pad.rect = props.pad.element.getBoundingClientRect();
    if (!calcSscrollOffset) {
      props.pad.offsetX = 0;
      props.pad.offsetY = 0;
    } else {
      props.pad.offsetX = window.pageXOffset;
      props.pad.offsetY = window.pageYOffset;
      pNode = props.pad.element.parentNode;
      while (pNode !== document.body) {
        props.pad.offsetX += pNode.scrollLeft;
        props.pad.offsetY += pNode.scrollTop;
        pNode = pNode.parentNode;
      }
    }
    if (!calcSscrollOffset) {
      props.handle.rect = props.handle.element.getBoundingClientRect();
      props.handle.offsetX = 0;
      props.handle.offsetY = 0;
    } else {
      props.handle.offsetX = window.pageXOffset;
      props.handle.offsetY = window.pageYOffset;
      pNode = props.handle.element.parentNode;
      while (pNode !== document.body) {
        props.handle.offsetX += pNode.scrollLeft;
        props.handle.offsetY += pNode.scrollTop;
        pNode = pNode.parentNode;
      }
    }
  };
  
  function refreshState() {
    updateRects();
    moveHandleToPerc(props.handle.percX, props.handle.percY);
  }
  
  function moveHandleToPerc(x, y) {
    moveHandleTo(
      (typeof x === "number") ? props.pad.rect.width / 100 * toRange(x, 0, 100) : undefined,
      (typeof y === "number") ? props.pad.rect.height / 100 * toRange(y, 0, 100) : undefined
    );
  };
  
  function moveHandleTo(x, y) {
    handleMoveEvent.x = (typeof x === "number") ? toRange(x, 0, props.pad.rect.width) : props.handle.x;    
    handleMoveEvent.y = (typeof y === "number") ? toRange(y, 0, props.pad.rect.height) : props.handle.y;        
    
    if (callOnBeforeMove(handleMoveEvent) === false) { return; }  
    
    props.handle.x = toRange(handleMoveEvent.x, 0, props.pad.rect.width);
    props.handle.y = toRange(handleMoveEvent.y, 0, props.pad.rect.height);  
    
    props.handle.percX = 100 * props.handle.x / props.pad.rect.width;
    props.handle.percY = 100 * props.handle.y / props.pad.rect.height;
     
    props.handle.element.style.left = toInt(props.handle.x - (props.handle.rect.width /2)) + "px";
    props.handle.element.style.top  = toInt(props.handle.y - (props.handle.rect.height /2)) + "px";
    
    callOnAfterMove(handleMoveEvent);
  };
  
  function DOMInsert() {
    if (inserted) { return; }
    inserted = true;
    
    props.handle.element.appendChild(props.hdlHTMLDiv.element);
    props.pad.element.appendChild(props.handle.element);
    props.pad.element.appendChild(props.padHTMLDiv.element);
    props.wrapper.element.appendChild(props.pad.element);  
    parentElement.appendChild(props.wrapper.element);

    updateRects();

    props.pad.element.style.marginLeft = (options.horzMargins === undefined) ?
      toInt(props.handle.rect.width / 2) + "px" : options.horzMargins;
    props.pad.element.style.marginTop = (options.vertMargins === undefined) ?
      toInt(props.handle.rect.height / 2) + "px" : options.vertMargins;
    props.pad.element.style.marginRight = props.pad.element.style.marginLeft;
    props.pad.element.style.marginBottom = props.pad.element.style.marginTop;
    
    callOnCreated();

    props.pad.element.addEventListener("mousedown",   padEventListener);
    props.pad.element.addEventListener("mouseup",     padEventListener);
    props.pad.element.addEventListener("mousemove",   padEventListener);    

    props.pad.element.addEventListener("touchstart",  padEventListener);
    props.pad.element.addEventListener("touchmove",   padEventListener);
    props.pad.element.addEventListener("touchend",    padEventListener);
    props.pad.element.addEventListener("touchcancel", padEventListener);

    window.addEventListener("resize", resizeEventListener);

    if ("number" === (typeof options.startX) === (typeof options.startY)) {
      moveHandleTo(options.startX, options.startY);
    } else {
      options.startX = options.startX.toString();
      options.startY = options.startY.toString();
      if (options.startX.indexOf("%") >= 0 || options.startY.indexOf("%") >= 0) {
        moveHandleToPerc(
          Number(options.startX.replace(/[^0-9.]/g, "")),
          Number(options.startY.replace(/[^0-9.]/g, ""))
        );
      }
    }
  }
  
  //PUBLIC
  if (typeof self === "object" && self !== null) {
    Object.defineProperties(this, {
      handleX: {
        get: function () { return props.handle.x; },
        set: function(value) { moveHandleTo(value, undefined); },
        configurable: false, enumerable: false
      },
      handleY:  {
        get: function () { return props.handle.y; },
        set: function (value) { moveHandleTo(undefined, value); },
        configurable: false, enumerable: false
      },
      handleXPerc: {
        get: function () { return props.handle.percX; },
        set: function(value) { moveHandleToPerc(value, undefined); },
        configurable: false, enumerable: false
      },
      handleYPerc: {
        get: function () { return props.handle.percY; },
        set: function(value) { moveHandleToPerc(undefined, value); },
        configurable: false, enumerable: false
      },
      padWidth: {
        get: function () { return props.pad.rect.width; },
        set: undefined,
        configurable: false, enumerable: false
      },
      padHeight: {
        get: function () { return props.pad.rect.height; },
        set: undefined,
        configurable: false, enumerable: false
      },
      interactive : {
        get: function () { return options.interactive; },
        set function (value) { if (typeof value === "boolean") { options.interactive = value; } },
        configurable: false, enumerable: false
      }
    });

    this.moveHandleTo = moveHandleTo;
    this.moveHandleToPerc = moveHandleToPerc;
    this.refreshState = refreshState;
    this.DOMInsert = DOMInsert;
  }
  
  //MAIN  
  if (typeof parentElement === "string") {
    parentElement = document.getElementById(parentElement);    
  }
  if (typeof parentElement !== "object" || parentElement === null) {
    throw "DragPad -> invalid parentElement";
  }
  
  options.padWidth      = (typeof options.padWidth === "string")       ? options.padWidth      : "200px";
  options.padHeight     = (typeof options.padHeight === "string")      ? options.padHeight     : "180px";
  options.padCapture    = (typeof options.padCapture === "boolean")    ? options.padCapture    : false;  
  options.padHTML       = (typeof options.padHTML === "string")        ? options.padHTML       : undefined;
  options.handleWidth   = (typeof options.handleWidth === "string")    ? options.handleWidth   : "40px";
  options.handleHeight  = (typeof options.handleHeight === "string")   ? options.handleHeight  : "40px";    
  options.handleHTML    = (typeof options.handleHTML === "string")     ? options.handleHTML    : undefined;
  options.onBeforeMove  = (typeof options.onBeforeMove === "function") ? options.onBeforeMove  : undefined;
  options.onAfterMove   = (typeof options.onAfterMove === "function")  ? options.onAfterMove   : undefined;  
  options.onStartMove   = (typeof options.onStartMove === "function")  ? options.onStartMove   : undefined;
  options.onEndMove     = (typeof options.onEndMove === "function")    ? options.onEndMove     : undefined;  
  options.onCreated     = (typeof options.onCreated === "function")    ? options.onCreated     : undefined;  
  options.onResized     = (typeof options.onResized === "function")    ? options.onResized     : undefined;  
  options.interactive   = (typeof options.interactive === "boolean")   ? options.interactive   : true;  
  options.vertMargins   = (typeof options.vertMargins === "string")    ? options.vertMargins   : undefined; 
  options.horzMargins   = (typeof options.horzMargins === "string")    ? options.horzMargins   : undefined; 
  options.autoDOMInsert = (typeof options.autoDOMInsert === "boolean") ? options.autoDOMInsert : true;
  options.startX        = (["string", "number"].indexOf(typeof options.startX) >= 0) ? options.startX : 0;
  options.startY        = (["string", "number"].indexOf(typeof options.startY) >= 0) ? options.startY : 0;  
  
  props.wrapper.element    = document.createElement("div");
  props.pad.element        = document.createElement("div");
  props.handle.element     = document.createElement("div");
  props.padHTMLDiv.element = document.createElement("div");
  props.hdlHTMLDiv.element = document.createElement("div"); 

  props.wrapper.element.className    = "dp-wrapper";
  props.pad.element.className        = "dp-pad";
  props.handle.element.className     = "dp-handle";
  props.padHTMLDiv.element.className = "dp-pad-html-div";
  props.hdlHTMLDiv.element.className = "dp-handle-html-div";
  
  if (options.wrapperClass) { props.wrapper.element.className += " " + options.wrapperClass; }
  if (options.padClass)     { props.pad.element.className     += " " + options.padClass; }
  if (options.handleClass)  { props.handle.element.className  += " " + options.handleClass; } 
  
  props.pad.element.style.width = options.padWidth;
  props.pad.element.style.height = options.padHeight;
  props.handle.element.style.width = options.handleWidth;
  props.handle.element.style.height = options.handleHeight;
  
  if (options.padHTML) {        
    props.padHTMLDiv.element.innerHTML = options.padHTML;
  } else {
    props.padHTMLDiv.element.style.display = "none";
  }
  
  if (options.handleHTML) {
    props.hdlHTMLDiv.element.innerHTML = options.handleHTML;
  } else {
    props.hdlHTMLDiv.element.style.display = "none";
  }
  
  if (options.autoDOMInsert) {
    DOMInsert();
  }  
}
