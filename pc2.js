// ==UserScript==
// @name         中南大学图书馆抢座（全选）
// @namespace    http://libzw.csu.edu.cn
// @version      1.2
// @description  Choosing seats in CSU Library Automatically!
// @author       Zhang Zhao, Li Junda
// @homepage     https://github.com/zhangzhao219/CSU-Library-Seats
// @match        http://libzw.csu.edu.cn/web/seat3*
// @grant        none
// ==/UserScript==

(function () {
    $("head").append($(`<link href="https://cdn.bootcdn.net/ajax/libs/bootstrap-switch/3.3.4/css/bootstrap3/bootstrap-switch.min.css"
    rel="stylesheet">`));
    $("head").append($(`<script src="https://cdn.bootcdn.net/ajax/libs/bootstrap-switch/3.3.4/js/bootstrap-switch.min.js"></script>`));
    $("head").append($(`<script src="https://cdn.bootcdn.net/ajax/libs/layer/3.5.1/layer.min.js"></script>`));

    var i;
    var ed = 0;

    function setCookie(cname, cvalue) {
        document.cookie = cname + "=" + cvalue + "; ";
    }
    //提取Cookie的值
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
        }
        return "";
    }
    function checkCookie() {
        var user = getCookie("username");
        if (user != "") {
            var mp = [[43, 1486519], [41, 1492504], [42, 1493701], [44, 1502080], [45, 1503277], [46, 1504474], [47, 1505671], [48, 1496095], [49, 1514050],
            [50, 1515247], [51, 1516444], [52, 1517641], [53, 1518838], [54, 1508065], [55, 1522431], [56, 1523629], [57, 1524827], [58, 1526025], [59, 1520035],
            [60, 1534411], [61, 1535609], [62, 1536807], [63, 1538005], [64, 1539203], [65, 1528421], [66, 1546391], [67, 1547589], [68, 1548787], [69, 1549985], [70, 1541599],
            ];

            load_seat(ska.area, ska.segment, ska.day, ska.startTime, ska.endTime);


            setTimeout(() => {
                var seatlist = document.getElementById("floor").getElementsByTagName("li");
                seatlist = Array.from(seatlist).sort((a, b) => parseInt(a.getAttribute("data-no")) - parseInt(b.getAttribute("data-no")));
                var canbooklist = new Array();

                for (i in seatlist) {
                    if (seatlist[i].className == "seat ava-icon") {
                        canbooklist.push(i);
                    }
                }

                console.log("可预约的座位有：" + canbooklist.map(function (i) { return seatlist[i].getAttribute("data-no").toString(); }));

                if (canbooklist.length > 0) {
                    console.log("可预约的座位有：" + canbooklist.map(function (i) { return parseInt(i) + 1; }));
                    books("/api.php/spaces/" + seatlist[0].getAttribute("data-no").toString() + "/book", {
                        'access_token': ska.access_token,
                        'userid': ska.userid,
                        'segment': ska.segment,
                        'type': 1
                    }, function (data) {
                        if (data.status == 1) {
                            ed = 1;
                            console.log("预约成功 " + (parseInt(canbooklist[0]) + 1).toString() + " 号座位");
                            var bookInfo = data.data.list;
                            var bookTipInfo = '';
                            bookTipInfo += '<div class="bookTipInfo">';
                            bookTipInfo += '<p class="book-usersname">当前状态：预约成功</p>';
                            bookTipInfo += '<p class="book-usersname">预约用户：' + ska.username + '</p>';
                            bookTipInfo += '<p class="book-usersid">预约卡号：' + bookInfo.booker + '</p>';
                            bookTipInfo += '<p class="book-times">预约时间：' + bookInfo.starttime + ' ~ ' + bookInfo.endingtime + '</p>';
                            bookTipInfo += '<p class="book-spaces">预约座位：' + bookInfo.spaceInfo.areaInfo.name + ' - ' + bookInfo.spaceInfo.no + ' 号座位</p>';
                            bookTipInfo += '</div>';
                            dialog({
                                'id': 'book-success-info',
                                'skin': 'green-dialog',
                                'padding': '40px',
                                'title': '预约详情',
                                quickClose: true,
                                'content': bookTipInfo,
                                okValue: '确定',
                                ok: function () {
                                    window.location.reload();
                                },
                                cancel: false
                            }).showModal();
                            button_stop.click();
                        }
                    })
                }

                let index = Math.floor((Math.random() * mp.length));
                window.location.assign("http://libzw.csu.edu.cn/web/seat3?area=" + mp[index][0] + "&segment=" + mp[index][1] + "&day=" + ska.day + "&startTime=" + ska.startTime + "&endTime=22:00");
            }, 1000);


        }
        else {
            user = prompt("是否选择全馆选座，选是则是任意输入后刷新界面，选否则无需输入:", "");

            if (user != "" && user != null) {
                setCookie("username", user, 30);
                window.location.reload();
                //应用setCookie
            }
            else {
                var ownhate = [0];
                var ownlike = [0];
                var i;
                var timeinterval = 1;
                var trytimes = 1;
                var time2;
                const bottommessage = document.getElementsByClassName("foots col-xs-12")[0].children[0].innerHTML;

                function beginbook() {
                    document.getElementsByClassName("foots col-xs-12")[0].children[0].innerHTML = "正在抢座，请稍作等待......";
                    load_seat(ska.area, ska.segment, ska.day, ska.startTime, ska.endTime);

                    var seatlist = document.getElementById("floor").getElementsByTagName("li");
                    seatlist = Array.from(seatlist).sort((a, b) => parseInt(a.getAttribute("data-no")) - parseInt(b.getAttribute("data-no")));

                    var queuecode = seatlist[0].getAttribute("data-no");

                    var canbooklist = new Array();

                    var ownhatetemp = ownhate.slice(0);
                    var ownliketemp = ownlike.slice(0);

                    for (i in ownhatetemp) {
                        ownhatetemp[i] -= 1;
                        ownhatetemp[i] = ownhatetemp[i].toString();
                    }
                    for (i in ownliketemp) {
                        ownliketemp[i] -= 1;
                        ownliketemp[i] = ownliketemp[i].toString();
                    }
                    for (i in seatlist) {
                        if (seatlist[i].className == "seat ava-icon") {
                            canbooklist.push(i);
                        }
                    }
                    for (i in ownhatetemp) {
                        var temp2 = canbooklist.indexOf(ownhatetemp[i]);
                        if (temp2 > -1) {
                            canbooklist = canbooklist.filter(function (item) {
                                return item != ownhatetemp[i];
                            });
                        }
                    }
                    while (ownliketemp.length > 1) {
                        var temp = ownliketemp[ownliketemp.length - 1];
                        temp2 = canbooklist.indexOf(temp);
                        if (temp2 > -1) {
                            canbooklist = canbooklist.filter(function (item) {
                                return item != temp;
                            });
                            canbooklist.unshift(temp);
                        }
                        ownliketemp.pop();
                    }
                    console.log("正在寻找座位，第" + trytimes.toString() + "次尝试");
                    trytimes += 1;
                    if (canbooklist.length > 0) {
                        console.log("可预约的座位有：" + canbooklist.map(function (i) { return parseInt(i) + 1; }));
                        books("/api.php/spaces/" + (parseInt(queuecode) + parseInt(canbooklist[0])).toString() + "/book", {
                            'access_token': ska.access_token,
                            'userid': ska.userid,
                            'segment': ska.segment,
                            'type': 1
                        }, function (data) {
                            if (data.status == 1) {
                                console.log("预约成功 " + (parseInt(canbooklist[0]) + 1).toString() + " 号座位");
                                var bookInfo = data.data.list;
                                var bookTipInfo = '';
                                bookTipInfo += '<div class="bookTipInfo">';
                                bookTipInfo += '<p class="book-usersname">当前状态：预约成功</p>';
                                bookTipInfo += '<p class="book-usersname">预约用户：' + ska.username + '</p>';
                                bookTipInfo += '<p class="book-usersid">预约卡号：' + bookInfo.booker + '</p>';
                                bookTipInfo += '<p class="book-times">预约时间：' + bookInfo.starttime + ' ~ ' + bookInfo.endingtime + '</p>';
                                bookTipInfo += '<p class="book-spaces">预约座位：' + bookInfo.spaceInfo.areaInfo.name + ' - ' + bookInfo.spaceInfo.no + ' 号座位</p>';
                                bookTipInfo += '</div>';
                                dialog({
                                    'id': 'book-success-info',
                                    'skin': 'green-dialog',
                                    'padding': '40px',
                                    'title': '预约详情',
                                    quickClose: true,
                                    'content': bookTipInfo,
                                    okValue: '确定',
                                    ok: function () {
                                        window.location.reload();
                                    },
                                    cancel: false
                                }).showModal();
                                button_stop.click();
                            }
                        })
                    }
                };

                function wait() {
                    time2 = setInterval(beginbook, timeinterval * 1000);
                };

                function begintimebook() {
                    var hour2 = parseInt(timebutton.value.split(":")[0]);
                    var minute2 = parseInt(timebutton.value.split(":")[1]);
                    hour1 = d.getHours();
                    minute1 = d.getMinutes();
                    var timeactual = (hour2 - hour1) * 60 * 60 * 1000 + (minute2 - minute1) * 60 * 1000;
                    if (timeactual < 0) {
                        timeactual = 0;
                    }
                    console.log((timeactual / 1000).toString() + "秒后开始预约！");

                    layer.confirm("在 " + timebutton.value + " 开始抢座！请确认！", { icon: 3, title: '提示' }, function (index) {
                        layer.close(index);
                        setTimeout(wait, timeactual);
                    }, function (index) {
                        layer.close(index);
                        window.location.reload();
                    });
                };

                if (document.getElementsByClassName("login-control")[0].style.display == "none") {
                    // 时间选择按钮
                    var d = new Date();
                    var timebutton = document.createElement("input");
                    timebutton.id = "time";
                    timebutton.type = "time";
                    timebutton.className = "btn btn-info";
                    timebutton.style.display = "block";

                    var hour1 = d.getHours();
                    var minute1 = d.getMinutes();
                    timebutton.value = hour1.toString().padStart(2, '0') + ":" + minute1.toString().padStart(2, '0');

                    // 默认配置抢座的按钮
                    var button_default_begin = document.createElement("button");
                    button_default_begin.innerHTML = "默认抢座";
                    button_default_begin.type = "button";
                    button_default_begin.className = "btn btn-success";
                    button_default_begin.setAttribute("data-toggle", "tooltip");
                    button_default_begin.setAttribute("data-placement", "right");
                    button_default_begin.title = "按照默认配置抢座</br>刷新时间1秒</br>无优先座位与禁止座位";
                    button_default_begin.style.display = "block";
                    button_default_begin.style.fontSize = "17px";


                    // 停止抢座的按钮
                    var button_stop = document.createElement("button");
                    button_stop.innerHTML = "停止抢座";
                    button_stop.type = "button";
                    button_stop.className = "btn btn-danger";
                    button_stop.setAttribute("data-toggle", "tooltip");
                    button_stop.setAttribute("data-placement", "right");
                    button_stop.title = "停止当前抢座任务";
                    button_stop.style.display = "block";
                    button_stop.style.fontSize = "17px";

                    // 自由配置抢座的按钮
                    var button_user_begin = document.createElement("button");
                    button_user_begin.innerHTML = "自由抢座";
                    button_user_begin.className = "btn btn-warning";
                    button_user_begin.setAttribute("data-toggle", "tooltip");
                    button_user_begin.setAttribute("data-placement", "right");
                    button_user_begin.title = "自由配置抢座方式";
                    button_user_begin.style.display = "block";
                    button_user_begin.style.fontSize = "17px";

                    // 新校区图书馆5楼A区的座位配置
                    var buttonx5A = document.createElement("button");
                    buttonx5A.innerHTML = "新校五楼A区";
                    buttonx5A.className = "btn btn-default";
                    buttonx5A.setAttribute("data-toggle", "tooltip");
                    buttonx5A.setAttribute("data-placement", "right");
                    buttonx5A.title = "预配置新校五楼A区抢座</br>仅选取有电座位</br>立即开抢";
                    buttonx5A.style.display = "block";

                    // 新校区图书馆5楼A区的座位配置（只约空位）
                    var buttonx5A1 = document.createElement("button");
                    buttonx5A1.innerHTML = "新校五楼A区zz";
                    buttonx5A1.className = "btn btn-default";
                    buttonx5A1.setAttribute("data-toggle", "tooltip");
                    buttonx5A1.setAttribute("data-placement", "right");
                    buttonx5A1.title = "预配置新校五楼A区抢座</br>刷新时间1秒</br>仅选取有电无主机座位</br>立即开抢";
                    buttonx5A1.style.display = "block";

                    // // 本部图书馆2楼B区的座位配置
                    // var buttonb2B = document.createElement("button");
                    // buttonb2B.innerHTML = "本部二楼B区";
                    // buttonb2B.className = "btn btn-default";
                    // buttonb2B.setAttribute("data-toggle", "tooltip");
                    // buttonb2B.setAttribute("data-placement", "right");
                    // buttonb2B.title = "预配置本部二楼B区抢座</br>仅选取有电座位</br>立即开抢";
                    // buttonb2B.style.display = "block";

                    // 放置按钮的位置
                    var location_to_place_buttons = document.getElementById('nav-date');

                    // 先增加时间框
                    location_to_place_buttons.appendChild(timebutton);

                    location_to_place_buttons.appendChild(button_default_begin);
                    location_to_place_buttons.appendChild(button_stop);

                    var tempbuttondiv = document.createElement("div");

                    tempbuttondiv.appendChild(button_user_begin);

                    var tempdiv = document.createElement("div");
                    tempdiv.style.display = "none";
                    tempdiv.appendChild(buttonx5A);
                    tempdiv.appendChild(buttonx5A1);
                    // tempdiv.appendChild(buttonb2B);

                    tempbuttondiv.appendChild(tempdiv);

                    location_to_place_buttons.appendChild(tempbuttondiv);

                    var head = document.head;
                    var styleElement = document.createElement('style');
                    styleElement.innerHTML = '.tooltip-inner{text-align: left !important;width: 150px!important;} ';
                    head.append(styleElement);

                    $('[data-toggle="tooltip"]').tooltip({ html: true });
                };

                tempbuttondiv.onmouseover = function () {
                    tempdiv.style.display = "block";
                };

                tempbuttondiv.onmouseleave = function () {
                    tempdiv.style.display = "none";
                };

                // 默认抢座
                button_default_begin.onclick = function () {
                    begintimebook();
                };

                // 自由抢座
                button_user_begin.onclick = function () {

                    // 标记现在是选择优先的还是禁止的，默认是禁止的，为0，1为优先的
                    var choosestatus = 0;
                    // 更新按钮状态
                    function update() {
                        for (i in document.getElementById("floor").children) {
                            var tempnode = document.getElementById("floor").children[i];
                            if (tempnode.nodeName == "BUTTON") {

                                if (tempnode.getAttribute("state") == 0) {
                                    tempnode.style.backgroundColor = "rgba(255,48,48,0.1)";
                                }
                                else if (tempnode.getAttribute("state") == 1) {
                                    tempnode.style.backgroundColor = "rgba(51,122,183,0.8)";
                                }
                                else {
                                    tempnode.style.backgroundColor = "rgba(0,255,0,0.9)";
                                }

                            }
                        }
                    }
                    button_user_begin.title = "刷选模式";
                    button_user_begin.remove();
                    tempdiv.remove();
                    document.getElementsByClassName("foots col-xs-12")[0].children[0].innerHTML = "自由抢座模式&#8658;&#8727;可自由刷选可点击&#8727;蓝色为不预约的座位&#8727;绿色为优先预约的座位&#8727;";
                    if (document.getElementById("clearbuttonduo")) {
                        document.getElementById("clearbuttonduo").remove();
                    }
                    if (document.getElementById("enterbuttonduo")) {
                        document.getElementById("enterbuttonduo").remove();
                    }
                    document.addEventListener("mousedown", function (e) {
                        this.body.style.cursor = "crosshair";
                        //鼠标按下时，生成一个div
                        var owndiv = document.createElement("div");
                        owndiv.id = "owndivdelete";
                        owndiv.style.position = "fixed";
                        owndiv.style.borderColor = "red";
                        owndiv.style.borderWidth = "2px";
                        owndiv.style.borderStyle = "solid";
                        document.body.appendChild(owndiv);

                        //获取鼠标开始拖动的起始位置
                        let startPos = {};
                        startPos.x = e.clientX;
                        startPos.y = e.clientY;

                        function move(e) {
                            let curPos = {};
                            curPos.x = e.clientX;
                            curPos.y = e.clientY;
                            //div 的left和top：如果鼠标当前位置>鼠标起始位置，则为鼠标起始位置（鼠标往右拉）；如果鼠标当前位置<鼠标起始位置，则为鼠标当前位置(鼠标往左拉)
                            owndiv.style.left = Math.min(startPos.x, curPos.x) + 'px';
                            owndiv.style.top = Math.min(startPos.y, curPos.y) + 'px';

                            //通过当前坐标x/y-鼠标起始坐标x/y得到要生成的div的宽度 ，如果往左拉，鼠标当前坐标-起始坐标可能为负数，所以，需要使用绝对值函数Math.abs()
                            owndiv.style.width = Math.abs(curPos.x - startPos.x) + 'px';
                            owndiv.style.height = Math.abs(curPos.y - startPos.y) + 'px';

                            document.body.appendChild(owndiv);
                        }
                        //鼠标按下移动时动态获取鼠标位置
                        document.addEventListener("mousemove", move);
                        //鼠标放下时，停止生成画框
                        document.addEventListener("mouseup", function () {
                            document.removeEventListener("mousemove", move);
                            if (document.getElementById("owndivdelete")) {
                                var tempdiv = document.getElementById("owndivdelete");
                                if (tempdiv.style.left != NaN && tempdiv.style.top != NaN) {

                                    var tempdivleft = tempdiv.getBoundingClientRect().left;
                                    var tempdivtop = tempdiv.getBoundingClientRect().top;
                                    var tempdivright = tempdiv.getBoundingClientRect().right;
                                    var tempdivbottom = tempdiv.getBoundingClientRect().bottom;

                                    for (i in document.getElementById("floor").children) {
                                        var tempnode = document.getElementById("floor").children[i];
                                        if (tempnode.nodeName == "BUTTON") {
                                            var centerx = (tempnode.getBoundingClientRect().left + tempnode.getBoundingClientRect().right) / 2;
                                            var centery = (tempnode.getBoundingClientRect().top + tempnode.getBoundingClientRect().bottom) / 2;
                                            // console.log(tempdivleft,tempdivright,tempdivtop,tempdivbottom);
                                            if (centerx >= tempdivleft && centerx <= tempdivright && centery >= tempdivtop && centery <= tempdivbottom) {
                                                if (choosestatus == 0) {
                                                    tempnode.setAttribute("state", "1");
                                                }
                                                else {
                                                    tempnode.setAttribute("state", "2");
                                                }
                                                update();
                                            }
                                        }
                                    }
                                }
                                tempdiv.remove();
                                this.body.style.cursor = "default";
                            }
                        }, {
                            once: true
                        });

                    });

                    layer.prompt({
                        formType: 0,
                        value: '1',
                        title: '请输入刷新间隔时间，以秒为单位',
                        area: ['200px', '100px'],
                        btn2: function () {
                            window.location.reload();
                        }
                    }, function (value, index, elem) {
                        layer.close(index);
                        timeinterval = parseInt(value);

                        var seatpanel = document.getElementById("floor").children[1];
                        var seatpanel2 = Array.from(seatpanel.children).sort((a, b) => parseInt(a.getAttribute("data-no")) - parseInt(b.getAttribute("data-no")));

                        var seatnum = seatpanel.childElementCount;
                        for (i = 0; i < seatnum; i++) {
                            var temp = document.createElement("button");
                            temp.id = "ownseat" + i.toString();
                            temp.setAttribute("state", "0");
                            temp.style.position = "absolute";
                            temp.style.top = seatpanel2[i].style.top;
                            temp.style.left = seatpanel2[i].style.left;
                            temp.style.width = seatpanel2[i].style.width;
                            temp.style.height = seatpanel2[i].style.height;
                            temp.style.backgroundColor = "rgba(255,48,48,0.1)";
                            document.getElementById("floor").appendChild(temp);

                            temp.onclick = function () {
                                if (this.getAttribute("state") == 0) {
                                    this.setAttribute("state", "1");
                                }
                                else if (this.getAttribute("state") == 1) {
                                    this.setAttribute("state", "2");
                                }
                                else {
                                    this.setAttribute("state", "0");
                                }
                                update();
                            }
                        }

                        var choosebutton = document.createElement("input");
                        choosebutton.type = "checkbox";
                        choosebutton.id = "checkbox";
                        location_to_place_buttons.appendChild(choosebutton);

                        $("#checkbox").bootstrapSwitch({
                            onText: "优先",      // 设置ON文本  
                            offText: "禁止",    // 设置OFF文本  
                            onColor: "success",// 设置ON文本颜色     (info/success/warning/danger/primary)  
                            offColor: "primary",  // 设置OFF文本颜色        (info/success/warning/danger/primary)  
                            size: "normal",    // 设置控件大小,从小到大  (mini/small/normal/large)  
                            // 当开关状态改变时触发  
                            onSwitchChange: function (event, state) {
                                if (state == true) {
                                    choosestatus = 1;
                                } else {
                                    choosestatus = 0;
                                }
                            }
                        });

                        document.getElementsByClassName("bootstrap-switch-off")[0].style.display = "block";
                        document.getElementsByClassName("tooltip-inner")[0].innerText = "刷选模式"

                        var clearbutton = document.createElement("button");
                        clearbutton.innerHTML = "清空";
                        clearbutton.type = "button";
                        clearbutton.className = "btn btn-info";
                        clearbutton.id = "clearbuttonduo";
                        clearbutton.style.display = "block";
                        clearbutton.style.fontSize = "17px";
                        document.getElementById("changeplace").insertBefore(clearbutton, document.getElementById("rgyy"));

                        var enterbutton = document.createElement("button");
                        enterbutton.innerHTML = "确认";
                        enterbutton.type = "button";
                        enterbutton.className = "btn btn-info";
                        enterbutton.id = "enterbuttonduo";
                        enterbutton.style.display = "block";
                        enterbutton.style.fontSize = "17px";
                        document.getElementById("changeplace").insertBefore(enterbutton, document.getElementById("rgyy"));

                        document.getElementById("rgyy").nextSibling.nextSibling.nextSibling.remove();
                        document.getElementById("rgyy").nextSibling.nextSibling.nextSibling.nextSibling.remove();


                        clearbutton.onclick = function () {
                            for (i in document.getElementById("floor").children) {
                                if (document.getElementById("floor").children[i].nodeName == "BUTTON") {
                                    document.getElementById("floor").children[i].setAttribute("state", 0);
                                }
                            }
                            update();
                        }

                        enterbutton.onclick = function () {
                            for (i in document.getElementById("floor").children) {
                                var tempnode = document.getElementById("floor").children[i];
                                if (tempnode.nodeName == "BUTTON") {
                                    if (tempnode.getAttribute("state") == 1) {
                                        ownhate.push(parseInt(tempnode.id.slice(7)) + 1);
                                    }
                                    else if (tempnode.getAttribute("state") == 2) {
                                        ownlike.push(parseInt(tempnode.id.slice(7)) + 1);
                                    }
                                }
                            }
                            console.log("不预约的座位：" + ownhate.slice(1));
                            console.log("优先预约的座位：" + ownlike.slice(1));

                            begintimebook();
                        }
                    });
                };

                buttonx5A.onclick = function () {
                    timeinterval = prompt("请输入刷新间隔时间，以秒为单位", "1");
                    if (timeinterval == null || timeinterval == "") {
                        window.location.reload();
                    }
                    else {
                        timeinterval = parseInt(timeinterval);
                        console.log("刷新间隔时间：" + timeinterval.toString());

                        for (i = 1; i <= 24; i += 1) {
                            ownhate.push(i);
                        }
                        ownlike = [0, 25, 31, 26, 32, 27, 33, 28, 34, 29, 35, 30, 36, 132, 120, 108, 96, 84];
                        for (i = 13; i <= 5 * 11 + 12; i++) {
                            ownlike.push(ownlike[ownlike.length - 5] - 1);
                        }

                        console.log("不预约的座位：" + ownhate.slice(1));
                        console.log("优先预约的座位：" + ownlike.slice(1));

                        begintimebook();
                    }
                };

                buttonx5A1.onclick = function () {
                    timeinterval = 1;

                    console.log("刷新间隔时间：" + timeinterval.toString());


                    ownlike = [0, 132, 120, 108, 96, 84];
                    for (i = 1; i <= 5 * 11; i++) {
                        ownlike.push(ownlike[ownlike.length - 5] - 1);
                    }

                    for (i = 1; i <= 72; i += 1) {
                        ownhate.push(i);
                    }

                    for (i = 133; i <= 180; i += 1) {
                        ownhate.push(i);
                    }

                    console.log("不预约的座位：" + ownhate.slice(1));
                    console.log("优先预约的座位：" + ownlike.slice(1));

                    begintimebook();
                };

                // buttonb2B.onclick = function () {
                //     timeinterval = parseInt(prompt("请输入刷新间隔时间，以秒为单位", "1"));

                //     ownhate = [0];
                //     for (var i = 145; i <= 152; i += 1) {
                //         ownhate.push(i);
                //     }
                //     ownlike = [0, 66, 133, 54, 121, 42, 109, 30, 97];

                //     console.log("不预约的座位：" + ownhate.slice(1));
                //     console.log("优先预约的座位：" + ownlike.slice(1));

                //     begintimebook();
                // };

                button_stop.onclick = function () {
                    clearInterval(time2);
                    document.getElementsByClassName("foots col-xs-12")[0].children[0].innerHTML = bottommessage;
                    button_user_begin.className = "btn btn-warning";
                    alertDialog('已停止！', 'success', 5);
                };
            }
        }
    }

    window.onload = checkCookie();

})();