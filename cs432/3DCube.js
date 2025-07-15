"use strict";

var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];
var translate = [0, 0, 0];
var scale = [1, 1, 1];

var thetaLoc;
var translationLoc;
var scaleLoc;

var tType;
//var deltaAmt = [0.0001, 0.001, 0.0001];
var deltaAmt = [0.1, 0.1, 0.1];




window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "uTheta");
    translationLoc = gl.getUniformLocation(program, "translation");
    scaleLoc = gl.getUniformLocation(program, "scale");
    
    //event listeners for buttons

    var tTypeId = document.getElementById( "TransformationType" )
    tTypeId.onclick = function() {
        tType = tTypeId.selectedIndex - 1;
    }

    render();
}

function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0)   // white
    ];

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
        colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        // colors.push(vertexColors[a]);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3fv(scaleLoc, scale);
    gl.uniform3fv(thetaLoc, theta);
    gl.uniform3fv(translationLoc, translate);



    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    requestAnimationFrame(render);
}


window.addEventListener("keydown", function() {
    
    if(event.key == "p") // Increase delta
    {
        deltaAmt[tType] += .1;
    }
    else if(event.key == "o") // Decrease delta
    {
        deltaAmt[tType] -= .1;
    }
    if(deltaAmt[tType] <= 0)
    {
        //Prevent delta from going negative
        deltaAmt[tType] = 0.1;
    }



    var deltaVec = [0,0,0];
    switch (event.key) {
        
    case "w": // Increase x
        deltaVec[0] += deltaAmt[tType];
        break;
    case "s": // Decrease x
        deltaVec[0] -= deltaAmt[tType];
        break;
    case "d": // Increase y
        deltaVec[1] += deltaAmt[tType];
        break;
    case "a": // Decrease y
        deltaVec[1] -= deltaAmt[tType];
        break;
    case "0": // Increase z
        deltaVec[2] += deltaAmt[tType];
        break;
    case "9": // Decrease z
        deltaVec[2] -= deltaAmt[tType];
        break;
    case "r": //Reset all values
        theta = [0, 0, 0];
        translate = [0, 0, 0];
        scale = [1, 1, 1];
        deltaAmt = [1,1,1];
        break;
    default:
        break;
    }

    if(tType == 0)
    {
        scale[0] = deltaVec[0] + scale[0];
        scale[1] = deltaVec[1] + scale[1];
        scale[2] = deltaVec[2] + scale[2];
        
    }
    else if(tType == 1)
    {
        theta[0] = deltaVec[0] + theta[0];
        theta[1] = deltaVec[1] + theta[1];
        theta[2] = deltaVec[2] + theta[2];
        
    }
    else if(tType == 2)
    {
        translate[0] = deltaVec[0] + translate[0];
        translate[1] = deltaVec[1] + translate[1];
        translate[2] = deltaVec[2] + translate[2];
    }


    var rate = document.getElementById("output");
    rate.innerHTML = deltaAmt[tType];
});