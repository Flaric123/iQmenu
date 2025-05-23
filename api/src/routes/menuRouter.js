import Router from 'express'
import { useAuth } from '../middlewares/useAuth.js';
import { useModel } from '../middlewares/useModel.js';
import { extractImagesFromMenuModel, Menu, MenuCreate, MenuListReturn, MenuReturn, MenuUpdate, nextMenuCode } from '../models/menuModels.js';
import { forbidden, notFound, ok } from '../utils/responses.js';
import { useIntegerParam } from '../middlewares/useParam.js';
import { generateQrCode, tryDeleteQrImage } from '../utils/qr.js';
import { tryDeleteUnusedImages } from '../utils/images.js';


const r = new Router();

// get all owner`s menus

r.get("/my", useAuth(), async (req, res) => {

  const { userId } = req.user;
  const foundMenus = await Menu.find({ ownerId: userId }).select(["-products", "-categories"]).exec();

  const result = MenuListReturn.build({ menus: foundMenus }).model;
  return ok(res, result);
})

// get by id

r.get("/:menuId", useAuth({ required: false }), useIntegerParam("menuId"), async (req, res) => {

  const menuId = req.menuId;
  const user = req.user;
  const foundMenu = await Menu.findOne({ code: menuId }).exec();

  if (!foundMenu) {
    return notFound(res, "Меню не найдено");
  }

  if (!foundMenu.isActive && (!user || user.userId !== foundMenu.ownerId)) {
    return forbidden(res, "Меню снято с публикации и доступно только владельцу");
  }

  const result = MenuReturn.build(foundMenu).model;
  return ok(res, result);
})

// create

r.post("/", useAuth(), useModel(MenuCreate), async (req, res) => {

  const { userId } = req.user;
  const createModel = req.model;

  createModel.code = await nextMenuCode();
  createModel.ownerId = userId;
  createModel.qr = await generateQrCode(createModel.code);

  const newMenu = await Menu.create(createModel);

  const result = MenuReturn.build(newMenu).model;
  return ok(res, result);
})

// update

r.put("/:menuId", useAuth(), useIntegerParam("menuId"), useModel(MenuUpdate), async (req, res) => {

  const { userId } = req.user;
  const menuId = req.menuId;
  const updateModel = req.model;

  const foundMenu = await Menu.findOne({ code: menuId }).exec();

  if (!foundMenu) {
    return notFound(res, "Меню не найдено");
  }

  if (foundMenu.ownerId !== userId) {
    return forbidden(res, "Отказано в доступе. Это меню принадлежит другому пользователю.")
  }

  const oldImages = extractImagesFromMenuModel(foundMenu);
  const newImages = extractImagesFromMenuModel(updateModel);
  await tryDeleteUnusedImages(oldImages, newImages);

  Object.assign(foundMenu, updateModel);
  await foundMenu.save();

  const result = MenuReturn.build(foundMenu).model;
  return ok(res, result);
})

// delete

r.delete("/:menuId", useAuth(), useIntegerParam("menuId"), async (req, res) => {

  const { userId } = req.user;
  const menuId = req.menuId;

  const foundMenu = await Menu.findOne({ code: menuId }).exec();

  if (!foundMenu) {
    return notFound(res, "Меню не найдено");
  }

  if (foundMenu.ownerId !== userId) {
    return forbidden(res, "Отказано в доступе. Это меню принадлежит другому пользователю.")
  }

  const oldImages = extractImagesFromMenuModel(foundMenu);
  await tryDeleteUnusedImages(oldImages, []);
  await tryDeleteQrImage(foundMenu.code);

  await Menu.findOneAndDelete({ code: menuId }).exec();

  const result = MenuReturn.build(foundMenu).model;
  return ok(res, result);
})

export const menuRouter = r;