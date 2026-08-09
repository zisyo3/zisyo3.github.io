
let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
const fileLoadButton = document.getElementById('fileLoad');
const fileInput = document.getElementById('fileInput');

ctx.fillStyle = "red";
ctx.fillRect(0, 0, canvas.width, canvas.height);
 
const LIFE  = 1;
const DEATH = 0;

let cellWidth  = 100;
let cellHeight = 100;
canvas.width  = cellWidth*5;
canvas.height = cellHeight*5;

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
    if(count < 1000 || true){
        updateStart = performance.now();    
        update();
        updateEnd = performance.now();
        updateTime = updateEnd  - updateStart;
        count++;
    }else if(score === 0){
        endTime = performance.now();
        score = 1000000000/(endTime - startTime);
    }
}, 1000/5);

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
 
    //let initFormula = (x,y) => ((x % y) % (2) ? LIFE : DEATH);
    let initFormula = (x,y) => Math.floor(Math.random() *((x+y)%3)*0.7);
    //let initFormula = (x,y) => ((x * y) % 64 === 0) ? LIFE : DEATH;
    //let initFormula = (x,y) => ((x & y) === 0) ? 1 : 0;
    //let initFormula = (x,y) =>  Math.sqrt((x-cellWidth/2)**2+(y-cellHeight/2)**2) % 20 < 0.9?1:0;
    /*let initFormula = (x,y) =>  {
        const mapRange = (val, min, max, newMin, newMax) => ((val - min) / (max - min)) * (newMax - newMin) + newMin;

        let centerX = cellWidth/2;
        let centerY = cellHeight/2;
        const G = cellHeight;
        let inA    = ((x-centerX + G*0.25  )**2 + (y-centerY)**2) < (G*0.25)**2;
        let inB    = ((x-centerX + G*0.1875)**2 + (y-centerY)**2) < (G*0.2 )**2;
        function inStar(px,py,cx,cy,rOuter){const rInner=rOuter*(3-Math.sqrt(5))/2;const vertices=[];for(let i=0;i<10;i++){const angle=(i*Math.PI/5)-(Math.PI/2);const r=(i%2===0)?rOuter:rInner;vertices.push({x:cx+r*Math.cos(angle),y:cy+r*Math.sin(angle)});}let inside=false;for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){const xi=vertices[i].x,yi=vertices[i].y;const xj=vertices[j].x,yj=vertices[j].y;const intersect=((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi);if(intersect)inside=!inside;}return inside;}


        return ((inA && !inB ) || inStar(x,y,centerX-G/16,centerY,G/8));

    }*/


    for(let y=0;y<cellHeight;y++){
        cells[y] = [];
        next [y] = [];
        for(let x=0;x<cellWidth;x++){
            cells[y][x] = initFormula(x,y);
            next[y][x] = 0;
        }
    }
}
function draw(){
    let cellSize=Math.min(canvas.width/cellWidth,canvas.height/cellHeight);
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
 
    for(let y=0;y<cellHeight;y++){
        for(let x=0;x<cellWidth;x++){
            if(cells[y][x] == LIFE){
                ctx.fillStyle = "Green";
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
            //life
            /*return  (sum==3)?LIFE       :
                    (sum==2)?cells[y][x]:
                                   DEATH;
            */
            return (sum == 3)?LIFE:
                   (sum == 1||sum == 4)?cells[y][x]:
                             DEATH;

        })
    );
    cells = next;
}

fileLoadButton.addEventListener('click', () => {
    fileInput.click(); 
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
    const csvText = e.target.result;
    const csvData = csvFileLoader(csvText);
    alert(csvData);
  };
});

function csvFileLoader(text){
     const csvData = [];
  
  const rows = text.split(/\r\n|\n/);
  
  rows.forEach(row => {
    if (row.trim() === '') return;
    
    const cells = row.split(',');
    
    // 3. 2次元配列に追加する
    csvData.push(cells);
  });
  
  return csvData;
}