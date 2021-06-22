/* --------------------------------------------------------
ObjectControls
version: 1.2.6
author: Alberto Piras
email: a.piras.ict@gmail.com
github: https://github.com/albertopiras
license: MIT
description: module for ThreeJS that allows you to rotate an Object(mesh) independently from the rest of the scene, and to zoom in/out moving the camera; for desktop and mobile.
----------------------------------------------------------*/

/**
 * ObjectControls
 * @constructor
 * @param camera - reference to the camera.
 * @param domElement - reference to the renderer's dom element.
 * @param objectToMove - reference the object to control.
 */
function ObjectControls(camera, domElement, objectToMove,scene,textures) {

  /**
  * setObjectToMove
  * @description changes the object(s) to control
  * @param newMesh
  **/
  this.setObjectToMove = function (newMesh) {
    mesh = newMesh;
  };

  /**
  * setZoomSpeed
  * @description sets a custom zoom speed (0.1 == slow  1 == fast)
  * @param newZoomSpeed
  **/
  this.setZoomSpeed = function (newZoomSpeed) {
    zoomSpeed = newZoomSpeed;
  };

  /**
  * setDistance
  * @description set the zoom range distance
  * @param {number} min
  * @param {number} max 
  **/
  this.setDistance = function (min, max) {
    minDistance = min;
    maxDistance = max;
  };

  /**
  * setRotationSpeed
  * @param {number} newRotationSpeed - (1 == fast)  (0.01 == slow)
  **/
  this.setRotationSpeed = function (newRotationSpeed) {
    rotationSpeed = newRotationSpeed;
  };

  /**
  * setRotationSpeedTouchDevices
  * @param {number} newRotationSpeed - (1 == fast)  (0.01 == slow)
  **/
  this.setRotationSpeedTouchDevices = function (newRotationSpeed) {
    rotationSpeedTouchDevices = newRotationSpeed;
  };

  this.enableVerticalRotation = function () {
    verticalRotationEnabled = true;
  };

  this.disableVerticalRotation = function () {
    verticalRotationEnabled = false;
  };

  this.enableHorizontalRotation = function () {
    horizontalRotationEnabled = true;
  };

  this.disableHorizontalRotation = function () {
    horizontalRotationEnabled = false;
  };

  this.setMaxVerticalRotationAngle = function (min, max) {
    MAX_ROTATON_ANGLES.x.from = min;
    MAX_ROTATON_ANGLES.x.to = max;
    MAX_ROTATON_ANGLES.x.enabled = true;
  };

  this.setMaxHorizontalRotationAngle = function (min, max) {
    MAX_ROTATON_ANGLES.y.from = min;
    MAX_ROTATON_ANGLES.y.to = max;
    MAX_ROTATON_ANGLES.y.enabled = true;
  };

  this.disableMaxHorizontalAngleRotation = function () {
    MAX_ROTATON_ANGLES.y.enabled = false;
  };

  this.disableMaxVerticalAngleRotation = function () {
    MAX_ROTATON_ANGLES.x.enabled = false;
  };

  this.disableZoom = function () {
    zoomEnabled = false;
  }

  this.enableZoom = function () {
    zoomEnabled = true;
  }

  domElement = (domElement !== undefined) ? domElement : document;

  /********************* Private control variables *************************/

  const MAX_ROTATON_ANGLES = {
    x: {
      // Vertical from bottom to top.
      enabled: false,
      from: Math.PI / 8,
      to: Math.PI / 8
    },
    y: {
      // Horizontal from left to right.
      enabled: false,
      from: Math.PI / 4,
      to: Math.PI / 4
    }
  };

  let
    flag,
    mesh = objectToMove,
    maxDistance = 300,
    minDistance = 300,
    zoomSpeed = 0.5,
    rotationSpeed = 0.05,
    rotationSpeedTouchDevices = 0.00005,
    isDragging = false,
    verticalRotationEnabled = false,
    horizontalRotationEnabled = true,
    zoomEnabled = true,
    mouseFlags = { MOUSEDOWN: 0, MOUSEMOVE: 1 },
    previousMousePosition = { x: 0, y: 0 },
    prevZoomDiff = { X: null, Y: null },
    sides = 32,
    /**
    * CurrentTouches
    * length 0 : no zoom
    * length 2 : is zoomming
    */
    currentTouches = [];

    
    let currentSide = 0;
  let currentSideTexture = textures[currentSide]
  scene.background = currentSideTexture
  console.log(domElement.width,domElement.height,currentSideTexture.image.width,currentSideTexture.image.height)
  fitTexture(domElement.width,domElement.height,currentSideTexture.image.width, currentSideTexture.image.height)

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

    let impliedRotation = mesh.rotation.y
  /***************************** Private shared functions **********************/

  function zoomIn() {
    camera.position.z -= zoomSpeed;
  }

  function zoomOut() {
    camera.position.z += zoomSpeed;
  }

  function rotateVertical(deltaMove, mesh) {
    if (mesh.length > 1) {
      for (let i = 0; i < mesh.length; i++) {
        rotateVertical(deltaMove, mesh[i])
      }
      return;
    }
    mesh.rotation.x += Math.sign(deltaMove.y) * rotationSpeed;

  }

  function rotateVerticalTouch(deltaMove, mesh) {
    if (mesh.length > 1) {
      for (let i = 0; i < mesh.length; i++) {

        rotateVerticalTouch(deltaMove, mesh[i])
      }
      return;
    }
    mesh.rotation.x += Math.sign(deltaMove.y) * rotationSpeedTouchDevices;
  }

  function fitTexture(targetWidth, targetHeight, imageWidth,imageHeight){
    const targetAspect = targetWidth / targetHeight;
    const imageAspect = imageWidth / imageHeight;
    const factor = imageAspect / targetAspect;
    // When factor larger than 1, that means texture 'wilder' than target。 
    // we should scale texture height to target height and then 'map' the center  of texture to target， and vice versa.
    scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
    scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
    scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;
    scene.background.repeat.y = factor > 1 ? 1 : factor;
  }



  function rotateHorizontal(deltaMove, mesh) {
    if (mesh.length > 1) {
      for (let i = 0; i < mesh.length; i++) {

        rotateHorizontal(deltaMove, mesh[i])

      }
      return;
    }

      // if (proposedRotation % Math.PI * 2 != mesh.rotation.y % Math.PI * 2 ){
    currentSide += 1 * -Math.sign(deltaMove.x)
        currentSide = currentSide == sides ? 0 : currentSide
      currentSide = currentSide < 0 ? sides -1 : currentSide
    currentSideTexture = textures[currentSide]
        scene.background = currentSideTexture
    fitTexture(domElement.width, domElement.height, currentSideTexture.image.width, currentSideTexture.image.height)


    mesh.rotation.y += Math.sign(deltaMove.x)  * Math.PI*2 / sides

      // }
    }

    // let boundedImpliedRotation = findThreshold(thresholds, impliedRotation) || 0
    // console.log('impliedRotation, boundedImpliedRotation,meshRotation',impliedRotation,boundedImpliedRotation.toFixed(6),mesh.rotation.y)

    // if (mesh.rotation.y != boundedImpliedRotation.toFixed(6)){
    //   console.log('rotating',mesh.rotation.y,boundedImpliedRotation.toFixed(6))
    //   mesh.rotation.y = boundedImpliedRotation.toFixed(6)
    // }

  

  function isRotationPermissable(impliedRotation, numberOfSides){
    var rotation = (impliedRotation % Math.PI * 2).toFixed(2)
    var bound = (Math.PI * 2 % numberOfSides).toFixed(2)
    if (Math.abs(rotation % bound) <= .1) { // this used to be rotation % bound == 0 but the toFixed creates problems with rounding
      console.log('true')
      return true
    }
    // console.log('false')

    return false;
  }


 



  function rotateHorizontalTouch(deltaMove, mesh) {
    if (mesh.length > 1) {
      for (let i = 0; i < mesh.length; i++) {

        rotateHorizontalTouch(deltaMove, mesh[i])
      }
      return;
    }
    mesh.rotation.y += Math.sign(deltaMove.x) * rotationSpeedTouchDevices;
  }

  /**
   * isWithinMaxAngle
   * @description Checks if the rotation in a specific axe is within the maximum
   * values allowed.
   * @param delta is the difference of the current rotation angle and the
   *     expected rotation angle
   * @param axe is the axe of rotation: x(vertical rotation), y (horizontal
   *     rotation)
   * @return true if the rotation with the new delta is included into the
   *     allowed angle range, false otherwise
   */
  function isWithinMaxAngle(delta, axe) {

    if (MAX_ROTATON_ANGLES[axe].enabled) {
      if (mesh.length > 1) {
        let condition = true;
        for (let i = 0; i < mesh.length; i++) {
          if (!condition) return false;
          if (MAX_ROTATON_ANGLES[axe].enabled) {
            condition = ((MAX_ROTATON_ANGLES[axe].from * -1) <
              (mesh[i].rotation[axe] + delta)) &&
              ((mesh[i].rotation[axe] + delta) < MAX_ROTATON_ANGLES[axe].to) ? true : false;
          }
        }
        return condition
      }

      const condition = ((MAX_ROTATON_ANGLES[axe].from * -1) <
        (mesh.rotation[axe] + delta)) &&
        ((mesh.rotation[axe] + delta) < MAX_ROTATON_ANGLES[axe].to);
      return condition ? true : false;
    }
    return true;
  }

  function resetMousePosition() {
    previousMousePosition = { x: 0, y: 0 };
  }

  /******************  MOUSE interaction functions - desktop  *****/
  function mouseDown(e) {
    isDragging = true;
    flag = mouseFlags.MOUSEDOWN;
    previousMousePosition = { x: e.offsetX, y: e.offsetY };

  }



  function mouseMove(e) {
    console.log('moving')
    if (isDragging) {
      const deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y
      };


      // if (horizontalRotationEnabled && deltaMove.x != 0)
      // && (Math.abs(deltaMove.x) > Math.abs(deltaMove.y))) {
      // enabling this, the mesh will rotate only in one specific direction
      // for mouse movement
      // {
        // if (!isWithinMaxAngle(Math.sign(deltaMove.x) * rotationSpeed, 'y'))
        //   return;


        // TODO: Need Velocity: https://www.carvana.com/vehicle/1853746
        if (Math.abs(deltaMove.x) >= 50) {
          rotateHorizontal(deltaMove, mesh)
          previousMousePosition = { x: e.offsetX, y: e.offsetY };

        }

 

        flag = mouseFlags.MOUSEMOVE;
      // }


    }
  }

  function mouseUp() {
    isDragging = false;
    resetMousePosition();
  }

  function wheel(e) {
    if (!zoomEnabled) return;
    const delta = e.wheelDelta ? e.wheelDelta : e.deltaY * -1;
    if (delta > 0 && camera.position.z > minDistance) {
      zoomIn();
    } else if (delta < 0 && camera.position.z < maxDistance) {
      zoomOut();
    }
  }
  /****************** TOUCH interaction functions - mobile  *****/

  function onTouchStart(e) {
    e.preventDefault();
    flag = mouseFlags.MOUSEDOWN;
    if (e.touches.length === 2) {
      prevZoomDiff.X = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
      prevZoomDiff.Y = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
      currentTouches = new Array(2);
    } else {
      previousMousePosition = { x: e.touches[0].pageX, y: e.touches[0].pageY };
    }
  }

  function onTouchEnd(e) {
    prevZoomDiff.X = null;
    prevZoomDiff.Y = null;

    /* If you were zooming out, currentTouches is updated for each finger you
     * leave up the screen so each time a finger leaves up the screen,
     * currentTouches length is decreased of a unit. When you leave up both 2
     * fingers, currentTouches.length is 0, this means the zoomming phase is
     * ended.
     */
    if (currentTouches.length > 0) {
      currentTouches.pop();
    } else {
      currentTouches = [];
    }
    e.preventDefault();
    if (flag === mouseFlags.MOUSEDOWN) {
      // TouchClick
      // You can invoke more other functions for animations and so on...
    } else if (flag === mouseFlags.MOUSEMOVE) {
      // Touch drag
      // You can invoke more other functions for animations and so on...
    }
    resetMousePosition();
  }

  function onTouchMove(e) {
    e.preventDefault();
    flag = mouseFlags.MOUSEMOVE;
    // Touch zoom.
    // If two pointers are down, check for pinch gestures.
    if (e.touches.length === 2 && zoomEnabled) {
      currentTouches = new Array(2);
      // Calculate the distance between the two pointers.
      const curDiffX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
      const curDiffY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);

      if (prevZoomDiff && prevZoomDiff.X > 0 && prevZoomDiff.Y > 0) {
        if ((curDiffX > prevZoomDiff.X) && (curDiffY > prevZoomDiff.Y) &&
          (camera.position.z > minDistance)) {
          zoomIn();
        } else if (
          curDiffX < prevZoomDiff.X && camera.position.z < maxDistance &&
          curDiffY < prevZoomDiff.Y) {
          zoomOut();
        }
      }
      // Cache the distance for the next move event.
      prevZoomDiff.X = curDiffX;
      prevZoomDiff.Y = curDiffY;

      // Touch Rotate.
    } else if (currentTouches.length === 0) {
      prevZoomDiff.X = null;
      prevZoomDiff.Y = null;
      const deltaMove = {
        x: e.touches[0].pageX - previousMousePosition.x,
        y: e.touches[0].pageY - previousMousePosition.y
      };
      previousMousePosition = { x: e.touches[0].pageX, y: e.touches[0].pageY };

      if (horizontalRotationEnabled && deltaMove.x != 0) {
        if (!isWithinMaxAngle(
          Math.sign(deltaMove.x) * rotationSpeedTouchDevices, 'y'))
          return;
        rotateHorizontalTouch(deltaMove, mesh)
      }

      if (verticalRotationEnabled && deltaMove.y != 0) {
        if (!isWithinMaxAngle(
          Math.sign(deltaMove.y) * rotationSpeedTouchDevices, 'x'))
          return;
        rotateVerticalTouch(deltaMove, mesh)
      }
    }
  }

  /********************* Event Listeners *************************/

  /** Mouse Interaction Controls (rotate & zoom, desktop **/
  // Mouse - move
  domElement.addEventListener('mousedown', mouseDown, false);
  domElement.addEventListener('mousemove', mouseMove, false);
  domElement.addEventListener('mouseup', mouseUp, false);
  domElement.addEventListener('mouseout', mouseUp, false);

  // Mouse - zoom
  domElement.addEventListener('wheel', wheel, false);

  /** Touch Interaction Controls (rotate & zoom, mobile) **/
  // Touch - move
  domElement.addEventListener('touchstart', onTouchStart, false);
  domElement.addEventListener('touchmove', onTouchMove, false);
  domElement.addEventListener('touchend', onTouchEnd, false);

};

export { ObjectControls };