const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('Sistema inventario.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('pdf_output.txt', data.text);
}).catch(function(err) {
    console.log("Error extracting PDF:", err);
});
