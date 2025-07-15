"use strict";

//Change Control Points Here:
let controlPointsList = [
    vec3(0.0, 0.0, 0.0),
    vec3(2.0, 0.0, 1.5),
    vec3(4.0, 0.0, 2.9),
    vec3(6.0, 0.0, 0.0),
    vec3(0.0, 2.0, 1.1),
    vec3(2.0, 2.0, 3.9),
    vec3(4.0, 2.0, 3.1),
    vec3(6.0, 2.0, 0.7),
    vec3(0.0, 4.0, -0.5),
    vec3(2.0, 4.0, 2.6),
    vec3(4.0, 4.0, 2.4),
    vec3(6.0, 4.0, 0.4),
    vec3(0.0, 6.0, 0.3),
    vec3(2.0, 6.0, -1.1),
    vec3(4.0, 6.0, 1.3),
    vec3(6.0, 6.0, -0.2),
]

let axesColor = [
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0)
]

let axes = [
    vec3(0.0,0.0,0.0),
    vec3(6.0,0.0,0.0),
    vec3(0.0,0.0,0.0),
    vec3(0.0,6.0,0.0),
    vec3(0.0,0.0,0.0),
    vec3(0.0,0.0,6.0)
]

let canvas;
let gl;

let filename;

let positions = [];
let colors = [];
var normals = [];

//Cylindrical orbit variables
const pi = 3.14159;
//Camera
var r = 2;
var h = 0;
var theta = pi;

//Projection variables
var at;
var eye 
var modelViewLoc;
var projLoc;
var perspSelect = 1;
var shapeType = 0;
var scaleSelect = 0;

//Relative scale variables
var upperXYZ;
var lowerXYZ;

//Material variables
var material_ambient = vec4(0.8, 0.4, 0.4, 1.0);
var material_diffuse = vec4(1.0, 0.1, 0.1, 1.0);
var material_specular = vec4(0.8, 0.8, 0.8, 1.0);
var material_shininess = 70.0;
var light_ambient = vec4(0.2, 0.2, 0.2, 1.0);
var light_diffuse = vec4(0.6, 0.6, 0.6, 1.0); 
var light_specular = vec4(1.0, 1.0, 1.0, 1.0); 
var materials = [[],[],[],[]];
var matChoice = 0;
materials[0].push(material_ambient, material_diffuse, material_specular,material_shininess);
materials[1].push(vec4(0.05,0.2,0.05,1.0), vec4(0.05,0.5,1.0,1.0), vec4(1.0,1.0,1.0,1.0),30.0);
materials[2].push(vec4(0.16,0.7,0.05,1.0), vec4(0.45,0.7,0.05,1.0), vec4(0.05,0.05,0.05,1.0),100.0);
materials[3].push(vec4(0.3,0.05,1.0,1.0), vec4(0.13,0.6,0.72,1.0), vec4(0.7,0.11,0.11,1.0),20.0);

//Material Product variables
var ambientProduct;
var diffuseProduct;
var specularProduct;


//Memory locations for shaders
var ambientLoc;
var diffuseLoc;
var specularLoc;
var shininessLoc;
var shapeTypeLoc;

var colorLoc;
var positionLoc;



//Bezier patch Buffers
var cBuffer;
var vBuffer;

//Axes and control points buffers
var pts_vBuffer;
var lines_cBuffer;
var lines_vBuffer;

//Bezier patch variables:
var u = 10;
var v = 10;


//Light positions
var lightPosition = vec3(0,0,0); //in camera coordinates
var lightPosLoc;


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.enable(gl.DEPTH_TEST);


    var projChoice = document.getElementById("projectionChoice");
    projChoice.onchange = function()
    {
        if(projChoice.selectedIndex == 0)
        {
            perspSelect = true;
        }
        else
        {
            perspSelect = false;
        }
    }

    var matSelect = document.getElementById("matType");
    matSelect.onchange = function()
    {
        switch(matSelect.selectedIndex)
        {
            case 0:
                matChoice = 0;
                break;
            case 1:
                matChoice = 1;
                break;
            case 2:
                matChoice = 2;
                break;
            case 3:
                matChoice = 3;
                break;
        }
        //Calculate Shading products
        ambientProduct = mult(light_ambient, materials[matChoice][0]);
        diffuseProduct = mult(light_diffuse, materials[matChoice][1]);
        specularProduct = mult(light_specular, materials[matChoice][2]);
        material_shininess = materials[matChoice][3];
    }
    loadModel();
    
}


