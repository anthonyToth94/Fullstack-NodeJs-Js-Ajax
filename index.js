const fs = require("fs");
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

/* 

  Erőforrások
  id: Number,
  name: string
  img: string
  content: string

  CRUD  => Create Read Read Update Delete
                        ID    ID     ID 

*/

app.use(express.static("public"));

// -> / GET
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

//READ
app.get("/products", (req, res) => {
  fs.readFile(__dirname + "/data/products.json", (err, data) => {
    res.status(200).send(JSON.parse(data));
  });
});

//READ BY ID
app.get("/products/:egyediAzonosito", (req, res) => {
  const id = req.params.egyediAzonosito;

  fs.readFile(__dirname + "/data/products.json", (err, data) => {
    const products = JSON.parse(data);

    const element = products.find((e) => e.id === id);

    if (!element) {
      res.status(404);
      res.send({ error: `${id} is not found!` });
      return;
    }

    res.status(200).send(element);
  });
});

//CREATE
app.post("/products", bodyParser.json(), (req, res) => {
  const newProduct = {
    id: randomIdGen(),
    name: sanitizeString(req.body.name),
    img: req.body.img,
    content: sanitizeString(req.body.content),
  };

  fs.readFile(__dirname + "/data/products.json", (err, data) => {
    const products = JSON.parse(data);

    products.push(newProduct);

    fs.writeFile(
      __dirname + "/data/products.json",
      JSON.stringify(products),
      () => {
        res.status(200).send(newProduct);
      }
    );
  });
});

//UPDATE
app.put("/products/:egyediAzonosito", bodyParser.json(), (req, res) => {
  const id = req.params.egyediAzonosito;

  fs.readFile(__dirname + "/data/products.json", (err, data) => {
    const products = JSON.parse(data);

    const indexById = products.findIndex((elem) => elem.id === id);

    if (indexById === -1) {
      res.status(404);
      res.send({ error: `${id} is not found!` });
      return;
    }

    const updatedProduct = {
      id: id,
      name: sanitizeString(req.body.name),
      img: req.body.img,
      content: sanitizeString(req.body.content),
    };

    products[indexById] = updatedProduct;

    fs.writeFile(
      __dirname + "/data/products.json",
      JSON.stringify(products),
      () => {
        res.status(200).send(updatedProduct);
      }
    );
  });
});

//DELETE
app.delete("/products/:egyediAzonosito", (req, res) => {
  const id = req.params.egyediAzonosito;

  fs.readFile(__dirname + "/data/products.json", (err, data) => {
    const products = JSON.parse(data);

    const indexById = products.findIndex((elem) => elem.id === id);

    if (indexById === -1) {
      res.status(404);
      res.send({ error: `${id} is not found!` });
      return;
    }

    products.splice(indexById, 1);
    fs.writeFile(
      __dirname + "/data/products.json",
      JSON.stringify(products),
      () => {
        res.status(200).send({ id: id });
      }
    );
  });
});

app.listen(3000);

function randomIdGen() {
  const rnd = [
    ["A", "B", "C", "D", "E", "F"],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  ];
  let myNum = "";
  for (let one = 0; one < 2; one++) {
    let random = Math.floor(Math.random() * rnd[0].length);
    myNum += rnd[0][random];

    for (let i = 0; i < 2; i++) {
      let random2 = Math.floor(Math.random() * rnd[1].length);
      i == 1 ? (myNum += rnd[1][random2] + "-") : (myNum += rnd[1][random2]);
    }
  }

  let myNumSub = myNum.substr(0, 7);
  //console.log(myNumSub);
  return myNumSub;
}

function sanitizeString(str) {
  str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, "");
  return str.trim();
}
