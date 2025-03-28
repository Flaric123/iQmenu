# iQmenu

Сервис по созданию электронных QR-код меню для кафе и ресторанов.

## Функции

Сервис позволяет вледельцам кафе и ресторанов легко создавать электронное меню и размещать его на нашем сайте. Доступ к меню получить по сгенерированному QR-коду, который можно распечатать и разместить в заведении.

Сервис расчитан на 2 категории пользователей: посетители и владельцы.

### Посетители

Посетители кафе и ресторанов.

Могут:
- Просматривать опубликованные меню
- Добавлять позиции меню в список избранного

### Владельцы

Владельцы кафе и ресторанов.

Могут:
- Регистрироваться и авторизоваться в приложении
- Создавать / Обновлять / Удалять электронные меню
- Генерация QR-кода для доступа к своим меню

## Электронное меню

Главная сущность приложения. Это список продуктов, которые предлогает заведение. Список разбит на категории. Каждый продукт может принадлежать нескольким категориям.

### Меню

`"*" - обязательный атрибут`

Атрибут | Тип | Комментарий
---|---|---
id* | int | Идентификатор меню
owner* | uuid | Идентификатор пользователя-владельца
isActive* | bool | Меню опубликованно?
products* | list[product] | Список продуктов
company_name | str | Название заведения
menu_name | str | Название меню
categories | list[str] | Список категорий (по умолчанию: Основные, Десерты, Напитки)

### Продукт

Атрибут | Тип | Комментарий
---|---|---
name* | str | Название продукта
price* | number | Цена продукта в рублях
isActive* | bool | Продукт есть в наличии?
categories | list[str] | Список категорий, в которые входит продукт
weight | number | Вес продукта в граммах
description | str | Текстовое описание продукта
composition | str | Состав ингредиентов
image | str | Ссылка на изображение продукта

## Авторизация и регистрация

Регистрироваться и авторизоваться могут только владельцы. Это дает им право создавать электронные меню и управлять ими.

### Владелец

Атрибут | Тип | Комментарий
---|---|---
id* | uuid | Идентификатор владельца
phone* | str | Номер телефона владельца
email* | str | Email владельца
name* | str | Имя владельца
passwordHash* | str | Хеш-пароля
isActive* | bool | Пользователь может авторизоваться?

## Страницы интерфейса

[pages.md](/docs/pages.md)

## Эндпоинты API

[endpoints.md](/docs/endpoints.md)

## Стек технологий

**MERN:** MongoDB + Express JS + React JS (+ Material UI) + Node JS.

- **MongoDB** - база данных.
- **Express JS** - Rest API.
- **React JS (+ Material UI)** - веб-интерфейс на основе библиотеке компонентов Material UI.
- **Node JS** - сервер.

## Ход работы

План работ и другие документы в [папке на диске](https://drive.google.com/drive/folders/1uhOXl5HWSEQCH_ULBHB0_cz0Zdm2dqIZ?usp=sharing) (открыта для vasenka***@mail.ru).

> [!IMPORTANT]
> Делаешь форк репозитория себе и по мере выполнения задач кидаешь пулл реквесты в ветку `dev`.

> [!NOTE]
> При разработке страниц и эндпоинтов учитывай структуру сущностей, описанных в таблицах выше.

## Технические особенности

iQmenu - это веб-приложение. Интерфейс адаптирован для ПК, планшетов и смартфонов.