var mongoose = require("mongoose");
mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose.connect("mongodb://root:example@localhost:27017", function() {
    mongoose.connection.db.dropDatabase();
});

