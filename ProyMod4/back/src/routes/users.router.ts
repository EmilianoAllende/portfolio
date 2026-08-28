import { Request, Response, Router } from "express";
import validateUserRegister from "../middlewares/userRegister.middleware";
import validateUserLogin from "../middlewares/userLogin.middleware";
import { login, registerUser } from "../controllers/user.controller";
import checkLogin from "../middlewares/checkLogin.middleware";
import { OrderRepository } from "../repositories/order.repository";

const usersRouter = Router();

usersRouter.post("/register", validateUserRegister, registerUser);

usersRouter.post("/login", validateUserLogin, login);

usersRouter.get("/orders", checkLogin, async (req: Request, res: Response) => {
  console.log("Query params:", req.query);
  const userId = Number(req.query.userId);
  const orders = await OrderRepository.find({
    relations: ["products"],
    where: { user: { id: userId } },
  });

  const sanitizedOrders = orders.map(order => ({
    ...order,
    products: order.products ?? [], // ← Si es null o undefined, lo reemplaza por []
  }));

  res.send(sanitizedOrders);
});

export default usersRouter;
