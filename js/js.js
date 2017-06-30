$(window).keypress(function(e) {
  if (e.keyCode == 13) {
    console.log('Enter pressed');
    $( "#butt" ).trigger( "click" );
  }
  if (e.keyCode == 32) {
      $('#troy').trigger("click");

    console.log('h pressed');
  }
});

$(window).load(function(){
    $('#myModal').modal('show');
});

//selectedLiwcWords, map, min, max
function check(){
      selectedLiwcWords =[];
      dialogChecked = [];
      if ($("#healthCheck").is(':checked')) {
          dialogChecked = dialogChecked.concat(wordList["Health"]);
      }
      if ($("#treatmentCheck").is(':checked')) {
          dialogChecked = dialogChecked.concat(wordList["Treatments"]);
      }
      if ($("#proceduresCheck").is(':checked')) {
          dialogChecked = dialogChecked.concat(wordList["Procedures"]);
      }
      if ($("#careCheck").is(':checked')) {
          dialogChecked = dialogChecked.concat(wordList["Care"]);
      }
}

var json = {};
var socket = io.connect('128.208.102.175:3030');
var map = {}; //map of posts to their date. Used at first
var sortedKeys = []; //sorted keys of the above map about posts to date
var wordList = {}; //list of words from the makeList function
var dialogChecked = []; //words from the dialog box that are checked
//keeps track of the minimum date and maximum date always
var globalMin = new Date();
var globalMax = new Date();
var dateSliderMax = '';
var care ="";
var treat ="";
var health ="";
var pro ="";
var min ="";
var max ="";
var selectedLiwcWords = {};
var str = "";

$("#options").click(function () {//if anything is clicked
  commonProcedures();
});

//put values once they change
$("#slider").bind("valuesChanging", map, function(e, data){
    min = data.values.min;
    max = data.values.max;
    commonProcedures();
});

$('#butt').click(function() {
    document.getElementById("vis").style.visibility = 'visible';
    var p = document.getElementById("response").value;
    console.log(p);
    if (p % 1 === 0) {
          socket.emit('key', p);
    } else {
          alert("not a valid entry");
    }
    socket = io.connect('128.208.102.175:3030');

    main(function() {
        getPicture();  
        checkJson();
        pullFromJson();
        loopSortedKeys();
        setUpSlider();
        commonProcedures();
   });
    function main(callback) {
        socket.on('all', function (data) {//'all'
            json = data;
            callback(); 
        }); 
    }
} );

function commonProcedures(){
        str ="";//str is the post section, clears it
        check();
        timeSelected();
        listPrinter(selectedLiwcWords, care, "#c", "Care");
        listPrinter(selectedLiwcWords, treat, "#t", "Treatments");
        listPrinter(selectedLiwcWords, health, "#h", "Health");
        listPrinter(selectedLiwcWords, pro, "#p", "Procedures");
        $("#sliderPosts").html(str);
        cloud(selectedLiwcWords, sortedKeys, map);
}

/*sets the time selected*/
/*modifies selectedLiwcWords variable*/
function timeSelected() {
  //Clears the selectedLowcWord array of any words that got added to the dialog checked array
    for (var h in dialogChecked) {
      selectedLiwcWords[dialogChecked[h]] = 0;//nothing displays if it is selectedLiwcWords[h]
    }
    console.log(sortedKeys);
    for (var i = 0; i < sortedKeys.length; i++){
      if (sortedKeys[i] in map){
        var x = sortedKeys[i];//value
        var c = new Date(x);
        if (c.getTime() >= min.getTime() && c.getTime() <= max.getTime()) {
            console.log("dfgsdgs" + x);
            str += '<li>' + map[x] + '</li><br>';
            for (var j = 0; j < dialogChecked.length; j++) {
           // for (var j in dialogChecked) {
                if(map[x].indexOf(dialogChecked[j])> -1 && dialogChecked[j] != 'll') {
                    var done = map[x].toLowerCase().split(dialogChecked[j].toLowerCase()).length - 1;
                    selectedLiwcWords[dialogChecked[j]] = selectedLiwcWords[dialogChecked[j]] + done;
                }
            }
        }
    }
}
}  

