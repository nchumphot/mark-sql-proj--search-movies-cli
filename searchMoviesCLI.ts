import { promptCLLoop, question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: "omdb" });
console.log("Welcome to search-movies-cli!");
let text: string;
let mySearch: string = "";
// let isRunning: boolean = true;
// let repeatSearch: boolean = true;

const connectToDb = async (): Promise<void> => {
  try {
    await client.connect();
    console.log("Connected to the database successfully!");
  } catch (error) {
    console.log("Something is wrong!", error);
  }
};

const sendQuery = async (queryText: string): Promise<void> => {
  const { rows } = await client.query(queryText);
  console.log("A query has been sent.");
  console.table(rows);
};

const runMyApp = async () => {
  try {
    await connectToDb();
    mySearch = question("Type your movie search here (or 'q' to quit): ");
    while (mySearch !== "q") {
      text = `SELECT *
      FROM movies
      WHERE name LIKE '%${mySearch.toLowerCase()}%'
      OR name LIKE '%${
        mySearch[0].toUpperCase() + mySearch.slice(1).toLowerCase()
      }%'
      ORDER BY date LIMIT 10;`;
      await sendQuery(text);
      mySearch = question("Type your movie search here (or 'q' to quit): ");
    }
  } finally {
    await client.end();
  }
};

runMyApp();
