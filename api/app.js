const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const supabase = require('./database/supabase')

const recipesRouter = require("./routes/recipeRoutes");

//testing 
const authenticateUser = require("./middleware/authMiddleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/recipes", recipesRouter);

//testing 
app.get("/api/test-auth", authenticateUser, (req, res) => {
  res.status(200).json({
    message: "Authentication successful",
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Recipe API is running!',
  })
})

app.get('/api/test-supabase', async (req, res) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('id')
    .limit(1)

  if (error) {
    console.error('Supabase connection error:', error)

    return res.status(500).json({
      message: 'Supabase connection failed',
      error: error.message,
    })
  }

  res.json({
    message: 'Supabase connection successful',
    data,
  })
})

module.exports = app;