function getPicture(){
    var pics = ["<img class ='img-responsive' src='img/person1.png'>","<img class ='img-responsive' src='img/person2.jpg'>","<img class ='img-responsive' src='img/person3.jpg'>","<img class ='img-responsive' src='img/person4.jpg'>"];
    var x = Math.floor(Math.random() * 4);
    $("#random").html(pics[x]);
}

function checkJson(){
    if (!json["liwcTable"][0]) {
        console.log("undefined")
    }
    
}

//go through the posts and add to the sortedKeys variable;
function pullFromJson() {
      var user = json['userTable'];
      var id = user[0].user_id;
      $('#id').html(id);
      var varchar = json['Profile_VarcharTable'];
      var replies = json['replyTable'];
      var discuss = json['discussionsTable'];
      care = makeList('Care','#care', 'Provider_Care', varchar, wordList);
      treat = makeList('Treatments','#treatments', 'Treatments', varchar, wordList);
      health = makeList('Health','#health', 'Health_Problems', varchar, wordList);
      pro = makeList('Procedures','#procedures', 'Clinical_Procedures', varchar, wordList);
      for (var i = 0; i < replies.length; i++) {//replies comes from json variable in method
          map[replies[i].date] = replies[i].content;
      }
      for (var i = 0; i < discuss.length; i++) {
          map[discuss[i].date] = discuss[i].content;
      }
      for (var key in map) {
          if (map.hasOwnProperty(key)) {
              sortedKeys.push(key);
          }
      }
      sortedKeys = sortedKeys.sort();//sort those keys added up
}

//loops through sortedKeys for the number given. Post data stays the same regardless of slider position.
function loopSortedKeys(){
  console.log("sortedkeys:");
    for (var i = 0; i < sortedKeys.length; i++) {
        var date = new Date(sortedKeys[i]);
        var hours = date.getHours()
        var suffix = '';
        if (hours > 11) {
            suffix += "PM";
        } else {
            suffix += "AM";
        }
        var minutes = date.getMinutes()
        if (minutes < 10) {
            minutes = "0" + minutes
        }
        if (hours > 12) {
            hours -= 12;
        } else if (hours === 0) {
            hours = 12;
        }
        var time = hours + ":" + minutes + " " + suffix;
        map[sortedKeys[i]] = '<b>' + "Post " + (i + 1) + " of " + (sortedKeys.length) + '</b>' + '<br>' + '<b>' + (date.getMonth() + 1) + "/" + (date.getDay() + 1) + "/" + date.getFullYear() + " " + time + '</b>' + '<br>' + map[sortedKeys[i]] + '<br>' + '<br>';
    }
}

/*set up the daterangeslider backdrop*/
function setUpSlider() {
  /*Math for slider date min and max*/
    min = new Date(sortedKeys[0]);
    max = new Date(sortedKeys[sortedKeys.length - 1]);
    var utc1 = Date.UTC(min.getFullYear(), min.getMonth(), min.getDate());
    var utc2 = Date.UTC(max.getFullYear(), max.getMonth(), max.getDate());
    var difference = (utc2 - utc1) / 2;
    var mid = new Date(utc2 - difference);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    $("#slider").dateRangeSlider({
        bounds: {
            min: new Date(min.getFullYear(),min.getMonth(), min.getDate() - 1),
            max: new Date(max.getFullYear(),max.getMonth(), max.getDate() + 1)
        },
        defaultValues: {
            min: new Date(min.getFullYear(),min.getMonth(), min.getDate()),
            max: new Date(mid.getFullYear(),mid.getMonth(), mid.getDate())
        },
        scales: [{
            first: function(value){
                return value; },
            end: function(value) {return value; },
            next: function(value){
                var next = new Date(value);
                return new Date(next.setMonth(value.getMonth() + 1));
            },
            label: function(value){
                return months[value.getMonth()] + " " + "'"+ value.getFullYear().toString().slice(-2);
            },
            format: function(tickContainer, tickStart, tickEnd){
                tickContainer.addClass("myCustomClass");
            }
        }]
    });
    dateSliderMax = $("#slider").dateRangeSlider("max");
}

