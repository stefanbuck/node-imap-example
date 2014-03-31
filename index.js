var Imap = require('imap'),
    inspect = require('util').inspect;

var imap = new Imap({
    user: 'you@mail.com',
    password: 'password',
    host: 'imap.mail.com',
    port: 143,
    tls: false
});

function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
}

imap.once('ready', function() {
    openInbox(function(err, box) {
        if (err) throw err;

        var f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)','TEXT'] });
        var mail;
        f.on('message', function(msg, seqno) {

            msg.on('body', function(stream, info) {
                var buffer = '';
                mail = {};

                stream.on('data', function(chunk) {
                    buffer += chunk.toString('utf8');
                });
                stream.once('end', function() {
                    if (info.which == 'TEXT') {
                        mail.body = buffer;
                    } else if( info.which === 'HEADER.FIELDS (FROM SUBJECT DATE)') {
                        mail.header = Imap.parseHeader(buffer);
                    }
                });
            });
            msg.once('attributes', function(attrs) {
//                console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
            });
        });
        f.once('error', function(err) {
            console.log('Fetch error: ' + err);
        });
        f.once('end', function() {
            console.log('Done fetching all messages!');
            console.log( mail.header );
            imap.end();
        });
    });
});

imap.once('error', function(err) {
    console.log(err);
});

imap.once('end', function() {
    console.log('Connection ended');
});

imap.connect();
