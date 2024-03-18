const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")

let cart = []

// Abrir o modal do carrinho
cartBtn.addEventListener("click", () => {
    updateCartModal()
    cartModal.style.display = "flex"
})

// Fechar o modal quando clicar fora
cartModal.addEventListener("click", (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = "none"
    }
})

// Fechar o modal quando clicar no botão Fechar
closeModalBtn.addEventListener("click", (event) => {
    cartModal.style.display = "none"
})

// Clique de adicionar item de cada elemento
menu.addEventListener("click", (event) => {
    let parentButton = event.target.closest(".add-to-cart-btn")

    if (parentButton) {
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))

        // Adicionar no carrinho
        addToCart(name, price)
    }
})


// Função para adicionar no carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name)

    if (existingItem) {
        existingItem.quantity += 1        
    } else {    
        cart.push({
            name,
            price,
            quantity: 1
        })
    }

    updateCartModal()
}

// Atualiza o carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = ""
    let total = 0

    cart.forEach(item => {
        const cartItemElement = document.createElement("div")
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col")


        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class="font-medium mt-2">${item.price.toLocaleString("pt-BR", { 
                        style: "currency", 
                        currency: "BRL" 
                    })}</p>                    
                </div>

                <button class="remove-from-cart-btn" data-name="${item.name}">
                    Remover
                </button>
            </div>
        `

        total += item.price * item.quantity

        cartItemsContainer.appendChild(cartItemElement)
    })

    cartTotal.textContent = total.toLocaleString("pt-BR", { 
        style: "currency", 
        currency: "BRL" 
    })

    cartCounter.innerHTML = cart.length

}

// Função para remover o item do carrinho
cartItemsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name")
        removeItemCart(name)
    }
})

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name)
    if (index !== -1) {
        const item = cart[index]

        if (item.quantity > 1) {
            item.quantity -= 1
        } else {
            cart.splice(index, 1)
        }

        updateCartModal()
    }
}

addressInput.addEventListener("input", (event) => {
    let inputValue  = event.target.value

    if (inputValue !== "") {
        addressWarn.classList.add("hidden")
        addressInput.classList.remove("border-red-500")
    }
})

// Finalizar o pedido
checkoutBtn.addEventListener("click", (event) => {
    const isOpen = checkRestauranteIsOpen()
    if (!isOpen) {
        Toastify({
            text: "Ops... o restaurante está fechado!!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#EF4444"
            }
        }).showToast()

        return
    }

    if (cart.length === 0) return
    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden")
        addressInput.classList.add("border-red-500")
        return
    }

    // Enviar pedido para API WhatsApp
    const cartItems = cart.map(item => {
        return (
            ` ${item.name} Quantidade ${item.quantity} Preço R$ ${item.price} |`
        )
    }).join("")

    const message = encodeURIComponent(cartItems)
    const phone = "19993576096";

    window.open(`https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`, "_blank")

    // Zerar o carrinho
    cart = []
    updateCartModal()
})

// Verificar a hora e manipular o card horário
function checkRestauranteIsOpen() {
    const data = new Date()
    const hora = data.getHours()
    return hora >= 18 && hora < 22 // true = restaurante está aberto
}

const spanItem = document.getElementById("date-span")
const isOpen = checkRestauranteIsOpen()

if (isOpen) {
    spanItem.classList.remove("bg-red-600")
    spanItem.classList.add("bg-green-600")
} else {
    spanItem.classList.remove("bg-green-600")
    spanItem.classList.add("bg-red-600")
}

// TESTE
document.addEventListener("DOMContentLoaded", function () {
    // Carregar itens do menu do JSON
    fetch("menu.json")
        .then(response => response.json())
        .then(data => {
            const menuItemsContainer = document.getElementById("menu-items");

            data.forEach(item => {
                const menuItem = `
                    <div class="flex gap-2">
                        <img src="${item.img}" alt="${item.nome}" class="w-28 h-28 rounded-md hover:scale-110 hover:-rotate-2 duration-300" />
                        <div>
                            <p class="font-bold">${item.nome}</p>
                            <p class="text-sm">${item.descricao}</p>
                            <div class="flex items-center gap-2 justify-between mt-3">                                
                                <p class="font-bold text-lg">${item.preco.toLocaleString("pt-BR", { 
                                    style: "currency", 
                                    currency: "BRL" 
                                })}</p>                                
                                <button class="bg-gray-900 px-5 rounded add-to-cart-btn" data-name="${item.nome}" data-price="${item.preco.toFixed(2)}">
                                    <i class="fa fa-cart-plus text-lg text-white"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                menuItemsContainer.insertAdjacentHTML("beforeend", menuItem);
            });
        })
        .catch(error => console.error("Erro ao carregar itens do menu:", error));
});
// TESTE