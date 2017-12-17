// const http = require("http2");
const http = require("http");
const https = require("https");
const http2 = require("http2");
const fs = require("fs");

const Koa = require("koa");
const route = require("koa-route");
const koaStatic = require("koa-static");
const app = new Koa();

app.use(async function(ctx, next) {
  console.log("!!!");
  await next();
});
app.use(route.get("/api/:whatever", everything));
app.use(koaStatic(__dirname + "/static"));
app.use(badurl);

async function everything(ctx, next) {
  console.log("everything");
  ctx.body = "Hello World!";
}

async function badurl(ctx, next) {
  console.log("badurl: " + ctx.request.originalUrl);
  console.log(JSON.stringify(ctx.request, null, 4));
  ctx.throw(404, "Not found :D", "Not Found :S");
}

const httpsOptions = {
  key: fs.readFileSync('./localhost.key'),
  cert: fs.readFileSync('./localhost.cert'),
};

// http
//   .createServer(app.callback())
//   .listen(80)
// ;

// https
//   .createServer(httpsOptions, app.callback())
//   .listen(443)
// ;

http2
  .createSecureServer(httpsOptions, app.callback())
  .listen(443)
;
