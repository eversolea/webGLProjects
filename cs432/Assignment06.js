"use strict";

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
//Light
var l_r = 2;
var l_h = 0;
var l_theta = pi;

//Projection variables
var at;
var eye 
var modelViewLoc;
var projLoc;
var perspSelect = 1;
var phongShading = 1;
var scaleSelect = 0;

//Relative scale variables
var upperXYZ;
var lowerXYZ;



//Material variables
var material_ambient = vec4(0.6, 0.2, 0.2, 1.0);
var material_diffuse = vec4(0.9, 0.1, 0.1, 1.0);
var material_specular = vec4(0.8, 0.8, 0.8, 1.0);
var material_shininess = 80.0;
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
var shadingTypeLoc;


//Light positions 
var lightPosition = vec3(0,3,0); //in camera coordinates
var lightPosition2 = vec3(l_r * Math.cos(l_theta),l_h,l_r * Math.sin(l_theta));
var lightPosLoc;
var lightPosLoc2;

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

    var shadingChoice = document.getElementById("shadingType");
    shadingChoice.onchange = function()
    {
        if(shadingChoice.selectedIndex == 0)
        {
            phongShading = true;
        }
        else
        {
            phongShading = false;
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

    let file = document.getElementById('files').files[0];

    let reader = new FileReader();
    reader.onload = function() 
    {
        let lines = this.result.split('\n');
        for (let line = 0; line < lines.length; line++)
        {
            let strings = lines[line].trimRight().split(' ');
            switch(strings[0])
            {
                case('v'): 
                    vert = vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3]));
                    verts.push(vert)
                break;
                case('f'): // do more stuff
                    face = [parseFloat(strings[1])-1, parseFloat(strings[2])-1, parseFloat(strings[3])-1];
                    faces.push(face);
                break;
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

        if(scaleSelect)
        {
            //Scale model to fit in starting projection view
            relativeScale = scale(1 / (upperXYZ[0] - lowerXYZ[0]), 1 / (upperXYZ[1] - lowerXYZ[1]) , 1 / (upperXYZ[2] - lowerXYZ[2]) );
        }
        else
        {
            relativeScale = mat4(1.0,  0.0,  0.0, 0.0,
                                        0.0,  1.0,  0.0, 0.0,
                                        0.0,  0.0,  1.0, 0.0,
                                        0.0,  0.0,  0.0, 1.0);
        }



        //Calculate normal of vtxs for Gourand Shading (avg of surrounding face normals)
        var faceNormals;
        for(var vtx = 0; vtx < verts.length; vtx++)
        {
            faceNormals = [];
            for(var i = 0; i < faces.length; i++)
            {
                if((faces[i][0] == vtx ) || (faces[i][1] == vtx ) || (faces[i][2] == vtx ))
                {
                    var vtx0 = vec3(verts[faces[i][0]][0], verts[faces[i][0]][1], verts[faces[i][0]][2]);
                    var vtx1 = vec3(verts[faces[i][1]][0], verts[faces[i][1]][1], verts[faces[i][1]][2]);
                    var vtx2 = vec3(verts[faces[i][2]][0], verts[faces[i][2]][1], verts[faces[i][2]][2]);
                    var val1 = subtract(vtx1,vtx0);
                    var val2 = subtract(vtx2,vtx0);
                    var vtxNormal = cross(val1,val2);
                    
                    faceNormals.push(vtxNormal);
                }
            }
            //average neighboring face normals and push to vertex normal list
            var summation = vec3(0,0,0);
            for(var i = 0; i < faceNormals.length; i++)
            {
                summation = add(summation,faceNormals[i]);
            }
            var normalized = normalize(summation);
            normals.push(normalized);
            
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

        let cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

        let colorLoc = gl.getAttribLocation( program, "aNormal" );
        gl.vertexAttribPointer( colorLoc, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( colorLoc );



        let vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

        let positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        modelViewLoc = gl.getUniformLocation(program, "modelView");
        projLoc = gl.getUniformLocation(program, "projection");
        ambientLoc = gl.getUniformLocation(program, "ambientProduct");
        diffuseLoc = gl.getUniformLocation(program, "diffuseProduct");
        specularLoc = gl.getUniformLocation(program, "specularProduct");
        lightPosLoc = gl.getUniformLocation(program, "lightPosition"),
        lightPosLoc2 = gl.getUniformLocation(program, "lightPosition2"),
        shininessLoc = gl.getUniformLocation(program, "shininess");
        shadingTypeLoc = gl.getUniformLocation(program, "phongShading");
        

        render();


    }
    reader.readAsText(file);
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
    

        
    //Passing shading and light position uniforms
    gl.uniform3fv(ambientLoc, flatten(convertV4_V3(ambientProduct)));
    gl.uniform3fv(diffuseLoc, flatten(convertV4_V3(diffuseProduct)));
    gl.uniform3fv(specularLoc, flatten(convertV4_V3(specularProduct)));
    gl.uniform3fv(lightPosLoc, flatten(lightPosition));
    gl.uniform3fv(lightPosLoc2, flatten(lightPosition2));
    gl.uniform1f(shininessLoc, material_shininess);
    gl.uniform1i(shadingTypeLoc, phongShading);
                
    //Passing projection and scaling uniforms
    gl.uniformMatrix4fv(projLoc, false, flatten(projection));
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(model_view));

    

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
        case "i": // Increase light radius
            l_r += 0.25;
            break;
        case "k": // Decrease light radius
            l_r -= 0.25;
            if(l_r <= 0)
            {
                l_r = 0.01;
            }
            break;
        case "l": // Increase light height
            l_h += 0.25;
            break;
        case "j": // Decrease light height
            l_h -= 0.25;
            break;
        case "o": // Increase light theta
            l_theta += pi / 32;
            break;
        case "u": // Decrease light theta
            l_theta -= pi / 32;
            break;
        case "r": //Reset all
            r = 2;
            h = 0;
            theta = pi;
            l_r = 2;
            l_h = 0;
            l_theta = pi;
            break;
        default:
            break;

    }

    //Camera orbit calculations

    this.document.getElementById("r").innerHTML = r;
    this.document.getElementById("h").innerHTML = h;
    this.document.getElementById("theta").innerHTML = theta;

    var eyeX = r * Math.cos(theta);
    var eyeY = h;
    var eyeZ = r * Math.sin(theta);
    eye = vec3(eyeX, eyeY, eyeZ);


    //Light orbit calculations

    this.document.getElementById("l_r").innerHTML = l_r;
    this.document.getElementById("l_h").innerHTML = l_h;
    this.document.getElementById("l_theta").innerHTML = l_theta;


    var lightX = l_r * Math.cos(l_theta);
    var lightY = l_h;
    var lightZ = l_r * Math.sin(l_theta);
    lightPosition2 = vec3(lightX, lightY, lightZ);


});

function convertV4_V3(vec4Input)
{
    return vec3(vec4Input[0],vec4Input[1],vec4Input[2]);
}


function convertV3_V4(vec3Input,num)
{
    return vec4(vec3Input[0],vec3Input[1],vec3Input[2],num);
}