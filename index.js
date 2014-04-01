var Imap = require('imap'),
    MailParser = require('mailparser').MailParser,
    debug = require('./utils/debug'),
    imap = null,
    mails = [],
    env = process.env.NODE_ENV || 'development';

var config = require('./env/' + env);

imap = new Imap( config );

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

imap.once('ready', function () {
  openInbox(function (err) {
    if (err) {
      throw err;
    }

    imap.sort([ '-ARRIVAL' ], [ 'UNSEEN' ], function (err, results) {
      if (err) {
        throw err;
      }

      if (results.length === 0) {
        debug('Nothing to fetch');
        return imap.end();
      }

      var fetch = imap.fetch(results, {
        markSeen: true,
        bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT']
      });

      fetch.on('message', function (msg) {

        var parser = new MailParser();

        parser.on('end', function (mail) {
          mails.push(mail);
        });

        msg.on('body', function (stream) {
          stream.on('data', function (chunk) {
            parser.write(chunk.toString());
          });
          stream.once('end', function () {
            parser.end();
          });
        });

      });

      fetch.on('error', function (err) {
        debug('Fetch error: ' + err);
      });

      fetch.on('end', function () {
        debug('Done fetching all messages!');
        imap.end();
      });

    });
  });
});

imap.on('error', function (err) {
  debug(err);
});

imap.on('end', function () {
  debug('Connection ended');
  debug(mails);
});

imap.connect();
