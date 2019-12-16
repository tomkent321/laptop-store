// all these are part of Node:
const fs = require('fs'); // file system
const http = require('http'); // web server
const url = require('url');
const store = require('./data/data.json');
// const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
// const laptopData = JSON.parse(json);
// console.log('laptop: ', laptopData);

const server = http.createServer((req, res) => {
  const pathName = url.parse(req.url, true).pathname; //note case of object property!
  const id = url.parse(req.url, true).query.id;

  res.writeHead(200, { 'Content-type': 'text/html' });
  switch (pathName) {
    // PRODUCT OVERVIEW
    case '/products':
    case '/':
      let queryProduct = `${__dirname}/templates/template-overview.html`;
      let queryLaptops = `${__dirname}/templates/template-card.html`;

      fs.readFile(queryProduct, 'utf-8', (err, data) => {
        let overviewOutput = data;
        fs.readFile(queryLaptops, 'utf-8', (err, data) => {
          const cardsOutput = store.map(el => replaceTemplate(data, el)).join('');
          overviewOutput = overviewOutput.replace('{%CARDS%}', cardsOutput);

          res.end(overviewOutput);
        });
      });

      break;
    case '/laptop':
      // LAPTOP DETAIL
      if (id < store.length) {
        let queryString = `${__dirname}/templates/template-laptop.html`;
        fs.readFile(queryString, 'utf-8', (err, data) => {
          if (err) throw err;
          const storeD = store[id];
          const output = replaceTemplate(data, storeD);
          res.end(output);
        });
      } else {
        res.end(`Invalid id entered..`);
      }
      break;

    // URL NOT FOUND or is an image
    default:
      if (/\.(jpg|jpeg|png|gif)$/i.test(pathName)) {
        // console.log('pathName: ', pathName);
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
          if (err) throw err;
          res.writeHead(200, { 'Content-type': 'img/jpg' });
          res.end(data);
        });
      } else {
        res.writeHead(400, { 'Content-type': 'text/html' });
        res.end('Page not found');
      }

      break;
  }

  // console.log('req.url: ', req.url);
  // console.log('pathName: ', pathName);
});

const port = 1337;
server.listen(port, '127.0.0.1', () => {
  console.log('now listening on port: ', port);
});

// uses a regular expression in the replace to allow multiple replacements of the same placeholder. Otherwise would only replace the first (there are 2 price fields in this template)
function replaceTemplate(originalHtml, storeD) {
  let output = originalHtml.replace(/{%PRODUCTNAME%}/g, storeD.productName);
  output = output.replace(/{%IMAGE%}/g, storeD.image);
  output = output.replace(/{%PRICE%}/g, storeD.price);
  output = output.replace(/{%CPU%}/g, storeD.cpu);
  output = output.replace(/{%STORAGE%}/g, storeD.storage);
  output = output.replace(/{%RAM%}/g, storeD.ram);
  output = output.replace(/{%SCREEN%}/g, storeD.screen);
  output = output.replace(/{%DESCRIPTION%}/g, storeD.description);
  output = output.replace(/{%ID%}/g, storeD.id);
  return output;
}