function listPrinter(selectedLiwcWords, old, html, name){
      var fin = '<h2>' + name + '</h2>';
      for (var x in selectedLiwcWords) {
          for (var y = 0; y < old.length; y++){
              if (x === old[y] && selectedLiwcWords[x] != 0){
                  fin += '<li>' + x + ' (' + selectedLiwcWords[x] + ")" + '</li>';
              }
          }
      }
      $(html).html(fin);
  }

function cloud(selectedLiwcWords, sortedKeys, map) {
        var roundsocial = socialConversion(json['liwcTable'][0].social);
        var liwcFrequency = []
        var ht = '';
        for (var x in selectedLiwcWords) {
          ht += '<li>' + x + ' ' + selectedLiwcWords[x] + '</li>';
          $("#info").html(ht);
          liwcFrequency.push({"text": x,"size": wordTermConversion(selectedLiwcWords[x])});}
          var frequency_list = [
          {"text":"Social","size":roundsocial},
          {"text":"Stuff","size":roundsocial}
          ];
          var color = d3.scale.linear()
              .domain([0,1,2,3,4,5,6,10,15,20,100])
              .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);
          d3.layout.cloud().size([800, 300])
              .words(liwcFrequency)
              .rotate(0)
              .fontSize(function(d) { return d.size; })
              .on("end", draw)
              .start();
            function draw(words) {
                $('#cloudDiv').empty();
                d3.select("#cloudDiv")
                        .append("svg")
                        .attr("width", 850)
                        .attr("height", 350)
                        .attr("class", "wordcloud")
                        .append("g")
                        // without the transform, words words would get cutoff to the left and top, they would
                        // appear outside of the SVG area
                        .attr("transform", "translate(320,200)")
                        .selectAll("text")
                        .data(words)
                        .enter().append("text")
                        .style("font-size", function(d) { return d.size + "px"; })
                        .style("fill", function(d, i) { return color(i); })
                        .attr("transform", function(d) {
                            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                        })
                        .text(function(d) { return d.text; });
            }//draw method
  }//cloud method
    //CLOUD
    function socialConversion(term) {
      if (!term) {
          var font = 0;//10;//1.5;
        }
        var x = term;
        if (x === 0) {
          return 10;
        }
    }
    function wordTermConversion(term) {
      if (!term) {
        //alert("no liwcWordTerm");
          return 0;
        }
        var x = term;
        if (x === 0) {
          return 10;
        }
        if (x >= 0 && x < 1) { 
            return 15;
        }
        if (x >= 1 && x < 2) {
            return 20;
        }
        if (x >= 2 && x < 3) {
            return 50;
        }
        if (x >= 3 && x < 4) {
            return 70;
        }
        if (x >= 4) {
            return 90;
        }
    }
    
    //makes an object with one property being the column name, the other being the words in it
    function makeList(title, htmlid, column, data, wordList) {
        if(data != undefined) {
                var end = '<h2>' + title + '</h2>';
                var tempArray = [];
                var html = data[0][column];
                html = html.split("&&");
                for(var i = 0; i < html.length - 1; i++) {
                   var array = html[i].split("=>");
                   end += '<li>' + array[0].toLowerCase() + array[array.length - 1].substr(array[array.length - 1].length - 4) + '</li>';
                    var w = array[0].toLowerCase().replace('  ', '');
                   var n = parseInt(array[array.length - 1].substr(array[array.length - 1].length - 3));
                     tempArray.push(w);//key to value
                }
                wordList[title] = tempArray;
        }
        $(htmlid).html(end)
        return tempArray;
    }
