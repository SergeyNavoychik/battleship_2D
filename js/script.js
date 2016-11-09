
/*================VIEW======================*/
var view = {
    btnSoundEffectsPress: false,
    soundEffects: false,
    audio: new Audio(),
    startField: function () {
        var element = $('td');
        element.removeClass('hit-field miss-field');
    },
    hit: function (el) {
        var hitEl = $('#'+el);
        hitEl.addClass('hit-field');
        this.alertMessage("Корабль ранен");
    },
    miss: function (el) {
        var missEl = $('#'+el);
        missEl.addClass('miss-field');
        this.alertMessage("Промах стреляйте еще");
    },
    alertMessage: function (msg) {
        var alertEl = $('#alert-message > p');
        alertEl.text(msg);
    },
    showStatistic: function (msgShot, msgHit) {
        var  countShot = $('#count-shot');
        var  hitPersents = $('#hit-persentage');
        countShot.text(msgShot);
        hitPersents.text(msgHit);
    },
    switchOnSound: function() {
        if(!this.btnSoundEffectsPress) {
            this.soundEffects = true;
            $("#switch_on_sound").text("Выключить звуковые эффекты");
            this.btnSoundEffectsPress = true;
        }
        else {
            this.soundEffects = false;
            $("#switch_on_sound").text("Включить звуковые эффекты");
            this.btnSoundEffectsPress = false;
        }
    },
    playSound: function(url) {
        if(this.soundEffects) {
            this.audio.src = url;
            this.audio.autoplay = true;
        }
    },
    popupWin: function () {
        $('#you_win').toggle();
        this.audio.pause();
    }
}

/*=====================CONTROLLER=================*/

var controller = {
    isTruePositionOfShot: function (inputValue) {
        if(inputValue == '' ){
            view.alertMessage('Вы не указали позицию выстрела, введите позицию!!!!');
            view.playSound('audio/attention.wav');
            return false;
        }
        var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];         /* если введенное значение верно*/
        var tmpRow = inputValue[0].toUpperCase();
        var col = inputValue[1];
        for (var i = 0; i < alphabet.length; ++i) {
            if (tmpRow == alphabet[i] && col > -1 && col < 7 && inputValue.length == 2) {
                return true;
            }
        }
        view.alertMessage('Вы ввели неверную позицию, повторите попытку');
        view.playSound('audio/attention.wav');
        return false;

    },
    getPositionOfShot: function (inputValue) {
        var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        var tmpRow = inputValue[0].toUpperCase();
        var col = inputValue[1];
        var row = alphabet.indexOf(tmpRow);
        var cell = row + col;
        return cell;
    },
    alreadyShot: function (madeShot) {                          /*Проверяем стреляли по этой позиции, или нет*/
        for ( var i = 0; i < model.madeShots.length; ++i){
            if(model.madeShots[i] == madeShot){
                view.alertMessage('Вы уже стреляли по этой позиции!');
                view.playSound('audio/attention.wav');
                return true;
            }
        }
        model.madeShots[model.countOfAttempt] = madeShot;
        return false;
    },
    isHit: function (position) {                    /* проверяем попал, или нет*/
        var hit = false;
        for (var i = 0; i < model.shipPosition.length; ++i) {
            for (var j = 0; j < model.shipPosition[i].length; ++j) {
                if (position == model.shipPosition[i][j]) {
                    model.hitArray[i][j] = '1';     /* если попали в массив попаданий записываем '1' для соответствующего корабля и позиции*/
                    view.hit(position);
                    ++model.countOfHits;
                    hit = true;
                }
            }
        }
        return hit;
    },
    isSunkShip: function () {                                         // Проверяем потоплен корабль, или пока только ранен
        var countHitOneShip = 0;                                      //Кол-во попаданий в один корабль
        for (var i = 0; i < model.hitArray.length; ++i) {
            for (var j = 0; j < model.hitArray[i].length; ++j) {
                if (model.hitArray[i][j] == 1){
                    ++countHitOneShip;
                    if(countHitOneShip == model.hitArray[i].length){
                        model.hitArray[i] = [];                       //если потоплен, обнуляем массив попаданий, для потопленного корабля
                        view.alertMessage("Вы потопили корабль");
                        --model.countShips;                           // Уменьшаем кол-во оставшихся кораблей
                    }
                }
                else{ break;}                                         // если есть поцизия в кот. еще не попали, переходим к след. кораблю
            }
            countHitOneShip = 0;
        }
    },
    fire: function () {
        if (!model.isSunk) {
            var inputValue = ($('#shot-position')).val();
            if (this.isTruePositionOfShot(inputValue)) {
                var shotPosition = this.getPositionOfShot(inputValue);
                if (!this.alreadyShot(shotPosition)) {                      /* проверяем стреляли по этой позиции, или нет*/
                    view.playSound('audio/shot.mp3');
                    ++model.countOfAttempt;
                    if (this.isHit(shotPosition)) {                         // проверяем попали, или нет
                        this.isSunkShip();                                  // проверяем поторили корабль, или нет
                        if (model.countShips == 0) {
                            setTimeout('view.alertMessage("Игра окончена, Вы победили!")', 500);
                            setTimeout("view.popupWin()", 2000);
                            setTimeout("view.playSound('audio/win.mp3')", 2000);
                            model.isSunk = true;
                            view.showStatistic(model.countOfAttempt, Math.round((model.countOfHits / model.countOfAttempt) * 100) + "%");
                        }
                    }
                    else {
                        view.miss(shotPosition);
                    }
                }
                else {
                    setTimeout('view.alertMessage("Введите новую позицию выстрела")', 2000);
                }
            }
        }
        else {
            view.alertMessage("Игра окончена, нажмите 'Начать сначала', что бы повторить");
        }
    },
    fireClickOnField: function (shotPosition) {
        if (!model.isSunk) {
            if (!this.alreadyShot(shotPosition)) {                      /* проверяем стреляли по этой позиции, или нет*/
                view.playSound('audio/shot.mp3');
                ++model.countOfAttempt;
                if (this.isHit(shotPosition)) {
                    this.isSunkShip();
                    if (model.countShips == 0) {
                        setTimeout('view.alertMessage("Игра окончена, Вы победили!")', 500);
                        setTimeout("view.popupWin()", 2000);
                        setTimeout("view.playSound('audio/win.mp3')", 2000);
                        model.isSunk = true;
                        view.showStatistic(model.countOfAttempt, Math.round((model.countOfHits / model.countOfAttempt) * 100) + "%");
                    }
                }
                else {
                    view.miss(shotPosition);
                }
            }
            else {
                setTimeout('view.alertMessage("Введите новую позицию выстрела")', 2000);
            }
        }
        else {
            view.alertMessage("Игра окончена, нажмите 'Начать сначала', что бы повторить");
        }
    },
    restart: function () {
        view.startField();
        view.showStatistic('','');
        view.alertMessage('');
        model.arrayField = [[],[],[],[],[],[],[]];
        model.madeShots = new Array();
        model.hitArray = [new Array(3),new Array(2), new Array(2),new Array(1)];
        model.countOfAttempt = 0;
        model.countOfHits = 0;
        model.isSunk = false;
        model.countShips = 4;
        model.shipPosition = [[],[],[],[]];
        model.setPosition();
    }
}

