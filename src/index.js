require('dotenv').config()
const { ClickHouse } = require('clickhouse');
const express = require('express')
const cors = require('cors')
const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator')
const { 
  createVisitsTableQuery,
  insertLastVisit,
  exampleGetAllQuery
 } = require('./dbQueries/track')

const app = express()
app.use(cors())
app.use(express.json())

const clickhouse = new ClickHouse({
  url: 'http://localhost',
	port: process.env.CLICKHOUSE_PORT,
	debug: false,
	// basicAuth: {
	// 	user: process.env.CLICKHOUSE_USER,
	// 	password: process.env.CLICKHOUSE_PASSWORD
	// },
	basicAuth: {},
	isUseGzip: false,
	trimQuery: false,
	usePost: false,
	format: "json",
	raw: false,
	config: {
		session_id                              : 'session_id if neeed',
		session_timeout                         : 60,
		output_format_json_quote_64bit_integers : 0,
		enable_http_compression                 : 0,
		// database                                : process.env.CLICKHOUSE_DB,
		database                                : 'default',
	},
	reqParams: {}
});

const fillQuery = async (name, surname) => {
  try {
    await clickhouse.query(exampleFillQuery(name, surname)).toPromise()
  } catch (e) {
    console.log(e)
  }
}

const getAllQuery = async () => {
  try {
    const all = await clickhouse.query(exampleGetAllQuery).toPromise()
    return all
  } catch (e) {
    console.log(e)
  }
}

const PORT = process.env.NODE_APP_PORT || 5000

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
  });

app.get('/fill', (req, res) => {
  const [name, surname] = uniqueNamesGenerator({
    length: 2,
    separator: '-',
    dictionaries: [adjectives, animals]
  }).split('-')

	fillQuery(name, surname)

	res.send(`Filled: ${name} ${surname}`)
})

app.get('/get', (req, res) => {
	getAllQuery()
    .then(data => {
      let result = ''

      data.forEach((item, index) => result += `${index + 1} ${item.name} ${item.surname} <br>`)
      res.send(result)
    })
})

process.on('uncaughtException', function (err) {
    console.log(err);
}); 


app.get('/create-visits-table', (req, res) => {
  try {
    clickhouse.query(createVisitsTableQuery()).toPromise()
      .then(() => res.send('Created'))
  } catch (e) {
    console.log(e)
  }
})

app.post('/track-event', (req, res) => {
  const { 
    eventName, 
    user_id,
    email,
    name,
    visit_time,
    spent_time
  } = req.body

  const query = insertLastVisit({
    eventName, 
    user_id,
    email,
    name,
    visit_time,
    spent_time
  })

  try {
    clickhouse.query(query).toPromise()
      .then(() => res.json(req.body))
  } catch (e) {
    console.log(e)
  }
})