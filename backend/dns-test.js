const dns = require("dns").promises;

(async () => {
  try {
    const records = await dns.resolveSrv(
      "_mongodb._tcp.beereddyagency.2yyulp6.mongodb.net"
    );
    console.log(records);
  } catch (err) {
    console.error(err);
  }
})();