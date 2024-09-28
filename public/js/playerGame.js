var socket = io();
var playerAnswered = false;
var correct;   //true,false ,"NA" (after time)
var name;
var score = 0;


var timer;

// var time = 20;

//quiz data
let quiz_type = -1
let questionsCount = { "mcq" : 0 , "buzzer" : 0}
let marks = {}
let time = 0

let currentQuestionIndex = 0

var params = jQuery.deparam(window.location.search); 
console.log("params : ",params)

socket.on('connect', function() {
    socket.emit('identifyUser', { role: 'player' });
    //Tell server that it is player connection from game view , asks for palyer data
    socket.emit('player-join-game', params);
    
    document.getElementById('answer1').style.visibility = "visible";
    document.getElementById('answer2').style.visibility = "visible";
    document.getElementById('answer3').style.visibility = "visible";
    document.getElementById('answer4').style.visibility = "visible";
});

//receives player and game data , update the ui
socket.on('playerGameData', function(data){
    console.log("playerGameData :" , data);

    currentQuestionIndex++

    if(currentQuestionIndex == 1){
        quiz_type = params.quiz_type
        questionsCount.mcq = params.mcq_questions
        questionsCount.buzzer = params.buzzer_questions
        marks = params.marks
        time = data.time
    }

    //conditional rendering based on question type
    if(data.questionData.type == "mcq"){
        //dispay mcq
        console.log("mcq question , timer started")
        updateTimer();
    }else{
        //display buzzer
        console.log("buzzer question")
    }
    
    // for(var i = 0; i < data.length; i++){
    //     if(data[i].playerId == socket.id){
    //         // document.getElementById('nameText').innerHTML = "Name: " + data[i].name;
    //         // document.getElementById('scoreText').innerHTML = "Score: " + data[i].gameData.score;
    //         console.log("pointed player ", data[i])
    //     }
    // }
   
 });

socket.on('noGameFound', function(){
    window.location.href = '../../';//Redirect user to 'join game' page 
});

socket.on('noQuestionsAvailable', function(){
    console.log("no question in the game")
});

// submit mcq (1-4) 
function answerSubmitted(num){
    if(playerAnswered == false){
        playerAnswered = true;
        console.log("answered " , num , time)
        socket.emit('playerAnswer', num);
        // document.getElementById('answer1').style.visibility = "hidden";
        // document.getElementById('answer2').style.visibility = "hidden";
        // document.getElementById('answer3').style.visibility = "hidden";
        // document.getElementById('answer4').style.visibility = "hidden";
        // document.getElementById('message').style.display = "block";
        // document.getElementById('message').innerHTML = "Answer Submitted! Waiting on other players...";
        
    }
}

//after evaluation
socket.on('answerResult', function(data){
    if(data == "true"){
        correct = true;
    }else if(data == "false"){
        correct = false
    }else if(data == "NA"){
        correct = "NA"
    }
});

function submitBuzzer(){
    playerAnswered = true
    console.log("player buzzered")
    socket.emit("playerBuzzered")

    //update ui
}

socket.on("buzzerAck", (ack)=>{
    if(ack == true){
        console.log("you buzzered first!!!")
    }else if(ack == false){
        console.log("your buzzer was not recorded")
    }

    console.log("waiting for next question")
})

//when  question ends
socket.on('questionOver', function(data){
    console.log("questionOver" , data)
    clearInterval(timer);
    if(correct == true){
        console.log("correcr answer")
        document.body.style.backgroundColor = "#4CAF50";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Correct!";
    }else if(correct == false){
        console.log("incorrect answer")
        document.body.style.backgroundColor = "#f94a1e";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Incorrect!";
    }else if(correct == "NA"){
        console.log("time limit")
        document.body.style.backgroundColor = "#f94a1e";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Not Responded or Time limit Excedded";
    }

    // document.getElementById('answer1').style.visibility = "hidden";
    // document.getElementById('answer2').style.visibility = "hidden";
    // document.getElementById('answer3').style.visibility = "hidden";
    // document.getElementById('answer4').style.visibility = "hidden";

    // socket.emit('getScore');
});

// socket.on('newScore', function(data){
//     console.log("score : ", data)
//     document.getElementById('scoreText').innerHTML = "Score: " + data.mcq + " | " + data.buzzer;
// });


//receive questions after the first one
socket.on('nextQuestionPlayer', function(data){
    correct = false;
    playerAnswered = false;
    currentQuestionIndex++;

    console.log("question /nwxt" , data)
    //conditional rendering based on question type
    if(data.questionData.type == "mcq"){
        //dispay mcq
        console.log("mcq question - >timer starts")
        updateTimer()
    }else{
        //display buzzer
        console.log("buzzer question")
    }
    
   
});

socket.on('hostDisconnect', function(){
    console.log("host disconnected , redircting")
    setTimeout(function() {
        window.location.href = "../../";
    }, 5000); 
});




socket.on('GameOver', function(data){
    //process and display leaderboard
    console.log("GameOver",data)
   
});

function updateTimer(){
    let time_ = time
    timer = setInterval(function(){
        time -= 1;
        document.getElementById('num').textContent = " " + time;
        if(time == 0){
            time = time_
            // socket.emit('timeUp');
        }
    }, 1000);
}

socket.on("error", function (message) {
    console.log("Error: " + message);
});