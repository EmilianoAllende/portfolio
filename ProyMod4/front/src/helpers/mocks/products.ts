//types
import { IProduct } from '@/interfaces/Product';

const productsMock: IProduct[] = [
    {
        id: 0,
        name: "MOCK HomePod mini",
        image:
        "https://static1.pocketnowimages.com/wordpress/wp-content/uploads/2023/06/apple-macbook-air-15-background-removed.png?q=50&fit=contain&w=480&h=480&dpr=1.5",
        price: 99,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        stock: 10,
        categoryId: 1,
    },
    {
        id: 1,
        name: "MOCK  AirPods Pro",
        image:
        "https://e7.pngegg.com/pngimages/478/694/png-clipart-apple-airpods-new-in-box-lightning-bluetooth-airpods-white-bluetooth-thumbnail.png",
        price: 279,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        stock: 10,
        categoryId: 2,
    },
    {
        id: 2,
        name: "MOCK Apple Watch Series 7",
        image:
        "https://img.freepik.com/premium-psd/smartwatch-realistic-isolated-transparent-background_1034016-12709.jpg",
        price: 429,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        stock: 10,
        categoryId: 3,
    },
    {
        id: 3,
        name: "MOCK HomePod mini",
        image:
        "https://www.apple.com/v/homepod-mini/j/images/overview/hero_homepod_white__fbci8wwv3oi2_large.png",
        price: 99,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        stock: 10,
        categoryId: 1,
    },
    {
        id: 4,
        name: "MOCK AirPods Pro",
        image:
        "https://e7.pngegg.com/pngimages/478/694/png-clipart-apple-airpods-new-in-box-lightning-bluetooth-airpods-white-bluetooth-thumbnail.png",
        price: 279,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        stock: 10,
        categoryId: 2,
    },
    {
        id: 5,
        name: "MOCK Apple Watch Series 7",
        image:
        "https://img.freepik.com/premium-psd/smartwatch-realistic-isolated-transparent-background_1034016-12709.jpg",
        price: 429,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        stock: 10,
        categoryId: 3,
    },
    {
        id: 6,
        name: "MOCK HomePod mini",
        image:
        "https://www.apple.com/v/homepod-mini/j/images/overview/hero_homepod_white__fbci8wwv3oi2_large.png",
        price: 99,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        stock: 10,
        categoryId: 1,
    },
    {
        id: 7,
        name: "MOCK AirPods Pro",
        image:
        "https://e7.pngegg.com/pngimages/478/694/png-clipart-apple-airpods-new-in-box-lightning-bluetooth-airpods-white-bluetooth-thumbnail.png",
        price: 279,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        stock: 10,
        categoryId: 2,
    },
    {
        id: 8,
        name: "MOCK Apple Watch Series 7",
        image:
        "https://img.freepik.com/premium-psd/smartwatch-realistic-isolated-transparent-background_1034016-12709.jpg",
        price: 429,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        stock: 10,
        categoryId: 3,
    },
];

export default productsMock;