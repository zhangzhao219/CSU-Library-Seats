// ==UserScript==
// @name         中南大学图书馆自动抢座
// @namespace    http://libzw.csu.edu.cn
// @version      1.0
// @description  Choosing seats in CSU Library Automatically!
// @author       Li Junda
// @match        http://libzw.csu.edu.cn/web/seat3*
// @grant        none
// ==/UserScript==

(function () {

    var ownhate = [0];
    var ownlike = [0];
    var ownliketempseat, ownhatetempseat;
    var i;
    var timeinterval = 1;
    var g1 = 0;
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

        var a = window.confirm("在 " + timebutton.value + " 开始抢座！请确认！");
        if (a == true) {
            setTimeout(wait, timeactual);
        }
        else {
            window.location.reload();
        }
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
        document.getElementsByClassName("foots col-xs-12")[0].children[0].innerHTML = "自由抢座模式&#8658;&#8727;点击灰色为不预约的座位&#8727;点击绿色为优先预约的座位&#8727;";
        if (document.getElementById("enterbuttonduo")) {
            document.getElementById("enterbuttonduo").remove();
        }
        if (document.getElementById("allnobuttonduo")) {
            document.getElementById("allnobuttonduo").remove();
        }
        if (document.getElementById("clearbuttonduo")) {
            document.getElementById("clearbuttonduo").remove();
        }
        if (document.getElementById("groupnobuttonduo")) {
            document.getElementById("groupnobuttonduo").remove();
        }

        button_user_begin.className = "btn btn-warning disabled";

        timeinterval = prompt("请输入刷新间隔时间，以秒为单位", "1");
        if (timeinterval == null || timeinterval == "") {
            window.location.reload();
        }
        else {
            timeinterval = parseInt(timeinterval);

            var seatpanel = document.getElementById("floor").children[1];
            var seatpanel2 = Array.from(seatpanel.children).sort((a, b) => parseInt(a.getAttribute("data-no")) - parseInt(b.getAttribute("data-no")));
            var list = [35,83,131,179];
            var g = 0;
            var seatnum = seatpanel.childElementCount;

            for (i = 0; i < seatnum; i++) {
                var temp = document.createElement("button");
                temp.id = "ownseat" + i.toString();
                temp.setAttribute("state", "0");
                if(i <= list[g]){
                    temp.setAttribute("group",g);
                }
                else {
                    temp.setAttribute("group",++g);
                }

                temp.style.position = "absolute";
                temp.style.top = seatpanel2[i].style.top;
                temp.style.left = seatpanel2[i].style.left;
                temp.style.width = seatpanel2[i].style.width;
                temp.style.height = seatpanel2[i].style.height;
                temp.style.backgroundColor = "rgba(255,48,48,0.1)";
                document.getElementById("floor").appendChild(temp);

                temp.onclick = function () {
                    var tempid = parseInt(this.id.slice(7));
                    if (this.getAttribute("state") == 0) {
                        this.style.backgroundColor = "rgba(54,54,54,0.9)";
                        this.setAttribute("state", "1");
                        ownliketempseat = ownlike.indexOf(tempid);
                        if (ownliketempseat > -1) {
                            ownlike = ownlike.filter(function (item) {
                                return item != tempid;
                            });
                        }
                        ownhatetempseat = ownhate.indexOf(parseInt(this.id.slice(7)));
                        if (ownhatetempseat > -1) {
                            ownhate = ownhate.filter(function (item) {
                                return item != tempid;
                            });
                        }
                        ownhate.push(parseInt(this.id.slice(7)));
                    }
                    else if (this.getAttribute("state") == 1) {
                        this.style.backgroundColor = "rgba(0,255,0,0.9)";
                        this.setAttribute("state", "2");
                        ownliketempseat = ownlike.indexOf(tempid);
                        if (ownliketempseat > -1) {
                            ownlike = ownlike.filter(function (item) {
                                return item != tempid;
                            });
                        }
                        ownhatetempseat = ownhate.indexOf(tempid);
                        if (ownhatetempseat > -1) {
                            ownhate = ownhate.filter(function (item) {
                                return item != tempid;
                            });
                        }
                        ownlike.push(tempid);
                    }
                    else if (this.getAttribute("state") == 2) {
                        this.style.backgroundColor = "rgba(255,48,48,0.1)";
                        this.setAttribute("state", "0");
                        ownliketempseat = ownlike.indexOf(tempid);
                        if (ownliketempseat > -1) {
                            ownlike = ownlike.filter(function (item) {
                                return item != tempid;
                            });
                        }
                        ownhatetempseat = ownhate.indexOf(tempid);
                        if (ownhatetempseat > -1) {
                            ownhate = ownhate.filter(function (item) {
                                return item != tempid;
                            });
                        }
                    }
                }
            }
            var allnobutton = document.createElement("button");
            allnobutton.innerHTML = "全选";
            allnobutton.type = "button";
            allnobutton.className = "btn btn-info";
            allnobutton.id = "allnobuttonduo";
            allnobutton.style.display = "block";
            allnobutton.style.fontSize = "17px";
            document.getElementById("changeplace").insertBefore(allnobutton, document.getElementById("rgyy"));

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

            var temp0 = document.createElement("button");
            temp0.innerHTML="第0组";
            temp0.id = "btn0-g";
            temp0.type ="button";
            temp0.className = "btn btn-info";
            temp0.style.display = "block";
            temp0.style.fontSize = "17px";
            document.getElementById("changeplace").insertBefore(temp0, document.getElementById("rgyy"));

            temp0.onclick = function(){
                for(i in document.getElementById("floor").children){
                    if (i != 0 && i != 1 && document.getElementById("floor").children[i].getAttribute("group") == "0") {
                        document.getElementById("floor").children[i].click();
                        document.getElementById("floor").children[i].click();
                    }
                }
            }
            var temp1 = document.createElement("button");
            temp1.innerHTML="第1组";
            temp1.id = "btn1-g";
            temp1.type ="button";
            temp1.className = "btn btn-info";
            temp1.style.display = "block";
            temp1.style.fontSize = "17px";
            document.getElementById("changeplace").insertBefore(temp1, document.getElementById("rgyy"));

            temp1.onclick = function(){
                for(i in document.getElementById("floor").children){
                    if (i != 0 && i != 1 && document.getElementById("floor").children[i].getAttribute("group") == "1") {
                        document.getElementById("floor").children[i].click();
                        document.getElementById("floor").children[i].click();
                    }
                }
            }

            var temp2 = document.createElement("button");
            temp2.innerHTML="第2组";
            temp2.id = "btn2-g";
            temp2.type ="button";
            temp2.className = "btn btn-info";
            temp2.style.display = "block";
            temp2.style.fontSize = "17px";
            document.getElementById("changeplace").insertBefore(temp2, document.getElementById("rgyy"));

            temp2.onclick = function(){
                for(i in document.getElementById("floor").children){
                    if (i != 0 && i != 1 && document.getElementById("floor").children[i].getAttribute("group") == "2") {
                        document.getElementById("floor").children[i].click();
                        document.getElementById("floor").children[i].click();
                    }
                }
            }

            var temp3 = document.createElement("button");
            temp3.innerHTML="第3组";
            temp3.id = "btn3-g";
            temp3.type ="button";
            temp3.className = "btn btn-info";
            temp3.style.display = "block";
            temp3.style.fontSize = "17px";
            document.getElementById("changeplace").insertBefore(temp3, document.getElementById("rgyy"));

            temp3.onclick = function(){
                for(i in document.getElementById("floor").children){
                    if (i != 0 && i != 1 && document.getElementById("floor").children[i].getAttribute("group") == "3") {
                        document.getElementById("floor").children[i].click();
                        document.getElementById("floor").children[i].click();
                    }
                }
            }
            // for(k = 1; k < 4; k++){
            //     let temp = document.createElement("button");
            //     temp.innerHTML = "第"+k.toString()+"组";
            //     temp.id = "btn" + k.toString();
            //     temp.type ="button";
            //     temp.className = "btn btn-info";
            //     temp.style.display = "block";
            //     temp.style.fontSize = "17px";
            //     document.getElementById("changeplace").insertBefore(temp, document.getElementById("rgyy"));

            //     temp.onclick = function(){
            //         for(i in document.getElementById("floor").children){
            //             if (i != 0 && i != 1 && document.getElementById("floor").children[i].getAttribute("group") == k.toString()) {
            //                 document.getElementById("floor").children[j].click();
            //                 document.getElementById("floor").children[j].click();
            //             }
            //         }
            //     }
            // }

            allnobutton.onclick = function () {
                for (i in document.getElementById("floor").children) {
                    if (i != 0 && i != 1) {
                        document.getElementById("floor").children[i].click();
                    }
                }
            }
            clearbutton.onclick = function () {
                for (i in document.getElementById("floor").children) {
                    if (i != 0 && i != 1) {
                        if (document.getElementById("floor").children[i].getAttribute("state") == 1) {
                            document.getElementById("floor").children[i].click();
                            document.getElementById("floor").children[i].click();
                        }
                        else if (document.getElementById("floor").children[i].getAttribute("state") == 2) {
                            document.getElementById("floor").children[i].click();
                        }
                    }
                }
            }

            enterbutton.onclick = function () {
                for (i in ownlike) {
                    ownlike[i] += 1;
                }
                for (i in ownhate) {
                    ownhate[i] += 1;
                }
                console.log("不预约的座位：" + ownhate.slice(1));
                console.log("优先预约的座位：" + ownlike.slice(1));

                begintimebook();
            }
        }
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

   

    button_stop.onclick = function () {
        clearInterval(time2);
        document.getElementsByClassName("foots col-xs-12")[0].children[0].innerHTML = bottommessage;
        button_user_begin.className = "btn btn-warning";
        alertDialog('已停止！', 'success', 5);
    };
})();