function loadModel() 
{
    positions = [];
    colors = [];
    normals = [];


    let verts = [];  
    let faces = [];

    let vert = [];
    let face = [];


    
    verts = computePatch(controlPointsList, u - 1, v - 1);
    let tempFace = vec3(0,0,0);
	for (var i = 0; i < u - 1; i++)
	{
		for (var j = 0; j < v - 1; j++)
		{
			tempFace = vec3( i * v + j , (i + 1) * v + j , i * v + j + 1 );
            faces.push(tempFace);
			tempFace = vec3( i * v + j + 1, (i + 1) * v + j , (i + 1) * v + j + 1 );
			faces.push(tempFace);

		}
	}

    //Transform Centroid of Bounding box to Origin:
    //Determine Centroid
    upperXYZ = vec3(-9999,-9999,-9999)
    lowerXYZ = vec3(9999,9999,9999)
    for(var i = 0; i < verts.length; i++)
    {
        if(verts[i][0] < lowerXYZ[0])
        {
            lowerXYZ[0] = verts[i][0];
        }
        if(verts[i][0] > upperXYZ[0])
        {
            upperXYZ[0] = verts[i][0];
        }
        if(verts[i][1] < lowerXYZ[1])
        {
            lowerXYZ[1] = verts[i][1];
        }
        if(verts[i][1] > upperXYZ[1])
        {
            upperXYZ[1] = verts[i][1];
        }
        if(verts[i][2] < lowerXYZ[2])
        {
            lowerXYZ[2] = verts[i][2];
        }
        if(verts[i][2] > upperXYZ[2])
        {
            upperXYZ[2] = verts[i][2];
        }
    }
        
    var centroid = vec3((upperXYZ[0] + lowerXYZ[0]) / 2, (upperXYZ[1] + lowerXYZ[1]) / 2, (upperXYZ[2] + lowerXYZ[2]) / 2 );
    
    //Find longest edge of bounding box to perform uniform scaling
    let longestEdge = 0;
    for(let i = 0; i < 3; i++)
    {
        if(upperXYZ[i] - lowerXYZ[i] > longestEdge)
        {
            longestEdge = upperXYZ[i] - lowerXYZ[i];
        }
    }

    //Transform model to origin using centroid
    var translateMtx = translate( -centroid[0], -centroid[1], -centroid[2]);
    //Then Scale model to fit in starting projection view
    var relativeScale = scale(1/longestEdge, 1/longestEdge, 1/longestEdge);

    for(var i = 0; i < verts.length; i++)
    {
        verts[i] = convertV4_V3(mult(translateMtx,convertV3_V4(verts[i],1)));
        verts[i] = convertV4_V3(mult(relativeScale,convertV3_V4(verts[i],1)));
    }

    for(var i = 0; i < axes.length; i++)
    {
        axes[i] = convertV4_V3(mult(translateMtx,convertV3_V4(axes[i],1)));
        axes[i] = convertV4_V3(mult(relativeScale,convertV3_V4(axes[i],1)));
    }

    for(var i = 0; i < controlPointsList.length; i++)
    {
        controlPointsList[i] = convertV4_V3(mult(translateMtx,convertV3_V4(controlPointsList[i],1)));
        controlPointsList[i] = convertV4_V3(mult(relativeScale,convertV3_V4(controlPointsList[i],1)));
    }




    //Calculate normal of vtxs for Gourand Shading (avg of surrounding face normals)
    //Initialize very vertex normal to (0,0,0)
    for(var i = 0; i < verts.length; i++)
    {
        normals[i] = vec3(0,0,0);
    }
    //Each face, compute face normal fn and normalize it. 
    //Then add to normals[i]
    for(var i = 0; i < faces.length; i++)
    {
        var vtx0 = vec3(verts[faces[i][0]][0], verts[faces[i][0]][1], verts[faces[i][0]][2]);
        var vtx1 = vec3(verts[faces[i][1]][0], verts[faces[i][1]][1], verts[faces[i][1]][2]);
        var vtx2 = vec3(verts[faces[i][2]][0], verts[faces[i][2]][1], verts[faces[i][2]][2]);
        var val1 = subtract(vtx1,vtx0);
        var val2 = subtract(vtx2,vtx0);
        var fn = normalize(cross(val1,val2));
        normals[faces[i][0]] = add(normals[faces[i][0]],fn);
        normals[faces[i][1]] = add(normals[faces[i][1]],fn);
        normals[faces[i][2]] = add(normals[faces[i][2]],fn);
    }
    //Normalize every vertex normal
    for(var i = 0; i < verts.length; i++)
    {
        normals[i] = normalize(normals[i])
        normals[i] = vec3(normals[i][0],normals[i][1],normals[i][2]);
    }        


    //Import model
    for(let i = 0; i < faces.length; i++)
    {
        positions.push(verts[faces[i][0]],verts[faces[i][1]],verts[faces[i][2]])
        colors.push(normals[faces[i][0]],normals[faces[i][1]],normals[faces[i][2]]);
    }
    

    //Set the at variable for the lookAt function to be the origin
    at = vec3(0,0,0);

    //Set the default eye coordinates
    var eyeX = r * Math.cos(theta);
    var eyeY = h;
    var eyeZ = r * Math.sin(theta);
    eye = vec3(eyeX, eyeY, eyeZ);

    //Calculate Shading products
    ambientProduct = mult(light_ambient, materials[matChoice][0]);
    diffuseProduct = mult(light_diffuse, materials[matChoice][1]);
    specularProduct = mult(light_specular, materials[matChoice][2]);

    //Create and bind color and vertex buffers
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);   
    //let colorLoc = gl.getAttribLocation( program, "aNormal" );
    


    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);   
    //let positionLoc = gl.getAttribLocation(program, "aPosition");
   
    
  
    colorLoc = gl.getAttribLocation( program, "aNormal" );
    positionLoc = gl.getAttribLocation(program, "aPosition");


    pts_vBuffer = gl.createBuffer();
    lines_vBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, pts_vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(controlPointsList), gl.STATIC_DRAW);  
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, lines_vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(axes), gl.STATIC_DRAW); 

 
    lines_cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lines_cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(axesColor), gl.STATIC_DRAW);  

 
    

    modelViewLoc = gl.getUniformLocation(program, "modelView");
    projLoc = gl.getUniformLocation(program, "projection");
    ambientLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularLoc = gl.getUniformLocation(program, "specularProduct");
    lightPosLoc = gl.getUniformLocation(program, "lightPosition"),
    shininessLoc = gl.getUniformLocation(program, "shininess");
    shapeTypeLoc = gl.getUniformLocation(program, "shapeType");
    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Eye - location of camera, at - look at point
    var model_view = lookAt(eye, vec3(0,0,0), vec3(0,1,0));
    var projection;

    //Projection
    if(perspSelect)
    {
        var projection = perspective(60, 1, 0.0001, 200);
    }
    else
    {
        var projection = ortho(-1,1,-1,1,-200,200);
    }

    gl.uniformMatrix4fv(projLoc, false, flatten(projection));
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(model_view));

    //Points
    shapeType = 1;
    gl.uniform1i(shapeTypeLoc, shapeType);

    gl.bindBuffer(gl.ARRAY_BUFFER, pts_vBuffer);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    gl.drawArrays(gl.POINTS, 0, controlPointsList.length);
    
   
    //Axes lines
    //shapeType = 2;
    //gl.uniform1i(shapeTypeLoc, shapeType);
    shapeType = 2;
    gl.uniform1i(shapeTypeLoc, shapeType);
    gl.bindBuffer(gl.ARRAY_BUFFER, lines_cBuffer);
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );
    gl.bindBuffer(gl.ARRAY_BUFFER, lines_vBuffer);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    gl.drawArrays(gl.LINES, 0, axes.length);

  
  

 
    
    
    //Bezier Surface
 
    //Passing shading and light position uniforms
    gl.uniform3fv(ambientLoc, flatten(convertV4_V3(ambientProduct)));
    gl.uniform3fv(diffuseLoc, flatten(convertV4_V3(diffuseProduct)));
    gl.uniform3fv(specularLoc, flatten(convertV4_V3(specularProduct)));
    gl.uniform3fv(lightPosLoc, flatten(lightPosition));
    //gl.uniform3fv(lightPosLoc2, flatten(lightPosition2));
    gl.uniform1f(shininessLoc, material_shininess);
    shapeType = 0;
    gl.uniform1i(shapeTypeLoc, shapeType);
                
    //Passing projection and scaling uniforms
    gl.uniformMatrix4fv(projLoc, false, flatten(projection));
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(model_view));
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.vertexAttribPointer( colorLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
    

    requestAnimationFrame(render);
}


