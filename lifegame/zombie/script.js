let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
window.onerror = function (message, source, lineno, colno, error) {if (error) {console.log("cause:", error.message);console.log("line:", source, "の", lineno, "行目");console.log("aboute:", error.stack);} else {console.log("error:", message, "行:", lineno);}return false;};
const fileLoadButton = document.getElementById('fileLoad');
const fileInput = document.getElementById('fileInput');

ctx.fillStyle = "red";
ctx.fillRect(0, 0, canvas.width, canvas.height);
canvas.style.imageRendering="pixelated";
Math.lerp = function(a,b,t){return a+(b-a)*t};

function getCanvasMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
}
//フラグ
let ev_init = false;
let ev_spawn = false;
let cellWidth  = 150;
let cellHeight = 150;
//canvasSize
canvas.width  = cellWidth;
canvas.height = cellHeight;

let cells = [];
let afterInfection  = [];
let afterMoving = [];
let isMoved = [];
ctx.imageSmoothingEnabled = false;
let startTime      = performance.now();
let endTime        = 0;
let score          = 0;

let updateTime     = 0;
let updateStart    = 0;
let updateEnd      = 0;
let drawTime       = 0;
let drawStart      = 0;
let drawEnd        = 0;
let sumTime        = 0;
let sumSumTime     = 0;

let generation      = 0;//世代
let frameAccumulator= 0;//実行速度を調節するための内部変数
let gameSpeed       = 150000;//実行速度
let csvData         = 0;
init();
draw();

setInterval(() => {
    frameAccumulator += gameSpeed;
    let totalUpdateTime = 0;
    while(frameAccumulator>=60){

        if(ev_init == true){init();ev_init=false;}
        
        updateStart = performance.now();    
        update();

        updateEnd = performance.now();
        updateTime = updateEnd  - updateStart;
        if(generation > 5){
            sumSumTime+=sumTime;
        }
        totalUpdateTime += updateTime;
        generation++;
        frameAccumulator -= 60;

        if(totalUpdateTime > 1000/60){
            break;

        }
        
    }
    
    //draw
    drawStart = performance.now();
    draw();
    drawEnd = performance.now();

    drawTime   = drawEnd    - drawStart;
    sumTime    = updateTime + drawTime;
    
    document.getElementById("performance").innerText =
        "update     :"+Math.round(updateTime               *100)/100+"ms\n"+
        "draw       :"+Math.round(drawTime                 *100)/100+"ms\n"+
        "sum        :"+Math.round(sumTime                  *100)/100+"ms\n"+
        "average    :"+((generation-5>=1)?
                      (Math.round(sumSumTime/(generation-5)*100)/100+"ms\n"):"?");    

    
}, 1000/60);

function init(){
    generation = 0;
    sumSumTime = 0;
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /*
    let initFormula = (x,y) => {
        let rnd = Math.random();
        const HUMAN_R  = 94.9/100;
        const POLICE_R = 5  /100;
        const ZOMBIE_R = 0.1 /100;

        if(rnd <= HUMAN_R){return HUMAN;}
        if(rnd <= POLICE_R+HUMAN_R){return POLICE;}
        if(rnd <= ZOMBIE_R+POLICE_R+HUMAN_R){return ZOMBIE;}
        return DEATH;
    }
    */
    
    

    let method = document.getElementById("reset-method")
    cells = [];
    afterInfection = [];
    afterMoving = [];
    isMoved = [];
    if(method.value == "random"||method.value == ""){
        for(let y=0;y<cellHeight;y++){
            cells[y] = [];
            afterInfection[y] = [];
            afterMoving[y] = [];
            isMoved[y] = [];
            for(let x=0;x<cellWidth;x++){
                cells[y][x] = initFormula(x,y);
                afterInfection[y][x] = 0;
                afterMoving[y][x] = 0;
                isMoved[y][x] = 0;
            }
        }
    }else{
        cells = csvData.map(row => [...row]);
        cellWidth  = cells[0].length;
        cellHeight = cells.length;
        for(let y=0;y<cellHeight;y++){
            afterInfection[y] = [];
            afterMoving[y] = [];
            isMoved[y] = [];
            for(let x=0;x<cellWidth;x++){
                afterInfection[y][x] = 0;
                afterMoving[y][x] = 0;
                isMoved[y][x] = false;
            }
        }
    }
}
function draw(){
    
    const cvs = ctx.getImageData(0, 0, canvas.width, canvas.height);

    function setColor(x,y,r,g,b){
        let i = (y*cellWidth+x)*4;
        let t = 0.5
        cvs.data[i]  =Math.lerp(cvs.data[i  ],r,t);
        cvs.data[i+1]=Math.lerp(cvs.data[i+1],g,t);
        cvs.data[i+2]=Math.lerp(cvs.data[i+2],b,t);
        cvs.data[i+3]=255;
        //ctx.fillStyle = `rgb(${r},${g},${b})`;
        //ctx.fillRect(x,y,1,1);
    }
    
    for(let y=0;y<cellHeight;y++){
        for(let x=0;x<cellWidth;x++){
            switch(cells[y][x]){
                case HUMAN:
                    setColor(x,y,0,255,0);
                    break;
                case POLICE:
                    setColor(x,y,0,0,255);
                    break;
                case ZOMBIE:
                    setColor(x,y,255,0,255);
                    break;
                case WALL:
                    setColor(x,y,125,125,125);
                    break;
                case DOCTOR:
                    setColor(x,y,255,255,255);
                    break;
                case DEATH:
                    setColor(x,y,0,0,0);
                    break
            }
        }
    }
    ctx.putImageData(cvs,0,0);
}




