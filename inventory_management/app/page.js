'use client'
import { useState, useEffect } from 'react'
import { firestore } from "@/firebase"
import { Box, Typography, Modal, Stack, TextField, Button, Card, CardContent, Select, MenuItem, Pagination, Grid } from "@mui/material"
import { query, collection, getDocs, setDoc, deleteDoc, doc, getDoc } from "firebase/firestore"

// Dashboard Component
const Dashboard = ({ inventory }) => {
  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.quantity < 5).length; // Example threshold

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 2, boxShadow: 1 }}>
      <Typography variant="h4" sx={{ mb: 2,textAlign: "center", fontFamily: 'Montserrat, sans-serif', textDecoration: "underline 1px #001845"}}>Inventory Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#ffffff', boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Total Items</Typography>
              <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif' }}>{totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#ffffff', boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Total Quantity</Typography>
              <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif' }}>{totalQuantity}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#ffffff', boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Low Stock Items</Typography>
              <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif' }}>{lowStockItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemName, setItemName] = useState('')
  const [editedName, setEditedName] = useState('')
  const [editedQuantity, setEditedQuantity] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const updateInventory = async () => {
    const snapshot = await getDocs(query(collection(firestore, 'inventory')))
    const inventoryList = []
    snapshot.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) => {
    if (!item) return; // Exit if item name is empty

    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    if (!item) return; // Exit if item name is empty

    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const editItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), editedName);
    await setDoc(docRef, { quantity: editedQuantity });
    setEditingItem(null);
    updateInventory();
  }

  const exportToCSV = () => {
    const csvData = [['Name', 'Quantity']];
    inventory.forEach(item => {
      csvData.push([item.name, item.quantity]);
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    updateInventory()
  }, [])

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInventory = filteredInventory.sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else {
      return sortDirection === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
    }
  });

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedInventory.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: '100vh',
        bgcolor: '#001233', // Dark background for the main container
      }}
    >
      <Box sx={{ bgcolor: '#001845', p: 2 }}> {/* Header */}
        <Typography variant="h4" color="white" textAlign= "center" sx={{ fontFamily: 'Verdana' }}>Kiki</Typography>
      </Box>

      <Dashboard inventory={inventory} />

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ width: '80%', maxWidth: '800px', bgcolor: '#ffffff', borderRadius: 2, boxShadow: 1, p: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontFamily: 'Montserrat, sans-serif' }}>Manage Inventory</Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              InputProps={{
                style: { fontFamily: 'Montserrat, sans-serif' },
              }}
            />
            <Button variant="contained" color="primary" onClick={() => setOpen(true)} sx={{ bgcolor: '#001845', '&:hover': { bgcolor: '#003366' }, fontFamily: 'Montserrat, sans-serif' }}>
              Add New Item
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'space-between' }}>
            <Box>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ minWidth: 120, fontFamily: 'Montserrat, sans-serif' }}
              >
                <MenuItem value="name" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Name</MenuItem>
                <MenuItem value="quantity" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Quantity</MenuItem>
              </Select>
              <Select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                sx={{ minWidth: 120, fontFamily: 'Montserrat, sans-serif' }}
              >
                <MenuItem value="asc" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Ascending</MenuItem>
                <MenuItem value="desc" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Descending</MenuItem>
              </Select>
            </Box>
            <Button variant="contained" color="primary" onClick={exportToCSV} sx={{ bgcolor: '#001845', '&:hover': { bgcolor: '#003366' }, fontFamily: 'Montserrat, sans-serif' }}>
              Export to CSV
            </Button>
          </Stack>

          <Box
            sx={{
              overflowY: 'auto',
              maxHeight: '300px',
              p: 2,
            }}
          >
            {currentItems.map(({ name, quantity }) => (
              <Card key={name} sx={{ display: 'flex', justifyContent: 'space-between', padding: 2, mb: 1 }}>
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" color="#333" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="#666" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Quantity: {quantity}
                  </Typography>
                </CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button variant="contained" color="primary" onClick={() => {
                    setEditingItem({ name, quantity });
                    setEditedName(name);
                    setEditedQuantity(quantity);
                  }} sx={{ bgcolor: '#001845', '&:hover': { bgcolor: '#003366' }, fontFamily: 'Montserrat, sans-serif' }}>
                    Edit
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => removeItem(name)} sx={{ bgcolor: '#33415c', '&:hover': { bgcolor: '#4a5d7c' }, fontFamily: 'Montserrat, sans-serif' }}>
                    Remove
                  </Button>
                </Stack>
              </Card>
            ))}
          </Box>

          <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
            <Pagination
              count={Math.ceil(sortedInventory.length / itemsPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              sx={{ fontFamily: 'Montserrat, sans-serif' }}
            />
          </Stack>
        </Box>
      </Box>

      {/* Add Item Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box position="absolute" top="50%" left="50%"
          sx={{
            transform: "translate(-50%,-50%)",
            width: 400,
            bgcolor: "white",
            border: "1px solid #ccc",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Montserrat, sans-serif' }}>Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item Name"
              InputProps={{
                style: { fontFamily: 'Montserrat, sans-serif' },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                setOpen(false)
              }}
              disabled={!itemName} // Disable if itemName is empty
              sx={{ bgcolor: '#001845', '&:hover': { bgcolor: '#003366' }, fontFamily: 'Montserrat, sans-serif' }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Edit Item Modal */}
      <Modal open={editingItem !== null} onClose={() => setEditingItem(null)}>
        <Box position="absolute" top="50%" left="50%"
          sx={{
            transform: "translate(-50%,-50%)",
            width: 400,
            bgcolor: "white",
            border: "1px solid #ccc",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Montserrat, sans-serif' }}>Edit Item</Typography>
          <TextField
            variant="outlined"
            fullWidth
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Item Name"
            InputProps={{
              style: { fontFamily: 'Montserrat, sans-serif' },
            }}
          />
          <TextField
            variant="outlined"
            fullWidth
            type="number"
            value={editedQuantity}
            onChange={(e) => setEditedQuantity(e.target.value)}
            placeholder="Quantity"
            InputProps={{
              style: { fontFamily: 'Montserrat, sans-serif' },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={editItem}
            sx={{ mt: 2, bgcolor: '#001845', '&:hover': { bgcolor: '#003366' }, fontFamily: 'Montserrat, sans-serif' }}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}