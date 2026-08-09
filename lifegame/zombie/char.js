
const HUMAN  = 1;
const POLICE = 2;
const ZOMBIE = 3;
const WALL   = 4;
const DOCTOR = 5;
const DEATH  = 0;

const charNumMax = Math.max(HUMAN,POLICE,ZOMBIE,WALL,DOCTOR,DEATH);
const SHOULD_SEEK = [];

for(let y = 0;y<charNumMax+1;y++){
    SHOULD_SEEK[y]=[];
    for(let x = 0;x<charNumMax+1;x++){
        SHOULD_SEEK[y][x]=0;
    }
}

// --- HUMAN (一般市民) の行動 ---
SHOULD_SEEK[HUMAN ][HUMAN ] =  1;
SHOULD_SEEK[HUMAN ][POLICE] =  15; 
SHOULD_SEEK[HUMAN ][DOCTOR] =  10; 
SHOULD_SEEK[HUMAN ][ZOMBIE] = -25; 
SHOULD_SEEK[HUMAN ][WALL  ] = -5;

// --- POLICE (警官) の行動 ---
SHOULD_SEEK[POLICE][HUMAN ] =  8;  
SHOULD_SEEK[POLICE][POLICE] =  2;  
SHOULD_SEEK[POLICE][DOCTOR] =  5;  
SHOULD_SEEK[POLICE][ZOMBIE] =  25; 
SHOULD_SEEK[POLICE][WALL  ] = -5;

// --- DOCTOR (医者) の行動 ---
SHOULD_SEEK[DOCTOR][HUMAN ] =  5;  
SHOULD_SEEK[DOCTOR][POLICE] =  20; 
SHOULD_SEEK[DOCTOR][DOCTOR] =  2;  
SHOULD_SEEK[DOCTOR][ZOMBIE] = -5; 
SHOULD_SEEK[DOCTOR][WALL  ] = -5;

// --- ZOMBIE (ゾンビ) の行動 ---
SHOULD_SEEK[ZOMBIE][HUMAN ] =  20;
SHOULD_SEEK[ZOMBIE][POLICE] =  5; 
SHOULD_SEEK[ZOMBIE][DOCTOR] =  15;
SHOULD_SEEK[ZOMBIE][ZOMBIE] =  0.1;
SHOULD_SEEK[ZOMBIE][WALL  ] = -5;


//警察のゾンビ撃破率
const POLICE_ATTACK_ZOMBIE_RATE   = 10/100

//感染率
const ZOMBIE_INFECT_HUMAN_RATE  = 15/100;
const ZOMBIE_INFECT_POLICE_RATE = 10/100; 
const ZOMBIE_INFECT_DOCTOR_RATE = 10/100;
//治療率
const DOCTOR_CURE_ZOMBIE_RATE   = 35/100;


const POLICE_ATTACK_ZOMBIE_RATE_LIST    = [0,0,0,0,0,0,0,0,0].map((sr,i)=>(i?1-(1-POLICE_ATTACK_ZOMBIE_RATE   )** i:0));//撃破率
const ZOMBIE_INFECT_HUMAN_RATE_LIST     = [0,0,0,0,0,0,0,0,0].map((sr,i)=>(i?1-(1-ZOMBIE_INFECT_HUMAN_RATE    )** i:0));//感染率
const ZOMBIE_INFECT_POLICE_RATE_LIST    = [0,0,0,0,0,0,0,0,0].map((sr,i)=>(i?1-(1-ZOMBIE_INFECT_POLICE_RATE   )** i:0));//感染率
const ZOMBIE_INFECT_DOCTOR_RATE_LIST    = [0,0,0,0,0,0,0,0,0].map((sr,i)=>(i?1-(1-ZOMBIE_INFECT_DOCTOR_RATE )** i:0));//感染率
const DOCTOR_CURE_ZOMBIE_RATE_LIST      = [0,0,0,0,0,0,0,0,0].map((sr,i)=>(i?1-(1-DOCTOR_CURE_ZOMBIE_RATE     )** i:0));//治療率

const POLICE_RATE = 40/100
const DOCTOR_RATE = 20/100;


function makeSurvivors(){
    const r = Math.random()
    if(r < POLICE_RATE)return POLICE;
    if(r < DOCTOR_RATE+POLICE_RATE)return DOCTOR;
    return HUMAN;
}

function initFormula(x,y){
    let rand = Math.random();
    if((x%50>=45)&&(y%50>=45))return WALL;
    if(y < 5)return ZOMBIE;
    if(y > 50||y < 20)return DEATH;
    return makeSurvivors();
}