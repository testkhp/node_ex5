const express = require("express");
const MongoClient = require("mongodb").MongoClient;
//데이터베이스의 데이터 입력,출력을 위한 함수명령어 불러들이는 작업
const app = express();
const port = 3000;

//ejs 태그를 사용하기 위한 세팅
app.set("view engine","ejs");
//사용자가 입력한 데이터값을 주소로 통해서 전달되는 것을 변환(parsing)
app.use(express.urlencoded({extended: true}));
app.use(express.json()) 
//css/img/js(정적인 파일)사용하려면 이코드를 작성!
app.use(express.static('public'));

//데이터 베이스 연결작업
let db; //데이터베이스 연결을 위한 변수세팅(변수의 이름은 자유롭게 지어도 됨)

MongoClient.connect("mongodb+srv://khp2337:cogktkfkd8214@cluster0.kjr1egt.mongodb.net/?retryWrites=true&w=majority",function(err,result){
    //에러가 발생했을경우 메세지 출력(선택사항)
    if(err) { return console.log(err); }

    //위에서 만든 db변수에 최종연결 ()안에는 mongodb atlas 사이트에서 생성한 데이터베이스 이름
    db = result.db("ex5");

    //db연결이 제대로 됬다면 서버실행
    app.listen(port,function(){
        console.log("서버연결 성공");
    });

});

app.get("/",function(req,res){
    res.send("메인페이지 접속완료");
});

app.get("/brdlist",(req,res)=>{
    //데이터베이스에서 데이터들을 가지고온 다음 -> list페이지로 전달
    //데이터꺼내온 후 그다음에 실행할 코드를 적어줌 -> ejs파일에 전달해주는 기능
    db.collection("board").find().toArray((err,result)=>{
        res.render("board_list.ejs",{data:result})
    })
})

app.get("/brdinsert",(req,res)=>{
    //글작성 경로로 요청하면 해당 ejs파일 보여줌
    res.render("board_insert.ejs");
})

app.post("/dbinsert",(req,res)=>{
    //count 콜렉션에서 boardCount 숫자값을 가지고 온 후
    //board 콜렉션에 데이터값이 삽입되는 순간 게시글 순번값을 boardCount에 있는 값을 받아서 사용
    db.collection("count").findOne({name:"게시물갯수"},(err,result)=>{
       db.collection("board").insertOne({
            num:result.boardCount,
            title:req.body.title,
            author:req.body.author,
            check:"check"
       },(err,result)=>{                                        //increament 1씩 증가
           db.collection("count").updateOne({name:"게시물갯수"},{$inc:{boardCount:1}},(err,result)=>{
                res.redirect("/brdlist") //게시글 입력완료 후 게시글 목록페이지로 요청
           })
       })
    })
    //게시글 입력페이지에서 입력한 데이터들을 db에 저장하는 작업
    //db에 입력작업이 끝난후 응답-> 
 
})


app.get("/brdupdate/:num",(req,res)=>{
    //데이터베이스에 저장되있는 게시글번호와 제목 작성자 데이터 가지고옴
    //수정페이지 ejs파일로 전달해주면서 -> input태그 value값으로 표시해서 보여줘
    //해당 게시글페이지에 있는 제목,번호,작성자
    //url주소창에 적어서 보내주는 데이터들 -> string 문자열
    db.collection("board").findOne({num:Number(req.params.num)},(err,result)=>{
        res.render("board_update.ejs",{data:result})
    })
})


//데이터베이스 update 처리
app.post("/dbupdate",(req,res)=>{
    db.collection("board").updateOne({num:Number(req.body.num)},{$set:{title:req.body.title,author:req.body.author}},(err,result)=>{

        res.redirect("/brdlist") //데이터베이스 데이터 수정후 게시글 목록페이지로 요청
    })
})


//데이터베이스 delete 처리
app.get("/dbdelete/:num",(req,res)=>{
    db.collection("board").deleteOne({num:Number(req.params.num)},(err,result)=>{
        res.redirect("/brdlist")
    })
})


// //update 기능 연습 -> 명령어 숙지
// app.get("/test",(req,res)=>{
//     //데이터베이스 수정명령어 써봅시다.
//     // 해당 콜렉션(count)에 name이든 boardCount든 수정할 항목을 아무거나 지정해도
//     // 수정되는 범위는 객체 단위로 취급할 수 있다. $set  $inc
//     db.collection("count").updateOne({name:"머리아프다"},{$set:{name:"게시물갯수",boardCount:1}},(err,result)=>{
//         console.log("데이터 수정완료")
//     })
// })


// app.get("/del",(req,res)=>{

//     let deleteNumber = [];
//     req.query.delOk.forEach((el,index)=>{
//         deleteNumber[index] = Number(el);
//     })
//     db.collection("board").deleteMany({num:{$in:deleteNumber}},(err,result)=>{
//         res.redirect("/brdlist")
//     })
// })



