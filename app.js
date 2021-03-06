var cheerio = require('cheerio')
var gs = require('nodegrass')

var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/crawlerNovel')

var url = 'http://www.biquku.com/0/330/'

/**
 * 获取小说章节数据
 * @return {[json]} [小说章节列表]
 */
var getList = function (){
    var chapterData = []
    gs.get(url,function(data){
        var html= data
        var $ = cheerio.load(html)
        $('#list dd a').each(function(idx, item){
            var $item = $(item);
            chapterData.push({
                'title': $item.text(),
                'id': $item.attr('href').split('.')[0]
            })
        })
    },'gbk').on('error',function(err){
        console.log(err)
    })
    return chapterData
}

var getContent = function (){
    var chapterData = getList()

    for (var i = 0; i < chapterData.length; i++) {
        var subUrl = url + chapterData.id + '.html'
        gs.get(subUrl,function(data){
            var html= data
            var $ = cheerio.load(html)
            var title = chapterData.title
            var content = $('#content').text()

            var Novel = mongoose.model('Novel', {
                "title": String,
                "content": String
            })

            var Chapter = new Novel({
                "title": title, 
                "content": content
            })

            Chapter.save(function(err){
                if(err){
                    console.log('保存失败')
                }
                console.log("保存完成")
            })
        },'gbk').on('error',function(err){
            console.log(err)
        })
    }
}

getContent()