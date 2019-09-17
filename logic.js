const {PythonShell} = require('python-shell');
const fs = require('fs');
var drawing = false;
var x_list = [];
var y_list = [];
var pre_x = -1;
var pre_y = -1;

//同じ文字について複数のa_bを保存しておくための配列
var all_x_y_a_b = [[],[]];

//一文字のa_bを保存しておくための配列
var x_a_b = [[],[]];
var y_a_b = [[],[]];

//平均文字のa_bを保存しておくための配列
var ave_x_a_b;
var ave_y_a_b;

//追加した文字のプレビューを行うためのx_y座標の配列
var view_x_y = [];
var ave_x_y = [];

var kakusuu = 0;
var point_nums = [];

//一文字について書いた個数
var draw_num = 0;

//同期処理のためにPromise.thenが何回呼ばれたかをカウントするために使用
var counter = 0;

//登録した字数
var saved_char_num = 0;

//全ての文字の総画数
var total_stroke_num = 0;

//ターゲットの文字の画数
var target_stroke_num = 0;

//ターゲットの文字
var target_char_str = '';

    function init(){
        //初期化処理
        x_a_b[0].length = 0;
        x_a_b[1].length = 0;
        y_a_b[0].length = 0;
        y_a_b[1].length = 0;
        //ave_x_y.length = 0;
        view_x_y.length = 0;
        kakusuu = 0;
        pre_x = -1;
        pre_y = -1;
        //とりあえず30画の文字まで保証
        for (var i=0; i<30; i++) {
            point_nums[i] = 0;
        }
        counter = 0;
    }

    function averaging_all_x_y_a_b(){
        var tmp_x = new Array(50);
        var tmp_y = new Array(50);
        var _ave_x_a_b = [[],[]];
        var _ave_y_a_b = [[],[]];

        for(var a_b=0; a_b < 2; a_b++){
            for(var j=0; j < kakusuu; j++){
                for(var k2=0; k2 < 51; k2++){
                    tmp_x[k2] = 0;
                    tmp_y[k2] = 0;
                }
                for(var k=0; k < 51; k++){
                    for(var i=0; i < draw_num; i++){
                        tmp_x[k] += all_x_y_a_b[0][i][a_b][j][k] / draw_num;
                        tmp_y[k] += all_x_y_a_b[1][i][a_b][j][k] / draw_num;
                        //all_x_y_a_b[x_or_y][書いた文字のNo][a_or_b][画数][フーリエ級数の係数]
                    }
                }
                //_ave_x_a_b[a_b].push(tmp_x);
                //_ave_y_a_b[a_b].push(tmp_y);
                _ave_x_a_b[a_b][j] = tmp_x.concat();
                _ave_y_a_b[a_b][j] = tmp_y.concat();
            }
        }
        ave_x_a_b = _ave_x_a_b;
        ave_y_a_b = _ave_y_a_b;
    }

    function draw_view_canvas(_ctx, _x_y, _canvas){
        _ctx.fillStyle = '#000000';
        var pen_size = 0.8;
        if(_canvas.width >= 300){
            //ave-canvasに描くときは筆の大きさを「３」にする
            pen_size = 3;
        }
        //点だけで描画する方法        
        for(var i=0; i < _x_y[0].length; i++){
            for(var j=0; j < _x_y[0][i].length; j++){
                _ctx.fillRect((_canvas.width * _x_y[0][i][j])/400,
                _canvas.width * (400 - _x_y[1][i][j])/400,
                pen_size,
                pen_size);
            }
        }
        /*
        //点を減らし、線でつなぐ方法
        for(var i=0; i < _x_y[0].length; i++){
            for(var j=0; j < _x_y[0][i].length - 1; j++){
                _ctx.beginPath();
                _ctx.moveTo((_canvas.width * _x_y[0][i][j])/400,
                            _canvas.width * (400 - _x_y[1][i][j])/400);
                _ctx.lineTo((_canvas.width * _x_y[0][i][j+1])/400, 
                            _canvas.width * (400 - _x_y[1][i][j+1])/400);
                _ctx.closePath();
                _ctx.stroke();
            }
        }
        */
    }

    function init_canvas(_cv, _cx){
        _cx.fillStyle = '#f0f5f9';
        _cx.fillRect(0, 0, _cv.width, _cv.height);
        //grid_numの値を変えると点線の数が増減する(Even_Num)
        const grid_num = 20 * 2;
        const margin = _cv.height/(grid_num - 2)/ 2;
        _cx.strokeStyle = "#a7c1d6";
        //以下、点線描画処理
        //縦線
        for(var i = 0; i < grid_num; i += 2){
            _cx.beginPath();
            _cx.moveTo(_cv.width/2, _cv.height/grid_num * i + margin);
            _cx.lineTo(_cv.width/2, _cv.height/grid_num * (i + 1) + margin);
            _cx.closePath();
            _cx.stroke();
        }
        //横線
        for(var i = 0; i < grid_num; i += 2){
            _cx.beginPath();
            _cx.moveTo(_cv.width/grid_num * i + margin, _cv.height/2);
            _cx.lineTo(_cv.width/grid_num * (i + 1) + margin, _cv.height/2);
            _cx.closePath();
            _cx.stroke();
        }
    }

    function plot(_x_a_b, _y_a_b, _ctx, _canvas){
        ave_x_y.length = 0;
        var pyshell = new PythonShell('plot.py', { mode: "json"});
        var x_y_a_b = {};
        x_y_a_b.x = _x_a_b;
        x_y_a_b.y = _y_a_b;
        x_y_a_b.point_nums = point_nums;
        var x_y_a_b_json_str = JSON.stringify(x_y_a_b);
        pyshell.send(x_y_a_b_json_str);
        pyshell.on('message', function (data) {
            var ave_x_json = data.x;
            var ave_y_json = data.y;
            ave_x_y.push(ave_x_json);
            ave_x_y.push(ave_y_json);
            draw_view_canvas(_ctx, ave_x_y, _canvas);
        });
        pyshell.end();
    }

    function view_plot(_x_a_b, _y_a_b, _ctx, _canvas){
        var pyshell = new PythonShell('plot.py', { mode: "json"});
        var x_y_a_b = {};
        x_y_a_b.x = _x_a_b;
        x_y_a_b.y = _y_a_b;
        x_y_a_b.point_nums = point_nums;
        var x_y_a_b_json_str = JSON.stringify(x_y_a_b);
        pyshell.send(x_y_a_b_json_str);
        pyshell.on('message', function (data) {
            var view_x_json = data.x;
            var view_y_json = data.y;
            view_x_y.push(view_x_json);
            view_x_y.push(view_y_json);
            draw_view_canvas(_ctx, view_x_y, _canvas);
        });
        pyshell.end();
    }

    function save_data(){
        var pyshell = new PythonShell('save_data.py', { mode: "json"});
        var send_json = {};
        send_json[target_char_str] = ave_x_y;
        pyshell.send(send_json);
        pyshell.on('message', function (data) {

        });
        pyshell.end();
    }

    function check(filePath) {
        var isExist = false;
        try {
          fs.statSync(filePath);
          isExist = true;
        } catch(err) {
          isExist = false;
        }
        return isExist;
    }

    function read_json(filePath) {
        var json = new String();
        if(check(filePath)) {;
          json = fs.readFileSync(filePath, 'utf8');
        }
        return json;
    };

    window.onload = function() {

        var y_pos = document.getElementById('y_pos');
        
        var kanji_list = JSON.parse(read_json("./character.json"));
        var kanji_length = kanji_list.size;
        y_pos.textContent = kanji_length;
        //画面左上に漢字を表示する<span>
        var target_char = document.getElementById('target-char');
        //登録した文字数を表示する<span>
        var saved_num = document.getElementById('saved-num');
        //残り総画数を表示する<span>
        var left_total_stroke = document.getElementById('left-total-stroke');
        //合計文字数を表示する<span>
        var total_char_num = document.getElementById('total-char-num');

        //漢字リスト(JSON)から総画数を計算
        for(var i=0; i < kanji_list['results'].length; i++){
            total_stroke_num += Number(kanji_list['results'][i]['stroke']);
        }
        left_total_stroke_num = total_stroke_num;
        left_total_stroke.textContent = left_total_stroke_num;
        total_char_num.textContent = kanji_list['results'].length

        target_char_str = kanji_list['results'][saved_char_num]['character'];
        target_stroke_num = kanji_list['results'][saved_char_num]['stroke'];
        target_char.textContent = '「' + target_char_str + '」';
        saved_num.textContent = saved_char_num;


        //各変数の初期化
        init();

        //書くキャンバス
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f5f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //ctx.scale(2,2);

        //書いた文字を表示していくキャンバス
        var view_canvases = document.getElementsByClassName('view-canvas');
        var ctxes = Array(view_canvases.length);
        for(var i = 0; i < view_canvases.length; i++){
            ctxes[i] = view_canvases[i].getContext('2d');
            ctxes[i].fillStyle = '#f0f5f9';
            ctxes[i].fillRect(0, 0, view_canvases[i].width, view_canvases[i].height);
        }

        //平均化した文字を表示するキャンバス
        var ave_canvas = document.getElementById('ave-canvas');
        var ave_ctx = ave_canvas.getContext('2d');
        ave_ctx.fillStyle = '#f0f5f9';
        ave_ctx.fillRect(0, 0, ave_canvas.width, ave_canvas.height);

        //キャンバスの初期化
        init_canvas(canvas, ctx);
        init_canvas(ave_canvas, ave_ctx);

        var ok = document.getElementById('ok-button');
        ok.addEventListener('click', function(e) {
            ok.disabled =  "disabled";
            //all_x_y_a_b[0].push(x_a_b);
            //all_x_y_a_b[1].push(y_a_b);
            init_canvas(ave_canvas, ave_ctx);
            all_x_y_a_b[0][draw_num] = JSON.parse(JSON.stringify(x_a_b))
            all_x_y_a_b[1][draw_num] = JSON.parse(JSON.stringify(y_a_b))
            view_plot(x_a_b, y_a_b, ctxes[draw_num], view_canvases[draw_num]);
            draw_num += 1;
            averaging_all_x_y_a_b();
            plot(ave_x_a_b, ave_y_a_b, ave_ctx, ave_canvas);
            init();
            init_canvas(canvas, ctx);
        });

        //初期化処理のところに書きたかった...
        ok.disabled =  "disabled";

        var cancel = document.getElementById('cancel-button');
        cancel.addEventListener('click', function(e){
            ok.disabled =  "disabled";
            init_canvas(canvas, ctx);
            init();
        });

        var all_delete_button = document.getElementById('all-delete-button');
        all_delete_button.addEventListener('click', function(e){
            for(var i = 0; i < view_canvases.length; i++){
                init_canvas(view_canvases[i], ctxes[i]);
            }
            draw_num = 0;
            ok.disabled =  "disabled";
            init_canvas(canvas, ctx);
            init_canvas(ave_canvas, ave_ctx);
            init();
        });

        var save_button = document.getElementById('save-button');
        save_button.addEventListener('click', function(e){
            left_total_stroke_num = left_total_stroke_num - target_stroke_num;
            left_total_stroke.textContent = left_total_stroke_num;
            save_data();
            saved_char_num += 1;
            target_char_str = kanji_list['results'][saved_char_num]['character'];
            target_stroke_num = kanji_list['results'][saved_char_num]['stroke'];
            target_char.textContent = '「' + target_char_str + '」';
            saved_num.textContent = saved_char_num;
            init_canvas(canvas, ctx);
            init_canvas(ave_canvas, ave_ctx);
            init();
            all_delete_button.click();
        });

        canvas.addEventListener('mouseup', function() {
            cancel.disabled = "disabled";
            kakusuu += 1;
            drawing = false;
            var pyshell = new PythonShell('spline.py', { mode: "json"});
            //pyshell.send({ command: "do_stuff", args: [1, 2, 3] });
            var x_y_json = {};
            x_y_json.x = x_list;
            x_y_json.y = y_list;
            var x_y_json_str = JSON.stringify(x_y_json);
            pyshell.send(x_y_json_str);
            pyshell.on('message', function (data) {
                //同期処理
                const promise = new Promise((resolve, reject) => {
                    var x = data.x;
                    var y = data.y;
                    x_a_b[0].push(x[0]);
                    x_a_b[1].push(x[1]);
                    y_a_b[0].push(y[0]);
                    y_a_b[1].push(y[1]);
                    resolve();
                });
                promise.then(() => {
                    counter += 1;
                    y_pos.textContent = counter;
                    if(counter == target_stroke_num){
                        ok.disabled = "";
                    }else{
                        ok.disabled = "disabled";
                    }
                    if(counter == kakusuu){
                        cancel.disabled = "";
                    }
                });
                //y_pos.textContent = kakusuu;
            });
            pyshell.end();
            x_list.length = 0;
            y_list.length = 0;
            pre_x = -1;
            pre_y = -1;
        });

        canvas.addEventListener('mousemove', function(e) {

            if(drawing) {
                // マウスの場所を計算
                var rect = e.target.getBoundingClientRect();
                var drawingX = e.clientX - rect.left;
                var drawingY = e.clientY - rect.top;
                if(drawingX != pre_x || drawingY != pre_y){
                    x_list.push(drawingX);
                    y_list.push(canvas.width - drawingY);
                }
                //線の末尾と次の描き初めとの間に線を引かないため
                if(pre_x != -1){
                    ctx.beginPath();
                    ctx.moveTo(pre_x, pre_y);
                    ctx.lineTo(drawingX, drawingY);
                    ctx.closePath();
                    ctx.stroke();
                }
                //前の座標を記憶
                pre_x = drawingX;
                pre_y = drawingY;
                //描いた線(一画)に含まれる点の数を増やす
                point_nums[kakusuu] += 1;
            }

        });
        canvas.addEventListener('mousedown', function() {
            drawing = true;
            ctx.strokeStyle = "rgb(0, 0, 0)";
        });
    };
    