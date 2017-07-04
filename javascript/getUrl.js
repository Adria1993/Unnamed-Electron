var cheerio = require('cheerio');
var request = require('request');
var _ = require('underscore');
var fs = require('fs');

function loadFavUrl(){
  var object = JSON.parse(fs.readFileSync('./json/favUrl.json', 'utf8'));
  return object;
}
$(document).ready(() => {
    var obj = loadFavUrl();
    loadNav(obj);
    $("#buttonSearch").click(() => {
      var str = $("#usr").val().toString();
      getImageRef(str);
    });
    $("#addToList").click(()=>{
      var url = $("#usr").val().toString();
      addObj(url)
    });
    $("#deleteToList").click(() => {
      var url = $("#usr").val().toString();
      deleteObj(url);
    });
});
function checkIfExist(favourite){
  let inList = false;
  loadFavUrl().favs.forEach((x) => {
    if(x.name == favourite.name || x.url == favourite.url){
      inList=true;
    }
  });
  return inList;
}
function getNameByUrl(src){
  var name = src.split("/");
  name = name[name.length - 1]
  return name;
}
function getUrlFromName(dom){
  var obj = loadFavUrl();
  var urlStr = null;
  obj.favs.forEach((x) => {
    if(x.name == dom){
      urlStr = x.url
    }
  })
  $('#usr').val(urlStr);
  getImageRef(urlStr);
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function getObject(str){
  var obj = loadFavUrl();
  var aux = null;
  obj.favs.forEach((x) => {
    if(x.url == str){
      aux = x
    }
  });
  return aux;
}
function deleteObj(str){
  var obj = loadFavUrl();
  var newObject = {
    favs: [],
  }
  obj.favs.forEach((x) => {
    if(x.url !== str){
      newObject.favs.push(x);
    }
  });
  saveFavList(JSON.stringify(newObject)).then((r) => {
    loadNav(loadFavUrl());
  });
}
function addObj(str){
  var object = getObject(str);
  if(!object){
    var favourite = {};
    var name;
    name = str.split("/");
    name = name[name.length - 2];
    name = name.replace(/-/g, " ");
    favourite.name = name;
    favourite.url = str;
    var json = loadFavUrl()
    json.favs.push(favourite);
    saveFavList(JSON.stringify(json)).then((r) => {
      loadNav(json);
    });
  }
  else{
    var msg = `Can't add new tag because ${object.name} already exist`;
    makeGrowl(msg,'danger');
  }
}
function loadNav(obj){
  removeChild('#navButtons');
  obj.favs.forEach((x) => {
    $('#navButtons').append(`
      <li>
        <a href="#" id="${x.name.replace(/ /g,"-")}" onclick="getUrlFromName('${x.name}')">${capitalizeFirstLetter(x.name).replace(/wallpapers/g, "")}
        </a>
      </li>`);
  })
}

function saveFavList(obj){
  return new Promise((res, rej) => {
    fs.writeFile("./json/favUrl.json", obj,(err) => {
      if(err) {
          rej(err);
      }
      else{
        res(true);
      }
    });
  })
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

function makeGrowl(message, color){
  $.bootstrapGrowl(message,{
      type: color,
      delay: 2000,
      ele: "body",
      offset: {
         from: "bottom",
         amount: 20
      },
      allow_dismiss: true,
      stackup_spacing: 10,
  });
}

function getImageRef(str){
  getUrls(str).then((res) => {
    remove('#images');
    res = _.uniq(res);
    $('.container').append('<div id="images"></div>')
    var cont = 0;
    res.forEach((x) => {
      var name = getNameByUrl(x);
      $("#images").append(
      `<div class="well container-image-url">
        <img src=${x} id="fromPage" alt="Avatar" class="image"></img>
        <div class="middle">
          <a href=${x} download="${name}">
            <button class="btn btn-success" id=button${cont} type="button")>
              <i class="glyphicon glyphicon-download">
              </i>
            </button>
          </a>
        </div>
      </div>`);
      cont++;
    });
    var child = $('#images').children().length;
    makeGrowl(`Added ${child} elements`,'success')
  })
}
