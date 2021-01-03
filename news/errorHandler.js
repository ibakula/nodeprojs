function handleDbOpen(err = null) {
    if (err != null) {
        console.log("errorHandler: DB Connection successfully opened!");
    }
    else {
        console.error("errorHandler: DB connection failed!");
        console.error(err.message);
    }
}