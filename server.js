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
    let home = '/national/year/2019'; // <-- change this
    res.redirect(home);
});

//NATIONAL APPLICATIONS
app.get('/national/year/:year', (req, res) => {
    let year = parseInt(req.params.year);
    fs.readFile(path.join(template_dir, 'national_template.html'), (err, template) => {
        let query = 'SELECT national.year, national.temp, national.tempc FROM national WHERE national.year = ?';
        console.log(req.query);
        db.all(query, [year], (err, rows) => {
            console.log(err);
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%', 'National Temperature');
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
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
        });
    });
});

app.get('/national/temperature/:temp', (req, res) => {
    let temp = parseFloat(req.params.temp);
    fs.readFile(path.join(template_dir, 'national_template.html'), (err, template) => {
        let query = 'SELECT national.year, national.temp, national.tempc FROM national WHERE national.temp > ?';
        console.log(req.query);
        db.all(query, [temp], (err, rows) => {
            console.log(err);
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%', 'National Temperature');
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
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
        });
    });
});


//STATE APPS BELOW THIS POINT
app.get('/state/year/:year', (req, res) => {
    let year = parseInt(req.params.year);
    fs.readFile(path.join(template_dir, 'state_template.html'), (err, template) => {
        let query = 'SELECT state.fips, state.year, state.temp, state.tempc, state_fips.fips, state_fips.state FROM state INNER JOIN state_fips ON state.fips = state_fips.fips WHERE state.year = ?';
        console.log(req.query);
        db.all(query, [year], (err, rows) => {
            console.log(err);
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%', 'State Temperature');
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
            let state_data = '';
            let i;
            for (i = 0; i < rows.length; i++) {
                state_data = state_data + '<tr>';
                state_data = state_data + '<td>' + rows[i].fips + '</td>';
                state_data = state_data + '<td>' + rows[i].name + '</td>';
                state_data = state_data + '<td>' + rows[i].state + '</td>';
                state_data = state_data + '<td>' + rows[i].year + '</td>';
                state_data = state_data + '<td>' + rows[i].temp + '</td>';
                state_data = state_data + '<td>' + rows[i].tempc + '</td>';
                state_data = state_data + '</tr>';
            }
            response = response.replace('%%TABLE_INFO%%', state_data);
            res.status(200).type('html').send(response);
        });
    });
});

app.get('/state/:state', (req, res) => {
    let state = req.params.state.toUpperCase();
    fs.readFile(path.join(template_dir, 'state_template.html'), (err, template) => {
        let query = 'SELECT state.fips, state.year, state.temp, state.tempc, state_fips.fips, state_fips.state FROM state INNER JOIN state_fips ON state.fips = state_fips.fips WHERE state_fips.state = ?';
        console.log(req.query);
        db.all(query, [state], (err, rows) => {
            console.log(err);
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%', rows[0].state);
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
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
        });
    });
});

app.get('/state/code/:fips', (req, res) => {
    let fips = req.params.fips;
    fs.readFile(path.join(template_dir, 'state_template.html'), (err, template) => {
        let query = 'SELECT state.fips, state.year, state.temp, state.tempc, state_fips.fips, state_fips.state FROM state INNER JOIN state_fips ON state.fips = state_fips.fips WHERE state_fips.fips = ?';
        console.log(req.query);
        db.all(query, [fips], (err, rows) => {
            console.log(err);
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%', rows[0].state);
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
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
        });
    });
});

app.get('/state/temperature/:temp', (req, res) => {
    let temp = req.params.temp;
    fs.readFile(path.join(template_dir, 'state_template.html'), (err, template) => {
        let query = 'SELECT state.fips, state.year, state.temp, state.tempc, state_fips.fips, state_fips.state FROM state INNER JOIN state_fips ON state.fips = state_fips.fips WHERE state.temp > ?';
        console.log(req.query);
        db.all(query, [temp], (err, rows) => {
            console.log(err);
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%', 'States where the year average temperature was above ' + temp + ' degrees.');
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
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
        });
    });
});

app.get('/county/temperature/:temp', (req, res) => {
    let temp = req.params.temp;
    fs.readFile(path.join(template_dir, 'county_template.html'), (err, template) => {
        let query = 'SELECT county.fips, county.year, county.temp, county.tempc, fips.name, fips.state FROM county INNER JOIN fips ON county.fips = fips.fips WHERE county.temp > ?';
        console.log(req.query);
        db.all(query, [temp], (err, rows) => {
            console.log(err);
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%', 'US Counties where the year average temperature was above ' + temp + ' degrees.');
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
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
        });
    });
});

app.get('/county/code/:fips', (req, res) => {
    let fips = parseInt(req.params.fips);
    fs.readFile(path.join(template_dir, 'county_template.html'), (err, template) => {
        let query = 'SELECT county.fips, county.year, county.temp, county.tempc, fips.name, fips.state FROM county INNER JOIN fips ON county.fips = fips.fips WHERE county.fips = ?';
        console.log(req.query);
        db.all(query, [fips], (err, rows) => {
            console.log(err);
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%','Placeholder');
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
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
        });
    });
});

app.get('/county/:county', (req, res) => {
    let county = req.params.county;
    fs.readFile(path.join(template_dir, 'county_template.html'), (err, template) => {
        let query = 'SELECT county.fips, county.year, county.temp, county.tempc, fips.name, fips.state FROM county INNER JOIN fips ON county.fips = fips.fips WHERE fips.name = ?';
        console.log(req.query);
        db.all(query, [county], (err, rows) => {
            console.log(err);
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%', rows[0].county);
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
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
        });
    });
});

app.get('/county/year/:year', (req, res) => {
    let year = parseInt(req.params.year);
    fs.readFile(path.join(template_dir, 'state_template.html'), (err, template) => {
        let query = 'SELECT county.fips, county.year, county.temp, county.tempc, fips.name, fips.state FROM county INNER JOIN fips ON county.fips = fips.fips WHERE county.year = ?';
        console.log(req.query);
        db.all(query, [year], (err, rows) => {
            console.log(err);
            let response = template.toString();
            response = response.replace('%%DATA_NAME%%', 'County Temperature by Year');
            //response = response.replace('%%COUNTY_ALT_TEXT%%', 'photo of US counties');
            //response = response.replace('%%COUNTY_IMAGE%%', '/photos/county.png');
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
        });
    });
});

app.get('/templates/:temp', (req, res) => {
    let temp = req.params.temp;
    fs.readFile(path.join(template_dir, 'testPage.html'), (err, template) => {
        let response = template.toString();
        res.status(200).type('html').send(response);
    });
});







app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
