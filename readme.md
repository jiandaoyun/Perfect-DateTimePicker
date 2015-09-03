# Perfect-DateTimePicker
---

## A jQuery plugin for Date and Time Picker(基于jQuery的日期时间选择器)

**Demo:** [http://finexs.github.io/Perfect-DateTimePicker](http://finexs.github.io/Perfect-DateTimePicker)

###Preview(预览图)
![](https://github.com/FineXs/Perfect-DateTimePicker/blob/master/examples/1.png)
![](https://github.com/FineXs/Perfect-DateTimePicker/blob/master/examples/2.png)
![](https://github.com/FineXs/Perfect-DateTimePicker/blob/master/examples/3.png)

###API(接口)

* 属性配置

<table>
<tr><td><b>属性</b></td><td><b>类型</b></td><td><b>描述</b></td></tr>
<tr><td>baseCls</td><td>String</td><td>主样式</td></tr>
<tr><td>viewMode</td><td>String</td><td>'YM'|'YMD'|'YMDHMS'|'HMS'</td></tr>
<tr><td>startDate</td><td>Date</td><td>起始日期</td></tr>
<tr><td>endDate</td><td>Date</td><td>结束日期</td></tr>
<tr><td>date</td><td>Date</td><td>当前值</td></tr>
<tr><td>onDateUpdate</td><td>Function</td><td>日期更新事件</td></tr>
<tr><td>onClear</td><td>Function</td><td>清除按钮事件</td></tr>
<tr><td>onOk</td><td>Function</td><td>确认按钮事件</td></tr>
<tr><td>onClose</td><td>Function</td><td>关闭按钮事件</td></tr>
<tr><td>onToday</td><td>Function</td><td>选取今天按钮事件</td></tr>
</table>

* 调用接口

<table>
<tr><td><b>方法</b></td><td><b>类型</b></td><td><b>参数</b></td><td><b>描述</b></td></tr>
<tr><td>getValue</td><td>Function</td><td>无</td><td>获取当前日期对象</td></tr>
<tr><td>getText</td><td>Function</td><td>format(可选，日期格式，例如: 'yyyy-MM-dd HH:mm:ss')</td><td>获取当前日期的文本格式</td></tr>
<tr><td>element</td><td>Object</td><td>无</td><td>返回选择器的jQuery对象</td></tr>
<tr><td>$datetable</td><td>Object</td><td>无</td><td>返回日期选择面板的jQuery对象</td></tr>
<tr><td>$monthtable</td><td>Object</td><td>无</td><td>返回年月选择面板的jQuery对象</td></tr>
<tr><td>$timetable</td><td>Object</td><td>无</td><td>返回时间选择面板的jQuery对象</td></tr>
</table>

###Example(代码示例)

```javascript
    var picker = $('#demo1').datetimepicker({
        date: new Date(),
        viewMode: 'YMDHMS',
        onDateUpdate: function(){
            $('#date-text').text(this.getText());
        },
        onClose: function(){
            this.element.remove();
        }
    });
    console.log(picker.getText());
    console.log(picker.getValue());
    picker.element.hide();
```

###Compatible(浏览器兼容性)
IE8+

###License(协议)
[MIT license](https://github.com/FineXs/Perfect-DateTimePicker/blob/master/LICENSE)