window.addEventListener("keydown", function() {
    
    switch (event.key) {
        
        case "w": // Increase camera radius
            r += 0.25;
            break;
        case "s": // Decrease camera radius
            r -= 0.25;
            if(r <= 0)
            {
                r = 0.01;
            }
            break;
        case "d": // Increase height
            h += 0.25;
            break;
        case "a": // Decrease height
            h -= 0.25;
            break;
        case "q": // Increase theta
            theta += pi / 32;
            break;
        case "e": // Decrease theta
            theta -= pi / 32;
            break;
        case "i": // Increase u
            //My u's and v's are flipped, so i'm just going to fix it at the user input here.
            v += 1;
            break;
        case "k": // Decrease u
            //My u's and v's are flipped, so i'm just going to fix it at the user input here.
            v -= 1;
            if(v < 2)
            {
                v = 2;
            }
            break;
        case "l": // Increase v
            //My u's and v's are flipped, so i'm just going to fix it at the user input here.
            u += 1;
            break;
        case "j": // Decrease v
            //My u's and v's are flipped, so i'm just going to fix it at the user input here.
            u -= 1;
            if(u < 2)
            {
                u = 2;
            }
            break;
        case "r": //Reset all
            r = 2;
            h = 0;
            theta = pi;
            u = 10;
            v = 10;
            break;
        default:
            break;

    }

    //Camera orbit calculations

    var eyeX = r * Math.cos(theta);
    var eyeY = h;
    var eyeZ = r * Math.sin(theta);
    eye = vec3(eyeX, eyeY, eyeZ);

    this.document.getElementById("u").innerHTML = v;
    this.document.getElementById("v").innerHTML = u;
    loadModel();

});

