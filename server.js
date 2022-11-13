// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
let chart = require('chart.js');

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
    let home = '/national/2019'; // <-- change this
    res.redirect(home);
});

//NATIONAL APPLICATIONS
app.get('/national/:year', (req, res) => {
    let year = parseInt(req.params.year);
    fs.readFile(path.join(template_dir, 'national_template.html'), (err, template) => {
        let query = 'SELECT national.year, national.temp, national.tempc FROM national WHERE national.year = ?';
        db.all(query, [year], (err, rows) => {
        if (err || rows.length == 0) {
            res.status(404).send('Error: ' + year + ' does not exist in database.');
        }
        else {
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%', 'Average National Temperature');
            response = response.replace('%%NATIONAL_ALT_TEXT%%', 'photo of the United States');
            response = response.replace('%%NATIONAL_IMAGE%%', '/photos/UNITED STATES.jpg');
            let national_data = '';
            let i;
            for (i = 0; i < rows.length; i++) {
                national_data = national_data + '<tr>';
                national_data = national_data + '<td>' + rows[i].year + '</td>';
                national_data = national_data + '<td>' + rows[i].temp + '</td>';
                national_data = national_data + '<td>' + rows[i].tempc + '</td>';
                national_data = national_data + '</tr>';
            }
                response = response.replace('%%TABLE_INFO%%', national_data);
                res.status(200).type('html').send(response);
            };
        });
    });
});

app.get('/state/:state', (req, res) => {
    let state = req.params.state.toUpperCase();
    fs.readFile(path.join(template_dir, 'state_template.html'), (err, template) => {
        let query = 'SELECT state.fips, state.year, state.temp, state.tempc, state_fips.fips, state_fips.state FROM state INNER JOIN state_fips ON state.fips = state_fips.fips WHERE state_fips.state = ?';
        db.all(query, [state], (err, rows) => {
            if (err || rows.length == 0) {
                res.status(404).type('html').send('Error: ' + state + ' is not a state in the database.');
            }
            else {
                let response = template.toString();
                response = response.replace('%%DATA_NAME%%', 'Average Temperature by State');
                response = response.replace('%%STATE_ALT_TEXT%%', 'photo of US counties');
                response = response.replace('%%STATE_IMAGE%%', '/photos/' + rows[0].state + '.png');
                let state_data = '';
                let i;
                for (i = 0; i < rows.length; i++) {
                    state_data = state_data + '<tr>';
                    state_data = state_data + '<td>' + rows[i].fips + '</td>';
                    state_data = state_data + '<td>' + rows[i].state + '</td>';
                    state_data = state_data + '<td>' + rows[i].year + '</td>';
                    state_data = state_data + '<td>' + rows[i].temp + '</td>';
                    state_data = state_data + '<td>' + rows[i].tempc + '</td>';
                    state_data = state_data + '</tr>';
                }
                response = response.replace('%%TABLE_INFO%%', state_data);
                res.status(200).type('html').send(response);
            };
        });
    });
});

app.get('/county/:fips', (req, res) => {
    let fips = parseInt(req.params.fips);
    fs.readFile(path.join(template_dir, 'county_template.html'), (err, template) => {
        let query = 'SELECT county.fips, county.year, county.temp, county.tempc, fips.name, fips.state FROM county INNER JOIN fips ON county.fips = fips.fips WHERE county.fips = ?';
        db.all(query, [fips], (err, rows) => {
            if (err || rows.length == 0) {
                res.status(404).type('html').send('Error: ' + fips + ' is not a valid fips code.');
            }
            else {
                let response = template.toString();
                response = response.replace('%%DATA_NAME%%', 'Average Temperature by County');
                response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
                response = response.replace('%%COUNTY_IMAGE%%', '/photos/UNITED STATES.jpg');
                let county_data = '';
                let i;
                for (i = 0; i < rows.length; i++) {
                    county_data = county_data + '<tr>';
                    county_data = county_data + '<td>' + rows[i].fips + '</td>';
                    county_data = county_data + '<td>' + rows[i].name + '</td>';
                    county_data = county_data + '<td>' + rows[i].state + '</td>';
                    county_data = county_data + '<td>' + rows[i].year + '</td>';
                    county_data = county_data + '<td>' + rows[i].temp + '</td>';
                    county_data = county_data + '<td>' + rows[i].tempc + '</td>';
                    county_data = county_data + '</tr>';
                }
                response = response.replace('%%TABLE_INFO%%', county_data);
                res.status(200).type('html').send(response);
            };
        });
    });
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