/*=============================MODEL======================*/

var model = {
    shipPosition: [[],[],[],[]],                                        //позиции кораблей
    hitArray: [new Array(3),new Array(2), new Array(2),new Array(1)],   /*массив попаданий*/
    madeShots: new Array(),                                             /*массив позиций по которым уже стреляли*/
    directionSetShips: 0,                                               //направление расстановки, 1 горизонталь, 0 по вертикали
    countOfAttempt: 0,
    countOfHits: 0,
    countShips: 4,
    countDeck: [3,2,2,1],                                               // количество палуб корабля
    isSunk: false,
    arrayField: [[],[],[],[],[],[],[]],     // массив для проверки наличия корабля на текущей позиции, 1 если есть корабль, иначе 0
    tmpShipPos: [],                                                     // временная позиция корабля
    row: 0,                                                             // значение строки
    column: [],                                                         // значение столбца
    setNewPosition: function (curPos) {
        var row,
            column,
            tmpColumn;
        row = (String(Math.floor(Math.random()*7)));
        column = String(Math.floor(Math.random()*7));
        tmpColumn = column;
        for( var j = 0; j < this.countDeck[curPos]; ++j){
            this.tmpShipPos[j] = row + column;
            if( tmpColumn > 4){                                  // если значения ячейни больше 4, то расставляем влево, что бы
                --column;                                       // не выйти за границы поля
            }
            else{
                ++column;
            }
        }
    },
    getPositionParams: function () {                            //разбиваем полученную позицию, на значение ряда и столбца
        var tmpPos = [];
        for( var i = 0; i < this.tmpShipPos.length; ++i){
            tmpPos = this.tmpShipPos[i].split('');
            this.column[i] = tmpPos[1];
        }
        this.row = tmpPos[0];

    },
    ifCollision: function () {
        this.getPositionParams();
        for( var j = 0; j < this.column.length; ++j){
            if (this.directionSetShips){
                if(this.arrayField[this.row][this.column[j]] == 1){
                    return true;
                }
            }
            else {
                if(this.arrayField[this.column[j]][this.row] == 1){
                    return true;
                }
            }
        }
        return false;
    },
    setPosition: function () {
        for( var i = 0; i < this.countShips; ++i){
            this.directionSetShips = Math.floor(Math.random()*2);
            console.log(this.directionSetShips);
            this.tmpShipPos.length = this.countDeck[i];
            if(this.directionSetShips){                             //если 1 расставляем по горизонтали, иначе по вертикали
                this.setNewPosition(i);
                while(this.ifCollision()){
                    this.setNewPosition(i);
                }
                this.getPositionParams();
                for( var j = 0; j < this.countDeck[i]; ++j){
                    this.shipPosition[i][j] = this.row+this.column[j];
                    this.arrayField[+this.row][this.column[j]] = 1;
                }
            }
            else{
                this.setNewPosition(i);
                while(this.ifCollision()){
                    this.setNewPosition(i);
                }
                this.getPositionParams();
                for( var j = 0; j < this.countDeck[i]; ++j){
                    this.shipPosition[i][j] = this.column[j] + this.row;
                    this.arrayField[+this.column[j]][this.row] = 1;
                }
            }
        }
        console.log(model.shipPosition);
    }
}
/*========================================================*/

$(document).ready(function () {
    var btnFire = $('#shot-btn'),
        form = $('#make-shot'),
        restart = $('#restart'),
        field =  $('#game-field .active td:not(:first-child)' ),
        btnSound = $('#switch_on_sound'),
        btnClosePopupWin = $('#close');
    model.setPosition();
    form.on('submit', function () {
        controller.fire();
        return false;
    });
    btnFire.on('click', function () {
        controller.fire();
    });
    restart.on('click', function () {
        controller.restart();
    });
    field.on( 'click', function (e) {
        controller.fireClickOnField(e.target.id);
    });
    btnSound.on('click', function () {
        view.switchOnSound();
    });
    btnClosePopupWin.on('click',function () {
        view.popupWin();
    });
})