function isCell(arg1,arg2,arg3,arg4){
    let targetCells,type,x,y;
    if(arg4 === undefined){
        targetCells = cells;
        type        = arg1;
        x           = arg2;
        y           = arg3;

    }else{
        targetCells = arg1;
        type        = arg2;
        x           = arg3;
        y           = arg4;
    }
    if(y < 0 || y >= cellHeight || x < 0 || x >= cellWidth){return false;}
    return targetCells[y][x] == type?1:0;
}
function sumCells(arg1,arg2,arg3,arg4){
    let targetCells,type,x,y;
    if(arg4 === undefined){
        targetCells = cells;
        type        = arg1;
        x           = arg2;
        y           = arg3;

    }else{
        targetCells = arg1;
        type        = arg2;
        x           = arg3;
        y           = arg4;

    }
    let sum = 0;
    for(let y2 = -1;y2 <= 1;y2++){
        if(y+y2>=cellHeight||y+y2<0){continue;}       
        for(let x2 = -1;x2 <= 1;x2++){
            if(x+x2>=cellWidth||x+x2<0||((!x2)&&(!y2))){continue;}
            sum += (targetCells[y+y2][x+x2] == type);
        }
    }
    return sum;
}
function update(){
    for(let y=0;y<cellHeight;y++){    
        for(let x=0;x<cellWidth;x++){
            let nowCell = cells[y][x];
            if(nowCell == HUMAN){
                let zombieSum = sumCells(ZOMBIE,x,y);
                afterInfection[y][x] = Math.random() < ZOMBIE_INFECT_HUMAN_RATE_LIST[zombieSum]?ZOMBIE:nowCell;
            }else if(nowCell == POLICE){
                let zombieSum = sumCells(ZOMBIE,x,y);
                afterInfection[y][x] = Math.random() < ZOMBIE_INFECT_POLICE_RATE_LIST[zombieSum]?ZOMBIE:nowCell;
            }else if(nowCell == ZOMBIE){
                let policeSum = sumCells(POLICE,x,y);
                let doctorSum = sumCells(DOCTOR,x,y);
                afterInfection[y][x] = 
                Math.random() < DOCTOR_CURE_ZOMBIE_RATE_LIST[doctorSum]?
                    makeSurvivors():
                Math.random() < POLICE_ATTACK_ZOMBIE_RATE_LIST[policeSum]?
                    DEATH:
                    nowCell;
            }else if(nowCell == WALL){
                afterInfection[y][x] = WALL;
            }else if(nowCell == DOCTOR){
                let zombieSum = sumCells(ZOMBIE,x,y);
                afterInfection[y][x] = Math.random() < ZOMBIE_INFECT_DOCTOR_RATE_LIST[zombieSum]?ZOMBIE:nowCell;
            }else{
                afterInfection[y][x] = DEATH;
            }
        }
    }
    
    afterMoving = afterInfection.map(row => row.map(cell=>0));

    for(let y = 0;y < cellHeight;y++){
        isMoved[y].fill(false);
    }


    function move(x,y){
        let nowCell = afterInfection[y][x];
        if(nowCell == DEATH){return;}
        if(nowCell == WALL){
            afterMoving[y][x] = nowCell;
            return;
        }
        let deathSum = sumCells(afterInfection,DEATH,x,y);
        
        if(deathSum != 0&&isMoved[y][x] == false){
            let biadR = 10; 
            let biasX = 0;
            let biasY = 0;
            const step = 1;
            for(let y2 = -biadR;y2 <= biadR;y2+=step){
                if(y+y2>=cellHeight||y+y2<0){continue;}       
                for(let x2 = -biadR;x2 <= biadR;x2+=step){
                    if(x+x2>=cellWidth||x+x2<0||((!x2)&&(!y2))){continue;}
                    let targetCell = afterInfection[y+y2][x+x2]; 

                    if(targetCell == DEATH){continue;}
                    let bias = (SHOULD_SEEK[nowCell][targetCell]) * step;
                    if(targetCell == WALL ){bias /=20;}
                    
                    let dist = Math.sqrt(x2 * x2 + y2 * y2);
                    
                    biasX += bias*(x2 > 0 ? 0.1 : -0.1);
                    biasY += bias*(y2 > 0 ? 0.1 : -0.1);
                }
            }
            biasX /= biadR;
            biasY /= biadR;
            let moveX = 0;
            let moveY = 0;
            let rand = 0
            if(Math.random()<0.5){
                rand = Math.floor(Math.random() * 3 - 1 + Math.max(Math.min(biasX,1),-1));
                moveX = Math.max(Math.min(rand,1),-1);
            }else{
                rand = Math.random() * 2 -1;
                moveY = Math.round(Math.max(Math.min(rand+biasY,1),-1));
            }
            
            if(isCell(afterMoving,DEATH,x+moveX,y+moveY)&&isCell(afterInfection,DEATH,x+moveX,y+moveY)){
                afterMoving[y+moveY][x+moveX] = nowCell;
                afterMoving[y][x] =  DEATH;
                isMoved[y+moveY][x+moveX] = true;
            }else{
                afterMoving[y][x] = nowCell;
            }
        }else{
            afterMoving[y][x] = nowCell;
        }
    }    
    if(!(generation%2)){
        for(let y = 0;y < cellHeight;y++){
            for(let x = 0;x < cellWidth;x++){
                move(x,y);
            }
        }
    }else{
        for(let y = cellHeight-1;y >= 0;y--){
            for(let x = cellWidth-1;x >= 0;x--){
                move(x,y);
            }
        }
    }
    cells = afterMoving;
    let char = {Generation:generation,HUMAN:0,POLICE:0,DOCTOR:0,ZOMBIE:0};
    if(!(generation%100)){
        for(let y = 0;y < cellHeight;y++){
            for(let x = 0;x < cellWidth;x++){
                if(cells[y][x] == HUMAN )char.HUMAN ++;
                if(cells[y][x] == POLICE)char.POLICE++;
                if(cells[y][x] == DOCTOR)char.DOCTOR++;
                if(cells[y][x] == ZOMBIE)char.ZOMBIE++;
            }
        }
        char.Generation = char.Generation.toString().padStart(5, ' ')
        char.HUMAN      = char.HUMAN .toString().padStart(5, ' ')
        char.POLICE     = char.POLICE.toString().padStart(5, ' ')
        char.DOCTOR     = char.DOCTOR.toString().padStart(5, ' ')
        char.ZOMBIE     = char.ZOMBIE.toString().padStart(5, ' ')

        console.log(JSON.stringify(char));
    }
}

fileLoadButton.addEventListener('click', () => {
    fileInput.click(); 
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // [0]を指定
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const csvText = e.target.result;
        cells = csvFileLoader(csvText);
        cellWidth  = cells[0].length;
        cellHeight = cells.length;
    };
    reader.readAsText(file);
});

function csvFileLoader(text) {
    const csvData = [];
    const rows = text.split(/\r\n|\n/);
  
    rows.forEach(row => {
        if (row.trim() === '') return;
        
        // 文字列の配列から、Number型（数値）の配列に変換して追加
        const stringCells = row.split(',');
        const numberCells = stringCells.map(cell => Number(cell)); 
        
        csvData.push(numberCells);
    });
  
    return csvData;
}
