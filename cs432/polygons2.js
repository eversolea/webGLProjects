
//Interactivity:
var circleRadius = 100;
var rotateEllipse = 1;
var squareAltcolor = vec3(1.0,1.0,1.0);
var ellipseAltcolor = vec3(1.0,0.0,0.0);
var newPentagon = vec2(10,10);

var maxNumPentagons = 200;
var maxNumPositions  = 9*maxNumPentagons;

var program;

//WebGL Graphics Variables:

var canvas;
var gl;

var index = 0;

//Global variables to keep track of pentagons which are created dynamically 
var pentagons = [];
var pentagonColor = [];
var colors = [];
canvas = document.getElementById( "gl-canvas" );

function main() 
{


    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clear(gl.COLOR_BUFFER_BIT);

    var vertices = [];
    var ellipseColors = [];
    var shadedCircleColors = [];
    var shadedCircle = [];
    var triColors = [];
    var triangle = [];
    var squareColor = [];
    var square = [];

    //Ellipse
    var cX = -0.6;
    var cY = 0.67;
    var r = 0.25 //Radius
    vertices = [];

    vertices.push(vec2(cX, cY));
    ellipseColors.push(ellipseAltcolor);
    for (i = 0; i <= 50; i++){
        if(rotateEllipse)
        {
            vertices.push(vec2(
                r*Math.cos(i*2*Math.PI/50 ) + cX,
                r*Math.sin(i*2*Math.PI/50 ) * 0.5 + cY
            ));
        }
        else
        {
            vertices.push(vec2(
                r*Math.cos(i*2*Math.PI/50 ) * 0.5 + cX,
                r*Math.sin(i*2*Math.PI/50 ) + cY
            ));
        }
        ellipseColors.push(ellipseAltcolor);
    }

    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    //Send Color array
    var shaderType = gl.getUniformLocation( program, "shaderType" );
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(ellipseColors), gl.STATIC_DRAW );

    
    gl.uniform1i(shaderType,2);
    var aColor = gl.getAttribLocation( program, "aColor" );
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer( aColor, 3, gl.FLOAT, false, 0, 0 );

    // Load the data into the GPU and send vertex array
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );



    gl.drawArrays( gl.TRIANGLE_FAN, 0, 52 );

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);


    //Shaded circle
    shadedCircleColors = [];
    shadedCircle = [];
    cX = 0.6;
    r = 0.25 * circleRadius / 100;
    shadedCircle.push(vec2(cX + r,cY))
    shadedCircleColors.push(vec3(0,0,0))
    for (i = 0; i <= 50; i++){
        shadedCircle.push(vec2(
            r*Math.cos(i*2*Math.PI/50) + cX,
            r*Math.sin(i*2*Math.PI/50) + cY
        ));
        shadedCircleColors.push(vec3(i/50,0,0))
    }

    //SHADED CIRCLE

 
    //Init program with color shade shaders
    //Send Color array
    var circle_cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, circle_cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shadedCircleColors), gl.STATIC_DRAW );

    var shaderType = gl.getUniformLocation( program, "shaderType" );
    gl.uniform1i(shaderType,2);
    var circle_aColor = gl.getAttribLocation( program, "aColor" );
    gl.enableVertexAttribArray(circle_aColor);
    gl.vertexAttribPointer( circle_aColor, 3, gl.FLOAT, false, 0, 0 );
    

    //Send Vertex array
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shadedCircle), gl.STATIC_DRAW );
    // Associate out shader variable with our data buffer
    var circle_aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.enableVertexAttribArray(circle_aPosition);
    gl.vertexAttribPointer( circle_aPosition, 2, gl.FLOAT, false, 0, 0 );
    


    gl.drawArrays( gl.TRIANGLE_FAN, 0, 52 );


    //Gradient Colored Triangle
    triangle = [];
    cX = 0;
    cY = 0.6;
    r = 0.35

    triangle.push(vec2(cX,cY))
    for (i = 0; i <= 2; i++){
        triangle.push(vec2(
            r*Math.cos(i*2*Math.PI/3 - 2*Math.PI/12) + cX,
            r*Math.sin(i*2*Math.PI/3 - 2*Math.PI/12) + cY
        ));
    }

    triangle.push(triangle[1]);
    triColors = [
        vec3( 0.5, 0.5, 0.5 ),
        vec3( 0.0, 0.0, 1.0 ),
        vec3( 1.0, 0.0, 0.0 ),
        vec3( 0.0, 1.0, 0.0 ),
        vec3( 0.0, 0.0, 1.0 )
    ];

    //Send Color array
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triColors), gl.STATIC_DRAW );

    var shaderType = gl.getUniformLocation( program, "shaderType" );
    gl.uniform1i(shaderType,2);
    var aColor = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( aColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(aColor);

    //Send Vertex array
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triangle), gl.STATIC_DRAW );
    // Associate out shader variable with our data buffer
    aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(aPosition);

 
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 5 );



    //Square
    square = [];
    squareColor = [];
    cX = 0
    cY = -0.2;
    r = 0.75;
    toggle = true

    for(j = 0; j < 6; j++)
    {
        for (i = 1; i <= 4; i++){
            square.push(vec2(
                r*Math.cos(i*2*Math.PI/4 - 2*Math.PI/8) + cX,
                r*Math.sin(i*2*Math.PI/4 - 2*Math.PI/8) + cY
            ));
        }
        

        if(toggle)
        {
            squareColor.push(squareAltcolor);
            squareColor.push(squareAltcolor);
            squareColor.push(squareAltcolor);
            squareColor.push(squareAltcolor);
        }
        else
        {
            squareColor.push(vec3(0.0, 0.0, 0.0));
            squareColor.push(vec3(0.0, 0.0, 0.0));
            squareColor.push(vec3(0.0, 0.0, 0.0));
            squareColor.push(vec3(0.0, 0.0, 0.0));
        }
        toggle = !toggle;
        r -= 0.12
    }                
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(squareColor), gl.STATIC_DRAW );

    var shaderType = gl.getUniformLocation( program, "shaderType" );
    gl.uniform1i(shaderType,2);
    var aColor = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( aColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(aColor);

    //Send Vertex array
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(square), gl.STATIC_DRAW );
    // Associate out shader variable with our data buffer
    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(aPosition);


    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 4, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 8, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 12, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 16, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 20, 4 );




    //Send Color array
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16 * maxNumPositions, gl.STATIC_DRAW );

    var shaderType = gl.getUniformLocation( program, "shaderType" );
    gl.uniform1i(shaderType,2);
    var aColor = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( aColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(aColor);

    //Send Vertex array
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 8 * maxNumPositions, gl.STATIC_DRAW );
    // Associate out shader variable with our data buffer
    aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(aPosition);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    

   

    if(pentagons.length > 0)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)

        gl.bufferData(gl.ARRAY_BUFFER, flatten(pentagons), gl.STATIC_DRAW );
            
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer)
        
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pentagonColor), gl.STATIC_DRAW );
        

        for(var i = 0; i < index; i++) {

            gl.drawArrays( gl.TRIANGLES, i * 9,  9 ); 
        }
    }
    requestAnimationFrame(main);
};


 //Left click event - pentagons drawing will only update when the event is hit
 canvas.addEventListener("mouseup", function(){

    //Pentagons (just color here. The pentagon vertex creation happens in the left click event)
    var colors = [

        vec3(0.0, 1.0, 1.0),  //
        vec3(1.0, 0.0, 0.0),  // red
        vec3(1.0, 1.0, 0.0),  // yellow
        vec3(0.0, 1.0, 0.0),  // green
        vec3(0.0, 0.0, 1.0),  // blue
        vec3(1.0, 0.0, 1.0),  // magenta
    ];


    newPentagon = vec2(2*event.clientX/canvas.width-1,
        2*(canvas.height-event.clientY)/canvas.height-1);

    var cX = -0.6;
    var cY = 0.67;
    var r = 0.1 //Radius
    //Generate distinct verticies we need for the pentagon
    var pentagonsTemp = [];
    for (i = 0; i <= 4; i++){
        pentagonsTemp.push(vec2(
            r*Math.cos(i*2*Math.PI/5 ) + newPentagon[0],
            r*Math.sin(i*2*Math.PI/5 ) + newPentagon[1]
        ));
    }

    //Generate Pentagon color
    var color = vec3(colors[index%6]);
    for(i = 0; i < 9; i++)
    {
        pentagonColor.push(color);
    }
 

    //Create the pentagon vertex list in traingles
    pentagons.push(pentagonsTemp[0]);
    pentagons.push(pentagonsTemp[1]);
    pentagons.push(pentagonsTemp[2]);
    pentagons.push(pentagonsTemp[2]);
    pentagons.push(pentagonsTemp[3]);
    pentagons.push(pentagonsTemp[4]);
    pentagons.push(pentagonsTemp[4]);
    pentagons.push(pentagonsTemp[0]);
    pentagons.push(pentagonsTemp[2]);

    index++;
    
});




