"use strict";

var canvas
  , gl
  , points
  , vertices
  , thetaLoc
  , theta = 0.0
  , subdivisions = 1;

function init()
{
  points = []
  vertices = []
  canvas = document.getElementById( "gl-canvas" );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  //
  //  Initialize our data for the Sierpinski Gasket
  //

  // First, initialize the corners of our gasket with three points.
  vertices = [
    vec2( -0.5, -0.5 ),
    vec2(  0,  0.5 ),
    vec2(  0.5, -0.5 )
  ];

  divideTriangle( vertices[0], vertices[1], vertices[2], subdivisions);

  //
  //  Configure WebGL
  //
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

  //  Load shaders and initialize attribute buffers
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  // Load the data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  thetaLoc = gl.getUniformLocation( program, "theta" );

  domEventListeners();
  render();
};

function triangle( a, b, c )
{
  points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{
  // check for end of recursion
  if ( count === 0 ) {
    triangle( a, b, c );
  }
  else {
    //bisect the sides
    var ab = mix( a, b, 0.5 );
    var ac = mix( a, c, 0.5 );
    var bc = mix( b, c, 0.5 );

    --count;

    // three new triangles
    divideTriangle( a, ab, ac, count );
    divideTriangle( c, ac, bc, count );
    divideTriangle( b, bc, ab, count );
    // divideTriangle( ab, bc, ac, count );
  }
}

function domEventListeners()
{
  // Update twist_angle
  document.getElementById('twist_angle').oninput = function() {
    var val = event.srcElement.value;

    document.getElementById('twist_angle_val').innerHTML = val;
    theta = val * Math.PI / 180;

    render();
  };

  // Update twist_angle
  document.getElementById('subdivisions').oninput = function() {
    var val = event.srcElement.value;

    document.getElementById('subdivisions_val').innerHTML = val;
    subdivisions = val;

    init();
  };
}


/**
 * Init
 */
window.onload = init;

function render()
{
  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.uniform1f( thetaLoc, theta );
  gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
