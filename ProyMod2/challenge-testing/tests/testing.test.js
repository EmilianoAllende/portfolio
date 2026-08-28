const CarritoCompra = require('./index');

describe('CarritoCompra', () => {
    let carrito;

    beforeEach(() => {
        carrito = new CarritoCompra();
        carrito.agregarProducto({ nombre: 'Chones', precio: 1000 });
        carrito.agregarProducto({ nombre: 'Zapatillas', precio: 25000 });
    });

    it('Agregar un producto incrementa el tamaño del carrito', () => {
        expect(carrito.productos.length).toBe(2);
    });

    it('Calcular total de la compra', () => {
        expect(carrito.calcularTotal()).toBe(26000);
    });

    it('Aplicar descuento al total de la compra', () => {
        expect(carrito.aplicarDescuento(10)).toBe(23400);
    });
});