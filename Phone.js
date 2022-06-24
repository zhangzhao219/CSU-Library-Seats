// ==UserScript==
// @name         中南大学图书馆自动抢座（手机版）
// @namespace    http://libzw.csu.edu.cn
// @version      1.1
// @description  Choosing seats in CSU Library Automatically!
// @author       Zhang Zhao
// @homepage     https://github.com/zhangzhao219/CSU-Library-Seats
// @match        http://libzw.csu.edu.cn/web/seat3*
// @grant        none
// ==/UserScript==

(function () {
  var ownhate = [0];
  var ownhatetempseat;
  var i;
  var timeinterval = 1;
  var trytimes = 1;
  var time2;
  function beginbook() {
    load_seat(ska.area, ska.segment, ska.day, ska.startTime, ska.endTime);
    var seatlist = document.getElementById("floor").getElementsByTagName("li");
    seatlist = Array.from(seatlist).sort(
      (a, b) =>
        parseInt(a.getAttribute("data-no")) -
        parseInt(b.getAttribute("data-no"))
    );
    var queuecode = seatlist[0].getAttribute("data-no");
    var canbooklist = new Array();
    var ownhatetemp = ownhate.slice(0);
    for (i in ownhatetemp) {
      ownhatetemp[i] -= 1;
      ownhatetemp[i] = ownhatetemp[i].toString();
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
    console.log("正在寻找座位，第" + trytimes.toString() + "次尝试");
    trytimes += 1;
    if (canbooklist.length > 0) {
      console.log(
        "可预约的座位有：" +
          canbooklist.map(function (i) {
            return parseInt(i) + 1;
          })
      );
      books(
        "/api.php/spaces/" +
          (parseInt(queuecode) + parseInt(canbooklist[0])).toString() +
          "/book",
        {
          access_token: ska.access_token,
          userid: ska.userid,
          segment: ska.segment,
          type: 1,
        },
        function (data) {
          if (data.status == 1) {
            console.log(
              "预约成功 " +
                (parseInt(canbooklist[0]) + 1).toString() +
                " 号座位"
            );
            var bookInfo = data.data.list;
            var bookTipInfo = "";
            bookTipInfo += '<div class="bookTipInfo">';
            bookTipInfo += '<p class="book-usersname">当前状态：预约成功</p>';
            bookTipInfo +=
              '<p class="book-usersname">预约用户：' + ska.username + "</p>";
            bookTipInfo +=
              '<p class="book-usersid">预约卡号：' + bookInfo.booker + "</p>";
            bookTipInfo +=
              '<p class="book-times">预约时间：' +
              bookInfo.starttime +
              " ~ " +
              bookInfo.endingtime +
              "</p>";
            bookTipInfo +=
              '<p class="book-spaces">预约座位：' +
              bookInfo.spaceInfo.areaInfo.name +
              " - " +
              bookInfo.spaceInfo.no +
              " 号座位</p>";
            bookTipInfo += "</div>";
            dialog({
              id: "book-success-info",
              skin: "green-dialog",
              padding: "40px",
              title: "预约详情",
              quickClose: true,
              content: bookTipInfo,
              okValue: "确定",
              ok: function () {
                window.location.reload();
              },
              cancel: false,
            }).showModal();
            clearInterval(time2);
          }
        }
      );
    }
  }
  function begintimebook() {
    var a = window.confirm("确认开始抢座！");
    if (a == true) {
      time2 = setInterval(beginbook, timeinterval * 1000);
    } else {
      window.location.reload();
    }
  }
  if (
    document.getElementsByClassName("login-control")[0].style.display == "none"
  ) {
    document.getElementsByClassName("foots col-xs-12")[0].style.display =
      "none";
    var button_default_begin = document.createElement("button");
    button_default_begin.innerHTML = "默认抢座";
    button_default_begin.type = "button";
    button_default_begin.className = "btn-small btn-success";
    button_default_begin.style.display = "inline";
    var button_user_begin = document.createElement("button");
    button_user_begin.innerHTML = "自由抢座";
    button_user_begin.className = "btn-small btn-warning";
    button_user_begin.style.display = "inline";
    var buttonx5A = document.createElement("button");
    buttonx5A.innerHTML = "新校五楼A区";
    buttonx5A.className = "btn-small";
    buttonx5A.style.display = "inline";
    var buttonx5A1 = document.createElement("button");
    buttonx5A1.innerHTML = "新校五楼A区zz";
    buttonx5A1.className = "btn-small";
    buttonx5A1.style.display = "inline";
    var buttonx2B = document.createElement("button");
    buttonx2B.innerHTML = "本部二楼B区";
    buttonx2B.className = "btn-small";
    buttonx2B.style.display = "inline";
    var location_to_place_buttons =
      document.getElementsByClassName("mobile_menu")[0];
    location_to_place_buttons.appendChild(button_default_begin);
    location_to_place_buttons.appendChild(button_user_begin);
    location_to_place_buttons.appendChild(buttonx5A);
    location_to_place_buttons.appendChild(buttonx5A1);
    location_to_place_buttons.appendChild(buttonx2B);
    var head = document.head;
    var styleElement = document.createElement("style");
    styleElement.innerHTML =
      ".tooltip-inner{text-align: left !important;width: 150px!important;} ";
    head.append(styleElement);
    $('[data-toggle="tooltip"]').tooltip({ html: true });
  }
  button_default_begin.onclick = function () {
    begintimebook();
  };
  button_user_begin.onclick = function () {
    timeinterval = prompt("请输入刷新间隔时间，以秒为单位", "1");
    if (timeinterval == null || timeinterval == "") {
      window.location.reload();
    } else {
      timeinterval = parseInt(timeinterval);
      var seatpanel = document.getElementById("floor").children[1];
      var seatpanel2 = Array.from(seatpanel.children).sort(
        (a, b) =>
          parseInt(a.getAttribute("data-no")) -
          parseInt(b.getAttribute("data-no"))
      );
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
          var tempid = parseInt(this.id.slice(7));
          if (this.getAttribute("state") == 0) {
            this.style.backgroundColor = "rgba(54,54,54,0.9)";
            this.setAttribute("state", "1");
            ownhatetempseat = ownhate.indexOf(parseInt(this.id.slice(7)));
            if (ownhatetempseat > -1) {
              ownhate = ownhate.filter(function (item) {
                return item != tempid;
              });
            }
            ownhate.push(parseInt(this.id.slice(7)));
          } else if (this.getAttribute("state") == 1) {
            this.style.backgroundColor = "rgba(255,48,48,0.1)";
            this.setAttribute("state", "0");
            ownhatetempseat = ownhate.indexOf(tempid);
            if (ownhatetempseat > -1) {
              ownhate = ownhate.filter(function (item) {
                return item != tempid;
              });
            }
          }
        };
      }
      var allnobutton = document.createElement("button");
      allnobutton.innerHTML = "全选";
      allnobutton.type = "button";
      allnobutton.className = "btn-primary";
      allnobutton.id = "allnobuttonduo";
      allnobutton.style.display = "inline";
      location_to_place_buttons.appendChild(allnobutton);
      var clearbutton = document.createElement("button");
      clearbutton.innerHTML = "清空";
      clearbutton.type = "button";
      clearbutton.className = "btn-primary";
      clearbutton.id = "clearbuttonduo";
      clearbutton.style.display = "inline";
      location_to_place_buttons.appendChild(clearbutton);
      var enterbutton = document.createElement("button");
      enterbutton.innerHTML = "确认";
      enterbutton.type = "button";
      enterbutton.className = "btn-primary";
      enterbutton.id = "enterbuttonduo";
      enterbutton.style.display = "inline";
      document
        .getElementById("changeplace")
        .insertBefore(enterbutton, document.getElementById("rgyy"));
      location_to_place_buttons.appendChild(enterbutton);
      allnobutton.onclick = function () {
        for (i in document.getElementById("floor").children) {
          if (i != 0 && i != 1) {
            document.getElementById("floor").children[i].click();
          }
        }
      };
      clearbutton.onclick = function () {
        for (i in document.getElementById("floor").children) {
          if (i != 0 && i != 1) {
            if (
              document
                .getElementById("floor")
                .children[i].getAttribute("state") == 1
            ) {
              document.getElementById("floor").children[i].click();
            }
          }
        }
      };
      enterbutton.onclick = function () {
        for (i in ownhate) {
          ownhate[i] += 1;
        }
        console.log("不预约的座位：" + ownhate.slice(1));
        begintimebook();
      };
    }
  };
  buttonx5A.onclick = function () {
    timeinterval = prompt("请输入刷新间隔时间，以秒为单位", "1");
    if (timeinterval == null || timeinterval == "") {
      window.location.reload();
    } else {
      timeinterval = parseInt(timeinterval);
      console.log("刷新间隔时间：" + timeinterval.toString());
      for (i = 1; i <= 24; i += 1) {
        ownhate.push(i);
      }
      console.log("不预约的座位：" + ownhate.slice(1));
      begintimebook();
    }
  };
  buttonx5A1.onclick = function () {
    timeinterval = 1;
    console.log("刷新间隔时间：" + timeinterval.toString());
    for (i = 1; i <= 72; i += 1) {
      ownhate.push(i);
    }
    for (i = 133; i <= 180; i += 1) {
      ownhate.push(i);
    }
    console.log("不预约的座位：" + ownhate.slice(1));
    begintimebook();
  };
  buttonx2B.onclick = function () {
    timeinterval = prompt("请输入刷新间隔时间，以秒为单位", "1");
    if (timeinterval == null || timeinterval == "") {
      window.location.reload();
    } else {
      timeinterval = parseInt(timeinterval);
      console.log("刷新间隔时间：" + timeinterval.toString());
      for (var i = 145; i <= 152; i += 1) {
        ownhate.push(i);
      }
      console.log("不预约的座位：" + ownhate.slice(1));
      begintimebook();
    }
  };
})();
