

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
        var  hitPersentage = $('#hit-persentage');
        countShot.text(msgShot);
        hitPersentage.text(msgHit);
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
    closePopupWin: function () {
        $('#you_win').css('display', 'none');
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
                else{ break;}                                     // если есть поцизия в кот. еще не попали, переходим к след. кораблю
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
                    if (this.isHit(shotPosition)) {
                        this.isSunkShip();
                        if (model.countShips == 0) {
                            setTimeout('view.alertMessage("Игра окончена, Вы победили!")', 500);
                            setTimeout("$('#you_win').css('display', 'block')", 2000);
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
            view.alertMessage("Игра окончена, нажмите 'Играть еще', что бы начать сначала");
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
                            setTimeout("$('#you_win').css('display', 'block')", 2000);
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
            view.alertMessage("Игра окончена, нажмите 'Играть еще', что бы начать сначала");
        }
    },
    restart: function () {
        view.startField();
        view.showStatistic('','');
        view.alertMessage('');
        model.madeShots = new Array();
		model.hitArray = [new Array(3),new Array(3), new Array(3),new Array(3)];
        model.countOfAttempt = 0;
        model.countOfHits = 0;
        model.isSunk = false;
        model.countShips = 4;
        model.shipPosition = [[],[],[],[]];
        model.arrayRow = [];
        model.setPosition();
    }
}

/*=============================MODEL======================*/

var model = {
    shipPosition: [[],[],[],[]],
    hitArray: [new Array(3),new Array(3), new Array(3),new Array(3)],   /*массив попаданий*/
    madeShots: new Array(),                             /*массив позиций по которым уже стреляли*/
    arrayRow: [],                                     // массив для значений ряда, на которых уже есть корабли
    countOfAttempt: 0,
    countOfHits: 0,
    countShips: 4,
    countDesk: 3,
    isSunk: false,
    deleteCollision: function (row) {
        for( var k = 0; k < model.arrayRow.length; ++k){
            if(model.arrayRow[k] == row){
                row = String(Math.floor(Math.random()*7));
                k = -1;
            }
        }
        model.arrayRow.push(row);
        return row;
    },
    setPosition: function () {
        var row,
            cell;
        for( var i = 0; i < this.countShips; ++i){
            var tmpRow =  String(Math.floor(Math.random()*7));
            row = this.deleteCollision(tmpRow);
            cell = String(Math.floor(Math.random()*7));
            var tmpCell = cell;
            for( var j = 0; j < this.countDesk; ++j){
                this.shipPosition[i][j] = row+cell;
                if( tmpCell > 4){                           // если значения ячейни больше 4, то расставляем влево, что бы
                    --cell;                                       // не выйти за границы поля
                }
                else{
                    ++cell;
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
        view.closePopupWin();
    });
})


