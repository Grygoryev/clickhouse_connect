const createVisitsTableQuery = () => `
  CREATE TABLE default.user_visits
  (
    eventName String,
    user_id String,
    email String,
    name String,
    visit_time String,
    spent_time String
  )
  ENGINE = MergeTree()
  ORDER BY name;
`

const insertLastVisit = ({ 
  eventName, 
  user_id, 
  email, 
  name, 
  visit_time, 
  spent_time 
}) => `
  INSERT INTO default.user_visits (eventName, user_id, email, name, visit_time, spent_time)
  VALUES ('${eventName}', '${user_id}', '${email}', '${name}', '${visit_time}', '${spent_time}');
`

const exampleGetAllQuery = `
  SELECT * FROM default.visits
`

module.exports = {
  createVisitsTableQuery,
  insertLastVisit,
  exampleGetAllQuery
}