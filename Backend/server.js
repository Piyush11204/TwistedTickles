import express from  "express"
const app = express()
const port = process.env.port || 3000
// app.use(cors())
app.use(express.static('dist'))


app.get('/',(req,res)=>{
    res.send("Server is ready")
})


app.get("/api/jokes",(req,res)=>{
    const jokes = [
        {
            "id": 1,
            "joke": "Why don't scientists trust atoms? Because they make up everything!"
        },
        {
            "id": 2,
            "joke": "Why did the scarecrow win an award? Because he was outstanding in his field!"
        },
        {
            "id": 3,
            "joke": "Why don't skeletons fight each other? They don't have the guts."
        },
        {
            "id": 4,
            "joke": "What do you call fake spaghetti? An impasta!"
        },
        {
            "id": 5,
            "joke": "What do you get when you cross a snowman and a vampire? Frostbite."
        },
        {
            "id": 6,
            "joke": "Why was the math book sad? Because it had too many problems."
        },
        {
            "id": 7,
            "joke": "Why did the bicycle fall over? Because it was two-tired!"
        },
        {
            "id": 8,
            "joke": "Why don't programmers like nature? It has too many bugs."
        },
        {
            "id": 9,
            "joke": "How do you organize a space party? You planet."
        },
        {
            "id": 10,
            "joke": "Why did the coffee file a police report? It got mugged."
        }
    ]
    res.send(jokes);
    
})


app.listen(port ,()=>{
    console.log(`Server is running on port ${port}`)
})