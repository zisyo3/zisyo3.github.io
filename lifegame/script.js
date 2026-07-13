
let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");


ctx.fillStyle = "red";
ctx.fillRect(0, 0, canvas.width, canvas.height);
 
const LIFE  = 1;
const DEATH = 0;

let cellWidth  = 100;
let cellHeight = 100;
canvas.width  = cellWidth;
canvas.height = cellHeight;

let cells = [];
let next  = [];

ctx.imageSmoothingEnabled = false;
let startTime   = performance.now();
let endTime     = 0;
let score       = 0;

let updateTime  = 0;
let updateStart = 0;
let updateEnd   = 0;
let drawTime    = 0;
let drawStart   = 0;
let drawEnd     = 0;
let sumTime     = 0;
let count       = 0;

init();
draw();
setInterval(() => {
    if(count < 200){
        updateStart = performance.now();    
        update();
        updateEnd = performance.now();
        updateTime = updateEnd  - updateStart;
        count++;
    }else if(score === 0){
        endTime = performance.now();
        score = 1000000000/(endTime - startTime);
    }
}, 1000/10000000);

setInterval(() => {
    drawStart = performance.now();
    draw();
    drawEnd = performance.now();

    drawTime   = drawEnd    - drawStart;
    sumTime    = updateTime + drawTime;
    document.getElementById("performance").innerText =
        "update :"+Math.round(updateTime*100)/100+"ms\n"+
        "draw   :"+Math.round(drawTime  *100)/100+"ms\n"+
        "sum    :"+Math.round(sumTime   *100)/100+"ms\n"+
        "score  :"+Math.round(score         )    +"pt  ";
}, 1000/60);

function init(){

    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
 
    //let initFormula = (x,y) => Math.floor(Math.random() * 2);
    let initFormula = (x,y) => Math.floor(Math.random() *2);
    //let initFormula = (x,y) => ((x * y) % 67 === 0) ? LIFE : DEATH;

    for(let y=0;y<cellHeight;y++){
        cells[y] = [];
        next[y] = [];
        for(let x=0;x<cellWidth;x++){
            cells[y][x] = initFormula(x,y);
            next[y][x] = 0;
        }
    }
}
function draw(){
    let cellSize=Math.min(canvas.width/cellWidth,canvas.height/cellHeight);
    
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
 
    for(let y=0;y<cellHeight;y++){
        for(let x=0;x<cellWidth;x++){
            if(cells[y][x] == LIFE){
                ctx.fillStyle = "black";
                ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);
            }
        }
    }
}
function update(){
    function cell(y,x){
        return (y < 0 || y >= cellHeight || x < 0 || x >= cellWidth?0:cells[y][x]);
    }
    next =cells.map((row,y)=>
        row.map((nowCell,x)=>{
            let sum = 
                cell(y-1,x-1)+cell(y-1,x)+cell(y-1,x+1)+
                cell(y  ,x-1)+            cell(y  ,x+1)+
                cell(y+1,x-1)+cell(y+1,x)+cell(y+1,x+1);
            return  sum == 3?LIFE        :
                    sum == 2?cells[y][x] :
                             DEATH       ;
        })
    );
    cells = next;
}
