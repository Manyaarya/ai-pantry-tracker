'use client'
import { useState, useEffect } from 'react'
import { firestore } from "@/firebase"
import { Box, Typography, Modal, Stack, TextField, Button, Card, CardContent } from "@mui/material"
import { query, collection, getDocs, setDoc, deleteDoc, doc, getDoc } from "firebase/firestore"

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')

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

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        bgcolor: '#eaeaea',
        p: 2,
        minHeight: '100vh',
      }}
    >
      <Modal open={open} onClose={handleClose}>
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
          <Typography variant="h6" sx={{ mb: 2 }}>Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item Name"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
              disabled={!itemName} // Disable if itemName is empty
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
        Add New Item
      </Button>
      <Box
        sx={{
          width: '80%',
          maxWidth: '600px',
          border: '1px solid #ccc',
          borderRadius: 2,
          overflow: 'hidden',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            bgcolor: '#3f51b5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Typography variant="h4" color='white'>Inventory Items</Typography>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto', // Enable vertical scrolling
            maxHeight: '300px', // Set a maximum height
            p: 2,
          }}
        >
          {inventory.map(({ name, quantity }) => (
            <Card key={name} sx={{ display: 'flex', justifyContent: 'space-between', padding: 2, mb: 1 }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" color="#333">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body2" color="#666">
                  Quantity: {quantity}
                </Typography>
              </CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="contained" color="primary" onClick={() => addItem(name)}>Add</Button>
                <Button variant="contained" color="secondary" onClick={() => removeItem(name)}>Remove</Button>
              </Stack>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  )
}