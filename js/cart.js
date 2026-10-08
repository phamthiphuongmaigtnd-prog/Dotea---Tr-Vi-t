// Quan ly gio hang bang localStorage
var CART_KEY = 'cart';

// Lay gio hang tu localStorage
function getCart() {
    var data = localStorage.getItem(CART_KEY);
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// Luu gio hang vao localStorage
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Dinh dang tien te VND
function formatCurrency(amount) {
    return Number(amount).toLocaleString('vi-VN') + ' đ';
}

// Them san pham vao gio hang
function addToCart(product) {
    var cart = getCart();
    var existingIndex = -1;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].name === product.name) {
            existingIndex = i;
            break;
        }
    }

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            name: product.name,
            price: product.price,
            img: product.img,
            quantity: 1
        });
    }

    saveCart(cart);
    alert('Đã thêm sản phẩm ' + product.name + ' vào giỏ hàng!');
}

// Gan su kien cho nut Them vao gio hang tren trang san pham
function setupProductButtons() {
    var buttons = document.querySelectorAll('.add-cart');
    if (!buttons || buttons.length === 0) return;

    buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var card = btn.closest('.product-card');
            if (!card) return;

            var nameEl = card.querySelector('h2');
            var priceEl = card.querySelector('.product-price');
            var imgEl = card.querySelector('.product-image img');

            var name = nameEl ? nameEl.textContent.trim() : 'Sản phẩm';
            var priceText = priceEl ? priceEl.textContent : '0';
            var price = parseInt(priceText.replace(/\D/g, ''), 10) || 0;
            var img = imgEl ? imgEl.getAttribute('src') : '';

            addToCart({
                name: name,
                price: price,
                img: img
            });
        });
    });
}

// Hien thi danh sach gio hang
function renderCart() {
    var tableBody = document.getElementById('cartTableBody');
    var cartEmpty = document.getElementById('cartEmpty');
    var cartContent = document.getElementById('cartContent');
    var totalPriceEl = document.getElementById('cartTotalPrice');
    var orderSection = document.getElementById('orderSection');

    if (!tableBody) return;

    var cart = getCart();

    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartContent.style.display = 'none';
        if (orderSection) {
            orderSection.style.display = 'none';
        }
        return;
    }

    cartEmpty.style.display = 'none';
    cartContent.style.display = 'block';

    var html = '';
    var total = 0;

    cart.forEach(function(item, index) {
        var subtotal = item.price * item.quantity;
        total += subtotal;

        html += '<tr>' +
            '<td class="cart-product-cell">' +
                (item.img ? '<img src="' + item.img + '" alt="' + item.name + '" class="cart-product-img">' : '') +
                '<span class="cart-product-name">' + item.name + '</span>' +
            '</td>' +
            '<td class="cart-price-cell">' + formatCurrency(item.price) + '</td>' +
            '<td class="cart-qty-cell">' +
                '<div class="quantity-control">' +
                    '<button type="button" class="quantity-btn" onclick="updateItemQuantity(' + index + ', -1)">-</button>' +
                    '<input type="number" class="quantity-input" min="1" value="' + item.quantity + '" onchange="setItemQuantity(' + index + ', this.value)">' +
                    '<button type="button" class="quantity-btn" onclick="updateItemQuantity(' + index + ', 1)">+</button>' +
                '</div>' +
            '</td>' +
            '<td class="cart-subtotal-cell">' + formatCurrency(subtotal) + '</td>' +
            '<td class="cart-action-cell">' +
                '<button type="button" class="btn-delete" onclick="removeItem(' + index + ')">Xóa</button>' +
            '</td>' +
        '</tr>';
    });

    tableBody.innerHTML = html;
    if (totalPriceEl) {
        totalPriceEl.textContent = formatCurrency(total);
    }

    renderOrderReview();
}

// Tang hoac giam so luong
function updateItemQuantity(index, delta) {
    var cart = getCart();
    if (!cart[index]) return;

    var newQty = cart[index].quantity + delta;
    if (newQty < 1) {
        if (confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            cart.splice(index, 1);
        }
    } else {
        cart[index].quantity = newQty;
    }

    saveCart(cart);
    renderCart();
}

// Thay doi so luong truc tiep tu o input
function setItemQuantity(index, value) {
    var cart = getCart();
    if (!cart[index]) return;

    var qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 1) {
        qty = 1;
    }

    cart[index].quantity = qty;
    saveCart(cart);
    renderCart();
}

// Xoa san pham
function removeItem(index) {
    var cart = getCart();
    if (!cart[index]) return;

    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
    }
}

// Loc ky tu an toan
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Hien thi form dat hang
function showOrderForm() {
    var cart = getCart();
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }

    var orderSection = document.getElementById('orderSection');
    if (orderSection) {
        orderSection.style.display = 'block';
        renderOrderReview();
        orderSection.scrollIntoView({ behavior: 'smooth' });

        var nameInput = document.getElementById('orderName');
        if (nameInput) {
            setTimeout(function() {
                nameInput.focus();
            }, 250);
        }
    }
}

