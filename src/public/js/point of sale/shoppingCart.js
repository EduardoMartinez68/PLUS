const cartItems = [];
let cartTotal = 0;

async function addToCart(img, name, barcode, price, purchaseUnit, this_product_is_sold_in_bulk) {
    const existingItem = cartItems.find(item => item.barcode === barcode);
    if (existingItem) {
        //we will see if the product is sold in bulk
        if(this_product_is_sold_in_bulk=='true'){
            //update the cant of the product in the scale 
            document.getElementById('scales-store-weight-input').value=existingItem.quantity;
            update_weight_of_the_scale();

            //get the new cant that the user would like buy
            let quantityForSales=await open_ui_weight_scale(barcode, name, price, 0, 0, 1);

            //we will see if the user delete the product
            if(quantityForSales<=0){
                await removeItem(barcodeEditProduct);
            }
            else{
                existingItem.quantity = quantityForSales; //update the product in the cart
            }
        }else{
            existingItem.quantity += 1; //update the product in the cart
        }

        notificationMessage(`${existingItem.name} fue agregado ❤️`, 'El Producto fue agregado correctamente');
    } else {
        let quantityForSales=1; //this is for the product that are sale for unit

        //we will see if the product is sold in bulk
        if(this_product_is_sold_in_bulk=='true'){
            //if the product is sould in bulk, we will ask the user the quantity of the product
            quantityForSales=await open_ui_weight_scale(barcode, name, price, 0, 0, 1);
        }

        cartItems.push({
            img: document.getElementById(img).src,
            name,
            barcode,
            price,
            quantity: quantityForSales,
            discount: 0,
            purchaseUnit,
            this_product_is_sold_in_bulk:this_product_is_sold_in_bulk
        });

        notificationMessage(`${name} fue agregado ❤️`, 'El Producto fue agregado correctamente');
    }
    updateCart();
}

function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    cartItems.forEach(item => {
        const itemTotal = (item.price - item.discount) * item.quantity;
        cartItemsContainer.innerHTML += `
            <div class="cart-item-point-of-sales">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info-point-of-sales">
                <div class="cart-item-name-point-of-sales">${item.name}</div>
                <div class="cart-item-barcode-point-of-sales">Código: ${item.barcode}</div>
                Cant.
                <input type="button" class="cart-item-quantity-point-of-sales" value="${item.quantity}" onclick="editCant(this,'${item.barcode}')" onchange="updateItemQuantity('${item.barcode}', this.value)"> ${item.purchaseUnit}
                <br>
                Desc.
                <input type="button" class="cart-item-discount-point-of-sales" value="${item.discount}" onchange="updateItemDiscount('${item.barcode}', this.value)">
                <div class="cart-item-price-point-of-sales">Precio: $${item.price.toFixed(2)}</div> 
                <div class="cart-item-total-point-of-sales">Total: $${itemTotal.toFixed(2)}</div>
                </div>
                <button class="cart-item-remove-point-of-sales" onclick="removeItem('${item.barcode}')">X</button>
            </div>
        `;
    });

    //her we update the price of the shopping cart
    cartTotal = cartItems.reduce((total, item) => total + (item.price - item.discount) * item.quantity, 0);
    document.getElementById('cart-total').textContent = cartTotal.toFixed(2);

    //her we update the number of product that exist in the shopping cart
    document.getElementById('products-total').textContent = cartItems.length;
}

function updateItemQuantity(barcode, quantity) {
    const item = cartItems.find(item => item.barcode === barcode);
    if (item) {
        item.quantity = parseInt(quantity);
        updateCart();
    }
}

function updateItemDiscount(barcode, discount) {
    const item = cartItems.find(item => item.barcode === barcode);
    if (item) {
        item.discount = parseFloat(discount);
        updateCart();
    }
}

async function removeItem(barcode) {
    //her we will see if the user would like delete the product
    if (await questionMessage('Eliminar Producto 🤔', '¿Estás seguro de querer eliminar este producto?')) {
        //if the user would like delete the product, we will delete the product
        const index = cartItems.findIndex(item => item.barcode === barcode);
        if (index !== -1) {
            cartItems.splice(index, 1);
            updateCart();
        }
        notificationMessage('Producto eliminado 👍', 'El Producto fue eliminado correctamente')
    }
}

function buyItems() {
    alert('Compra realizada con éxito');
    cartItems.length = 0; // Limpiar carrito
    updateCart();
}

