document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Pashmina kaos", img: "1.jpg", price: 45000 },
      { id: 2, name: "Malay Scarf", img: "2.jpg", price: 40000 },
      { id: 3, name: "Polycatton Scarf", img: "3.jpg", price: 30000 },
      { id: 4, name: "Paris Jadul", img: "4.jpg", price: 28000 },
      { id: 5, name: "Basic Scarf", img: "5.jpg", price: 28000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      //cek apakah ada barang yang sama di keranjang
      const cartItem = this.items.find((item) => item.id === newItem.id);

      //jika belum ada/cart masih kosong

      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        this.items = this.items.map((item) => {
          //jika barang ada cek apakah barang beda atau sama dengan yang ada di cart
          if (item.id !== newItem.id) {
            return item;
          } else {
            //jika baranf sudah ada, tambahkan quantity dan subtotal
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
      console.log(this.total);
    },

    remove(id) {
      const cartItem = this.items.find((item) => item.id === id);
      if (cartItem.quantity > 1) {
        this.items = this.items.map((item) => {
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
      checkoutButton.classList.add("disabled");
    } else {
      return false;
    }
  }
  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

// kirim data ketika tombol checkout diklik
checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  // const message = formatMessage(objData);
  // window.open("https://wa.me/?text=" + encodeURIComponent(message));
  //minta transacrtion token dari server
  try {
    const response = await fetch("php/placeOrder.php", {
      method: "POST",
      body: data,
    });
    const token = await response.text();
    // console.log(token);
    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

//format pesan whangsapp
// format pesan whatsapp
const formatMessage = (obj) => {
  return `Data Customer
    Nama: ${obj.name}
    Email: ${obj.email}
    No HP: ${obj.phone}
Data Pesanan
${JSON.parse(obj.items).map(
  (item) => `${item.name} (${item.quantity} x ${rupiah(item.total)}) \n`,
)}
TOTAL: ${rupiah(obj.total)}
Terima kasih.`;
};

//konfersi ke rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
