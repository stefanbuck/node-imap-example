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

imap.once('ready', function () {
    openInbox(function (err, box) {
        if (err) throw err;

        imap.sort([ '-ARRIVAL' ], [ 'UNSEEN' ], function (err, results) {
            if (err) throw err;

            if(results.length === 0) {
                console.log('Nothing to fetch');
                return imap.end();
            }

            var f = imap.fetch(results, {
                markSeen: true,
                bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT']
            });
            var mail;
            f.on('message', function (msg, seqno) {

                msg.on('body', function (stream, info) {
                    var buffer = '';
                    mail = {};

                    stream.on('data', function (chunk) {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', function () {
                        if (info.which == 'TEXT') {
                            mail.body = buffer;
                        } else if (info.which === 'HEADER.FIELDS (FROM SUBJECT DATE)') {
                            mail.header = Imap.parseHeader(buffer);
                        }
                    });
                });
                msg.once('end', function () {
                    console.log(mail);
                    mail = {};
                });
            });
            f.once('error', function (err) {
                console.log('Fetch error: ' + err);
            });
            f.once('end', function () {
                console.log('Done fetching all messages!');
                imap.end();
            });
        });
    });
});

imap.once('error', function (err) {
    console.log(err);
});

imap.once('end', function () {
    console.log('Connection ended');
});

imap.connect();