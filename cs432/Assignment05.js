"use strict";

let canvas;
let gl;

let positions = [];
let colors = [];
var normals = [];

//Cylindrical orbit variables
const pi = 3.14159;
var r = 2;
var h = 0;
var theta = pi;

var at;
var eye 

var modelViewLoc;
var projLoc;

var perspSelect = 1;
var scaleSelect = 0;


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.enable(gl.DEPTH_TEST);



    document.getElementById('files').onchange = function() 
    {
        positions = [];
        colors = [];
        normals = [];


        let verts = [];  
        let faces = [];
    
        let vert = [];
        let face = [];


        let file = this.files[0];
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
                        vert = vec4(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3]), 1);
                        verts.push(vert)
                    break;
                    case('f'): // do more stuff
                        face = [parseFloat(strings[3])-1, parseFloat(strings[1])-1, parseFloat(strings[2])-1];
                        faces.push(face);
                    break;
                }
            }



            //Transform Centroid of Bounding box to Origin:
            //Determine Centroid
            var upperXYZ = vec3(-9999,-9999,-9999)
            var lowerXYZ = vec3(9999,9999,9999)
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
                verts[i] = mult(translateMtx,verts[i]);
                verts[i] = mult(relativeScale,verts[i]);
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
                normals[i] = vec4(Math.abs(normals[i][0]),Math.abs(normals[i][1]),Math.abs(normals[i][2]),1);
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



            let program = initShaders(gl, "vertex-shader", "fragment-shader");
            gl.useProgram(program);

            let cBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

            let colorLoc = gl.getAttribLocation( program, "aColor" );
            gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
            gl.enableVertexAttribArray( colorLoc );



            let vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

            let positionLoc = gl.getAttribLocation(program, "aPosition");
            gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionLoc);

            modelViewLoc = gl.getUniformLocation(program, "modelView");
            projLoc = gl.getUniformLocation(program, "projection");

            render();


        }
        reader.readAsText(file);
    }


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

}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //Eye - location of camera, at - look at point
    var model_view = lookAt(eye, vec3(0,0,0), vec3(0,1,0));
    var projection;

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
        case "r": //Reset all
            r = 2;
            h = 0;
            theta = pi;
            break;
        default:
            break;

    }

    this.document.getElementById("r").innerHTML = r;
    this.document.getElementById("h").innerHTML = h;
    this.document.getElementById("theta").innerHTML = theta;

    var eyeX = r * Math.cos(theta);
    var eyeY = h;
    var eyeZ = r * Math.sin(theta);
    eye = vec3(eyeX, eyeY, eyeZ);

});
