function(doc) {
    if (doc.user || doc.message.user) {
        var d = new Date(doc.date),
        day = d.getDay();

        var user = doc.user || doc.message.user;

        emit([user.name, day], 1);
    }
};