function render() 
{
    gl.clear(gl.COLOR_BUFFER_BIT);



    gl.drawArrays( gl.TRIANGLE_FAN, 0, 52 );

 
    //Circle

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 52 );
     

    //DRAW
    //COLOR GRADIENT TRIANGLE
 
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 5 );


    //DRAW
    //SQAURES

    //Send Color array

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 4, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 8, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 12, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 16, 4 );
    gl.drawArrays( gl.TRIANGLE_FAN, 20, 4 );


    //DRAW
    //PENTAGONS


 
    for(var i = 0; i < index; i++) {

        gl.drawArrays( gl.TRIANGLES, i * 9,  9 ); 
    }
   
    requestAnimationFrame(render);
};


//Onload function
window.onload = main();


//Interactivity functions:

document.getElementById("circleRadius").onchange = function()
{
    circleRadius = document.getElementById("circleRadius").value;
    output = document.getElementById("output");
    output.innerHTML = "Radius: " + circleRadius; 
    init();
};

document.getElementById("ellipseRotate90").onclick = function()
    { rotateEllipse = !rotateEllipse;
      init();
    
    };

newColor = document.getElementById("squareColor");
newColor.onchange = function()
{
switch(newColor.selectedIndex)
{
    case 0:
        squareAltcolor = vec3(1.0,0.0,0.0)
        break;
    case 1:
        squareAltcolor = vec3(0.5,0.8,0.9)
        break;
    case 2:
        squareAltcolor = vec3(0.0,0.5,0.5)
        break;
    case 3:
        squareAltcolor = vec3(1.0,1.0,1.0)
        break;
    default:
        break;
}
init();
};

window.addEventListener("keydown", function() {
    switch (event.key) {
    case "r": // ’r’ key
        ellipseAltcolor = vec3(1.0,0.0,0.0);
        break;
    case "g": // ’g’ key
        ellipseAltcolor = vec3(0.0,1.0,0.0);
        break;
    case "b": // ’b’ key
        ellipseAltcolor = vec3(0.0,0.0,1.0);
        break;
    case "y": // ’y’ key
        ellipseAltcolor = vec3(1.0,1.0,0.0);
        break;
    case "p": // ’p’ key
        ellipseAltcolor = vec3(0.5,0.0,0.5);
        break;
    case "w": // ’w’ key
        ellipseAltcolor = vec3(1.0,1.0,1.0);
        break;
    default:
        break;
    }
    init();
});
