//Setting Up Variables for responsive Design
const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 2
const width = canvas.width;
const height = canvas.height;

const cellwidth = Math.floor(width/7);
const cellheight = Math.floor(height/6);
const stoneradius = Math.floor(cellheight/2.5);

let widthlines = [0,0,0,0,0,0];
let heightlines = [0,0,0,0,0];
let centerx = []
let centery = []

let x = Math.floor(cellwidth/2)
let y = Math.floor(cellheight/2)
for(let i = 0; i < 7;i++){
    centerx.push(x);
    x+=cellwidth;
}
for(let i = 0; i < 6;i++){
    centery.push(y);
    y+=cellheight;
}

let start = 0;
for(let i = 0; i<widthlines.length;i++){
    widthlines[i]=start+cellwidth;
    start+=cellwidth;
}

start = 0;
for(let i = 0; i<heightlines.length;i++){
    heightlines[i]=start+cellheight;
    start+=cellheight;
}
//Drawing CellBorders
for(let i = 0; i<widthlines.length;i++){
    ctx.beginPath();
    ctx.moveTo(widthlines[i],0);
    ctx.lineTo(widthlines[i],height);
    ctx.stroke();
}
for(let i = 0; i<heightlines.length;i++){
    ctx.beginPath();
    ctx.moveTo(0,heightlines[i]);
    ctx.lineTo(width,heightlines[i]);
    ctx.stroke();
}
function draw(button) {
    $.ajax({
        method: "GET",
        url: "/json/"+button,
        dataType: "json",

        success: function (result) {
            drawCircles(result)
        }
    });
}
function initbuttons(){
    $("#b0").click(function (){
        console.log("b0 pressed")
        draw(0)
    })
    $("#b1").click(function (){
        console.log("b1 pressed")
        draw(1)
    })
    $("#b2").click(function (){
        console.log("b2 pressed")
        draw(2)
    })
    $("#b3").click(function (){
        console.log("b3 pressed")
        draw(3)
    })
    $("#b4").click(function (){
        console.log("b4 pressed")
        draw(4)
    })
    $("#b5").click(function (){
        console.log("b5 pressed")
        draw(5)
    })
    $("#b6").click(function (){
        console.log("b6 pressed")
        draw(6)
    })
}
$(document).ready(function (){
    console.log("Document is ready");
    initbuttons()
    connectWebSocket();
    $.ajax({
        method: "GET",
        url: "/json",
        dataType: "json",

        success: function (result) {
            drawCircles(result)
        }
    });
});
function drawCircles(json){
    cells = json.grid.cells;
    for(let i = 0; i < cells.length;i++){
        let val = cells[i].val;
        let row = cells[i].row;
        let col = cells[i].col;
        if(val === 1){
            ctx.fillStyle = "#c82124";
        }else{
            ctx.fillStyle = "#3370d4";
        }
        if(val !== 0){
            ctx.beginPath();
            ctx.arc(centerx[col],centery[row],stoneradius,0,2*Math.PI);
            ctx.fill();
        }
    }
}
function connectWebSocket(){
    let websocket = new WebSocket("https://connect4htwgws2021.herokuapp.com/ws");
    websocket.setTimeout

    websocket.onopen = function (){
        console.log("Connected to Websocket");
    };
    websocket.onclose = function(){
        console.log("Connection with Websocket Closed");
    };
    websocket.onmessage = function (e){
        if(typeof e.data === "string"){
            let json = JSON.parse(e.data);
            let event = json.event
            let grid = json.grid
            if(event === "update")
                drawCircles(grid);
            else if (event === "end")
                alert("Spiel vorbei")
        }
    };
    websocket.onerror = function (error){
        console.log("Error in Websocket Occured: " +error);
    };
}

