'use client'
import Image from "next/image"
import { useState, useEffect } from 'react'
import { firestore } from "@/firebase"
import { Box, Typography, Modal, Stack, TextField, Button} from "@mui/material"
import { query, collection, getDocs, deleteDoc, doc } from "firebase/firestore"

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
    const docRef = doc(collection(firestone, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()) {
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    } else {
      await setDoc(docRef, {quantity: 1})
    }
    await updateInventory()
   }


 const removeItem = async (item) => {
  const docRef = doc(collection(firestone, 'inventory'), item)
  const docSnap = await getDoc(docRef)

  if(docSnap.exists()) {
    const {quantity} = docSnap.data()
    if(quantity === 1) {
      await deleteDoc(docRef)
    }
    else{
      await setDoc(docRef, {quantity: quantity - 1})
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
    width="100vh"
    height="100vh"
    display="flex"
    justifyContent="center"
    alignItems="center"
    gap={2} 
    flexDirection="column">
      <Modal open={open} onClose={handleClose}>
        <Box position="absolute" top="50%" left="50%"
        sx={{
          transform:"translate(-50%,-50%)"
      }}
        width={400}
        bgcolor="white"
        border="2px solid black"
        boxShadow={24}
        p={4}
        display="flex"
        flexDirection="column"
        gap={3}
        >
          <Typography variant="h6">Add item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value)
            }}
            />
            <Button
            variant="outlined"
             onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained"
      onClick={()=>{
        handleOpen()
      }}
      >Add new Item</Button>
      <Box border="1px solid black">
        <Box width="800px" height="100px"
        bgcolor="pink" alignItems="center" justifyContent="center"
        display="flex">
          <Typography variant="h2" color='#333'>Inventory Items</Typography>
        </Box>
      </Box>
      <Stack width="300px"
      height= "300px"
      spacing={2}
      overflow="auto">
        {inventory.map(({name, quantity}) => (
            <Box key={name} width="100%"
            minHeight="150px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="#f0f0f0"
            padding={5}
            >
              <Typography variant="h3"
              color="#333"
              textAlign="center" >
                 {name.charAt(0).toUpperCase() + name.slice(1)}
                 </Typography>

                 <Typography variant="h3"
              color="#333"
              textAlign="center" >
                 {quantity}
                 </Typography>
            </Box>
          ))}
      </Stack>
    </Box>
  )
}