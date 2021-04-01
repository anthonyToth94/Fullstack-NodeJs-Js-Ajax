const state = {
  product: [],
  editedId: "",
};

window.onload = render;

function render() {
  fetch("/products")
    .then((response) => {
      if (!response.ok) {
        console.log("Szerver hiba");
        return;
      }
      return response.json();
    })
    .then((data) => {
      content = "";
      for (elem of data) {
        content += `<div class="box">
            <img class="myImg " src="${elem.img}" alt="${elem.name}" width="200px" />
            <div id="myModal" class="modal">
            <span class="close">&times;</span>
            <img class="modal-content" id="img01">
            <div id="caption"></div>
            </div>
            <h3>${elem.name}</h3>
            <p>
            ${elem.content}
            </p>
            <button class="details" data-productid=${elem.id}>Show</button>
          </div>`;
      }
      document.querySelector("main").style.justifyContent = "flex-start";
      document.querySelector("main").innerHTML = content;
      myModal();

      showButton();
    });
}

document.querySelector("#create").addEventListener("click", (event) => {
  event.preventDefault();

  hideShow();

  document.querySelector("main").innerHTML = "";
  document.querySelector("main").style.justifyContent = "center";
  content = `<form id="createForm">
     <div><input id="createName" type="text" placeholder="Neve.." required autocomplete="off" name="name"></div>
     <div><textarea id="createDescription" name="description" rows="4" cols="28"></textarea></div>
     <input id="küld" type="submit" value="Küldés"></form>`;

  document.querySelector("main").innerHTML = content;

  document.querySelector("#createForm").onsubmit = async function (event) {
    event.preventDefault();

    const name = event.target.elements.name.value;
    const description = event.target.elements.description.value;

    images = [
      "/img/random/pic0.jpg",
      "/img/random/pic1.jpg",
      "/img/random/pic2.jpg",
    ];

    const number = Math.floor(Math.random() * images.length);

    const response = await fetch("/products", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        img: images[number],
        content: description,
      }),
      headers: {
        "Content-type": "application/json",
      },
    });

    console.log(images[number]);
    if (!response.ok) {
      console.log("Szerver hiba");
      return;
    }

    const data = await response.json();

    render();
  };
});

function myModal() {
  var modal = document.getElementById("myModal");

  // Get the image and insert it inside the modal - use its "alt" text as a caption
  var img = document.querySelectorAll(".myImg");
  var modalImg = document.getElementById("img01");
  var captionText = document.getElementById("caption");
  for (image of img) {
    image.onclick = function () {
      modal.style.display = "block";
      modalImg.src = this.src;
      captionText.innerHTML = this.alt;
    };
  }

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  };
}

function showButton() {
  const showButton = document.querySelectorAll(".details");
  let content2 = "";
  for (show of showButton) {
    show.onclick = async function (event) {
      const id = event.target.dataset.productid;

      const response = await fetch(`/products/${id}`);

      if (!response.ok) {
        console.log("Server Error");
        return;
      }
      const product = await response.json();

      content2 = `
      <div id="first"><img src="${product.img}" alt="${product.name}" width="200px"></div>
      <div id="second"><h3>${product.name}</h3>
      <p>${product.content}</p>
      <button class="edit" data-productid=${product.id}>Edit</button>
      <button class="delete" data-productid=${product.id}>Delete</button></div>`;

      const hr = document.createElement("HR");
      hr.style.width = "142rem";
      hr.style.margin = "auto";

      const main = document.getElementsByTagName("main")[0];
      const container = document.querySelectorAll(".container")[1];

      if (container.childNodes[2].nodeName != "HR") {
        main.parentNode.insertBefore(hr, main.nextSibling);
      }

      const section = document.getElementsByTagName("section")[0];
      section.innerHTML = content2;

      deleteButton();
      editButton();
    };
  }
}

function deleteButton() {
  const deleteButton = document.querySelectorAll(".delete");
  let content = "";
  for (element of deleteButton) {
    element.onclick = async function (event) {
      event.preventDefault();

      const id = event.target.dataset.productid;

      const response = await fetch(`/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.log("Server Error");
        return;
      }
      const data = await response.json();

      render();
      hideShow();
    };
  }
}

function editButton() {
  const editButton = document.querySelectorAll(".edit");
  let content = "";
  for (element of editButton) {
    element.onclick = async function (event) {
      event.preventDefault();

      const id = event.target.dataset.productid;
      state.editedId = id;

      const response = await fetch(`/products/${id}`);
      if (!response.ok) {
        console.log("Server Error");
        return;
      }

      const product = await response.json();

      const second = document.querySelector("#second");
      second.innerHTML = `<form id="formEdit"><div><input type="text" class="editContent" value="${product.name}" autocomplete="off" name="name"></div>
       <div><input class="editContent" type="text" value="${product.content}" autocomplete="off" name="description"></div>
       <button class="edit done" data-productid=${product.id}>Done</button></form>`;

      formEdit.onsubmit = function (event) {
        event.preventDefault();

        name = event.target.elements.name.value;
        img = product.img;
        content = event.target.elements.description.value;

        const body = JSON.stringify({
          name: name,
          img: img,
          content: content,
        });

        fetch(`/products/${state.editedId}`, {
          method: "PUT",
          body: body,
          headers: {
            "Content-type": "application/json",
          },
        })
          .then((resp) => {
            if (!resp.ok) {
              console.log("Server Hiba");
              return;
            }
            return resp.json();
          })
          .then((data) => {
            render();
            hideShow();
          });
      };
    };
  }
}

function hideShow() {
  const section = document.getElementsByTagName("section")[0];
  section.innerHTML = "";

  const main = document.getElementsByTagName("main")[0];
  const container = document.querySelectorAll(".container")[1];

  if (container.childNodes[2].nodeName == "HR") {
    container.removeChild(container.childNodes[2]);
  }
}
