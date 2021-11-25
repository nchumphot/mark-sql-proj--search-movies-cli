import { promptCLLoop, question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: "omdb" });
console.log("Welcome to search-movies-cli!");
let text: string;
let mySearch: string = "";
let isRunning: boolean = true;
let repeatSearch: boolean = true;

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

connectToDb().then(() => {
  while (isRunning) {
    mySearch = question("Type your movie search here (or 'q' to quit): ");
    if (mySearch === "q") {
      isRunning = false;
      client
        .end()
        .then(() =>
          console.log(
            "Disconnected from the database. \nThank you for using search-movies-cli!"
          )
        );
    } else {
      text = `SELECT *
        FROM movies
        WHERE name LIKE '%${mySearch.toLowerCase()}%'
        OR name LIKE '%${
          mySearch[0].toUpperCase() + mySearch.slice(1).toLowerCase()
        }%'
        ORDER BY date LIMIT 10;`;
      sendQuery(text);
    }
  }
});
