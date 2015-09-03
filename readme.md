# Perfect-DateTimePicker
---

> A jQuery plugin for Date and Time Picker(基于jQuery的日期时间选择器)

**Demo:** ![lalal](http://www.shaowenwu.cn)

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
```

###API(接口)

<table>
<th>
<tr><td>属性</td><td>类型</td><td>描述</td></tr>
</th>
<tbody>
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
</tbody>
</table>
