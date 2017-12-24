const cluster = require("cluster");
cluster.on("exit", function(worker, code, signal) {
    const exitCode = worker.process.exitCode;
    console.log('Worker ' + worker.process.pid + ' died (' + exitCode + ').  Restarting...');
    cluster.fork();
});
if (cluster.isMaster) {
  console.log('Master pid:  ' + process.pid);
  cluster.fork();
  return;
}

const http = require("http");
const http2 = require("http2");
const fs = require("fs");

const Koa = require("koa");
const route = require("koa-route");
const koaStatic = require("koa-static");
const app = new Koa();
const api = require("./api");

app.use(verbose);

app.use(route.get("/api/", (ctx) => {
  ctx.body = {message: api.sayHi()};
}));

const staticOpts = {
  hidden: true,
};
app.use(koaStatic(__dirname + "/static", staticOpts));
app.use(badurl);

async function verbose(ctx, next) {
  console.log("request:  " + JSON.stringify(ctx.request));
  return next();
}

async function badurl(ctx, next) {
  console.log("badurl: " + ctx.request.originalUrl);
  console.log(JSON.stringify(ctx.request, null, 4));
  ctx.throw(404, "Not found", "Not Found");
}

const certpath = "/etc/letsencrypt/live/www.harrypehkonen.com";
const httpsOptions = {
  key: fs.readFileSync(certpath + "/privkey.pem"),
  cert: fs.readFileSync(certpath + "/cert.pem"),
};

http
  .createServer(app.callback())
  .listen(80)
;

http2
  .createSecureServer(httpsOptions, app.callback())
  .listen(443)
;
