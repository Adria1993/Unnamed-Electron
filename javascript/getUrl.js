var cheerio = require('cheerio');
var request = require('request');
var _ = require('underscore');
var fs = require('fs');

function loadFavUrl(){
  return JSON.parse(fs.readFileSync('./json/favUrl.json', 'utf8'));
}
$(document).ready(() => {
    var obj = loadFavUrl();
    loadDropDownNav(obj);
    if(obj != null){
      $("#buttonSearch").click(() => {
        var str = $("#usr").val().toString();
        getImageRef(str);
      });
      $("#addToList").click(()=>{
        var favourite = {};
        var url = $("#usr").val().toString()
        if(url !== ""){
          var name;
          name = url.split("/");
          name = name[name.length - 2];
          name = name.replace(/-/g, " ");
          favourite.name = name;
          favourite.url = url;
          obj.favs.push(favourite);
          saveFavList(JSON.stringify(obj));
          loadDropDownNav(obj);
        }
      });
    }
});

function getUrlFromName(dom){
  var obj = loadFavUrl();
  var urlStr = null;
  obj.favs.forEach((x) => {
    if(x.name == dom){
      urlStr = x.url
    }
  })
  $('#usr').val(urlStr);
  console.log();
  getImageRef(urlStr);
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function loadDropDownNav(obj){
  removeChild('#navButtons');
  obj.favs.forEach((x) => {
    $('#navButtons').append(`<li><a href="#" id="${x.name.replace(/ /g,"-")}" onclick="getUrlFromName('${x.name}')">${capitalizeFirstLetter(x.name)}</a></li>`);
  })
}

function saveFavList(obj){
  fs.writeFile("./json/favUrl.json", obj,(err) => {
    if(err) {
        return console.log(err);
    }
  });
}

function getUrls(target){
  var results = [];
  return new Promise((res, rej) =>{
    request.get(target, function(error, response, body) {
      if(error) rej(error);
        var $ = cheerio.load(body);
        $("a").each(function(i, image) {
			  if($(image).attr('href') !== undefined)
				    results.push($(image).attr('href'));
        });
      res(results.filter((x) => (x.includes('jpg') || x.includes('png'))));
    });
  });
}

function removeChild(dom){
  $(dom).children().remove();
}

function remove(dom){
  $(dom).remove();
}

function getImageRef(str){
  getUrls(str).then((res) => {
    remove('#images');
    res = _.uniq(res);
    $('body').append('<div id="images"></div>')
    res.forEach((x) => {
      $("#images").append(`<div class="well"><img src=${x} id="fromPage"></img></div>`);
    });
    var child = $('#images').children().length;
    $.bootstrapGrowl(`Added ${child} elements`,{
        type: 'success',
        delay: 2000,
        ele: "body",
        offset: {
	         from: "bottom",
	         amount: 20
	      },
        allow_dismiss: true,
        stackup_spacing: 10,
    });
  })
}
