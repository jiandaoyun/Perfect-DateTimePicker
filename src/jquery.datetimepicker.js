(function (factory) {
    /* global define */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals: jQuery
        factory(window.jQuery);
    }
}(function ($) {

    /**
     * 初始化函数
     * @param element
     * @param options
     * @returns {{}}
     */
    var dateTimePicker = function(element, options){
        var picker = {},
            CONSTS = $.fn.datetimepicker.CONSTS,
            NAV = CONSTS.NAV,
            I18N = CONSTS.I18N,
            cache = {
                showYear: null,
                showMonth: null
            },
            $datetable, //日期面板
            $monthtable, //年月面板
            $timetable, //时间面板

            utils = {
                /**
                 * 获取该月总天数
                 * @param date {Date} 日期
                 * @param month {Number} 有参数表示指定月份，无参数表示当前月份
                 * @private
                 */
                getMonthDays: function(date, month){
                    var MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                    var year = date.getFullYear();
                    if (month == null) {
                        month = date.getMonth();
                    }
                    if (((0 === (year % 4)) && ( (0 !== (year % 100)) || (0 === (year % 400)))) && month === 1) {
                        return 29;
                    } else {
                        return MD[month];
                    }
                },
                
                isEmpty: function(value){
                    return value === "" || value == null;
                },
                
                applyFunc: function(obj, func, param, defaultValue){
                    if ($.isFunction(func)) {
                        return func.apply(obj, param ? param : []);
                    }
                    return defaultValue;
                },

                /**
                 * 让字符串通过指定字符做补齐的函数
                 * 
                 * @param text {String}  原始字符串
                 * @param size {Number}  总共需要的位数
                 * @param ch {String}  用于补齐的字符
                 * @return {String}  补齐后的字符串
                 */
                leftPad: function (text, size, ch) {
                    var result = String(text);
                    if (!ch) {
                        ch = " ";
                    }
                    while (result.length < size) {
                        result = ch + result;
                    }
                    return result.toString();
                },

                /**
                 * 日期格式解析
                 * @param format {JSON} 日期格式内容
                 * @param date {Date} 日期对象
                 * @returns {String} 返回日期字符串
                 */
                _compileDateFormat: function (format, date) {
                    var str = format.str, len = format.len, ch = format['char'];
                    switch(ch){
                        case 'E': //星期
                            str = CONSTS.DN[date.getDay()];
                            break;
                        case 'y': //年
                            if(len <= 3){
                                str = (date.getFullYear()+'').slice(2,4);
                            }else{
                                str = date.getFullYear();
                            }
                            break;
                        case 'M': //月
                            if(len > 2){
                                str = CONSTS.MN[date.getMonth()];
                            }else if(len < 2){
                                str = date.getMonth() + 1;
                            }else{
                                str = this.leftPad(date.getMonth() + 1 +'', 2,'0');
                            }
                            break;
                        case 'd': //日
                            if(len > 1){
                                str = this.leftPad(date.getDate()+'', 2,'0');
                            }else{
                                str = date.getDate();
                            }
                            break;
                        case 'h': //时(12)
                            var hour = date.getHours()%12;
                            if(hour === 0){
                                hour = 12;
                            }
                            if(len > 1){
                                str = this.leftPad(hour +'', 2,'0');
                            }else{
                                str = hour;
                            }
                            break;
                        case 'H': //时(24)
                            if(len > 1){
                                str = this.leftPad(date.getHours()+'', 2,'0');
                            }else{
                                str = date.getHours();
                            }
                            break;
                        case 'm':
                            if(len > 1){
                                str = this.leftPad(date.getMinutes()+'', 2,'0');
                            }else{
                                str = date.getMinutes();
                            }
                            break;
                        case 's':
                            if(len > 1){
                                str = this.leftPad(date.getSeconds()+'', 2,'0');
                            }else{
                                str = date.getSeconds();
                            }
                            break;
                        case 'a':
                            str = date.getHours()<12?'am':'pm';
                            break;
                        default:
                            str = format.str;
                            break;
                    }
                    return str;
                },

                /**
                 * 日期对象按照指定格式转化成字符串
                 * e.g. Thu Dec 12 2013 00:00:00 GMT+0800 + 'yyyy-MM-dd' --> '2013-12-12'
                 * @param {Date} date 日期对象
                 * @param {String} format 日期格式
                 * @return {String} 返回日期字符串
                 */
                date2str: function(date, format){
                    if(!date){
                        return '';
                    }
                    var len = format.length, result = '';
                    if (len > 0) {
                        var flagch = format.charAt(0), start = 0, str = flagch;
                        for (var i = 1; i < len; i++) {
                            var ch = format.charAt(i);
                            if (flagch !== ch) {
                                result += this._compileDateFormat({
                                    'char': flagch,
                                    'str': str,
                                    'len': i - start
                                }, date);
                                flagch = ch;
                                start = i;
                                str = flagch;
                            }else{
                                str +=ch;
                            }
                        }
                        result += this._compileDateFormat({
                            'char': flagch,
                            'str': str,
                            'len': len - start
                        }, date);
                    }
                    return result;
                }
            },
            
            /**
             * 生成按钮对象
             * @param tr {$} 行
             * @param text {String} 文本内容
             * @param colspan {Number} 合并单元格
             * @param nav {Number} 操作数
             * @param cls {String} 类名
             * @returns {*} 返回TD对象
             * @private
             */
            _createCell = function (tr, text, colspan, nav, cls) {
                var $cell = $('<td/>')
                    .attr('colSpan', colspan)
                    .html(text)
                    .appendTo(tr);
                if (nav) {
                    $cell.data('nav', nav);
                }
                cls = cls ? 'btn ' + cls : 'btn';
                $cell.addClass(cls);
                return $cell;
            },

            _createDatePicker = function(){
                var table = $('<table cellspacing = "2px" cellpadding = "0" class="dt"/>');
                var thead = $('<thead/>').appendTo(table);
                //head
                //head - tools
                row = $('<tr class = "mainhead"/>');
                //head - tools - 前一月
                table.$prevm = _createCell(row, '<i class="icon-datepicker-prev"/>', 1, NAV['prevm'], "prevm");
                //head - tools - title(标记年份和月份)
                table.$title = $('<td class="title" colspan="5"/>').data('nav',NAV['title']).appendTo(row);
                //head - tools - 后一月
                table.$nextm = _createCell(row, '<i class="icon-datepicker-next"/>', 1, NAV['nextm'], "nextm");
                row.appendTo(thead);
                //head - week names
                row = $('<tr/>');
                var i;
                for (i = 7; i > 0; --i) {
                    $('<td/>').appendTo(row);
                }
                for (i = 0; i < 7; ++i) {
                    var $fdcell = row.children().eq(i);
                    $fdcell.addClass('day name').text(I18N.SDN[i]);
                    if (i === 0 || i ===6) { //周六,周日
                        $fdcell.addClass("weekend");
                    }
                }
                row.appendTo(thead);
                //body
                var tbody = $('<tbody onselectstart="return false;"/>').appendTo(table);
                for (i = 6; i > 0; i--) {
                    var bodyRow = $('<tr/>').appendTo(tbody);
                    for (var t = 0; t < 7; t++) {
                        $('<td/>').appendTo(bodyRow);
                    }
                }
                //foot
                var tfoot = $('<tfoot/>').appendTo(table);
                //分割线
                _createCell($('<tr/>').appendTo(tfoot), '', 7, null, 'split');
                var row = $('<tr/>');
                //foot - 清除按钮
                _createCell(row, I18N["CLEAR"], 2, NAV['clear'], 'clear');
                //foot - 今天按钮
                _createCell(row, I18N["TODAY"], 3, NAV['today'], 'today');
                //foot - 确认按钮
                _createCell(row, I18N["OK"], 2, NAV['dok'], 'ok');
                row.appendTo(tfoot);
                return table;
            },

            /**
             * 生成年月选择部分
             * @private
             */
            _createMonthPicker = function () {
                var table = $('<table cellspacing = "2px" cellpadding = "0" class="mt"/>');
                //tbody
                var tbody = $('<tbody/>').appendTo(table);
                //tbody - tools
                var row = $('<tr/>').appendTo(tbody);
                for (var n = 0; n < 2; n++) {
                    $('<td class="month"/>').appendTo(row);
                }
                //tbody - 翻年按钮
                _createCell(row, '<i class="icon-datepicker-prev"/>', 1, NAV['prevy'], ' prevy');
                _createCell(row, '<i class="icon-datepicker-next"/>', 1, NAV['nexty'], ' nexty');
                //tbody - years
                for (var m = 0; m < 5; m++) {
                    row = $('<tr/>').appendTo(tbody);
                    $('<td class="month"/><td class="month"/>' +
                        '<td class="year"/><td class="year"/>').appendTo(row);
                }
                //foot - buttons
                var tfoot = $('<tfoot/>').appendTo(table);
                row = $('<tr/>').appendTo(tfoot);
                //tbody - 确定与取消
                _createCell(row, I18N["OK"], 4, NAV['mok'], 'ok');
                return table;
            },

            /**
             * 翻到上个月
             * @private
             */
            _toPrevMonth = function () {
                var sd = options.startDate, date = options.date;
                var month = cache.showMonth,
                    year = cache.showYear;
                if (!sd) {
                    if (month > 0) {
                        _setMonth(month - 1);
                    } else {
                        date.setFullYear(year - 1);
                        _setMonth(11);
                    }
                    return;
                }
                if (year > sd.getFullYear()) {
                    if (month > 0) {
                        _setMonth(month - 1);
                    } else {
                        date.setFullYear(year - 1);
                        _setMonth(11);
                    }
                } else if (year == sd.getFullYear()) {
                    if (month > sd.getMonth() && month > 0) {
                        _setMonth(month - 1);
                        if (date < sd) {
                            options.date = new Date(sd);
                        }
                    }
                }
            },

            /**
             * 翻到下个月
             * @private
             */
            _toNextMonth = function () {
                var edd = options.endDate, date = options.date;
                var month = cache.showMonth,
                    year = cache.showYear;
                if (!edd) {
                    if (month < 11) {
                        _setMonth(month + 1);
                    } else {
                        date.setFullYear(year + 1);
                        _setMonth(0);
                    }
                    return;
                }
                if (year < edd.getFullYear()) {
                    if (month < 11) {
                        _setMonth(month + 1);
                    } else {
                        date.setFullYear(year + 1);
                        _setMonth(0);
                    }
                } else if (year == edd.getFullYear()) {
                    if (month < edd.getMonth()) {
                        _setMonth(month + 1);
                        if (date > edd) {
                            options.date = new Date(edd);
                        }
                    }
                }
            },

            /**
             * 翻到前十年
             * @private
             */
            _toPrevDecade = function () {
                var sd = options.startDate, date = options.date;
                var year = date.getFullYear() - 10, month = date.getMonth();
                var minMonth, minYear;
                if (sd && year == (minYear = sd.getFullYear())) {
                    minMonth = sd.getMonth();
                }
                if (!minYear || minYear < CONSTS.MINYEAR) {
                    minYear = CONSTS.MINYEAR;
                }
                if (year < minYear) {
                    date.setFullYear(minYear);
                    if (month < minMonth) {
                        date.setMonth(minMonth);
                    }
                } else {
                    date.setFullYear(year);
                }
            },

            /**
             * 翻到后十年
             * @private
             */
            _toNextDecade = function () {
                var edd = options.endDate, date = options.date;
                var year = date.getFullYear() + 10, month = date.getMonth();
                var maxMonth, maxYear;
                if (edd && year == (maxYear = edd.getFullYear())) {
                    maxMonth = edd.getMonth();
                }
                if (!maxYear || maxYear > CONSTS.MAXYEAR) {
                    maxYear = CONSTS.MAXYEAR;
                }
                if (year > maxYear) {
                    date.setFullYear(maxYear);
                    if (month < maxMonth) {
                        date.setMonth(maxMonth);
                    }
                } else {
                    date.setFullYear(year);
                }
            },

            _setMonth = function (m) {
                var date = options.date;
                var day = date.getDate(),
                    edd = options.endDate,
                    std = options.startDate;
                var max = utils.getMonthDays(date, m);
                if (day > max) {
                    date.setDate(max);
                }
                date.setMonth(m);
                if (edd && date > edd) {
                    date.setDate(edd.getDate());
                }
                if (std && date < std) {
                    date.setDate(std.getDate());
                }
            },

            /**
             * 加载日期数据
             * @param table {$} 容器
             * @param date ｛Date｝当前日期
             * @private
             */
            _loadDateData = function (table, date) {
                if (!date) {
                    return;
                }
                var year = date.getFullYear(),
                    month = date.getMonth(),
                    day = date.getDate();
                var today = new Date(),
                    TY = today.getFullYear(),
                    TM = today.getMonth(),
                    TD = today.getDate();
                cache.showYear = year;
                cache.showMonth = month;
                var std = options.startDate,
                    edd = options.endDate;
                //设置title
                table.$title.text(I18N.MN[month] + ", " + year);
                //根据起始和结束日期设置翻月按钮
                var nextDay = new Date(date);
                nextDay.setDate(utils.getMonthDays(nextDay, null) + 1);
                if ((edd && nextDay > edd) || nextDay.getFullYear() > CONSTS.MAXYEAR) {
                    table.$nextm.addClass('disabled').removeClass('hover').data('disabled', true);
                } else {
                    table.$nextm.removeClass('disabled').data('disabled', false);
                }
                var prevDay = new Date(date);
                prevDay.setDate(0);
                if ((std && prevDay < std) || prevDay.getFullYear() < CONSTS.MINYEAR) {
                    table.$prevm.addClass('disabled').removeClass('hover').data('disabled', true);
                } else {
                    table.$prevm.removeClass('disabled').data('disabled', false);
                }
                //日期设置
                date.setDate(1);
                var day1 = date.getDay() % 7;
                date.setDate(0 - day1);
                date.setDate(date.getDate() + 1);
                var $frow = table.find('tbody').children().eq(0);
                //根据起始和结束日期设置td日期
                for (var i = 0; i < 6; i++) {
                    if (!$frow.length) {
                        break;
                    }
                    var $cells = $frow.children();
                    var iday;
                    for (var j = 0; j < 7; ++j, date.setDate(iday + 1)) {
                        var $cell = $cells.eq(j);
                        $cell.removeClass().data('nav', NAV['day']);
                        if (!$cell.length) {
                            break;
                        }
                        iday = date.getDate();
                        $cell.text(iday);
                        var current_month = (date.getMonth() == month);
                        if (!current_month) {
                            $cell.addClass('oday').data('disabled',true);
                            continue;
                        }
                        var disabled = false;
                        if ((std != null && std > date) || (edd != null && edd < date)) {
                            //日期范围外
                            $cell.addClass('day disabled');
                            disabled = true;
                        } else {
                            //日期范围内
                            $cell.addClass('day');
                        }
                        $cell.data('disabled', disabled);
                        if (!disabled) {
                            if (current_month && iday == day) {
                                cache.selectedDate && cache.selectedDate.removeClass('selected');
                                $cell.addClass('selected');
                                cache.selectedDate = $cell;
                                cache.showDay = iday;
                            }
                            if (date.getFullYear() == TY &&
                                date.getMonth() == TM &&
                                iday == TD) {
                                $cell.addClass('today');
                            }
                            var wday = date.getDay();
                            if (i === 0 || i ===6) {
                                $cell.addClass("weekend");
                            }
                        }
                    }
                    $frow = $frow.next();
                }
            },

            /**
             * 加载年月数据
             * @param table {$} 表格对象
             * @param date {Date} 当前日期
             * @private
             */
            _loadMonthData = function (table, date) {
                if (!date) {
                    return;
                }
                var year = date.getFullYear(), month = date.getMonth();
                //处理需要显示的10个年份
                var midyear = $(table).data('midYear');
                if (!midyear) {
                    midyear = year;
                } else {
                    if (year > midyear + 5) {
                        midyear += 10;
                    } else if (year < midyear - 4) {
                        midyear -= 10;
                    }
                }
                $(table).data('midYear', midyear);
                var years = [midyear - 4, midyear - 3, midyear - 2, midyear - 1, midyear,
                    midyear + 1, midyear + 2, midyear + 3, midyear + 4, midyear + 5];
                var ycells = $("td.year", table);
                var mcells = $("td.month", table);
                var ed = options.endDate;
                var sd = options.startDate;
                var maxYear, maxMonth, minYear, minMonth;
                //结束日期
                if (ed) {
                    if (ed && year == (maxYear = ed.getFullYear())) {
                        maxMonth = ed.getMonth();
                    }
                }
                if (!maxYear || maxYear > CONSTS.MAXYEAR) {
                    maxYear = CONSTS.MAXYEAR;
                }
                //起始日期
                if (sd) {
                    if (sd && year == (minYear = sd.getFullYear())) {
                        minMonth = sd.getMonth();
                    }
                }
                if (!minYear || minYear < CONSTS.MINYEAR) {
                    minYear = CONSTS.MINYEAR;
                }
                //12个月份数据加载
                for (var i = 0; i < 12; i++) {
                    var $mcell = mcells.eq(i).text(I18N.MN[i])
                        .data('nav', NAV['month']).data('month', i);
                    if (i == month) {
                        cache.selectedMonth && cache.selectedMonth.removeClass('selected');
                        $mcell.addClass("selected");
                        cache.selectedMonth = $mcell;
                    }
                    if ((!utils.isEmpty(minMonth) && i < minMonth) || (!utils.isEmpty(maxMonth) && i > maxMonth)) {
                        $mcell.addClass("disabled").data('disabled', true);
                    } else {
                        $mcell.removeClass("disabled").data('disabled', false);
                    }
                    //一页可显示的10年数据加载
                    if (i < 10) {
                        var $ycell = ycells.eq(i).text(years[i]).data('nav', NAV['year']);
                        if (years[i] == year) {
                            cache.selectedYear && cache.selectedYear.removeClass('selected');
                            $ycell.addClass("selected");
                            cache.selectedYear = $ycell;
                        }
                        if ((!utils.isEmpty(minYear) && years[i] < minYear) || (!utils.isEmpty(maxYear) && years[i] > maxYear)) {
                            $ycell.addClass("disabled").data('disabled', true)
                        } else {
                            $ycell.removeClass("disabled").data('disabled', false);
                        }
                    }
                }
                //翻页按钮 - 向前
                var $prev = $("td.prevy", table).removeClass('disabled').data('disabled', false);
                if (years[0] <= minYear) {
                    $prev.addClass("disabled").data('disabled', true).removeClass('hover');
                }
                //翻页按钮 - 向后
                var $next = $("td.nexty", table).removeClass('disabled').data('disabled', false);
                if (years[9] >= maxYear) {
                    $next.addClass("disabled").data('disabled', true).removeClass('hover');
                }
            },

            _loadTimeData = function (table, date) {
                if (!date) {
                    return;
                }
                var hour = date.getHours()+'',
                    minute = date.getMinutes()+'',
                    second = date.getSeconds()+'';
                table.$h.val(utils.leftPad(hour, 2, '0'));
                table.$m.val(utils.leftPad(minute, 2, '0'));
                table.$s.val(utils.leftPad(second, 2, '0'));
            },

            /**
             * 时间增加单位1
             * @param {Object} timetable 时间表
             * @param {Object} input 时间输入框对象
             * @private
             */
            _doTimeInc = function(timetable, input){
                var t = input.data('time');
                if (t === 'h') {
                    var text = (optionsdate.getHours() + 1) % 24;
                    options.date.setHours(text);
                    timetable.$h.val(utils.leftPad((text+''), 2, '0'));
                } else if (t === 'm') {
                    var text = (options.date.getMinutes() + 1) % 60;
                    options.date.setMinutes(text);
                    timetable.$m.val(utils.leftPad((text+''), 2, '0'));
                } else {
                    var text = (options.date.getSeconds() + 1) % 60;
                    options.date.setSeconds(text);
                    timetable.$s.val(utils.leftPad((text+''), 2, '0'));
                }
                input.select();
                utils.applyFunc(picker, options.onDateUpdate, arguments, false);
            },
            /**
             * 时间减少单位1
             * @param {Object} timetable 时间表
             * @param {Object} input 时间输入框对象
             * @private
             */
            _doTimeDec = function(timetable, input){
                var t= input.data('time');
                if (t === 'h') {
                    var text = (options.date.getHours() + 23) % 24;
                    options.date.setHours(text);
                    timetable.$h.val(utils.leftPad((text+''), 2, '0'));
                } else if (t === 'm') {
                    var text = (options.date.getMinutes() + 59 ) % 60;
                    options.date.setMinutes(text);
                    timetable.$m.val(utils.leftPad((text+''), 2, '0'));
                } else {
                    var text = (options.date.getSeconds() + 59) % 60;
                    options.date.setSeconds(text);
                    timetable.$s.val(utils.leftPad((text+''), 2, '0'));
                }
                input.select();
                utils.applyFunc(picker, options.onDateUpdate, arguments, false);
            },

            _createTimePicker = function () {
                var table = $('<table cellspacing = "0" cellpadding = "0" class="tt"/>');
                var tbody = $('<tbody>').appendTo(table);
                table.$h = $('<input/>').data('time', 'h').keyup(function () {
                    var text = this.value;
                    var value = parseInt(text, 10);
                    if (value < 24 && value >= 0) {
                        options.date.setHours(value);
                        utils.applyFunc(picker, options.onDateUpdate, arguments);
                    }
                }).focus(function () {
                    table.focus = $(this);
                });
                table.$m = $('<input/>').data('time', 'm').keyup(function () {
                    var text = this.value;
                    var value = parseInt(text, 10);
                    if (value < 60 && value >= 0) {
                        options.date.setMinutes(value);
                        utils.applyFunc(picker, options.onDateUpdate, arguments);
                    }
                }).focus(function () {
                    table.focus = $(this);
                });
                table.$s = $('<input/>').data('time', 's').keyup(function () {
                    var text = this.value;
                    var value = parseInt(text, 10);
                    if (value < 60 && value >= 0) {
                        options.date.setSeconds(value);
                        utils.applyFunc(picker, options.onDateUpdate, arguments);
                    }
                }).focus(function () {
                    table.focus = $(this);
                });
                table.focus = table.$s;
                var $add = $('<td/>').append($('<i class="icon-datepicker-plus"/>')).data('nav', NAV['plus']);
                var $min = $('<td/>').append($('<i class="icon-datepicker-minus"/>')).data('nav', NAV['minus']);
                $('<tr/>').append($('<td rowspan="2"/>').text(I18N.TIME))
                    .append($('<td rowspan="2"/>').append(table.$h))
                    .append($('<td class="common" rowspan="2"/>').text(':'))
                    .append($('<td rowspan="2"/>').append(table.$m))
                    .append($('<td class="common" rowspan="2"/>').text(':'))
                    .append($('<td rowspan="2"/>').append(table.$s))
                    .append($add)
                    .appendTo(tbody);
                $('<tr/>').append($min).appendTo(tbody);
                return table;
            },

            /**
             * 添加时分秒部分独立显示时的按钮操作面板
             * @param timetable 时间面板
             * @private
             */
            _addTimeOptPane = function(timetable){
                var $foot = $('<tfoot/>');
                var $tr = $('<tr/>').appendTo($foot);
                //清空按钮
                _createCell($tr, I18N["CLEAR"], 2, NAV['clear'], 'clear');
                //当前按钮
                _createCell($tr, I18N["CURRENT"], 3, NAV['current'], 'current');
                //确认按钮
                _createCell($tr, I18N["OK"], 2, NAV['dok'], 'ok');
                $foot.appendTo(timetable);
            },
            /**
             * 所有绑定事件
             * @private
             */
            _bindEvts = function () {
                var proxy = function (event) {
                    var target = event.target;
                    var $target = $(target).closest('td');
                    var type = event.type;
                    var navitype = $target.data('nav');
                    if ($target.data('disabled') || $target.length === 0 || !navitype) {
                        return;
                    }
                    if(!options.date){
                        options.date = new Date();
                    }
                    if (type === 'mouseover') {
                        //MOUSEOVER事件
                        $target.addClass('hover');
                    } else if (type === "mouseup") {
                        //MOUSEUP事件
                        switch (navitype) {
                            case NAV['prevm']:
                                //前月
                                _toPrevMonth();
                                _loadDateData($datetable, new Date(options.date));
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                break;
                            case NAV['nextm']:
                                //后月
                                _toNextMonth();
                                _loadDateData($datetable, new Date(options.date));
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                break;
                            case NAV['title']:
                                //加载数据
                                _loadMonthData($monthtable, new Date(cache.showYear, cache.showMonth));
                                $monthtable.css({
                                    position: 'absolute',
                                    top: 0,
                                    'z-index': 100000
                                }).show("fast");
                                break;
                            case NAV['clear']:
                                //清空按钮
                                options.date = null;
                                cache.selectedDate && cache.selectedDate.removeClass('selected');
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                utils.applyFunc(picker, options.onClear, arguments);
                                break;
                            case NAV['current']:
                                //当前按钮
                                options.date = new Date();
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                            case NAV['today']:
                                //今天按钮
                                var today = new Date();
                                if((options.startDate && today<options.startDate) ||
                                    (options.endDate && today>options.endDate)){
                                    return;
                                }else{
                                    options.date = today;
                                    cache.selectedDate && cache.selectedDate.removeClass('selected');
                                    cache.selectedDate = $datetable.find('td.today').addClass('selected');
                                }
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                utils.applyFunc(picker, options.onToday, arguments);
                                break;
                            case NAV['dok']:
                                //日期界面的确认按钮
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                utils.applyFunc(picker, options.onOk, arguments);
                                break;
                            case NAV['prevy']:
                                //前十年
                                _toPrevDecade();
                                _loadMonthData($monthtable, new Date(options.date));
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                break;
                            case NAV['nexty']:
                                //后十年
                                _toNextDecade();
                                _loadMonthData($monthtable, new Date(options.date));
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                break;
                            case NAV['mok']:
                                //年月界面的确认按钮
                                _loadDateData($datetable, new Date(options.date));
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                if($datetable.parent().length > 0){
                                    $monthtable.hide("fast");
                                }
                                break;
                            case NAV['cancel']:
                                //年月界面的取消按钮
                                _loadDateData($datetable, new Date(options.date));
                                $monthtable.hide("fast");
                                break;
                            case NAV['year']:
                                //选中年
                                cache.selectedYear && cache.selectedYear.removeClass('selected');
                                cache.selectedYear = $target;
                                var date = options.date;
                                date.setFullYear($target.text());
                                _loadMonthData($monthtable, new Date(date));
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                break;
                            case NAV['month']:
                                //选中月
                                cache.selectedMonth && cache.selectedMonth.removeClass('selected');
                                cache.selectedMonth = $target.addClass('selected');
                                options.date.setMonth($target.data('month'));
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                break;
                            case NAV['day']:
                                //选中日
                                cache.selectedDate && cache.selectedDate.removeClass('selected');
                                cache.selectedDate = $target.addClass('selected');
                                var curDate = options.date;
                                curDate.setFullYear(cache.showYear);
                                curDate.setMonth(cache.showMonth);
                                curDate.setDate($target.text());
                                utils.applyFunc(picker, options.onDateUpdate, arguments);
                                if(!$timetable.parent().length){
                                    utils.applyFunc(picker, options.onClose, arguments);
                                }
                                break;
                            case NAV['plus']:
                                //增加时间
                                _doTimeInc($timetable, $timetable.focus);
                                break;
                            case NAV['minus']:
                                //减少时间
                                _doTimeDec($timetable, $timetable.focus);
                                break;
                            default:
                                break;
                        }
                    } else if (type === "mouseout") {
                        //MOUSEOUT事件
                        $target.removeClass('hover');
                    }
                };
                element.unbind();
                element.bind("mousedown", proxy)
                    .bind("mouseover", proxy)
                    .bind("mouseup", proxy)
                    .bind("mouseout", proxy);
            };
        //初始化面板
        element.addClass(options.baseCls);
        $datetable = _createDatePicker();
        _loadDateData($datetable, new Date(options.date));
        $monthtable = _createMonthPicker();
        $timetable = _createTimePicker();
        switch (options.viewMode) {
            case CONSTS.VIEWMODE.YM : // 年月
                _loadMonthData($monthtable, new Date(options.date));
                $monthtable.appendTo(element).show();
                break;
            case CONSTS.VIEWMODE.HMS :   // 时分秒
                _loadTimeData($timetable, options.date);
                _addTimeOptPane($timetable);
                $timetable.appendTo(element).show();
                break;
            case CONSTS.VIEWMODE.YMD : //年月日
                $datetable.appendTo(element).show();
                $monthtable.hide().appendTo(element);
                break;
            default : // 年月日、年月日时分秒
                $datetable.appendTo(element).show();
                $monthtable.hide().appendTo(element);
                var row = $('<tr/>').prependTo($datetable.find('tfoot'));
                _loadTimeData($timetable, options.date);
                $timetable.show().appendTo($('<td colspan="7"/>').appendTo(row));
                break;
        }
        _bindEvts();
        picker.element = element;
        picker.$datetable = $datetable;
        picker.$monthtable = $monthtable;
        picker.$timetable = $timetable;
        picker.getValue = function(){
            var viewMode = CONSTS.VIEWMODE;
            var date = options.date;
            if(date && (options.viewMode === viewMode.YMD || options.viewMode === viewMode.YM)){
                //如果不包含时间，则把时间计为00:00:00
                date.setHours(0, 0, 0, 0);
            }
            return date;
        };
        picker.setValue = function (value) {
            options.date = value;
        };
        picker.getText = function (format) {
            return utils.date2str(this.getValue(), format?format:'yyyy/MM/dd HH:mm:ss');
        };
        return picker;
    };

    /**
     * dateTimePicker的jQuery构造函数
     * @param options
     * @returns {*}
     */
    $.fn.datetimepicker = function (options) {
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('dateTimePicker')) {
                options = $.extend(true, {}, $.fn.datetimepicker.defaults, options);
                $this.data('dateTimePicker', dateTimePicker($this, options));
            }
        });
    };

    /**
     * 常量
     * @type {JSON}
     */
    $.fn.datetimepicker.CONSTS = {
        I18N: {
            SDN: ["日", "一", "二", "三", "四", "五", "六"],
            MN: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            DN: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
            CALENDAR: "日历",
            CLEAR: "清空",
            TODAY: "今天",
            OK: "确定",
            CURRENT: "当前",
            TIME: "时间"
        },

        VIEWMODE: {
            YM: 'YM',  //年月
            YMD: 'YMD', //年月日
            HMS: 'HMS', //时分秒
            YMDHMS: 'YMDHMS' //年月日时分秒
        },

        MINYEAR: 1900,
        MAXYEAR: 2999,

        NAV: {
            'prevm': 2, //上个月
            'nextm': 3, //下个月
            'title': 4, //年月显示标题
            'clear': 5, //清除
            'today': 6, //今天
            'dok': 7,   //日期确认
            'prevy': 8, //前十年
            'nexty': 9, //后十年
            'cancel': 10, //取消
            'mok': 11,   //确认
            'plus': 12, //增加时间
            'minus': 13, //减少时间
            'current': 15, //当前时间
            'day': 100, //日
            'month': 200, //月
            'year': 300 //年
        }
    };

    /**\
     * dateTimePicker的默认属性配置
     * @type {JSON}
     */
    $.fn.datetimepicker.defaults = {
        baseCls: "perfect-datetimepicker",  //基础样式
        viewMode: $.fn.datetimepicker.CONSTS.VIEWMODE.YMD,
        endDate: null, //结束日期
        startDate: null, //起始日期
        date: null, //初始日期
        //日期更新事件
        onDateUpdate: null,
        //清除按钮事件
        onClear: null,
        //确认按钮事件
        onOk: null,
        //关闭按钮事件
        onClose: null,
        //选取今天按钮事件
        onToday: null
    };
}));
