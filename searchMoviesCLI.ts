import { promptCLLoop, question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: "omdb" });
console.log("Welcome to search-movies-cli!");
let text: string;
let values: string[];
let mySearch: string = "";
let navNumber: string = "";
let selectFav: string = "";
let movieIDs: string[] = [];
let movieNames: string[] = [];

const connectToDb = async (): Promise<void> => {
  try {
    await client.connect();
    console.log("Connected to the database successfully!");
  } catch (error) {
    console.log("Something is wrong!", error);
  }
};

const sendQuery = async (
  queryText: string,
  parameters: string[]
): Promise<void> => {
  const results = await client.query(queryText, parameters);
  console.log("A query has been sent.");
  console.table(results.rows);
  movieIDs = results.rows.map((item) => item.id);
  movieNames = results.rows.map((item) => item.name);
  let promptToPrint = "";
  for (let i = 1; i <= movieNames.length; i++) {
    promptToPrint += `[${i}] ${movieNames[i - 1]}\n`;
  }
  promptToPrint += "[0] CANCEL";
  console.log(promptToPrint);
  selectFav = question(
    `Choose a movie row number to favourite [1...${movieNames.length} / 0]: `
  );
};

const saveFavourite = async (queryText: string, parameters: string[]) => {
  await client.query(queryText, parameters);
  console.log(`Saving favourite movie: ${movieNames[parseInt(selectFav) - 1]}`);
};

const navSelection = () => {
  console.log("[1] Search\n[2] See favourites\n[3] Quit");
  navNumber = question("Choose an action! [1, 2 ,3]: ");
};

const runMyApp = async () => {
  try {
    await connectToDb();
    navSelection();
    while (navNumber !== "3") {
      // WHILE the user is in the app
      if (navNumber === "1") {
        // IF the user wants to search
        navNumber = ""; // reset navNumber
        mySearch = question("Search term: ");
        text = `SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count
          FROM movies
          WHERE name LIKE $1
          OR name LIKE $2
          AND kind = 'movie'
          ORDER BY date DESC LIMIT 10;`;
        values = [
          `%${mySearch.toLowerCase()}%`,
          `%${mySearch[0].toUpperCase() + mySearch.slice(1).toLowerCase()}%`,
        ];
        await sendQuery(text, values);
        if (selectFav !== "0") {
          // Save the favourite movie
          text = `INSERT INTO favourites (movie_id) VALUES ($1)`;
          values = [`${movieIDs[parseInt(selectFav) - 1]}`];
          await saveFavourite(text, values);
          // selectFav = ""; // reset selectFav
          navSelection();
        } else {
          // Cancel query and go back to picking navNumber
          navSelection();
        }
      }
    }
    // END OF MAIN BODY
    // WHEN navNumber is "3", below will be executed.
  } finally {
    await client.end();
    console.log("Disconnected from the database.");
  }
};

runMyApp();
