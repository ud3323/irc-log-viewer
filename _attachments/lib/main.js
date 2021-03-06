require('./core');
require('./controller');
require('./templates');
require('./views');

IRC.MessagesView.appendTo('#messages');
IRC.DaysView.appendTo('#days');

IRC.set('daysController', IRC.DaysController.create());
IRC.set('messagesController', IRC.MessagesController.create());

IRC.set('dataSource', Ember.Object.create({

    loadDay: function(day) {
        IRC.messagesController.clear();
        IRC.messagesController.set('loading', true);
        var from = day || IRC.createDateTime();
        var to = from.advance({
            day: 1
        });
        IRC.messagesController.set('date', from);
        $.couch.db('irc').view('viewer/messages', {
            success: function(data) {
                if (data && data.rows && data.rows.length > 0) {
                    data.rows.forEach(function(row) {
                        IRC.messagesController.addMessage(row.doc);
                    });
                }
                IRC.messagesController.set('loading', false);
            },
            include_docs: true,
            reduce: false,
            startkey: IRC.getDateArray(from, 'year', 'month', 'day'),
            endkey: IRC.getDateArray(to, 'year', 'month', 'day')
        });
    }

}));
IRC.dataSource.loadDay(IRC.createDateTime().adjust({
    hour: 0,
    timezone: 0
}));

$.couch.db('irc').view('viewer/messages', {
    success: function(data) {
        if (data && data.rows && data.rows.length > 0) {
            data.rows.forEach(function(doc) {
                var key = doc.key;
                var date = Ember.DateTime.create().adjust({
                    year: key[0],
                    month: key[1],
                    day: key[2],
                    hour: 0,
                    timezone: 0
                });
                IRC.daysController.addDay({
                    date: date,
                    count: doc.value
                });
            });
        }
        IRC.daysController.set('loading', false);
    },
    group_level: 3,
    descending: true
});