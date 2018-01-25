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
const https = require("https");
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

app.use(route.get("/api/dump/", (ctx) => {
  ctx.body = ctx;
}));

app.use(route.get("/api/secure/", (ctx) => {
  ctx.body = {
    secure: ctx.secure,
  };
}));

// non-api routes get redirected to tls
app.use(forceSecure);
const staticOpts = {
  hidden: true,
};

app.use(koaStatic(__dirname + "/static", staticOpts));
app.use(badurl);


// route handlers
async function verbose(ctx, next) {
  console.log("request:  " + JSON.stringify(ctx.request));
  return next();
}

async function forceSecure(ctx, next) {
  if (ctx.secure)
    return next();
  else {
    const host = ctx.request.header.host;
    const path = ctx.request.url;
    const url = "https://" + host + path;
    console.log("redirecting to tls:  " + url);
    ctx.response.redirect(url);
  }
}

async function badurl(ctx, next) {
  console.log("badurl: " + ctx.request.originalUrl);
  console.log(JSON.stringify(ctx.request, null, 4));
  ctx.throw(404, "Not found", "Not Found");
}

const letsEncryptPath = "/etc/letsencrypt/live/www.harrypehkonen.com";
const certpath = fs.existsSync(letsEncryptPath)
  ? letsEncryptPath
  : process.cwd();
const httpsOptions = {
  key: fs.readFileSync(certpath + "/privkey.pem"),
  cert: fs.readFileSync(certpath + "/cert.pem"),
};

http
  .createServer(app.callback())
  .listen(80)
;

https
  .createServer(httpsOptions, app.callback())
  .listen(443)
;