// Hien thi san pham da chon va tong tien trong form dat hang
function renderOrderReview() {
    var reviewContainer = document.getElementById('orderReviewItems');
    var reviewTotalEl = document.getElementById('orderReviewTotalPrice');
    if (!reviewContainer) return;

    var cart = getCart();
    var html = '';
    var total = 0;

    cart.forEach(function(item) {
        var subtotal = item.price * item.quantity;
        total += subtotal;
        html += '<div class="order-review-row">' +
            '<span class="order-item-name">' + escapeHtml(item.name) + ' (x' + item.quantity + ')</span>' +
            '<span class="order-item-subtotal">' + formatCurrency(subtotal) + '</span>' +
        '</div>';
    });

    reviewContainer.innerHTML = html;
    if (reviewTotalEl) {
        reviewTotalEl.textContent = formatCurrency(total);
    }
}

// Xu ly xac nhan dat hang
function submitOrder(event) {
    if (event) event.preventDefault();

    var cart = getCart();
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }

    var nameInput = document.getElementById('orderName');
    var phoneInput = document.getElementById('orderPhone');
    var addressInput = document.getElementById('orderAddress');
    var noteInput = document.getElementById('orderNote');

    var name = nameInput ? nameInput.value.trim() : '';
    var phone = phoneInput ? phoneInput.value.trim() : '';
    var address = addressInput ? addressInput.value.trim() : '';
    var note = noteInput ? noteInput.value.trim() : '';

    if (!name || !phone || !address) {
        alert('Vui lòng điền đầy đủ họ và tên, số điện thoại và địa chỉ nhận hàng!');
        return;
    }

    // Kiem tra dinh dang so dien thoai (9 - 11 so)
    var cleanPhone = phone.replace(/[\s\-\.]/g, '');
    if (!/^[0-9]{9,11}$/.test(cleanPhone)) {
        alert('Vui lòng nhập số điện thoại hợp lệ (9 - 11 chữ số)!');
        if (phoneInput) phoneInput.focus();
        return;
    }

    // Tinh tong tien va tao ma don hang
    var totalMoney = 0;
    var totalCount = 0;
    for (var i = 0; i < cart.length; i++) {
        totalMoney += cart[i].price * cart[i].quantity;
        totalCount += cart[i].quantity;
    }

    var orderCode = 'DT' + Math.floor(100000 + Math.random() * 900000);

    // Dien thong tin chi tiet vao khung hoa don trong modal
    var receiptBox = document.getElementById('orderReceiptBox');
    if (receiptBox) {
        receiptBox.innerHTML =
            '<div class="receipt-row">' +
                '<span class="receipt-label">Mã đơn hàng:</span>' +
                '<span class="receipt-value" style="font-weight: bold; color: var(--forest, #725039);">' + orderCode + '</span>' +
            '</div>' +
            '<div class="receipt-row">' +
                '<span class="receipt-label">Người nhận:</span>' +
                '<span class="receipt-value">' + escapeHtml(name) + '</span>' +
            '</div>' +
            '<div class="receipt-row">' +
                '<span class="receipt-label">Số điện thoại:</span>' +
                '<span class="receipt-value">' + escapeHtml(phone) + '</span>' +
            '</div>' +
            '<div class="receipt-row">' +
                '<span class="receipt-label">Địa chỉ:</span>' +
                '<span class="receipt-value">' + escapeHtml(address) + '</span>' +
            '</div>' +
            (note ?
            '<div class="receipt-row">' +
                '<span class="receipt-label">Ghi chú:</span>' +
                '<span class="receipt-value">' + escapeHtml(note) + '</span>' +
            '</div>' : '') +
            '<div class="receipt-row">' +
                '<span class="receipt-label">Tổng thanh toán (' + totalCount + ' sản phẩm):</span>' +
                '<span class="receipt-value">' + formatCurrency(totalMoney) + '</span>' +
            '</div>';
    }

    // Xoa gio hang
    localStorage.removeItem(CART_KEY);

    // Hien thi modal thong bao thanh cong
    var modal = document.getElementById('orderSuccessModal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        alert('Đặt hàng thành công! Cảm ơn bạn đã lựa chọn sản phẩm của Dootea. Dootea sẽ liên hệ với bạn qua số điện thoại để xác nhận đơn hàng. Phí vận chuyển sẽ được thông báo khi xác nhận đơn hàng.');
    }

    // Reset form va render lai gio hang
    var orderForm = document.getElementById('orderForm');
    if (orderForm) orderForm.reset();

    var orderSection = document.getElementById('orderSection');
    if (orderSection) orderSection.style.display = 'none';

    renderCart();
}

// Dong modal thong bao dat hang thanh cong
function closeSuccessModal() {
    var modal = document.getElementById('orderSuccessModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Khoi chay khi trang tai xong
document.addEventListener('DOMContentLoaded', function() {
    setupProductButtons();
    renderCart();

    // Dong modal khi bam ra ngoai vung noi dung
    var modal = document.getElementById('orderSuccessModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeSuccessModal();
            }
        });
    }
});
