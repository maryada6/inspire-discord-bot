import fetch from "node-fetch"
export default function getQuote(){
    return fetch("https://zenquotes.io/api/random")
    .then(res=> {
        return res.json()
    })
    .then(
        data=>{
            return data[0]['q']+'\n-'+data[0]['a'];
        }
    )
    .catch(err=>console.log(err))
}

getQuote()