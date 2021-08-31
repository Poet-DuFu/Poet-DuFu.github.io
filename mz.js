(function () {
    "use strict";
    (function ($) {

        const AVATAR_SIZE = 50;
        const FACTIONS_SIZE = 20;
        const TYPE_SIZE = 20;
        const NAME_SIZE = 16;
        const MARGIN_SIZE = 2;
        const ARC_SIZE = 4;

        const herosGroupByType = (function (xs, key) {
            return xs.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        })($(`#CardSelectTr tr[data-param3]`).toArray().map(m => new Hero($(m))), "type")

        class Pos {
            i; j;
            x; y;
            l; t;
            w; h;
            type;
            constructor(i, j, type) {
                this.i = i;
                this.j = j;
                this.w = Math.max(3 * FACTIONS_SIZE, AVATAR_SIZE);
                this.h = AVATAR_SIZE + FACTIONS_SIZE + MARGIN_SIZE + MARGIN_SIZE + ARC_SIZE + NAME_SIZE;
                this.l = -.5 * this.w + i;
                this.t = -.5 * this.h + j + 4;
                this.x = -.5 * AVATAR_SIZE + i;
                this.y = this.t + ARC_SIZE + MARGIN_SIZE + FACTIONS_SIZE;
                this.type = type;
            }
        }

        class Hero {
            obj;
            factions;
            type;
            name;
            constructor(obj) {
                this.obj = obj;
                this.factions = obj.attr("data-param2").split(",").map(x => x.trim());
                this.type = obj.attr("data-param3").trim();
                this.name = $(`td:eq(1) a`, obj).text().trim();
            }

            get img() {
                return $("img", this.obj)[0];
            }

            draw(context, pos) {

                let x = pos.x;
                let y = pos.y;

                if (!!this.img) {
                    context.drawImage(this.img, x, y, AVATAR_SIZE, AVATAR_SIZE);
                }

                if (!!this.factions && this.factions.length > 0) {

                    this.factions.forEach((e, index) => {
                        let img = $(`.cardSelectOption[data-option='2|${e}'] img`)[0];
                        context.drawImage(img, index * FACTIONS_SIZE + x + .5 * AVATAR_SIZE - 1.5 * FACTIONS_SIZE
                            , index % 2 * -ARC_SIZE - MARGIN_SIZE - FACTIONS_SIZE + y, FACTIONS_SIZE, FACTIONS_SIZE);

                    });
                }

                if (!!this.type) {
                    let img = $(`.cardSelectOption[data-option='3|${this.type}'] img`)[0];
                    context.drawImage(img, x, y + AVATAR_SIZE - TYPE_SIZE, TYPE_SIZE, TYPE_SIZE);
                }


                if (!!this.name) {

                    context.font = `${NAME_SIZE}px 微软雅黑`;
                    let textW = context.measureText(this.name).width;
                    context.fillStyle = "#EEEEEE";

                    let px = x + MARGIN_SIZE;
                    px -= .5 * textW;
                    px += .5 * AVATAR_SIZE;

                    let py = y + AVATAR_SIZE + NAME_SIZE;

                    context.fillText(this.name, px + 1, py + 1);

                    context.fillStyle = "#111111";

                    context.fillText(this.name, px, py);

                }

            }
        }


        class Contract {

            imgSrc;
            canvas;
            context;
            width;
            height;
            contractName;
            posArray = [];
            lines = [];
            list = [];
            result;
            cmin = 2;//最小锲约
            cmax = 18;//最大丧失契约
            strinfo = "";

            static herosGroupByType;






            constructor() {

            }

            drawtxt(t, x, y) {
                let ts = 30;
                let context = this.context;
                context.font = `${ts}px 微软雅黑`;
                context.fillStyle = "red";

                let tw = context.measureText(t).width;
                context.fillText(t, -.5 * tw + x, .5 * ts + y);
            }

            createList(lv, arr, un) {

                let list = this.list;
                let lines = this.lines;
                let nameSet = new Set(arr.map(m => m.name));
                let nl = this.lines.filter(l => l[1][0] == lv);
                if (lv < this.posArray.length) {
                    let type = this.posArray[lv].type;
                    //let heros = $(`#CardSelectTr tr[data-param3='${type}']`).toArray().map(m => new Hero($(m)));
                    let heros = Contract.herosGroupByType[type]
                    for (let h of heros) {

                        if (!nameSet.has(h.name)) {

                            let intersection = nl.map(e => {
                                let a = arr[e[0][0]].factions;
                                let b = h.factions;
                                return a.filter(v => b.includes(v));

                            })
                            if (intersection.every(e => e.length >= this.cmin)) {

                                var nowUn = un;

                                if (intersection.length > 0) {

                                    nowUn += intersection.map(m => 3 - m.length).reduce((a, b) => a + b)
                                }

                                if (nowUn <= this.cmax) {
                                    this.createList(lv + 1, arr.concat([h]), nowUn);
                                }
                            }
                        }
                    }


                } else {
                    list.push({
                        reduce: 3 * lines.length - un,
                        ls: lines.map(e => {
                            let a = arr[e[0][0]].factions;
                            let b = arr[e[1][0]].factions;
                            let intersection = a.filter(v => b.includes(v));
                            return intersection;
                        }),

                        arr, lv, un,
                        cr: 3 * lines.length - un

                    });

                }

            }


            clear() {


                let cindex = 0;
                let img = new Image();
                let canvas = this.canvas;
                let context = this.context;
                img.src = this.imgSrc;


                canvas.width = this.width;
                canvas.height = this.height + 50;

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0, this.width, this.height);


                this.drawtxt(this.name + this.strinfo, this.width / 2, this.height + 25);
            }

            drawLine(arr) {
                let lines = this.lines;
                let context = this.context;

                lines.forEach((e, i) => {


                    if (!!arr) {
                        let a = arr[e[0][0]].factions;
                        let b = arr[e[1][0]].factions;
                        let intersection = a.filter(v => b.includes(v));




                        switch (intersection.length) {
                            case 1:

                                context.strokeStyle = "Grey";
                                break;
                            case 2:
                                context.strokeStyle = "Cyan";
                                break;
                            case 3:
                                context.strokeStyle = "Blue";
                                break;

                            default:
                                context.strokeStyle = "Blue";
                                break;
                        }


                    } else {
                        context.strokeStyle = "Red";
                    }





                    context.lineWidth = 3;//设置线条宽度


                    context.beginPath();//开始绘制线条，若不使用beginPath，则不能绘制多条线条
                    context.moveTo(e[0][1], e[0][2]);//线条开始位置
                    context.lineTo(e[1][1], e[1][2]);//线条经过点

                    context.closePath();//结束绘制线条，不是必须的

                    context.stroke();//用于绘制线条
                    this.drawtxt(e[0][0], e[0][1], e[0][2]);
                    this.drawtxt(e[1][0], e[1][1], e[1][2]);
                });




            }



            drawbg(s) {
                let context = this.context;
                let posArray = this.posArray;

                posArray.forEach((e, i) => {


                    let w = Math.max(3 * FACTIONS_SIZE, AVATAR_SIZE);
                    let h = AVATAR_SIZE + FACTIONS_SIZE + MARGIN_SIZE + MARGIN_SIZE + ARC_SIZE + NAME_SIZE;


                    context.font = `${AVATAR_SIZE}px 微软雅黑`;
                    context.fillStyle = "red";

                    let tw = context.measureText(i).width;
                    context.fillText(i, -.5 * tw + e.i, .5 * AVATAR_SIZE + e.j);

                    if (!s) {

                        context.fillStyle = "#EADEC9";

                        context.fillRect(e.l, e.t, e.w, e.h);
                    }


                });
            }

            testDraw() {
                let gameCanvas = document.getElementById("qiyue");
                gameCanvas.appendChild(this.canvas);
                this.clear();
                this.drawbg(true);
                this.drawLine();

            }

            calc() {
                this.createList(0, [], 0);
                this.list.sort((a, b) => a.un - b.un);
                let maxReduce = this.list[0].reduce;
                let dic = (function (xs) {
                    return xs.reduce(function (rv, x) {
                        var key = x.arr.map(m => m.name).sort().join();
                        (rv[key] = rv[key] || []).push(x);
                        return rv;
                    }, {});
                })(this.list.filter(f => maxReduce == f.reduce));

                this.result = dic;
            }

            drawArr(arr) {
                let con = this;
                con.clear();
                con.drawLine(arr);
                con.drawbg();
                arr.forEach((e, i) => e.draw(con.context, con.posArray[i]))
            }

            build() {

                let con = this;
                let gameCanvas = document.getElementById("qiyue");
                gameCanvas.appendChild(con.canvas);
                let select = document.createElement("select");
                gameCanvas.appendChild(select);



                let keys = Object.keys(con.result);

                keys.sort();


                keys.forEach((k, i) => {
                    $("<option >")
                        .text(k)
                        .appendTo(select)
                });
                con.clear();
                $(select)
                    .change(function () {
                        let arr = con.result[$(this).val()][0].arr;
                        con.drawArr(arr);



                    })
                    .change()
                    .css("height", con.canvas.height)
                    .css("margin-left", 50)

                    ;
                select.multiple = true;
            }



        }

        $(function () {

            Contract.herosGroupByType = (function (xs, key) {
                return xs.reduce(function (rv, x) {
                    // console.log(rv);
                    (rv[x[key]] = rv[x[key]] || []).push(x);
                    return rv;
                }, {});
            })($(`#CardSelectTr tr[data-param3]`).toArray().map(m => new Hero($(m))), "type")


            let contractList = [];



            if (true) {
                //提斯雷奥之契市政厅 town Hall
                let con = new Contract();

                con.imgSrc = "https://i.loli.net/2021/08/29/5eBjqVmYpKO4vCS.png";
                con.canvas = document.createElement("canvas");
                con.context = con.canvas.getContext("2d");
                con.width = 540;
                con.height = 445;
                con.name = "市政厅";
                con.posArray = [
                    new Pos(102, 98, "法师"),
                    new Pos(269, 57, "法师"),
                    new Pos(437, 98, "法师"),

                    new Pos(145, 254, "僧侣"),
                    new Pos(269, 192, "僧侣"),
                    new Pos(395, 254, "僧侣"),

                    new Pos(47, 371, "飞兵"),
                    new Pos(197, 389, "飞兵"),
                    new Pos(340, 389, "飞兵"),
                    new Pos(493, 371, "飞兵"),
                ];

                con.lines = [
                    [[0, 99, 112], [1, 265, 40]],
                    [[1, 276, 40], [2, 442, 112]],

                    [[0, 99, 112], [3, 144, 236]],
                    [[1, 265, 40], [3, 144, 236]],
                    [[1, 270, 36], [4, 270, 168]],
                    [[1, 276, 40], [5, 397, 236]],
                    [[2, 442, 112], [5, 397, 236]],

                    [[3, 152, 264], [4, 270, 168]],
                    [[4, 270, 168], [5, 386, 264]],

                    [[3, 152, 264], [6, 36, 362]],
                    [[3, 152, 264], [7, 198, 395]],
                    [[4, 270, 175], [7, 198, 395]],
                    [[4, 270, 175], [8, 340, 395]],
                    [[5, 386, 264], [8, 340, 395]],
                    [[5, 386, 264], [9, 504, 363]],

                    [[6, 36, 362], [7, 200, 408]],
                    [[7, 198, 395], [8, 340, 395]],
                    [[8, 340, 408], [9, 504, 363]],

                ];
                //con.testDraw()
                con.calc();
                // con.build();
                contractList.push(con);

            }


            if (true) {
                //苍绿之息护林联盟 Green Breath Forest Alliance
                let con = new Contract();

                con.imgSrc = "https://i.loli.net/2021/08/29/5XWtNjmC8YdZ6fv.png";
                con.canvas = document.createElement("canvas");
                con.context = con.canvas.getContext("2d");
                con.width = 448;
                con.height = 432;
                con.name = "苍绿之息护林联盟";
                con.posArray = [

                    new Pos(51, 61, "僧侣"),
                    new Pos(226, 61, "僧侣"),
                    new Pos(401, 61, "僧侣"),

                    new Pos(136, 218, "法师"),
                    new Pos(316, 218, "法师"),

                    new Pos(226, 376, "骑兵"),

                ];

                con.lines = [
                    [[0, 51, 61], [1, 226, 61]],
                    [[1, 226, 61], [2, 401, 61]],

                    [[0, 47, 61], [3, 138, 205]],
                    [[1, 226, 61], [3, 138, 205]],
                    [[1, 226, 61], [4, 316, 205]],
                    [[2, 401, 61], [4, 316, 205]],

                    [[3, 136, 218], [4, 316, 218]],

                    [[3, 136, 227], [5, 226, 370]],
                    [[4, 316, 227], [5, 226, 370]],


                ];


                //con.testDraw()
                con.calc();
                // con.build();
                contractList.push(con);

            }

            if (true) {
                //大地之子研究院 Earth Son Research Institute
                let con = new Contract();


                con.imgSrc = "https://i.loli.net/2021/08/30/LR4gpAMQJe63NCV.png";
                con.canvas = document.createElement("canvas");
                con.context = con.canvas.getContext("2d");
                con.width = 450;
                con.height = 414;
                con.name = "大地之子研究院";

                con.cmin = 1;//最小锲约
                con.cmax = 10;


                con.posArray = [

                    new Pos(51, 61, "骑兵"),
                    new Pos(402, 61, "骑兵"),

                    new Pos(152, 209, "弓兵"),
                    new Pos(304, 209, "弓兵"),

                    new Pos(51, 358, "枪兵"),
                    new Pos(401, 358, "枪兵"),

                ];


                con.lines = [
                    [[0, 51, 61], [1, 401, 61]],

                    [[0, 35, 61], [4, 35, 358]],
                    [[1, 412, 61], [5, 412, 358]],


                    [[0, 61, 61], [2, 152, 209]],
                    [[1, 388, 61], [3, 297, 209]],

                    [[2, 152, 209], [3, 297, 209]],

                    [[2, 152, 209], [4, 55, 358]],
                    [[3, 297, 209], [5, 393, 358]],


                    [[4, 51, 353], [5, 401, 353]],

                ];
                //con.testDraw()
                con.calc();
                //con.build();
                contractList.push(con);
            }

            if (true) {
                //秘铁意志兄弟会 Secret Iron Will Brotherhood
                let con = new Contract();


                con.imgSrc = "https://i.loli.net/2021/08/31/PFCEa56HSqB2Oco.png";
                con.canvas = document.createElement("canvas");
                con.context = con.canvas.getContext("2d");
                con.width = 448;
                con.height = 432;
                con.name = "秘铁意志兄弟会";





                con.posArray = [

                    new Pos(226, 61, "飞兵"),

                    new Pos(136, 218, "步兵"),
                    new Pos(316, 218, "步兵"),

                    new Pos(51, 376, "魔物"),
                    new Pos(226, 376, "魔物"),
                    new Pos(401, 376, "魔物"),
                ];


                con.lines = [
                    [[0, 226, 61], [1, 136, 203]],
                    [[0, 226, 61], [2, 316, 203]],

                    [[1, 136, 214], [2, 316, 214]],

                    [[1, 136, 222], [3, 44, 366]],
                    [[1, 136, 222], [4, 226, 366]],
                    [[2, 316, 222], [4, 226, 366]],
                    [[2, 316, 222], [5, 406, 366]],

                    [[3, 51, 372], [4, 226, 372]],
                    [[4, 226, 372], [5, 401, 372]],
                ];

                //con.testDraw()
                con.calc();
                //con.build();
                contractList.push(con);



            }

            // console.log(contractList);





            let gameCanvas = document.getElementById("qiyue");

            let canvas = document.createElement("canvas");
            let context = canvas.getContext("2d");


            canvas.width = 750;
            canvas.height = 750;

            context.clearRect(0, 0, 750, 750);
            gameCanvas.appendChild(canvas);
            //context.drawImage(img, 0, 0, this.width, this.height);

            // contractList.reduce(function (rv, x) {

            //     if (!rv.length) {
            //         let select = document.createElement("select");
            //         gameCanvas.appendChild(select);



            //         let keys = Object.keys(rv.result);

            //         keys.sort();


            //         keys.forEach((k, i) => {
            //             $("<option >")
            //                 .text(k)
            //                 .appendTo(select)
            //         });

            //         $(select).css("height", 750).css("width", 150)
            //         select.multiple = true;

            //         // con.clear();
            //         // $(select)
            //         //     .change(function () {
            //         //         let arr = con.result[$(this).val()][0].arr;
            //         //         con.drawArr(arr);



            //         //     })
            //         //     .change()
            //         //     .css("height", con.canvas.height)
            //         //     .css("margin-left", 50)

            //         //     ;
            //         // select.multiple = true;



            //     } else {


            //     }
            //     return [0];
            // });


            let showlist = [[0, 0], [0, 0], [0, 0], [0, 0]];


            function showdata(data, index, k) {
                let ds = !!k ? data : data[index];
                let dc = ds.length;
                let di = showlist[index][k];
                di = di % dc;
                di = di < 0 ? (di + dc) : di;
                return { data: ds[di], index: di, count: dc };
            }


            if (true) {

                function drawMain() {
                    let data = (contractList.reduce(function (rv, x, index) {



                        //console.log(index, !!rv.length, index > 0);

                        let data1 = index > 1 ? rv : [Object.entries(rv.result).map(([k, v], i) => {
                            return {

                                v: v,
                                n: v[0].arr.map(m => m.name),
                            }
                        })];


                        let a = showdata(data1, index - 1, 0).data;

                        let data2 = Object.entries(x.result).map(([k, v], i) => {
                            return {
                                v: v,
                                n: v[0].arr.map(m => m.name),
                            }
                        }).filter(b => a.n.filter(v => b.n.includes(v)).length == 0)
                            .map(e => {
                                return {
                                    v: e.v,
                                    n: a.n.concat(e.n),
                                }
                            });
                        return data1.concat([data2]);
                        //return i;
                    })

                    );
                    // console.log(data);


                    context.clearRect(0, 0, canvas.width, canvas.height);
                    contractList.forEach((e, index) => {




                        let d1 = showdata(data, index, 0);
                        let ds = d1.data;

                        // console.log(ds, ds.v[0]);

                        if (!!ds && ds.v.length > 0) {

                            let d2 = showdata(ds.v, index, 1);



                            let arr = d2.data.arr;
                            e.strinfo = `  (${d1.index + 1}/${d1.count} | ${d2.index + 1}/${d2.count} )`;
                            e.drawArr(arr);
                            let row = parseInt(index / 2) * 500 + 270 - (e.canvas.width / 2);
                            let col = parseInt(index % 2) * 500 + 250 - (e.canvas.height / 2);




                            context.drawImage(e.canvas, row * .75, col * .75, e.canvas.width * .75, e.canvas.height * .75);
                        }
                    });
                }

                drawMain();





                const windowToCanvas = (canvas, x, y) => {
                    let rect = canvas.getBoundingClientRect()
                    return {
                        x: x - rect.left * (canvas.width / rect.width),
                        y: y - rect.top * (canvas.height / rect.height)
                    }
                }

                if (true) {
                    let oarea = -1;

                    canvas.onmouseup = (e) => {

                        let ele = windowToCanvas(canvas, e.clientX, e.clientY)
                        let { x, y } = ele

                        let { i, j } = { i: parseInt(x / (canvas.width / 2)), j: parseInt(y / (canvas.height / 2)) };


                        let narea = 2 * i + j;

                        let show = showlist[narea];




                        let areaw = canvas.width / 16;
                        let areah = canvas.height / 16;
                        let margin = 0;

                        let offx = parseInt(x / (canvas.width / 2)) * (canvas.width / 2);
                        let offy = parseInt(y / (canvas.height / 2)) * (canvas.height / 2);

                        {
                            let { x1, x2, y1, y2 } = { x1: offx + margin, x2: offx + areaw - margin, y1: offy + areah + margin, y2: offy + 7 * areah - margin };

                            if (x > x1 && x < x2 && y > y1 && y < y2) show[0]--;


                        }
                        {
                            let { x1, x2, y1, y2 } = { x1: offx + 7 * areaw + margin, x2: offx + 8 * areaw - margin, y1: offy + areah + margin, y2: offy + 7 * areah - margin };

                            if (x > x1 && x < x2 && y > y1 && y < y2) show[0]++;
                        }





                        {
                            let { x1, x2, y1, y2 } = { x1: offx + areaw + margin, x2: offx + 7 * areaw - margin, y1: offy + margin, y2: offy + areah - margin };


                            if (x > x1 && x < x2 && y > y1 && y < y2) show[1]--;
                        }
                        {
                            let { x1, x2, y1, y2 } = { x1: offx + areaw + margin, x2: offx + 7 * areaw - margin, y1: offy + 7 * areah + margin, y2: offy + 8 * areah - margin };

                            if (x > x1 && x < x2 && y > y1 && y < y2) show[1]++;
                        }



                        drawMain();


                    }


                    canvas.onmousemove = (e) => {
                        if (true) {
                            let ele = windowToCanvas(canvas, e.clientX, e.clientY)
                            let { x, y } = ele

                            let narea = parseInt(x / (canvas.width / 2)) + 2 * parseInt(y / (canvas.height / 2));

                            let areaw = canvas.width / 16;
                            let areah = canvas.height / 16;
                            let margin = 10;


                            if (true) {
                                oarea = narea;

                                let offx = parseInt(x / (canvas.width / 2)) * (canvas.width / 2);
                                let offy = parseInt(y / (canvas.height / 2)) * (canvas.height / 2);



                                context.clearRect(0, 0, canvas.width, canvas.height);
                                drawMain();

                                context.strokeStyle = "Grey";
                                //context.clearRect(0, 0, canvas.width, canvas.height);

                                context.beginPath();
                                context.moveTo(offx + areaw - margin, offy + areah + margin);
                                context.lineTo(offx + margin, offy + 4 * areah);
                                context.lineTo(offx + areaw - margin, offy + 7 * areah - margin);
                                context.closePath();

                                context.moveTo(offx + 7 * areaw + margin, offy + areah + margin);
                                context.lineTo(offx + 8 * areaw - margin, offy + 4 * areah);
                                context.lineTo(offx + 7 * areaw + margin, offy + 7 * areah - margin);
                                context.closePath();

                                context.moveTo(offx + areaw + margin, offy + areah - margin);
                                context.lineTo(offx + 4 * areaw, offy + margin);
                                context.lineTo(offx + 7 * areaw - margin, offy + areah - margin);
                                context.closePath();

                                context.moveTo(offx + areaw + margin, offy + 7 * areah + margin);
                                context.lineTo(offx + 4 * areaw, offy + 8 * areah - margin);
                                context.lineTo(offx + 7 * areaw - margin, offy + 7 * areah + margin);
                                context.closePath();

                                context.closePath();
                                context.stroke();

                            }
                            // context.lineTo(x, y)
                            // context.stroke()
                        }
                    }


                }








                // let theCanvas = canvas;
                // //let context = theCanvas.getContext('2d')
                // let isAllowDrawLine = false
                // theCanvas.onmousedown = function (e) {
                //     isAllowDrawLine = true
                //     let ele = windowToCanvas(theCanvas, e.clientX, e.clientY)
                //     let { x, y } = ele
                //     context.moveTo(x, y)
                //     theCanvas.onmousemove = (e) => {
                //         if (isAllowDrawLine) {
                //             let ele = windowToCanvas(theCanvas, e.clientX, e.clientY)
                //             let { x, y } = ele
                //             context.lineTo(x, y)
                //             context.stroke()
                //         }
                //     }
                // }
                // theCanvas.onmouseup = function () {
                //     isAllowDrawLine = false
                // }

            }








            if (false) {



                let data = (contractList.reduce(function (rv, x) {


                    let data2 = Object.entries(x.result).map(([k, v], i) => {
                        return {
                            k: [k],
                            v: [v],
                            n: v[0].arr.map(m => m.name),
                        }
                    });


                    let data1 = !!rv.length ? rv : Object.entries(rv.result).map(([k, v], i) => {
                        return {
                            k: [k],
                            v: [v],
                            n: v[0].arr.map(m => m.name),
                        }
                    });

                    return data1.flatMap(a => data2
                        .filter(b => a.n.filter(v => b.n.includes(v)).length == 0)
                        .map(b => {
                            return {
                                k: a.k.concat(b.k),
                                v: a.v.concat(b.v),
                                n: a.n.concat(b.n),
                            }
                        })
                    )
                })
                    .reduce(function (rv, x) {
                        var key = x.n.sort().join();
                        (rv[key] = rv[key] || []).push(x);
                        return rv;
                    }, {})
                );

                let vs = (data)[Object.keys(data).sort()[0]][0];
                // let vs = Object.values(data)[0][0];
                context.clearRect(0, 0, 750, 750);
                contractList.forEach((e, i) => {


                    let arr = vs.v[i][0].arr;
                    e.drawArr(arr);

                    let row = parseInt(i / 2) * 500 + 270 - (e.canvas.width / 2);
                    let col = parseInt(i % 2) * 500 + 250 - (e.canvas.height / 2);
                    // console.log(i, (i / 2), (i % 2), row, col, e.canvas.width, e.canvas.height);

                    context.drawImage(e.canvas, row * .75, col * .75, e.canvas.width * .75, e.canvas.height * .75);

                });
            }






            document.addEventListener('keydown', function (e) {
                console.log(e.keyCode);
                if (34 == e.keyCode) {
                    e.preventDefault();
                }

                if (33 == e.keyCode) {
                    e.preventDefault();
                }
            });
        });
    })(jQuery);
})();
