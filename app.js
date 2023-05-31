const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const app = express();
let db = null;
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
const convertDbObjectToResponseObjectDirectors = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
const convertDbObjectToResponseObjectSingle = (dbSingle) => {
  return {
    movieId: dbSingle.movie_id,
    directorId: dbSingle.director_id,
    movieName: dbSingle.movie_name,
    leadActor: dbSingle.lead_actor,
  };
};
//Get all movies API
app.get("/movies/", async (request, response) => {
  const getAllMovies = `
        SELECT * FROM movie;
    `;
  const allMovies = await db.all(getAllMovies);
  response.send(
    allMovies.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
//Post a movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO 
          movie(director_id, movie_name, lead_actor) 
        VALUES (${directorId},'${movieName}','${leadActor}');
           `;

  const dpResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get a movie API
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getAllMovies = `
        SELECT * FROM movie WHERE movie_id = ${movieId};
    `;
  const allMovies = await db.get(getAllMovies);
  response.send(convertDbObjectToResponseObjectSingle(allMovies));
});

//Update a movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `UPDATE 
          movie 
        SET director_id = ${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
        WHERE movie_id = ${movieId};
           `;

  await db.run(addMovieQuery);
  response.send("Movie Details Updated");
});

//Delete a movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDelete = `
        DELETE FROM movie WHERE movie_id = ${movieId};
    `;
  await db.run(movieDelete);
  response.send("Movie Removed");
});

//Get all Directors API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT * FROM director;
    `;
  const getDirectors = await db.all(getDirectorsQuery);
  response.send(
    getDirectors.map((eachPlayer) =>
      convertDbObjectToResponseObjectDirectors(eachPlayer)
    )
  );
});

//Get a director Movies API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovies = `
        SELECT * FROM movie WHERE director_id = ${directorId};
    `;
  const directorMovies = await db.all(getMovies);
  response.send(
    directorMovies.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
module.exports = app;