function convertV4_V3(vec4Input)
{
    return vec3(vec4Input[0],vec4Input[1],vec4Input[2]);
}


function convertV3_V4(vec3Input,num)
{
    return vec4(vec3Input[0],vec3Input[1],vec3Input[2],num);
}

function computePatch(controlPoints, du, dv)
{
	let patchPoints = [];
	for (let u = 0; u <= du; u += 1)
	{
		for (let  v = 0; v <= dv; v += 1)
		{
			let patchPoint = vec3(0,0,0);
			let polynomial1 = vec3(0,0,0);
			let polynomial2 = vec3(0,0,0);
			let element = 0;

			for (let i = 0; i <= 3; ++i)
			{
				for (let  j = 0; j <= 3; ++j)
				{
					//Calculate what element in the control points array we want to access
					element = i * 4 + j;

					polynomial1 = bernsteinPolynomial(3, i, u / du);
					polynomial2 = bernsteinPolynomial(3, j, v / dv);
					patchPoint[0] += polynomial1[0] * polynomial2[0] * controlPoints[element][0];
					patchPoint[1] += polynomial1[1] * polynomial2[1] * controlPoints[element][1];
					patchPoint[2] += polynomial1[2] * polynomial2[2] * controlPoints[element][2];
					
				}
			}
			patchPoints.push(patchPoint);
		}
	}
	return patchPoints;
}

function bernsteinPolynomial(n, i, u)
{
	let vertex = vec3(0,0,0);
	
	//Calculating the bernstein polynomials here 
	vertex[0] += binomial(n, i) * Math.pow((1 - u), (n - i)) * Math.pow(u, i);
	vertex[1] += binomial(n, i) * Math.pow((1 - u), (n - i)) * Math.pow(u, i);
	vertex[2] += binomial(n, i) * Math.pow((1 - u), (n - i)) * Math.pow(u, i);

	return vertex;
}

function factorial(n)
{
	let output = 1;
	for (let i = 1; i <= n; i++)
	{
		output *= i;
	}
	return output;
}

function binomial(n, x)
{
	let output = factorial(n);

	output /= factorial(n - x) * factorial(x);

	return output;
}