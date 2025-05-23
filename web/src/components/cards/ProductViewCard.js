import { Avatar, Box, Card, CardMedia, Chip, Stack, Typography } from '@mui/material'
import React, { memo } from 'react'
import ProductFavoriteButton from '../controls/ProductFavoriteButton';
import FastfoodIcon from '@mui/icons-material/Fastfood';

function ProductViewCard({ product, onClick }) {

  const onClickHandler = () => {
    onClick && onClick(product);
  }

  return (
    <Card>

      <Box position="relative">

        {/* Картинка */}
        <Box sx={{ width: "100%", aspectRatio: "1 / 1" }}>
          <Avatar
            variant="square"
            src={product.image}
            onClick={onClickHandler}
            sx={{ cursor: "pointer", width: "100%", height: "100%" }}
          >
            <FastfoodIcon sx={{ width: 80, height: 80 }} />
          </Avatar>
        </Box>

        {/* Предупреждение о наличии */}
        {product.isActive === false && (
          <Chip
            label="Нет в наличии"
            color="error"
            size="small"
            sx={{ position: "absolute", bottom: 8, left: 8 }}
          />
        )}

      </Box>

      {/* Содержимое */}
      <Stack direction="column" sx={{ p: 1 }}>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div" color="secondary" onClick={onClickHandler} sx={{ cursor: "pointer" }}>
            {product.price}₽
          </Typography>
          <ProductFavoriteButton product={product} />
        </Stack>

        <Typography variant="subtitle2" component="div" noWrap onClick={onClickHandler} sx={{ cursor: "pointer" }}>
          {product.name}
        </Typography>

      </Stack>

    </Card>
  )
}

export default memo(ProductViewCard)