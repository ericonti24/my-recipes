const getRecipes = (req, res) => {
    res.json([
        {
            id: 1,
            title: "Chicken Alfredo",
            prep_time: 30
        },
        {
            id: 2,
            title: "Tacos",
            prep_time: 20
        }
    ]);
};

module.exports = {
    getRecipes
};