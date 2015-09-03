# Perfect-DateTimePicker
---

## A jQuery plugin for Date and Time Picker(基于jQuery的日期时间选择器)

**Demo:** ![lalal](http://www.shaowenwu.cn)

###Example(代码示例)

```javascript
    $('#demo1').datetimepicker({
        date: new Date(),
        viewMode: 'YMDHMS',
        onDateUpdate: function(){
            $('#date-text').text(this.getText());
            $('#date-text-ymd').text(this.getText('yyyy-MM-dd'));
            $('#date-value').text(this.getValue());
        }
    });
```

###API(接口)

|---|---|---|
|属性|类型|描述|
|---|---|---|
|baseCls|String|主样式|
|viewMode|String|主样式|
|startDate|Date|起始日期|
|endDate|Date|结束日期|
|date|Date|当前值|
|onDateUpdate|Function|日期更新事件|
|onClear|Function|清除按钮事件|
|onOk|Function|确认按钮事件|
|onClose|Function|关闭按钮事件|
|onToday|Function|选取今天按钮事件|
