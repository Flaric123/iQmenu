import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  IconButton,
  ListItemText,
  Stack,
  Alert,
  Button,
  Chip,
  Typography,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { CSS } from '@dnd-kit/utilities';
import ProductEditDialog from '../dialogs/ProductsEditDialog';
import { deepCopy, fileToDataUrl } from '../../utils/utils';
import { PRODUCT_CREATE_TEMPLATE } from '../../values/default';
import withInputShell from '../../hoc/withInputShell';

const SortableItem = ({ id, product, onEdit, onDelete, onToggleActive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const [imageUrl, setImageUrl] = useState(null);

  const syncImageWithImageUrl = async () => {
    if (typeof product.image == "string") {
      setImageUrl(product.image);
    } else if (product.image instanceof File) {
      setImageUrl(await fileToDataUrl(product.image));
    }
  }

  useEffect(() => {
    syncImageWithImageUrl();
  }, [product.image]);

  return (
    <ListItem
      ref={setNodeRef}
      {...attributes}
      secondaryAction={
        <IconButton edge="end" onClick={() => onDelete(product.id)}>
          <DeleteIcon />
        </IconButton>
      }
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        borderBottomColor: "divider",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        pl: 0
      }}
    >
      <IconButton {...listeners} sx={{ touchAction: 'none' }}>
        <DragIndicatorIcon />
      </IconButton>
      <ListItemAvatar>
        <Avatar variant="rounded" src={imageUrl} sx={{ width: 50, height: 50 }}>
          <FastfoodIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Chip
              label={product.isActive ? "Есть" : "Нет"}
              size="small"
              color={product.isActive ? "success" : "error"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(product.id);
              }}
              sx={{ cursor: 'pointer' }}
            />
            <Typography noWrap>{product.name}</Typography>
          </Stack>
        }
        secondary={
          <Typography color="text.secondary" noWrap sx={{ fontSize: 12 }} >
            {[product.price + ' ₽', ...(product.categories ?? [])].filter(Boolean).join(', ')}
          </Typography>
        }
        onClick={(e) => onEdit && onEdit(product)}
      />
    </ListItem>
  );
};

const ProductsInput = ({ products, categories, onChange }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleAddProduct = () => {
    const newProduct = deepCopy(PRODUCT_CREATE_TEMPLATE);
    newProduct.id = Math.random(); // tmp id
    setCurrentProduct(newProduct);
    setEditDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct({ ...product });
    setEditDialogOpen(true);
  };

  const handleDeleteProduct = (id) => {
    onChange(products.filter(p => p.id !== id));
  };

  const handleToggleActive = (id) => {
    onChange(products.map(p =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const handleSaveProduct = (product) => {
    if (currentProduct.name) {
      onChange(products.map(p => p.id === currentProduct.id ? product : p));
    } else {
      onChange([...products, product]);
    }
    setEditDialogOpen(false);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = products.findIndex(p => p.id === active.id);
      const newIndex = products.findIndex(p => p.id === over.id);
      onChange(arrayMove(products, oldIndex, newIndex));
    }
    setActiveId(null);
  };

  const initTmpIdsForProducts = () => {
    products.forEach(p => {
      if (!p.id) {
        p.id = Math.random();
      }
    })
  }

  initTmpIdsForProducts();

  return (
    <Stack direction="column" spacing={1}>
      <Button
        variant="outlined"
        color="success"
        startIcon={<AddIcon />}
        onClick={handleAddProduct}
      >
        Добавить продукт
      </Button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={products.map(product => product.id)}
          strategy={verticalListSortingStrategy}
        >
          <List sx={{ borderWidth: "1px", borderColor: "#c4c4c4", borderStyle: "solid", borderRadius: 2, p: 0 }}>
            {products.map((product) => (
              <SortableItem
                key={product.id}
                id={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleActive={handleToggleActive}
              />
            ))}
          </List>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <ListItem sx={{ bgcolor: 'background.paper', boxShadow: 3 }}>
              <ListItemText
                primary={products.find(p => p.id === activeId)?.name}
              />
            </ListItem>
          ) : null}
        </DragOverlay>
      </DndContext>

      {products.length === 0 && (
        <Alert severity="info">
          Нет добавленных продуктов
        </Alert>
      )}

      <ProductEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        product={currentProduct}
        categories={categories}
        onSave={handleSaveProduct}
        products={products}
      />
    </Stack>
  );
};

export default withInputShell(ProductsInput);