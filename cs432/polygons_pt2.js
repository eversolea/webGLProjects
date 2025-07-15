
var canvas;
var gl;

window.onload = function init() {
canvas = document.getElementById( "gl-canvas" );

gl = canvas.getContext('webgl2');
if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }



//Vertices
var cX = -0.6;
var cY = -0.67;
var r = 0.3 //Radius
var vertices = [];

vertices.push(vec2(cX, cY));
for (i = 0; i <= 7; i++){
    vertices.push(vec2(
        r*Math.cos(i*2*Math.PI/7) * 0.9 + cX,
        r*Math.sin(i*2*Math.PI/7) + cY
    ));
}

cY = 0.55;
var shadedCircleColors = [];
var shadedCircle = [];
cX = 0.55;
r = 0.425;
shadedCircle.push(vec2(cX,cY))
shadedCircleColors.push(vec3(0,0,0))
for (i = 0; i <= 50; i++){
    if (i%2 == 0)
    {
        shadedCircle.push(vec2(
            r*Math.cos(i*2*Math.PI/50) + cX,
            r*Math.sin(i*2*Math.PI/50) + cY));
        shadedCircleColors.push(vec3(0,0.0,1));
    }
    else
    {
        shadedCircle.push(vec2(
            r*Math.cos(i*2*Math.PI/50) * 0.75 + cX,
            r*Math.sin(i*2*Math.PI/50) * 0.75 + cY));
         shadedCircleColors.push(vec3(i/50,0.4,0));
    }

}


var pentagon = [];

var pentagon = [
    vec2( 0, 0 ),
    vec2( -0.2, -0.2 ),
    vec2(  -0.2,  0.2 ),
    vec2(  0.2, 0.2 ),
    vec2( 0.3, 0.0),
    vec2( 0.2, -0.2),
    vec2( -0.2, -0.2 ),
    vec2( -0.3, -0.3 )
];


//Why doesn't this work?
//triangle.push(triangle[1]);
var pentagonColors = [
    vec3( 0.0, 0.0, 1.0 ),
    vec3( 1.0, 0.0, 0.0 ),
    vec3( 0.0, 1.0, 0.0 ),
    vec3( 1.0, 0.0, 0.0 ),
    vec3( 0.0, 1.0, 0.0 ),
    vec3( 0.0, 0.0, 1.0 ),
    vec3( 1.0, 0.0, 0.0 )
];



gl.viewport( 0, 0, canvas.width, canvas.height );
gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

//  Load shaders and initialize attribute buffers


var program = initShaders( gl, "vertex-shader", "fragment-shader" );
gl.useProgram(program);

//Draw Red Ellpise
// Load the data into the GPU

 var bufferId = gl.createBuffer();
 gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
 gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

  // Associate out shader variable with our data buffer

 var shaderType = gl.getUniformLocation( program, "shaderType" );
 gl.uniform1i(shaderType,1);
 var aPosition = gl.getAttribLocation( program, "aPosition" );
 gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
 gl.enableVertexAttribArray(aPosition);

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 9 );



//Drawing shaded circle
 //Init program with color shade shaders

//Send Color array

var cBuffer = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
gl.bufferData( gl.ARRAY_BUFFER, flatten(shadedCircleColors), gl.STATIC_DRAW );

var shaderType = gl.getUniformLocation( program, "shaderType" );
 gl.uniform1i(shaderType,2);
var aColor = gl.getAttribLocation( program, "aColor" );
gl.vertexAttribPointer( aColor, 3, gl.FLOAT, false, 0, 0 );
gl.enableVertexAttribArray(aColor);

//Send Vertex array

bufferId = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
gl.bufferData( gl.ARRAY_BUFFER, flatten(shadedCircle), gl.STATIC_DRAW );
// Associate out shader variable with our data buffer
aPosition = gl.getAttribLocation( program, "aPosition" );
gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
gl.enableVertexAttribArray(aPosition);
    
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 52 );




//Drawing Color Gradient Triangle


//Send Color array

var cBuffer = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
gl.bufferData( gl.ARRAY_BUFFER, flatten(pentagonColors), gl.STATIC_DRAW );

var shaderType = gl.getUniformLocation( program, "shaderType" );
 gl.uniform1i(shaderType,2);
var aColor = gl.getAttribLocation( program, "aColor" );
gl.vertexAttribPointer( aColor, 3, gl.FLOAT, false, 0, 0 );
gl.enableVertexAttribArray(aColor);

//Send Vertex array

bufferId = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
gl.bufferData( gl.ARRAY_BUFFER, flatten(pentagon), gl.STATIC_DRAW );
// Associate out shader variable with our data buffer
aPosition = gl.getAttribLocation( program, "aPosition" );
gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
gl.enableVertexAttribArray(aPosition);
    
    //Why doesn't this work?
    //gl.drawArrays( gl.TRIANGLE_FAN, 0, 5 );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 7 );






};

