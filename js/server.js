var mysql = require('mysql')
var io = require('socket.io').listen(3030)
var db = mysql.createConnection({     
    host: '',
    user: '',
    password: '',
    database: '',
    port: 3306,
})
db.connect(function(err){
    if (err) console.log(err)
})
console.log("connected");
io.sockets.on('connection', function(socket){
        console.log("1. in io.socket.on(CONNECTION), should only be once");
        socket.on('key', function(value){
        //console.log(all);
        console.log("2. in socket.on(key), with value of : " + value);
        var all = {};
        myQuery(all, function(all) {
            //console.log("all = " + JSON.stringify(all));
            socket.emit('all', all);
        });
        function myQuery(all, callback) {
            console.log("first step in myQuery() function definition with a value of : " + value);
            var replyTable = []
            var userTable = []
            var psychoTable = []
            var discussionsTable = []
            var profileTable = []
            var personalTable = []
            var liwcTable = []
            var id = value;
            var count = 0;
            var nbEndedQueries = 0;
            var amountOfQueries = 8;
            var followTable = [];

            db.query('SELECT * FROM `userByuser_LIWC_ResultD3_Punc` WHERE `userId` =' + id)
                .on('result', function(data){
                    liwcTable.push(data)
                })
                .on('end', function(){
                    all["liwcTable"] = liwcTable;
                                singleton(all);
                })
            db.query('SELECT * FROM `Users` WHERE `user_id` =' + id)
                .on('result', function(data){
                    userTable.push(data)
                })
                .on('end', function(){
                    all['userTable'] = userTable;
                                singleton(all);
                })

            db.query('SELECT * FROM `Discussions` WHERE `user_id` =' + id)
                .on('result', function(data){
                    discussionsTable.push(data)
                })
                .on('end', function(){
                    all['discussionsTable'] = discussionsTable;
                                singleton(all);

                })
            db.query('SELECT * FROM  `Profile_Varchar` WHERE `userId` =' + id)
                .on('result', function(data){
                    profileTable.push(data)

                })
                .on('end', function(){
                    all['Profile_VarcharTable'] = profileTable;
                                singleton(all);
                })

             db.query('SELECT * FROM  `User Follows` WHERE `user_id` =' + id)
                .on('result', function(data){
                    profileTable.push(data)
                })
                .on('end', function(){
                    all['followTable'] = followTable;
                                singleton(all);
                })

            db.query('SELECT * FROM `LIWCWords_CC_byPost_Freq_psychoProc`  WHERE `userId` =' + id)
                .on('result', function(data){
                    psychoTable.push(data)
                })
                .on('end', function(){
                    all['psychoTable'] = psychoTable;
                                singleton(all);
                })

            db.query('SELECT * FROM `Replies` WHERE `user_id` =' + id)
                .on('result', function(data){
                    replyTable.push(data)
                })
                .on('end', function(){
                    all['replyTable'] = replyTable;
                                singleton(all);

                })

            db.query('SELECT * FROM `LIWCWords_CC_byPost_Freq_PersonalConcern`  WHERE `userId` =' + id)
                .on('result', function(data){
                    personalTable.push(data)
                })
                .on('end', function(){
                    all['personalTable'] = personalTable;
                                singleton(all);

                })
            //singleton method to solve issue with specific asynchronous js issue
            function singleton(all) {
                if(++nbEndedQueries >= amountOfQueries) {
                    console.log("SINGLETON TEST: PASS, queries : " + nbEndedQueries);
                    callback(all);
                } else {
                    console.log("SINGLETON TEST: FAIL, queries : " + nbEndedQueries);
                }
            }
        }
    })    
})


