class CarritoCompra{
    constructor(){
        this.productos = [];
    }

    agregarProducto(producto){
        this.productos.push(producto);
    }
    calcularTotal() {
        let total = 0;
        this.productos.forEach(producto => {
            total += producto.precio;
        });
        return total;
    }
    aplicarDescuento(porcentaje) {
        const descuento = (porcentaje / 100) * this.calcularTotal();
        return this.calcularTotal() - descuento;
    }
}

module.exports = CarritoCompra;