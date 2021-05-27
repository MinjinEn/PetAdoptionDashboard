//declare fetch
const fetch = require('node-fetch');
const express = require('express');
const jsdom = require("jsdom");
const fs = require('fs');
// const Chart = require('chart.js');
const { isContext } = require('vm');
require('dotenv').config();
const secret_key = process.env.SECRET_KEY;
const key = process.env.KEY;
const app = express();

const { JSDOM } = jsdom;

var page_template = fs.readFileSync('home.html','utf-8');

app.use(express.static('public'))
// app.use('/css', express.static(__dirname + 'public/css'))
// app.use('/css', express.static(__dirname + 'public/js'))

const dom = new JSDOM( page_template, 
                        {
                            contentType: "text/html",
                            pretendToBeVisual: true,
                        });

const { document } = dom.window;


let result = document.getElementById('results');

// Variables parameters: organization and type
let org = 'RI77';
let type = 'adoptable';


var DATA = [];
app.get('/', (request, response) => {
    fetch('https://api.petfinder.com/v2/oauth2/token', {
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + key + '&client_secret=' + secret_key,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (resp) {

        // Return the response as JSON
        return resp.json();

    }).then(function (data) {

        // Log the API data
        // console.log('token', data);

        // Store token data
        token = data.access_token;
        token_type = data.token_type;
        expires = new Date().getTime() + (data.expires_in * 1000);

        fetch('https://api.petfinder.com/v2/animals?organization=' + org + '&status=' + type, {
            headers: {
                'Authorization': token_type + ' ' + token,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        

            }).then(function (resp) {

                // Return the API response as JSON
                return resp.json();

            }).then(function (data) {
                DATA = data.animals;
                // Log the pet data
                // your content will be here
                data.animals.forEach(val => {
                    // console.log(val);
                    // if (val.name === 'sdf') {
                    addToDOM('div', val);
                    // }
                });

                // send back html dom to the browser
                // dom will be the place to store html
                response.send(dom.serialize());
            }).catch(function (err) {
                // Log any errors
                console.log('ERROR!! Something not working!', err);
            });
    });

})

app.get('/jsonDATA', (request, response) => {
    response.send(DATA);
});

let addToDOM = ( element, item) => {
    let div = document.createElement(element);
    let image = document.createElement('img');
    let caption = document.createElement('textarea')// <textarea></
    let title = document.createElement('label') // <label></label>
   
    div.setAttribute('class', 'pet_intro');
    div.style.display = "inline-block"
    div.style.textAlign = "center"
    div.style.margin = "1%"
    div.onmouseover = function() {
        this.style.backgroundColor = 'black';
        this.style.color = 'white';
    };
    div.onmouseout = function() {
        this.style.backgroundColor = 'transparent';
        this.style.color = 'black';
    }
    image.setAttribute('src', item.photos[0].medium);
    // image.src = item.photos[0].medium
    image.setAttribute('alt', `image of ${item.name}`);
    // image.height = "300"
    image.setAttribute('height', "400");
    image.width = "240"
    caption.setAttribute('class', 'description');
    caption.innerHTML = item.description
    // console.log(item.description)
    title.style.fontSize ="small"
    title.style.textAlign = "center"
    title.innerHTML = item.name
    

    div.append(image)  
    div.append(document.createElement('br'));
    div.append(title)
    div.append(document.createElement('br'));
    div.append(caption)    
     
    result.append(div);
}











    


app.listen(8080, () => {
    console.log('Example app listening at http://localhost:8080');
  });
