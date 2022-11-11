// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'climate.sqlite3'); // <-- change this

let app = express();
let port = 8000;

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});

// Serve static files from 'public' directory
app.use(express.static(public_dir));


// GET request handler for home page '/' (redirect to desired route)
app.get('/', (req, res) => {
    let home = '/county/'; // <-- change this
    res.redirect(home);
});

/*
// Example GET request handler for data about a specific year
app.get('/year/:selected_year', (req, res) => {
    console.log(req.params.selected_year);
    fs.readFile(path.join(template_dir, 'year.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database

        res.status(200).type('html').send(template); // <-- you may need to change this
    });
});
*/
/* Get the national temperature information in either C or F*/
app.get('/county/:temp', (req, res) => {
    let temp = parseFloat(req.params.temp);
    fs.readFile(path.join(template_dir, 'county_template.html'), (err, template) => {
        let query = 'SELECT county.fips, county.year, county.temp, county.tempc FROM county WHERE county.temp > ?';
        console.log(req.query);
        db.all(query, [temp], (err, rows) => {
            console.log(err);
            console.log(rows);
            console.log(temp);
            let response = template.toString();
            //response = response.replace('%%COUNTY%%', (rows[0].fips));
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
            let county_data = '';
            let i;
            for (i = 0; i < rows.length; i++) {
                county_data = county_data + '<tr>';
                county_data = county_data + '<td>' + rows[i].fips + '</td>';
                county_data = county_data + '<td>' + rows[i].year + '</td>';
                county_data = county_data + '<td>' + rows[i].temp + '</td>';
                county_data = county_data + '</tr>';
            }
            response = response.replace('%%COUNTY_INFO%%', county_data);
            res.status(200).type('html').send(response);
        });
    });
});









app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
