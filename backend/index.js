import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db=new pg.Client({
  user:'postgres',
  database:'melicious',
  password:'a1b2c3@#',
  host:'localhost',
  port:5432
});

db.connect();


const app = express();
const port = 4000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


app.get("/melicious", async (req, res) => {
  try {
    const data = await db.query('SELECT * FROM reported_urls');
    console.log("Database query result:", data);
    
    const items = data.rows;
    console.log("Items:", items);

    const linksArray = items.map(item => ({ link: item.url, type: item.types }));
    res.json(linksArray);
  } catch (err) {
    console.error("Error in GET /malicious:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});



app.post('/report', async (req, res) => {
  console.log(req.body);
  const link = req.body.link ;
  const type = req.body.type ;
  // Validate the link and type
  if (!link || !type) {
    return res.status(400).json({ error: 'No URL or TYPE provided' });
  }

  try {
    await db.query("INSERT INTO public.reported_urls (url, types) VALUES ($1, $2)", [link, type]);
    res.json({ message: 'URL reported successfully', link });
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ error: 'Database error', details: err });
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });